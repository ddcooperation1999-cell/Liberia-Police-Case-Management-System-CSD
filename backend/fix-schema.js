const db = require('./db');
const fs = require('fs');
const path = require('path');

async function fixDatabaseSchema() {
  try {
    console.log('🔧 Fixing database schema issues...\n');

    // 1. Fix case_assignments table - add missing columns
    console.log('1. Fixing case_assignments table...');
    try {
      // Check if table has the column
      const result = await db.query("PRAGMA table_info(case_assignments)");
      const columns = result.rows.map(r => r.name);
      
      const neededColumns = {
        'assigned_date': "ALTER TABLE case_assignments ADD COLUMN assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
        'assigned_by': "ALTER TABLE case_assignments ADD COLUMN assigned_by INTEGER",
      };

      for (const [colName, alterSQL] of Object.entries(neededColumns)) {
        if (!columns.includes(colName)) {
          try {
            await db.run(alterSQL);
            console.log(`   ✅ Added column: ${colName}`);
          } catch (err) {
            if (!err.message.includes('duplicate column')) {
              console.log(`   ⚠️  ${colName}: ${err.message}`);
            }
          }
        }
      }
    } catch (err) {
      console.log('   ⚠️  Could not verify columns:', err.message);
    }

    // 2. Ensure geolocation_tags table exists and has proper structure
    console.log('\n2. Verifying geolocation_tags table...');
    try {
      await db.query('SELECT COUNT(*) FROM geolocation_tags LIMIT 1');
      console.log('   ✅ geolocation_tags table exists');
    } catch (err) {
      console.log('   ℹ️  Creating geolocation_tags table...');
      await db.run(`
        CREATE TABLE IF NOT EXISTS geolocation_tags (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          case_id INTEGER NOT NULL,
          latitude REAL NOT NULL,
          longitude REAL NOT NULL,
          location_name TEXT,
          location_type TEXT DEFAULT 'other',
          description TEXT,
          timestamp TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (case_id) REFERENCES police_cases(id)
        )
      `);
      console.log('   ✅ geolocation_tags table created');
    }

    // 3. Ensure offline_queue table exists
    console.log('\n3. Verifying offline_queue table...');
    try {
      await db.query('SELECT COUNT(*) FROM offline_queue LIMIT 1');
      console.log('   ✅ offline_queue table exists');
    } catch (err) {
      console.log('   ℹ️  Creating offline_queue table...');
      await db.run(`
        CREATE TABLE IF NOT EXISTS offline_queue (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          action TEXT NOT NULL,
          table_name TEXT NOT NULL,
          data TEXT,
          record_id INTEGER,
          synced INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('   ✅ offline_queue table created');
    }

    // 4. Ensure translations table exists
    console.log('\n4. Verifying translations table...');
    try {
      await db.query('SELECT COUNT(*) FROM translations LIMIT 1');
      console.log('   ✅ translations table exists');
    } catch (err) {
      console.log('   ℹ️  Creating translations table...');
      await db.run(`
        CREATE TABLE IF NOT EXISTS translations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          key TEXT UNIQUE NOT NULL,
          english TEXT NOT NULL,
          kpelle TEXT,
          mandingo TEXT,
          context TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('   ✅ translations table created');
    }

    // 5. Ensure case_closure table exists
    console.log('\n5. Verifying case_closures table...');
    try {
      await db.query('SELECT COUNT(*) FROM case_closures LIMIT 1');
      console.log('   ✅ case_closures table exists');
    } catch (err) {
      console.log('   ℹ️  Creating case_closures table...');
      await db.run(`
        CREATE TABLE IF NOT EXISTS case_closures (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          case_id INTEGER NOT NULL UNIQUE,
          closing_reason TEXT NOT NULL,
          closure_date DATE,
          disposition TEXT,
          notes TEXT,
          status TEXT DEFAULT 'initiated',
          approved_at TIMESTAMP,
          rejected_at TIMESTAMP,
          rejection_reason TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (case_id) REFERENCES police_cases(id)
        )
      `);
      console.log('   ✅ case_closures table created');
    }

    // 6. Verify all other tables
    console.log('\n6. Verifying other tables...');
    const tablesNeeded = ['cases', 'case_notes', 'evidence', 'notifications', 'audit_logs'];
    for (const table of tablesNeeded) {
      try {
        await db.query(`SELECT COUNT(*) FROM ${table} LIMIT 1`);
        console.log(`   ✅ ${table} table exists`);
      } catch (err) {
        console.log(`   ⚠️  ${table} table not found: ${err.message}`);
      }
    }

    console.log('\n✅ Database schema verification complete!\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error fixing schema:', error);
    process.exit(1);
  }
}

fixDatabaseSchema();
