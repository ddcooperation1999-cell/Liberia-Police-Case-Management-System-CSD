const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'police_cases.db');
const db = new sqlite3.Database(dbPath);

db.all('SELECT id, username, role, status FROM users', (err, rows) => {
  if (err) {
    console.error('Error:', err);
    process.exit(1);
  }
  
  console.log('Users in database:');
  if (rows && rows.length > 0) {
    rows.forEach(row => {
      console.log(`  - ID: ${row.id}, Username: ${row.username}, Role: ${row.role}, Status: ${row.status}`);
    });
  } else {
    console.log('  No users found');
  }
  
  db.close();
  process.exit(0);
});
