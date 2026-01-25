#!/usr/bin/env node

/**
 * Login Error Resolver
 * Fixes all common login issues
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

console.log('\n════════════════════════════════════════');
console.log('  ADMIN PANEL LOGIN ERROR RESOLVER');
console.log('════════════════════════════════════════\n');

const dbPath = path.join(__dirname, 'police_cases.db');

// Step 1: Check if database exists
if (!fs.existsSync(dbPath)) {
  console.error('❌ Database file not found at:', dbPath);
  console.log('   Please ensure the database is initialized.');
  process.exit(1);
}

console.log('✓ Step 1: Database file found');

// Step 2: Connect to database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Cannot connect to database:', err.message);
    process.exit(1);
  }

  console.log('✓ Step 2: Database connection successful');
  
  // Step 3: Optimize database
  db.serialize(() => {
    db.run('PRAGMA foreign_keys = ON');
    db.run('PRAGMA journal_mode = WAL');
    db.run('PRAGMA synchronous = NORMAL');
    db.run('PRAGMA cache_size = 10000');
  });
  
  console.log('✓ Step 3: Database optimized');

  // Step 4: Check users table
  db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", (err, tables) => {
    if (err) {
      console.error('❌ Error checking tables:', err.message);
      db.close();
      process.exit(1);
    }

    if (!tables || tables.length === 0) {
      console.error('❌ Users table missing!');
      console.log('   Run the database initialization first.');
      db.close();
      process.exit(1);
    }

    console.log('✓ Step 4: Users table verified');

    // Step 5: Verify table structure
    db.all("PRAGMA table_info(users)", (err, columns) => {
      if (err) {
        console.error('❌ Error checking table structure:', err.message);
        db.close();
        process.exit(1);
      }

      const requiredColumns = ['id', 'username', 'password_hash', 'role'];
      const hasRequiredColumns = requiredColumns.every(col => 
        columns.some(c => c.name === col)
      );

      if (!hasRequiredColumns) {
        console.error('❌ Users table structure is incorrect!');
        console.log('   Required columns:', requiredColumns);
        db.close();
        process.exit(1);
      }

      console.log('✓ Step 5: Table structure verified');

      // Step 6: Ensure admin user exists
      db.get(
        'SELECT id, username, password_hash, role FROM users WHERE username = ? AND role = ?',
        ['dortusnimely', 'admin'],
        async (err, user) => {
          if (err) {
            console.error('❌ Error querying database:', err.message);
            db.close();
            process.exit(1);
          }

          if (!user) {
            console.log('⚠️  Step 6: Admin user not found, creating...');
            try {
              const passwordHash = await bcrypt.hash('dortusnimely', 12);
              db.run(
                `INSERT INTO users (username, password_hash, role, first_name, last_name, status, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                ['dortusnimely', passwordHash, 'admin', 'Dortu', 'Snimely', 'active'],
                function(err) {
                  if (err) {
                    console.error('❌ Error creating user:', err.message);
                    db.close();
                    process.exit(1);
                  }
                  console.log('✓ Step 6: Admin user created');
                  verifyCredentials(db);
                }
              );
            } catch (hashErr) {
              console.error('❌ Error during password hashing:', hashErr.message);
              db.close();
              process.exit(1);
            }
          } else {
            console.log('✓ Step 6: Admin user exists (ID:', user.id + ')');
            verifyCredentials(db);
          }
        }
      );
    });
  });
});

async function verifyCredentials(db) {
  db.get(
    'SELECT id, username, password_hash, role FROM users WHERE username = ? AND role = ?',
    ['dortusnimely', 'admin'],
    async (err, user) => {
      if (err) {
        console.error('❌ Error verifying credentials:', err.message);
        db.close();
        process.exit(1);
      }

      if (!user) {
        console.error('❌ Admin user not found after creation!');
        db.close();
        process.exit(1);
      }

      try {
        const isValid = await bcrypt.compare('dortusnimely', user.password_hash);
        
        if (!isValid) {
          console.log('⚠️  Step 7: Password mismatch detected, fixing...');
          const newHash = await bcrypt.hash('dortusnimely', 12);
          db.run(
            'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [newHash, user.id],
            (err) => {
              if (err) {
                console.error('❌ Error updating password:', err.message);
                db.close();
                process.exit(1);
              }
              console.log('✓ Step 7: Password fixed');
              printSuccess(db);
            }
          );
        } else {
          console.log('✓ Step 7: Credentials verified');
          printSuccess(db);
        }
      } catch (bcryptErr) {
        console.error('❌ Error during password verification:', bcryptErr.message);
        db.close();
        process.exit(1);
      }
    }
  );
}

function printSuccess(db) {
  console.log('\n════════════════════════════════════════');
  console.log('  ✅ ALL CHECKS PASSED - LOGIN READY');
  console.log('════════════════════════════════════════\n');
  
  console.log('LOGIN INFORMATION:');
  console.log('  URL:      http://localhost:3000');
  console.log('  Username: dortusnimely');
  console.log('  Password: dortusnimely\n');
  
  console.log('VERIFICATION:');
  console.log('  ✓ Database: Connected');
  console.log('  ✓ Users table: Verified');
  console.log('  ✓ Admin user: Created/Verified');
  console.log('  ✓ Credentials: Valid\n');
  
  console.log('NEXT STEPS:');
  console.log('  1. Make sure servers are running');
  console.log('     Command: .\\start-servers.bat\n');
  console.log('  2. Open browser: http://localhost:3000\n');
  console.log('  3. Login with the credentials above\n');
  
  db.close();
  process.exit(0);
}
