const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'police_cases.db'));

db.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name", (err, tables) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Tables in database:');
    tables.forEach(t => console.log('  -', t.name));
  }
  db.close();
});
