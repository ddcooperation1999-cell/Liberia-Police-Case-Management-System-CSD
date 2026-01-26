/**
 * Multi-Database Support - SQLite (local) and PostgreSQL (production)
 * Automatically detects environment and uses appropriate database
 */

const path = require('path');
require('dotenv').config();

let db;
let isPostgres = false;

function initializeDatabase() {
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('postgresql')) {
    // Production: PostgreSQL
    console.log('📡 Initializing PostgreSQL connection...');
    const { Pool } = require('pg');
    
    db = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 10,
      min: 2,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    db.on('error', (err) => {
      console.error('PostgreSQL pool error:', err);
    });

    isPostgres = true;
    console.log('✅ PostgreSQL connected successfully');
    
    // Initialize schema
    initializePostgresSchema();
  } else {
    // Local: SQLite
    console.log('📚 Initializing SQLite connection...');
    const sqlite3 = require('sqlite3').verbose();
    const dbPath = path.join(__dirname, 'police_cases.db');
    
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('SQLite Error:', err);
      } else {
        console.log('✅ SQLite connected successfully');
        
        // Optimize SQLite
        db.run('PRAGMA journal_mode = WAL');
        db.run('PRAGMA synchronous = NORMAL');
        db.run('PRAGMA cache_size = 10000');
        db.run('PRAGMA foreign_keys = ON');
        db.run('PRAGMA temp_store = MEMORY');
        
        // Initialize schema
        initializeSqliteSchema();
      }
    });

    db.on('error', (err) => {
      console.error('SQLite error:', err);
    });
  }

  return db;
}

async function initializePostgresSchema() {
  try {
    const queries = [
      `CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        role VARCHAR(50) DEFAULT 'officer',
        status VARCHAR(50) DEFAULT 'active',
        badge_number VARCHAR(100) UNIQUE,
        county VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
      
      `CREATE TABLE IF NOT EXISTS cases (
        id SERIAL PRIMARY KEY,
        case_number VARCHAR(50) UNIQUE NOT NULL,
        title VARCHAR(255),
        description TEXT,
        case_type VARCHAR(100),
        status VARCHAR(50) DEFAULT 'open',
        priority VARCHAR(50) DEFAULT 'normal',
        investigator_id INTEGER REFERENCES users(id),
        evidence_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
      
      `CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        message TEXT,
        type VARCHAR(50),
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,

      `CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        action VARCHAR(255),
        table_name VARCHAR(100),
        record_id INTEGER,
        changes JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,

      `CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);`,
      `CREATE INDEX IF NOT EXISTS idx_cases_case_number ON cases(case_number);`,
      `CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);`,
      `CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);`,
      `CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);`
    ];

    const client = await db.connect();
    try {
      for (const query of queries) {
        await client.query(query);
      }
      console.log('✅ PostgreSQL schema initialized');
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error initializing PostgreSQL schema:', err);
  }
}

function initializeSqliteSchema() {
  const queries = [
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT UNIQUE,
      role TEXT DEFAULT 'officer',
      status TEXT DEFAULT 'active',
      badge_number TEXT UNIQUE,
      county TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,
    
    `CREATE TABLE IF NOT EXISTS cases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_number TEXT UNIQUE NOT NULL,
      title TEXT,
      description TEXT,
      case_type TEXT,
      status TEXT DEFAULT 'open',
      priority TEXT DEFAULT 'normal',
      investigator_id INTEGER REFERENCES users(id),
      evidence_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,
    
    `CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      message TEXT,
      type TEXT,
      is_read BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      action TEXT,
      table_name TEXT,
      record_id INTEGER,
      changes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);`,
    `CREATE INDEX IF NOT EXISTS idx_cases_case_number ON cases(case_number);`,
    `CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);`,
    `CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);`,
    `CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);`
  ];

  queries.forEach(query => {
    db.run(query, (err) => {
      if (err && !err.message.includes('already exists')) {
        console.error('SQLite schema error:', err);
      }
    });
  });
}

module.exports = {
  getDb: () => db,
  isPostgres: () => isPostgres,
  initialize: initializeDatabase
};
