const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, 'police_cases.db');

console.log('🔧 Login Error Fixer - Diagnosing Issues...\n');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Database connection error:', err);
    process.exit(1);
  }

  console.log('✓ Database connected\n');

  // Enable foreign keys and optimizations
  db.run('PRAGMA foreign_keys = ON');
  db.run('PRAGMA journal_mode = WAL');
  db.run('PRAGMA synchronous = NORMAL');
  db.run('PRAGMA cache_size = 10000');
  
  // Check users table
  db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", async (err, tables) => {
    if (err) {
      console.error('❌ Error checking tables:', err);
      db.close();
      process.exit(1);
    }

    if (!tables || tables.length === 0) {
      console.error('❌ Users table does not exist!');
      console.log('   Run: node backend/db-init.js first');
      db.close();
      process.exit(1);
    }

    console.log('✓ Users table exists\n');

    // Check if dortusnimely user exists
    db.get('SELECT id, username, role FROM users WHERE username = ?', ['dortusnimely'], async (err, user) => {
      if (err) {
        console.error('❌ Error querying users:', err);
        db.close();
        process.exit(1);
      }

      if (!user) {
        console.log('❌ Admin user "dortusnimely" not found!');
        console.log('   Creating admin user...');

        try {
          const passwordHash = await bcrypt.hash('dortusnimely', 12);
          
          db.run(
            `INSERT INTO users (username, password_hash, role, first_name, last_name, status, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            ['dortusnimely', passwordHash, 'admin', 'Dortu', 'Snimely', 'active'],
            function(err) {
              if (err) {
                console.error('❌ Error creating user:', err);
                db.close();
                process.exit(1);
              }
              console.log('✓ Admin user created successfully\n');
              verifyLogin(db);
            }
          );
        } catch (err) {
          console.error('❌ Error hashing password:', err);
          db.close();
          process.exit(1);
        }
      } else {
        console.log(`✓ Admin user "${user.username}" found (ID: ${user.id}, Role: ${user.role})\n`);
        verifyLogin(db);
      }
    });
  });
});

async function verifyLogin(db) {
  console.log('🔐 Verifying login credentials...\n');

  db.get(
    'SELECT id, username, password_hash, role FROM users WHERE username = ?',
    ['dortusnimely'],
    async (err, user) => {
      if (err) {
        console.error('❌ Error:', err);
        db.close();
        process.exit(1);
      }

      if (!user) {
        console.error('❌ User not found');
        db.close();
        process.exit(1);
      }

      try {
        const isValid = await bcrypt.compare('dortusnimely', user.password_hash);
        if (isValid) {
          console.log('✓ Password is correct');
          console.log('✓ Login will work\n');
        } else {
          console.error('❌ Password mismatch - fixing password...');
          const newHash = await bcrypt.hash('dortusnimely', 12);
          db.run('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, user.id], (err) => {
            if (err) {
              console.error('❌ Error updating password:', err);
              db.close();
              process.exit(1);
            }
            console.log('✓ Password fixed\n');
            finish(db);
          });
          return;
        }

        finish(db);
      } catch (err) {
        console.error('❌ Error during verification:', err);
        db.close();
        process.exit(1);
      }
    }
  );
}

function finish(db) {
  console.log('═══════════════════════════════════════');
  console.log('✅ LOGIN DIAGNOSTICS COMPLETE');
  console.log('═══════════════════════════════════════\n');
  console.log('✓ Database: OK');
  console.log('✓ Users table: OK');
  console.log('✓ Admin user: dortusnimely');
  console.log('✓ Password: dortusnimely');
  console.log('✓ Credentials verified\n');
  console.log('🔗 Access: http://localhost:3000');
  console.log('📝 Login: dortusnimely / dortusnimely\n');
  
  db.close();
  process.exit(0);
}
