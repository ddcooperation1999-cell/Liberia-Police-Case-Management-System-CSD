const jwt = require('jsonwebtoken');
const db = require('../db');

// General auth middleware (supports a localhost development bypass)
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers['x-access-token'] || req.query?.token;

    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const parts = typeof authHeader === 'string' && authHeader.split ? authHeader.split(' ') : [authHeader];
    const token = parts.length === 2 ? parts[1] : parts[0];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const secret = process.env.JWT_SECRET || 'default-secret-key-change-me';
    const payload = jwt.verify(token, secret);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Admin only middleware
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Officer auth
const officerAuth = (req, res, next) => {
  if (req.user.role === 'admin') {
    return next();
  }
  if (req.user.role === 'officer') {
    return next();
  }
  return res.status(403).json({ error: 'Officer access required' });
};

module.exports = { authMiddleware, adminOnly, officerAuth };
