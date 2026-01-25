#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, 'police_cases.db');
const schemaPath = path.join(__dirname, 'sql', 'new_features_schema.sql');

console.log('🔧 Installing new features schema...');
console.log(`📁 Database: ${dbPath}`);
console.log(`📄 Schema: ${schemaPath}`);

// Read the schema file
if (!fs.existsSync(schemaPath)) {
  console.error(`❌ Schema file not found: ${schemaPath}`);
  process.exit(1);
}

const schema = fs.readFileSync(schemaPath, 'utf8');

// Open database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error(`❌ Error opening database: ${err.message}`);
    process.exit(1);
  }
  console.log('✅ Database opened');
});

// Split schema into individual statements
const statements = schema
  .split(';')
  .map(stmt => stmt.trim())
  .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

let completed = 0;
let failed = 0;

// Execute each statement
db.serialize(() => {
  statements.forEach((statement, index) => {
    db.run(statement, (err) => {
      if (err) {
        console.warn(`⚠️  Statement ${index + 1} warning: ${err.message}`);
        failed++;
      } else {
        completed++;
      }
    });
  });

  // Close after all statements
  db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    if (err) {
      console.error(`❌ Error verifying tables: ${err.message}`);
    } else {
      console.log('\n✅ Installation Complete!');
      console.log(`📊 Created ${completed}/${statements.length} statements`);
      if (failed > 0) {
        console.log(`⚠️  ${failed} statements had warnings (likely duplicates)`);
      }
      console.log(`\n📋 Database Tables:`);
      tables.forEach(t => console.log(`   • ${t.name}`));
    }
    db.close();
    process.exit(failed > 0 ? 1 : 0);
  });
});
