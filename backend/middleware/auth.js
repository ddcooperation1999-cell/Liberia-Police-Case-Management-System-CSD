const jwt = require('jsonwebtoken');

// General auth middleware
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      console.warn('🔴 No auth header in request to', req.path);
      return res.status(401).json({ error: 'No authorization header' });
    }
    
    const parts = authHeader.split(' ');
    const token = parts.length === 2 ? parts[1] : authHeader;
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const secret = process.env.JWT_SECRET || 'default-secret-key-change-me';
    const payload = jwt.verify(token, secret);
    req.user = payload;
    console.log('✅ Auth success for user:', payload.username);
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
