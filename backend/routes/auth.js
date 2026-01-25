const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

// Login - Simple, no blocks, no restrictions
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Query user from database
    const result = await db.query(
      'SELECT id, username, password_hash, role, county_id FROM users WHERE username = ?',
      [username]
    );

    // Check if user exists
    if (!result.rows || result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        county_id: user.county_id
      },
      process.env.JWT_SECRET || 'default-secret-key-change-me',
      { expiresIn: '8h' }
    );

    // Return token and user info
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        county_id: user.county_id
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Register officer (admin only)
router.post('/register', async (req, res) => {
  const { username, password, county_id } = req.body;

  const trimmedUsername = username?.trim();
  const trimmedPassword = password?.trim();

  if (!trimmedUsername || !trimmedPassword || !county_id) {
    return res.status(400).json({ error: 'Username, password, and county are required' });
  }

  try {
    const hash = await bcrypt.hash(trimmedPassword, parseInt(process.env.BCRYPT_ROUNDS) || 12);
    await db.run('INSERT INTO users (username, password_hash, role, county_id) VALUES (?, ?, ?, ?)', [trimmedUsername, hash, 'officer', county_id]);
    res.status(201).json({ message: 'Officer registered successfully' });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ error: 'Username already exists' });
    } else {
      console.error('Registration error:', err);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
});

module.exports = router;
