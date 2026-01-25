/**
 * Audit Logs Management
 * Retrieve and display audit logs for compliance and security monitoring
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'police_cases.db');
const db = new sqlite3.Database(dbPath);

/**
 * Middleware to verify authentication
 */
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * Middleware to check admin role
 */
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

/**
 * GET /api/audit-logs - Retrieve audit logs with filtering
 */
router.get('/', verifyToken, requireAdmin, (req, res) => {
  const { 
    limit = 100, 
    offset = 0,
    userId,
    action,
    resourceType,
    dateFrom,
    dateTo
  } = req.query;

  let query = `
    SELECT al.*, u.username, u.email, u.role
    FROM audit_logs al
    LEFT JOIN users u ON al.user_id = u.id
    WHERE 1=1
  `;

  const params = [];

  if (userId) {
    query += ' AND al.user_id = ?';
    params.push(userId);
  }

  if (action) {
    query += ' AND al.action LIKE ?';
    params.push(`%${action}%`);
  }

  if (resourceType) {
    query += ' AND al.resource_type = ?';
    params.push(resourceType);
  }

  if (dateFrom) {
    query += ' AND al.timestamp >= ?';
    params.push(dateFrom);
  }

  if (dateTo) {
    query += ' AND al.timestamp <= ?';
    params.push(dateTo);
  }

  query += ' ORDER BY al.timestamp DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching audit logs:', err);
      return res.status(500).json({ error: 'Failed to fetch audit logs' });
    }

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM audit_logs WHERE 1=1`;
    const countParams = [];

    if (userId) {
      countQuery += ' AND user_id = ?';
      countParams.push(userId);
    }

    if (action) {
      countQuery += ' AND action LIKE ?';
      countParams.push(`%${action}%`);
    }

    if (resourceType) {
      countQuery += ' AND resource_type = ?';
      countParams.push(resourceType);
    }

    if (dateFrom) {
      countQuery += ' AND timestamp >= ?';
      countParams.push(dateFrom);
    }

    if (dateTo) {
      countQuery += ' AND timestamp <= ?';
      countParams.push(dateTo);
    }

    db.get(countQuery, countParams, (err, countRow) => {
      res.json({
        logs: rows || [],
        total: countRow ? countRow.total : 0,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    });
  });
});

/**
 * GET /api/audit-logs/user/:userId - Get audit logs for specific user
 */
router.get('/user/:userId', verifyToken, requireAdmin, (req, res) => {
  const { limit = 50, offset = 0 } = req.query;

  const query = `
    SELECT al.*, u.username, u.email
    FROM audit_logs al
    LEFT JOIN users u ON al.user_id = u.id
    WHERE al.user_id = ?
    ORDER BY al.timestamp DESC
    LIMIT ? OFFSET ?
  `;

  db.all(query, [req.params.userId, parseInt(limit), parseInt(offset)], (err, rows) => {
    if (err) {
      console.error('Error fetching user audit logs:', err);
      return res.status(500).json({ error: 'Failed to fetch user audit logs' });
    }

    // Get total count
    db.get('SELECT COUNT(*) as total FROM audit_logs WHERE user_id = ?', 
      [req.params.userId], (err, countRow) => {
        res.json({
          logs: rows || [],
          total: countRow ? countRow.total : 0,
          limit: parseInt(limit),
          offset: parseInt(offset)
        });
      }
    );
  });
});

/**
 * GET /api/audit-logs/resource/:resourceType/:resourceId - Get audit logs for specific resource
 */
router.get('/resource/:resourceType/:resourceId', verifyToken, (req, res) => {
  const { limit = 50, offset = 0 } = req.query;

  const query = `
    SELECT al.*, u.username, u.email
    FROM audit_logs al
    LEFT JOIN users u ON al.user_id = u.id
    WHERE al.resource_type = ? AND al.resource_id = ?
    ORDER BY al.timestamp DESC
    LIMIT ? OFFSET ?
  `;

  db.all(
    query,
    [req.params.resourceType, req.params.resourceId, parseInt(limit), parseInt(offset)],
    (err, rows) => {
      if (err) {
        console.error('Error fetching resource audit logs:', err);
        return res.status(500).json({ error: 'Failed to fetch resource audit logs' });
      }

      // Get total count
      db.get(
        'SELECT COUNT(*) as total FROM audit_logs WHERE resource_type = ? AND resource_id = ?',
        [req.params.resourceType, req.params.resourceId],
        (err, countRow) => {
          res.json({
            logs: rows || [],
            total: countRow ? countRow.total : 0,
            limit: parseInt(limit),
            offset: parseInt(offset)
          });
        }
      );
    }
  );
});

/**
 * GET /api/audit-logs/summary - Get audit logs summary statistics
 */
router.get('/summary', verifyToken, requireAdmin, (req, res) => {
  const queries = {
    totalLogs: 'SELECT COUNT(*) as count FROM audit_logs',
    logsLast24h: `SELECT COUNT(*) as count FROM audit_logs 
                  WHERE timestamp >= datetime('now', '-1 day')`,
    actionBreakdown: `SELECT action, COUNT(*) as count FROM audit_logs 
                     GROUP BY action ORDER BY count DESC`,
    resourceBreakdown: `SELECT resource_type, COUNT(*) as count FROM audit_logs 
                       GROUP BY resource_type ORDER BY count DESC`,
    topUsers: `SELECT u.id, u.username, u.email, COUNT(*) as actions
              FROM audit_logs al
              JOIN users u ON al.user_id = u.id
              GROUP BY al.user_id
              ORDER BY actions DESC
              LIMIT 10`
  };

  const results = {};
  let pending = Object.keys(queries).length;

  Object.keys(queries).forEach(key => {
    db.all(queries[key], (err, rows) => {
      if (err) {
        console.error(`Error fetching ${key}:`, err);
        results[key] = null;
      } else {
        results[key] = rows;
      }
      pending--;
      if (pending === 0) {
        res.json(results);
      }
    });
  });
});

/**
 * POST /api/audit-logs - Create audit log entry (called by other services)
 */
router.post('/', (req, res) => {
  const { userId, action, resourceType, resourceId, oldValue, newValue, ipAddress } = req.body;

  if (!userId || !action || !resourceType) {
    return res.status(400).json({ 
      error: 'userId, action, and resourceType are required' 
    });
  }

  const query = `
    INSERT INTO audit_logs (user_id, action, resource_type, resource_id, old_value, new_value, ip_address, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `;

  db.run(
    query,
    [userId, action, resourceType, resourceId || null, oldValue || null, newValue || null, ipAddress || null],
    function(err) {
      if (err) {
        console.error('Error creating audit log:', err);
        return res.status(500).json({ error: 'Failed to create audit log' });
      }

      res.status(201).json({
        success: true,
        logId: this.lastID
      });
    }
  );
});

/**
 * GET /api/audit-logs/export - Export audit logs (CSV format)
 */
router.get('/export', verifyToken, requireAdmin, (req, res) => {
  const { dateFrom, dateTo } = req.query;

  let query = `
    SELECT al.timestamp, u.username, al.action, al.resource_type, al.resource_id,
           al.old_value, al.new_value, al.ip_address
    FROM audit_logs al
    LEFT JOIN users u ON al.user_id = u.id
    WHERE 1=1
  `;

  const params = [];

  if (dateFrom) {
    query += ' AND al.timestamp >= ?';
    params.push(dateFrom);
  }

  if (dateTo) {
    query += ' AND al.timestamp <= ?';
    params.push(dateTo);
  }

  query += ' ORDER BY al.timestamp DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error exporting audit logs:', err);
      return res.status(500).json({ error: 'Failed to export audit logs' });
    }

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'No audit logs found' });
    }

    // Convert to CSV format
    const headers = ['Timestamp', 'User', 'Action', 'Resource Type', 'Resource ID', 'Old Value', 'New Value', 'IP Address'];
    const csvContent = [
      headers.join(','),
      ...rows.map(row => [
        row.timestamp,
        row.username || 'Unknown',
        row.action,
        row.resource_type,
        row.resource_id || '',
        row.old_value || '',
        row.new_value || '',
        row.ip_address || ''
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="audit_logs.csv"');
    res.send(csvContent);
  });
});

module.exports = router;
