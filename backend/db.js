const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'police_cases.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Database connected successfully');
    // Optimize SQLite for better performance
    db.run('PRAGMA journal_mode = WAL'); // Write-ahead logging
    db.run('PRAGMA synchronous = NORMAL'); // Reduce I/O
    db.run('PRAGMA cache_size = 10000'); // Increase cache
    db.run('PRAGMA foreign_keys = ON'); // Enforce constraints
    db.run('PRAGMA temp_store = MEMORY'); // Temp tables in memory
  }
});

// Connection pooling simulation
const connectionPool = {
  maxConnections: 5,
  activeConnections: 0,
  queue: [],
  
  acquire: function() {
    if (this.activeConnections < this.maxConnections) {
      this.activeConnections++;
      return db;
    }
    return new Promise(resolve => {
      this.queue.push(resolve);
    });
  },
  
  release: function() {
    this.activeConnections--;
    if (this.queue.length > 0) {
      const resolve = this.queue.shift();
      this.activeConnections++;
      resolve(db);
    }
  }
};

// Handle database errors
db.on('error', (err) => {
  console.error('Database error:', err);
});

module.exports = {
  query: (text, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(text, params, (err, rows) => {
        if (err) {
          console.error('Query error:', { text, params, error: err.message });
          reject(new Error(`Database query failed: ${err.message}`));
        }
        else resolve({ rows: rows || [] });
      });
    });
  },
  run: (text, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(text, params, function(err) {
        if (err) {
          console.error('Run error:', { text, params, error: err.message });
          reject(new Error(`Database operation failed: ${err.message}`));
        }
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  },
  exec: (text) => {
    return new Promise((resolve, reject) => {
      db.exec(text, (err) => {
        if (err) {
          console.error('Exec error:', { error: err.message });
          reject(new Error(`Database initialization failed: ${err.message}`));
        }
        else resolve();
      });
    });
  },
  db,
};
