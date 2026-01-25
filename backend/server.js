#!/usr/bin/env node
/**
 * Minimal Backend Server for LNPMS
 * This server handles authentication and provides core API endpoints
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database setup
let db;
try {
  db = new sqlite3.Database(path.join(__dirname, 'police_cases.db'), (err) => {
    if (err) {
      console.error('[DB] Connection error:', err.message);
    } else {
      console.log('[DB] Connected successfully');
    }
  });
  db.configure('busyTimeout', 5000);
} catch (err) {
  console.error('[FATAL] Database initialization failed:', err);
  process.exit(1);
}

// Utility: Promise-based database query
const dbQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('[DB] Query error:', { sql, params, error: err.message });
        reject(err);
      } else {
        resolve(rows || []);
      }
    });
  });
};

// Utility: Promise-based database run
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        console.error('[DB] Run error:', { sql, params, error: err.message });
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    server: 'LNPMS Backend API'
  });
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    console.log(`[AUTH] Login attempt for user: ${username}`);

    // Query user
    const users = await dbQuery(
      'SELECT id, username, password_hash, role FROM users WHERE username = ?',
      [username]
    );

    if (!users || users.length === 0) {
      console.log(`[AUTH] User not found: ${username}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // Verify password with bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!passwordMatch) {
      console.log(`[AUTH] Password mismatch for user: ${username}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    console.log(`[AUTH] Login successful for user: ${username}`);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });

  } catch (err) {
    console.error('[AUTH] Login error:', err);
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// Create admin user if doesn't exist
app.post('/api/auth/setup-admin', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    // Check if user exists
    const existing = await dbQuery('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    const result = await dbRun(
      'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
      [username, passwordHash, 'admin']
    );

    console.log(`[AUTH] Admin user created: ${username}`);

    res.json({
      success: true,
      message: 'Admin user created',
      userId: result.lastID
    });

  } catch (err) {
    console.error('[SETUP] Error:', err);
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// Get current user
app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const users = await dbQuery('SELECT id, username, role FROM users WHERE id = ?', [decoded.id]);

    if (!users.length) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({ user: users[0] });
  } catch (err) {
    console.error('[AUTH] Token verification error:', err.message);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Get all counties
app.get('/api/counties', async (req, res) => {
  try {
    const counties = await dbQuery('SELECT id, name FROM counties ORDER BY name');
    res.json({ counties });
  } catch (err) {
    console.error('[API] Counties error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get cases
app.get('/api/cases', async (req, res) => {
  try {
    const cases = await dbQuery(`
      SELECT id, case_number, case_type, status, priority, created_at 
      FROM police_cases 
      ORDER BY created_at DESC 
      LIMIT 50
    `);
    res.json({ cases });
  } catch (err) {
    console.error('[API] Cases error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`[SERVER] LNPMS Backend API started`);
  console.log(`[SERVER] Listening on http://localhost:${PORT}`);
  console.log(`[SERVER] Database: ${path.join(__dirname, 'police_cases.db')}`);
  console.log(`[SERVER] CORS enabled for localhost:3000`);
  console.log(`${'='.repeat(60)}\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[SERVER] Shutting down...');
  db.close((err) => {
    if (err) console.error('[DB] Close error:', err);
    server.close(() => {
      console.log('[SERVER] Stopped');
      process.exit(0);
    });
  });
});

process.on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[FATAL] Unhandled rejection:', reason);
});
