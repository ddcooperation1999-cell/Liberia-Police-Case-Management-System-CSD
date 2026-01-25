/**
 * Automated Backup System
 * Implements scheduled database backups with encryption and cloud storage integration
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const cron = require('node-cron');
const db = require('../db');

// Ensure backup directory exists
const backupDir = path.join(__dirname, '..', 'backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

/**
 * Backup configuration
 */
const BackupConfig = {
  // Schedule: Run daily at 2 AM
  schedule: process.env.BACKUP_SCHEDULE || '0 2 * * *',
  // Retention: Keep last 30 days of backups
  retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS) || 30,
  // Encryption: Enable backup encryption
  encryptionEnabled: process.env.BACKUP_ENCRYPTION_ENABLED !== 'false',
  // Compression
  compressionEnabled: process.env.BACKUP_COMPRESSION_ENABLED !== 'false',
  // Cloud storage
  cloudStorageEnabled: process.env.BACKUP_CLOUD_STORAGE_ENABLED === 'true',
  cloudProvider: process.env.BACKUP_CLOUD_PROVIDER || 'aws', // aws or azure
  s3Bucket: process.env.AWS_S3_BACKUP_BUCKET,
  azureContainer: process.env.AZURE_BACKUP_CONTAINER
};

/**
 * Encrypt backup data
 */
const encryptBackup = (data, encryptionKey) => {
  const key = crypto.scryptSync(encryptionKey, 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return {
    encryptedData: encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
};

/**
 * Decrypt backup data
 */
const decryptBackup = (encryptedBackup, encryptionKey) => {
  const key = crypto.scryptSync(encryptionKey, 'salt', 32);
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    key,
    Buffer.from(encryptedBackup.iv, 'hex')
  );

  decipher.setAuthTag(Buffer.from(encryptedBackup.authTag, 'hex'));

  let decrypted = decipher.update(encryptedBackup.encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};

/**
 * Create database backup
 */
const createBackup = async () => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `backup-${timestamp}`;
    const backupPath = path.join(backupDir, `${backupName}.sql`);

    // Get all tables
    const tables = [
      'counties',
      'users',
      'suspects',
      'criminal_records',
      'police_cases',
      'case_documents',
      'flagged_individuals'
    ];

    let sqlDump = `-- Database Backup: ${timestamp}\n`;
    sqlDump += `-- Backup ID: ${backupName}\n`;
    sqlDump += `-- Retention: Until ${new Date(Date.now() + BackupConfig.retentionDays * 24 * 60 * 60 * 1000).toISOString()}\n\n`;

    // Dump each table
    for (const table of tables) {
      const result = await db.query(`SELECT * FROM ${table}`);
      
      sqlDump += `\n-- Table: ${table}\n`;
      sqlDump += `DELETE FROM ${table};\n`;

      if (result.rows && result.rows.length > 0) {
        const columns = Object.keys(result.rows[0]);
        const columnNames = columns.join(', ');

        result.rows.forEach(row => {
          const values = columns.map(col => {
            const val = row[col];
            if (val === null) {
              return 'NULL';
            }
            if (typeof val === 'string') {
              return `'${val.replace(/'/g, "''")}'`;
            }
            return val;
          }).join(', ');

          sqlDump += `INSERT INTO ${table} (${columnNames}) VALUES (${values});\n`;
        });
      }
    }

    // Write to file
    let backupData = sqlDump;

    // Encrypt if enabled
    if (BackupConfig.encryptionEnabled) {
      const encryptionKey = process.env.BACKUP_ENCRYPTION_KEY || 'default-key';
      const encrypted = encryptBackup(sqlDump, encryptionKey);
      backupData = JSON.stringify(encrypted);
    }

    fs.writeFileSync(backupPath, backupData, 'utf8');

    // Upload to cloud if enabled
    if (BackupConfig.cloudStorageEnabled) {
      await uploadBackupToCloud(backupPath, backupName);
    }

    // Clean old backups
    await cleanOldBackups();

    console.log(`✅ Backup created successfully: ${backupName}`);

    return {
      success: true,
      backupName,
      path: backupPath,
      timestamp,
      encrypted: BackupConfig.encryptionEnabled,
      size: fs.statSync(backupPath).size
    };
  } catch (err) {
    console.error('❌ Backup failed:', err);
    return {
      success: false,
      error: err.message
    };
  }
};

/**
 * Upload backup to cloud storage
 */
const uploadBackupToCloud = async (filePath, backupName) => {
  try {
    if (BackupConfig.cloudProvider === 'aws') {
      // AWS S3 integration
      // Requires: npm install aws-sdk
      const AWS = require('aws-sdk');
      const s3 = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION
      });

      const fileContent = fs.readFileSync(filePath);
      const params = {
        Bucket: BackupConfig.s3Bucket,
        Key: `backups/${backupName}`,
        Body: fileContent,
        ServerSideEncryption: 'AES256'
      };

      await s3.upload(params).promise();
      console.log(`✅ Backup uploaded to S3: s3://${BackupConfig.s3Bucket}/backups/${backupName}`);
    } else if (BackupConfig.cloudProvider === 'azure') {
      // Azure Blob Storage integration
      // Requires: npm install @azure/storage-blob
      const { BlobServiceClient } = require('@azure/storage-blob');
      const blobServiceClient = BlobServiceClient.fromConnectionString(
        process.env.AZURE_STORAGE_CONNECTION_STRING
      );

      const containerClient = blobServiceClient.getContainerClient(BackupConfig.azureContainer);
      const blockBlobClient = containerClient.getBlockBlobClient(backupName);

      const fileContent = fs.readFileSync(filePath);
      await blockBlobClient.upload(fileContent, fileContent.length);

      console.log(`✅ Backup uploaded to Azure: ${backupName}`);
    }
  } catch (err) {
    console.error('Failed to upload backup to cloud:', err);
  }
};

/**
 * Restore from backup
 */
const restoreFromBackup = async (backupName) => {
  try {
    const backupPath = path.join(backupDir, `${backupName}.sql`);

    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup not found: ${backupName}`);
    }

    let sqlDump = fs.readFileSync(backupPath, 'utf8');

    // Decrypt if necessary
    if (BackupConfig.encryptionEnabled) {
      try {
        const encrypted = JSON.parse(sqlDump);
        const encryptionKey = process.env.BACKUP_ENCRYPTION_KEY || 'default-key';
        sqlDump = decryptBackup(encrypted, encryptionKey);
      } catch (err) {
        // Not encrypted or invalid encryption, try to use as-is
      }
    }

    // Execute SQL commands
    const statements = sqlDump.split(';\n').filter(s => s.trim() && !s.trim().startsWith('--'));

    for (const statement of statements) {
      await db.run(statement.trim() + ';');
    }

    console.log(`✅ Database restored from backup: ${backupName}`);

    return {
      success: true,
      backupName,
      restoreTime: new Date().toISOString()
    };
  } catch (err) {
    console.error('❌ Restore failed:', err);
    return {
      success: false,
      error: err.message
    };
  }
};

/**
 * Clean old backups based on retention policy
 */
const cleanOldBackups = async () => {
  try {
    const files = fs.readdirSync(backupDir);
    const now = Date.now();
    const retentionMs = BackupConfig.retentionDays * 24 * 60 * 60 * 1000;

    for (const file of files) {
      const filePath = path.join(backupDir, file);
      const stats = fs.statSync(filePath);
      const age = now - stats.mtime.getTime();

      if (age > retentionMs) {
        fs.unlinkSync(filePath);
        console.log(`🗑️  Deleted old backup: ${file}`);
      }
    }
  } catch (err) {
    console.error('Error cleaning old backups:', err);
  }
};

/**
 * Get list of available backups
 */
const listBackups = () => {
  try {
    const files = fs.readdirSync(backupDir);
    return files.map(file => {
      const filePath = path.join(backupDir, file);
      const stats = fs.statSync(filePath);
      return {
        name: file.replace('.sql', ''),
        size: stats.size,
        created: stats.mtime.toISOString(),
        encrypted: BackupConfig.encryptionEnabled
      };
    });
  } catch (err) {
    console.error('Error listing backups:', err);
    return [];
  }
};

/**
 * Schedule automated backups
 */
const scheduleBackups = () => {
  console.log(`📅 Scheduling backups: ${BackupConfig.schedule}`);

  cron.schedule(BackupConfig.schedule, async () => {
    console.log('⏰ Running scheduled backup...');
    await createBackup();
  });

  // Also run on startup
  createBackup();
};

/**
 * Initialize backup system
 */
const initializeBackupSystem = () => {
  if (process.env.BACKUP_AUTOMATED === 'true') {
    scheduleBackups();
  } else {
    console.log('ℹ️  Automated backups disabled. Set BACKUP_AUTOMATED=true to enable.');
  }
};

module.exports = {
  BackupConfig,
  createBackup,
  restoreFromBackup,
  listBackups,
  encryptBackup,
  decryptBackup,
  scheduleBackups,
  initializeBackupSystem,
  uploadBackupToCloud,
  cleanOldBackups
};
