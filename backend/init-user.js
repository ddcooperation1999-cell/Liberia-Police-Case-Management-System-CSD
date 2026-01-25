const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, 'police_cases.db');
const db = new sqlite3.Database(dbPath);

// Check if user exists and create if needed
db.serialize(() => {
  // First, check if user exists
  db.get('SELECT * FROM users WHERE username = ?', ['dortusnimely'], async (err, row) => {
    if (err) {
      console.error('Error checking user:', err);
      process.exit(1);
    }

    if (row) {
      console.log('✓ User dortusnimely already exists');
      db.close();
      process.exit(0);
    } else {
      console.log('User not found. Creating default admin user...');
      
      try {
        const passwordHash = await bcrypt.hash('dortusnimely', 12);
        
        db.run(
          `INSERT INTO users (username, password_hash, role, first_name, last_name, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          ['dortusnimely', passwordHash, 'admin', 'Dortu', 'Snimely', 'active'],
          function(err) {
            if (err) {
              console.error('Error creating user:', err);
              process.exit(1);
            }
            console.log('✓ Default admin user created successfully');
            console.log('Username: dortusnimely');
            console.log('Password: dortusnimely');
            db.close();
            process.exit(0);
          }
        );
      } catch (err) {
        console.error('Error hashing password:', err);
        process.exit(1);
      }
    }
  });
});
