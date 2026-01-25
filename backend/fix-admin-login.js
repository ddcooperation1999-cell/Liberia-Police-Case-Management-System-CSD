#!/usr/bin/env node

const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const dbPath = path.join(__dirname, 'police_cases.db');

const db = new sqlite3.Database(dbPath, async (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }

  console.log('Connected to database');

  try {
    // Check if user exists
    db.get('SELECT * FROM users WHERE username = ?', ['dortusnimely'], async (err, user) => {
      if (err) {
        console.error('Error querying user:', err);
        db.close();
        process.exit(1);
      }

      const password = 'dortusnimely';
      const hash = await bcrypt.hash(password, 12);

      if (user) {
        console.log('User dortusnimely exists, updating password...');
        db.run(
          'UPDATE users SET password_hash = ? WHERE username = ?',
          [hash, 'dortusnimely'],
          (err) => {
            if (err) {
              console.error('Error updating user:', err);
              db.close();
              process.exit(1);
            }
            console.log('✓ Password updated successfully');
            console.log('Username: dortusnimely');
            console.log('Password: dortusnimely');
            console.log('Role: admin');
            db.close();
            process.exit(0);
          }
        );
      } else {
        console.log('User dortusnimely not found, creating...');
        db.run(
          `INSERT INTO users (username, password_hash, role, first_name, last_name, status)
           VALUES (?, ?, ?, ?, ?, ?)`,
          ['dortusnimely', hash, 'admin', 'Dortu', 'Snimely', 'active'],
          function(err) {
            if (err) {
              console.error('Error creating user:', err);
              db.close();
              process.exit(1);
            }
            console.log('✓ User created successfully');
            console.log('Username: dortusnimely');
            console.log('Password: dortusnimely');
            console.log('Role: admin');
            db.close();
            process.exit(0);
          }
        );
      }
    });
  } catch (err) {
    console.error('Error:', err);
    db.close();
    process.exit(1);
  }
});
