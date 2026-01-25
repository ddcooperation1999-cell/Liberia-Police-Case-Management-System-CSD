const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('Creating admin user...');

const db = new sqlite3.Database(path.join(__dirname, 'police_cases.db'), (err) => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
  
  console.log('Database connected');
  
  // Hash the password
  bcrypt.hash('dortusnimely', 10, (err, hash) => {
    if (err) {
      console.error('Hash error:', err);
      process.exit(1);
    }
    
    console.log('Password hashed');
    
    // Insert user
    db.run(
      'INSERT OR REPLACE INTO users (username, password_hash, role) VALUES (?, ?, ?)',
      ['dortusnimely', hash, 'admin'],
      function(err) {
        if (err) {
          console.error('Insert error:', err);
        } else {
          console.log('✓ Admin user "dortusnimely" created successfully');
          console.log('✓ Password: dortusnimely');
          console.log('✓ Role: admin');
        }
        
        db.close((err) => {
          if (err) console.error('Close error:', err);
          process.exit(0);
        });
      }
    );
  });
});
