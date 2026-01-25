const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'police_cases.db');
const schemaPath = path.join(__dirname, 'sql', 'new_features_schema.sql');

console.log('Installing schema...\n');

const schema = fs.readFileSync(schemaPath, 'utf8');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.exec(schema, (err) => {
    if (err) {
      console.error('Error:', err.message);
    } else {
      console.log('✅ Schema installed successfully!\n');
      
      // List tables
      db.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name", [], (err, tables) => {
        if (!err && tables.length > 0) {
          console.log('Database tables:');
          tables.forEach(t => console.log(`  • ${t.name}`));
        }
        db.close();
        process.exit(0);
      });
    }
  });
});
