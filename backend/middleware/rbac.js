/**
 * Role-Based Access Control (RBAC) Middleware
 * Implements granular access control for different user roles and resources
 */

const jwt = require('jsonwebtoken');

// Define role-based permissions
const rolePermissions = {
  admin: {
    users: ['create', 'read', 'update', 'delete'],
    cases: ['create', 'read', 'update', 'delete'],
    reports: ['create', 'read', 'update', 'delete'],
    analytics: ['create', 'read', 'update', 'delete'],
    documents: ['create', 'read', 'update', 'delete'],
    criminalRecords: ['create', 'read', 'update', 'delete'],
    flaggedIndividuals: ['create', 'read', 'update', 'delete'],
    auditLogs: ['read'],
    systemSettings: ['read', 'update'],
  },
  officer: {
    cases: ['create', 'read', 'update'],
    reports: ['create', 'read'],
    documents: ['create', 'read', 'update'],
    criminalRecords: ['read'],
    flaggedIndividuals: ['read'],
    auditLogs: ['read'], // Limited audit log access
  },
  supervisor: {
    users: ['read', 'update'],
    cases: ['create', 'read', 'update', 'delete'],
    reports: ['create', 'read', 'update'],
    analytics: ['read', 'update'],
    documents: ['create', 'read', 'update', 'delete'],
    criminalRecords: ['create', 'read', 'update'],
    flaggedIndividuals: ['create', 'read', 'update'],
    auditLogs: ['read'],
  }
};

/**
 * Enhanced authentication middleware with role verification
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      code: 'NO_AUTH_HEADER'
    });
  }
  
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      code: 'NO_TOKEN'
    });
  }
  
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 32) {
      console.error('JWT_SECRET not properly configured');
      return res.status(500).json({ 
        error: 'Server configuration error',
        code: 'JWT_CONFIG_ERROR'
      });
    }
    
    const payload = jwt.verify(token, secret);
    req.user = payload;
    
    // Add user metadata for audit logging
    req.user.loginTime = new Date().toISOString();
    req.user.requestId = Math.random().toString(36).substring(7);
    
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired, please login again',
        code: 'TOKEN_EXPIRED'
      });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    } else {
      console.error('Token verification error:', err.message);
      return res.status(401).json({ 
        error: 'Invalid or expired token',
        code: 'TOKEN_VERIFICATION_ERROR'
      });
    }
  }
};

/**
 * Check if user has permission for specific resource and action
 */
const checkPermission = (userRole, resource, action) => {
  const permissions = rolePermissions[userRole];
  if (!permissions) {
    return false;
  }
  
  const resourcePermissions = permissions[resource];
  if (!resourcePermissions) {
    return false;
  }
  
  return resourcePermissions.includes(action);
};

/**
 * Middleware to check specific resource permissions
 */
const requirePermission = (resource, action) => {
  return (req, res, next) => {
    if (!checkPermission(req.user.role, resource, action)) {
      return res.status(403).json({ 
        error: `Insufficient permissions for ${action} on ${resource}`,
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredRole: 'admin'
      });
    }
    next();
  };
};

/**
 * Admin-only middleware
 */
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Admin access required',
      code: 'ADMIN_ONLY',
      userRole: req.user.role
    });
  }
  next();
};

/**
 * Supervisor or admin middleware
 */
const supervisorOrAdmin = (req, res, next) => {
  if (!['admin', 'supervisor'].includes(req.user.role)) {
    return res.status(403).json({ 
      error: 'Supervisor or admin access required',
      code: 'SUPERVISOR_OR_ADMIN_ONLY',
      userRole: req.user.role
    });
  }
  next();
};

/**
 * Officer authorization - can access their own county/department data
 */
const officerAuth = (req, res, next) => {
  if (req.user.role === 'admin') {
    return next(); // Admins can access everything
  }
  
  if (req.user.role === 'officer') {
    // Officer can access data for their county
    req.user.accessLevel = 'county'; // Limit to their county
    return next();
  }
  
  return res.status(403).json({ 
    error: 'Access denied',
    code: 'ACCESS_DENIED',
    userRole: req.user.role
  });
};

/**
 * Data ownership check - verify user owns the resource
 */
const checkDataOwnership = (req, resourceUserId) => {
  // Admin can access all data
  if (req.user.role === 'admin') {
    return true;
  }
  
  // User can access their own data
  return req.user.id === resourceUserId;
};

/**
 * Middleware for data ownership verification
 */
const requireDataOwnership = (userIdField = 'userId') => {
  return (req, res, next) => {
    const resourceUserId = req.body[userIdField] || req.params[userIdField];
    
    if (!checkDataOwnership(req, resourceUserId)) {
      return res.status(403).json({ 
        error: 'You do not have permission to access this resource',
        code: 'OWNERSHIP_CHECK_FAILED'
      });
    }
    
    next();
  };
};

/**
 * Get all available actions for a role
 */
const getRolePermissions = (role) => {
  return rolePermissions[role] || {};
};

module.exports = {
  authMiddleware,
  adminOnly,
  supervisorOrAdmin,
  officerAuth,
  requirePermission,
  requireDataOwnership,
  checkPermission,
  checkDataOwnership,
  getRolePermissions,
  rolePermissions
};
