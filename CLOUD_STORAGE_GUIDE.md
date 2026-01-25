# Cloud Storage & Data Management Integration Guide
## AWS S3 & Azure Blob Storage Integration

---

## 1. AWS S3 INTEGRATION

### 1.1 Prerequisites
- AWS Account with appropriate permissions
- AWS Access Key ID and Secret Access Key
- Node.js package: `npm install aws-sdk`

### 1.2 Environment Variables
```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BACKUP_BUCKET=police-cms-backups
AWS_S3_DOCUMENTS_BUCKET=police-cms-documents

# Backup Configuration
BACKUP_CLOUD_STORAGE_ENABLED=true
BACKUP_CLOUD_PROVIDER=aws
```

### 1.3 S3 Bucket Setup
```bash
# Create backup bucket
aws s3 mb s3://police-cms-backups --region us-east-1

# Create documents bucket
aws s3 mb s3://police-cms-documents --region us-east-1

# Enable versioning for protection
aws s3api put-bucket-versioning \
  --bucket police-cms-backups \
  --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket police-cms-backups \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'

# Block public access
aws s3api put-public-access-block \
  --bucket police-cms-backups \
  --public-access-block-configuration \
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

### 1.4 IAM User Permissions
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "BackupBucketAccess",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:ListBucket",
        "s3:GetBucketVersioning",
        "s3:ListBucketVersions"
      ],
      "Resource": [
        "arn:aws:s3:::police-cms-backups",
        "arn:aws:s3:::police-cms-backups/*"
      ]
    },
    {
      "Sid": "DocumentBucketAccess",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::police-cms-documents",
        "arn:aws:s3:::police-cms-documents/*"
      ]
    },
    {
      "Sid": "KMSAccess",
      "Effect": "Allow",
      "Action": [
        "kms:Decrypt",
        "kms:Encrypt",
        "kms:GenerateDataKey"
      ],
      "Resource": "arn:aws:kms:us-east-1:ACCOUNT-ID:key/KEY-ID"
    }
  ]
}
```

### 1.5 Usage Example
```javascript
const AWS = require('aws-sdk');
const fs = require('fs');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Upload backup
async function uploadBackup(filePath, backupName) {
  const fileContent = fs.readFileSync(filePath);
  
  const params = {
    Bucket: process.env.AWS_S3_BACKUP_BUCKET,
    Key: `backups/${backupName}.sql`,
    Body: fileContent,
    ServerSideEncryption: 'AES256',
    Metadata: {
      'backup-date': new Date().toISOString(),
      'retention-days': '30'
    }
  };

  await s3.upload(params).promise();
}

// Download backup
async function downloadBackup(backupName) {
  const params = {
    Bucket: process.env.AWS_S3_BACKUP_BUCKET,
    Key: `backups/${backupName}.sql`
  };

  const data = await s3.getObject(params).promise();
  return data.Body.toString('utf-8');
}

// List backups
async function listBackups() {
  const params = {
    Bucket: process.env.AWS_S3_BACKUP_BUCKET,
    Prefix: 'backups/'
  };

  const data = await s3.listObjectsV2(params).promise();
  return data.Contents || [];
}

// Lifecycle policy (auto-delete old backups)
async function setLifecyclePolicy() {
  const params = {
    Bucket: process.env.AWS_S3_BACKUP_BUCKET,
    LifecycleConfiguration: {
      Rules: [
        {
          Id: 'DeleteOldBackups',
          Prefix: 'backups/',
          Status: 'Enabled',
          Expiration: { Days: 30 }
        }
      ]
    }
  };

  await s3.putBucketLifecycleConfiguration(params).promise();
}
```

---

## 2. AZURE BLOB STORAGE INTEGRATION

### 2.1 Prerequisites
- Azure Storage Account
- Connection string or credentials
- Node.js package: `npm install @azure/storage-blob`

### 2.2 Environment Variables
```env
# Azure Configuration
AZURE_STORAGE_ACCOUNT_NAME=policecmsbackup
AZURE_STORAGE_ACCOUNT_KEY=...
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...
AZURE_STORAGE_CONTAINER=backups

# Backup Configuration
BACKUP_CLOUD_STORAGE_ENABLED=true
BACKUP_CLOUD_PROVIDER=azure
AZURE_BACKUP_CONTAINER=backups
```

### 2.3 Azure Storage Setup
```bash
# Create storage account
az storage account create \
  --name policecmsbackup \
  --resource-group police-cms-rg \
  --location eastus \
  --sku Standard_LRS \
  --encryption-services blob

# Create container
az storage container create \
  --account-name policecmsbackup \
  --name backups \
  --auth-mode login

# Enable public access
az storage container set-permission \
  --account-name policecmsbackup \
  --name backups \
  --public-access off

# Create lifecycle management policy
az storage account management-policy create \
  --account-name policecmsbackup \
  --resource-group police-cms-rg \
  --policy '{
    "rules": [{
      "name": "deleteOldBackups",
      "type": "Lifecycle",
      "definition": {
        "actions": {
          "baseBlob": {
            "delete": {
              "daysAfterModificationGreaterThan": 30
            }
          }
        },
        "filters": {
          "blobTypes": ["blockBlob"],
          "prefixMatch": ["backups"]
        }
      }
    }]
  }'
```

### 2.4 Azure RBAC Permissions
```json
{
  "Name": "Storage Blob Data Contributor",
  "Id": "ba92f5b4-2d11-453d-a403-e96b0029c9fe",
  "IsCustom": false,
  "Description": "Allows full access to Azure Storage blobs",
  "Actions": [
    "Microsoft.Storage/storageAccounts/blobServices/containers/delete",
    "Microsoft.Storage/storageAccounts/blobServices/containers/read",
    "Microsoft.Storage/storageAccounts/blobServices/containers/write",
    "Microsoft.Storage/storageAccounts/blobServices/generateUserDelegationKey/action"
  ],
  "DataActions": [
    "Microsoft.Storage/storageAccounts/blobServices/containers/blobs/delete",
    "Microsoft.Storage/storageAccounts/blobServices/containers/blobs/read",
    "Microsoft.Storage/storageAccounts/blobServices/containers/blobs/write",
    "Microsoft.Storage/storageAccounts/blobServices/containers/blobs/move/action"
  ],
  "AssignableScopes": [
    "/subscriptions/{subscriptionId}/resourceGroups/police-cms-rg"
  ]
}
```

### 2.5 Usage Example
```javascript
const { BlobServiceClient } = require('@azure/storage-blob');
const fs = require('fs');

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);

// Upload backup
async function uploadBackup(filePath, backupName) {
  const containerClient = blobServiceClient.getContainerClient(
    process.env.AZURE_BACKUP_CONTAINER
  );
  
  const blockBlobClient = containerClient.getBlockBlobClient(
    `backups/${backupName}.sql`
  );

  const fileContent = fs.readFileSync(filePath);
  
  await blockBlobClient.upload(fileContent, fileContent.length, {
    metadata: {
      'backup-date': new Date().toISOString(),
      'retention-days': '30'
    }
  });
}

// Download backup
async function downloadBackup(backupName) {
  const containerClient = blobServiceClient.getContainerClient(
    process.env.AZURE_BACKUP_CONTAINER
  );
  
  const blockBlobClient = containerClient.getBlockBlobClient(
    `backups/${backupName}.sql`
  );

  const downloadBlockBlobResponse = await blockBlobClient.download(0);
  return await streamToText(downloadBlockBlobResponse.readableStreamBody);
}

// List backups
async function listBackups() {
  const containerClient = blobServiceClient.getContainerClient(
    process.env.AZURE_BACKUP_CONTAINER
  );

  const backups = [];
  for await (const blob of containerClient.listBlobsFlat({ prefix: 'backups/' })) {
    backups.push(blob);
  }
  return backups;
}

// Delete old backup
async function deleteBackup(backupName) {
  const containerClient = blobServiceClient.getContainerClient(
    process.env.AZURE_BACKUP_CONTAINER
  );

  const blockBlobClient = containerClient.getBlockBlobClient(
    `backups/${backupName}.sql`
  );

  await blockBlobClient.delete();
}
```

---

## 3. HYBRID BACKUP STRATEGY

### 3.1 Backup Architecture
```
Database
    ↓
Local Backup
    ├→ /backend/backups/
    ├→ Encrypted (AES-256-GCM)
    └→ 30-day retention
    ↓
Cloud Backup (Primary)
    ├→ AWS S3 or Azure Blob Storage
    ├→ Geo-redundant storage
    ├→ Server-side encryption
    └→ Automated lifecycle policy
    ↓
Cold Storage (Archival)
    ├→ AWS Glacier or Azure Archive
    ├→ Long-term retention (7+ years)
    └→ Legal hold for cases
```

### 3.2 Backup Workflow
```javascript
// Complete backup with cloud sync
async function createComprehensiveBackup() {
  // 1. Create local backup
  const backupResult = await createBackup();
  
  if (!backupResult.success) {
    logEvent('BACKUP_FAILED', 'system', 'system', 'system', {
      errorMessage: backupResult.error
    });
    return;
  }

  // 2. Upload to cloud (if enabled)
  if (BackupConfig.cloudStorageEnabled) {
    try {
      await uploadBackupToCloud(
        backupResult.path,
        backupResult.backupName
      );
      logEvent('BACKUP_CLOUD_SUCCESS', 'system', 'system', 'system', {
        resourceId: backupResult.backupName,
        resourceType: 'backup'
      });
    } catch (err) {
      logEvent('BACKUP_CLOUD_FAILED', 'system', 'system', 'system', {
        errorMessage: err.message,
        resourceId: backupResult.backupName
      });
    }
  }

  // 3. Clean old backups
  await cleanOldBackups();

  // 4. Verify backup integrity
  await verifyBackupIntegrity(backupResult.backupName);
}
```

---

## 4. DATA VALIDATION FRAMEWORK

### 4.1 Validation Layers
```
Input Layer
    ↓ Type checking
    ↓ Format validation
    ↓ Length constraints
    ↓ Pattern matching
    ↓ Whitelist validation
    ↓
Business Logic Layer
    ↓ Business rule validation
    ↓ Uniqueness constraints
    ↓ Referential integrity
    ↓ State machine validation
    ↓
Data Layer
    ↓ Database constraints
    ↓ Trigger validation
    ↓ Transaction logging
```

### 4.2 Validation Examples

**Case Data Validation:**
```javascript
// In routes/cases.js
const { validateRequestBody, validationSchemas } = require('../middleware/validation');

router.post('/cases', 
  validateRequestBody(validationSchemas.case),
  async (req, res) => {
    // Data is validated before reaching this handler
    // req.body is sanitized
    try {
      // Business logic here
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);
```

**Password Strength Validation:**
```javascript
const { validatePasswordStrength } = require('../middleware/validation');

const errors = validatePasswordStrength(password, 'medium');
if (errors.length > 0) {
  return res.status(400).json({
    error: 'Password does not meet requirements',
    requirements: errors
  });
}
```

---

## 5. MONITORING & ALERTS

### 5.1 Backup Monitoring
```javascript
// Monitor backup system
const monitorBackups = () => {
  cron.schedule('0 3 * * *', async () => { // 3 AM daily
    const backups = listBackups();
    
    // Check if backup from today exists
    const today = new Date().toISOString().split('T')[0];
    const todayBackup = backups.find(b => b.name.includes(today));
    
    if (!todayBackup) {
      logEvent('BACKUP_MISSING', 'system', 'system', 'system', {
        severity: 'CRITICAL',
        metadata: { date: today }
      });
      // Send alert email
      sendAlert('Backup Missing', `No backup found for ${today}`);
    }
    
    // Check backup size (sanity check)
    backups.forEach(b => {
      if (b.size < 1000) { // Less than 1KB is suspicious
        sendAlert('Suspicious Backup', `Backup ${b.name} is only ${b.size} bytes`);
      }
    });
  });
};
```

### 5.2 Cloud Storage Monitoring
```bash
# AWS CloudWatch Metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/S3 \
  --metric-name BucketSizeBytes \
  --dimensions Name=BucketName,Value=police-cms-backups \
  --start-time 2026-01-18T00:00:00Z \
  --end-time 2026-01-19T00:00:00Z \
  --period 86400 \
  --statistics Average

# Azure Monitor Metrics
az monitor metrics list \
  --resource /subscriptions/{subscription}/resourceGroups/police-cms-rg/providers/Microsoft.Storage/storageAccounts/policecmsbackup \
  --metric BlobCapacity \
  --start-time 2026-01-18T00:00:00Z
```

---

## 6. DISASTER RECOVERY PROCEDURES

### 6.1 Complete System Restoration

**Step 1: Prepare Recovery Environment**
```bash
# Provision new server or use standby
# Ensure same OS, Node.js version, dependencies
npm install
```

**Step 2: Restore Database**
```javascript
const { restoreFromBackup } = require('./config/backup');

// Find most recent backup
const backups = listBackups();
const latestBackup = backups.sort((a, b) => 
  new Date(b.created) - new Date(a.created)
)[0];

// Restore
const result = await restoreFromBackup(latestBackup.name);
if (result.success) {
  console.log('Database restored successfully');
} else {
  console.error('Restore failed:', result.error);
}
```

**Step 3: Restore Configuration**
```bash
# Copy environment files
cp /backup/location/.env .env

# Copy SSL certificates
cp /backup/location/ssl/* ./config/ssl/

# Restore application files
cp -r /backup/location/backend/* ./
```

**Step 4: Verification**
```bash
# Run health check
curl http://localhost:3001/health

# Verify database connections
npm test

# Check data integrity
node scripts/verify-backup.js
```

**Step 5: Notification & Documentation**
```javascript
// Log recovery event
logEvent('SYSTEM_RECOVERY', 'system', 'system', 'system', {
  resourceId: 'full-system',
  metadata: {
    backupRestored: latestBackup.name,
    recoveryTime: elapsedTime,
    verified: true
  }
});
```

---

## 7. COST OPTIMIZATION

### 7.1 AWS Cost Estimation (Monthly)
```
Backup Storage (30 days):     $0.023/GB/month
  ├─ 500MB data × 30 backups = 15GB
  └─ Cost: ~$0.34/month

Data Transfer:                 $0.09/GB (outbound)
  └─ Restore: ~$0.45/month (estimate)

Glacier Archival (long-term):  $0.004/GB/month
  └─ Long-term archive: minimal

Total: ~$1-2/month for average case
```

### 7.2 Cost Reduction Strategies
- Use Lifecycle Policies for automatic archival
- Enable S3 Intelligent-Tiering
- Compress backups before upload
- Delete old backups automatically
- Use regional endpoints only

---

## 8. COMPLIANCE & TESTING

### 8.1 Backup Testing Schedule
```
Monthly:   Verify backup file integrity
Quarterly: Full restoration test (non-production)
Annually:  Disaster recovery drill
```

### 8.2 Testing Checklist
- [ ] Backup created successfully
- [ ] File size is reasonable (not 0 or huge)
- [ ] File is encrypted (if enabled)
- [ ] Upload to cloud succeeded
- [ ] Download from cloud works
- [ ] Restore process completes
- [ ] All data restored correctly
- [ ] Application starts normally
- [ ] Database queries return correct data
- [ ] Audit logs are intact

---

**Document Version:** 1.0  
**Last Updated:** January 18, 2026  
**Next Review:** July 18, 2026
