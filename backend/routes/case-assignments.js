/**
 * Case Assignment Management
 * Handles assignment of cases to officers/supervisors
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
 * GET /api/case-assignments - Get all case assignments
 */
router.get('/', verifyToken, (req, res) => {
  const { officer_id, status } = req.query;
  let query = 'SELECT * FROM case_assignments';
  const params = [];
  
  if (officer_id) {
    query += ' WHERE officer_id = ?';
    params.push(officer_id);
  }
  
  if (status) {
    query += (officer_id ? ' AND' : ' WHERE') + ' status = ?';
    params.push(status);
  }
  
  query += ' ORDER BY assigned_date DESC LIMIT 100';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error:', err);
      return res.status(500).json({ error: 'Failed to fetch assignments' });
    }
    res.json(rows || []);
  });
});

/**
 * POST /api/case-assignments - Assign case to officer(s)
 */
router.post('/', verifyToken, (req, res) => {
  const { caseId, officerId, assignedBy, notes } = req.body;

  if (!caseId || !officerId) {
    return res.status(400).json({ error: 'caseId and officerId required' });
  }

  const query = `
    INSERT INTO case_assignments (case_id, officer_id, assigned_by, assignment_date, notes, status)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?, 'active')
  `;

  db.run(query, [caseId, officerId, req.user.userId, notes || null], function(err) {
    if (err) {
      console.error('Error assigning case:', err);
      return res.status(500).json({ error: 'Failed to assign case' });
    }

    res.json({
      success: true,
      assignmentId: this.lastID,
      message: 'Case assigned successfully'
    });
  });
});

/**
 * GET /api/case-assignments/:caseId - Get case assignments
 */
router.get('/:caseId', verifyToken, (req, res) => {
  const query = `
    SELECT ca.*, u.username, u.first_name, u.last_name, u.role
    FROM case_assignments ca
    JOIN users u ON ca.officer_id = u.id
    WHERE ca.case_id = ?
    ORDER BY ca.assignment_date DESC
  `;

  db.all(query, [req.params.caseId], (err, rows) => {
    if (err) {
      console.error('Error fetching assignments:', err);
      return res.status(500).json({ error: 'Failed to fetch assignments' });
    }

    res.json({
      assignments: rows || [],
      total: rows ? rows.length : 0
    });
  });
});

/**
 * GET /api/case-assignments/officer/:officerId - Get officer's assigned cases
 */
router.get('/officer/:officerId', verifyToken, (req, res) => {
  const query = `
    SELECT ca.*, pc.case_number, pc.case_type, pc.status, pc.priority
    FROM case_assignments ca
    JOIN police_cases pc ON ca.case_id = pc.id
    WHERE ca.officer_id = ? AND ca.status = 'active'
    ORDER BY ca.assignment_date DESC
  `;

  db.all(query, [req.params.officerId], (err, rows) => {
    if (err) {
      console.error('Error fetching officer cases:', err);
      return res.status(500).json({ error: 'Failed to fetch officer cases' });
    }

    res.json({
      cases: rows || [],
      total: rows ? rows.length : 0
    });
  });
});

/**
 * PUT /api/case-assignments/:assignmentId - Update assignment
 */
router.put('/:assignmentId', verifyToken, (req, res) => {
  const { status, notes } = req.body;

  let query = 'UPDATE case_assignments SET ';
  const params = [];

  if (status) {
    query += 'status = ? ';
    params.push(status);
  }

  if (notes !== undefined) {
    if (params.length > 0) query += ', ';
    query += 'notes = ? ';
    params.push(notes);
  }

  query += 'WHERE id = ?';
  params.push(req.params.assignmentId);

  db.run(query, params, function(err) {
    if (err) {
      console.error('Error updating assignment:', err);
      return res.status(500).json({ error: 'Failed to update assignment' });
    }

    res.json({
      success: true,
      message: 'Assignment updated successfully'
    });
  });
});

/**
 * DELETE /api/case-assignments/:assignmentId - Remove assignment
 */
router.delete('/:assignmentId', verifyToken, (req, res) => {
  const query = 'UPDATE case_assignments SET status = ? WHERE id = ?';

  db.run(query, ['inactive', req.params.assignmentId], function(err) {
    if (err) {
      console.error('Error removing assignment:', err);
      return res.status(500).json({ error: 'Failed to remove assignment' });
    }

    res.json({
      success: true,
      message: 'Assignment removed successfully'
    });
  });
});

/**
 * POST /api/case-assignments/bulk - Assign case to multiple officers
 */
router.post('/bulk/assign', verifyToken, (req, res) => {
  const { caseId, officerIds, notes } = req.body;

  if (!caseId || !officerIds || officerIds.length === 0) {
    return res.status(400).json({ error: 'caseId and officerIds required' });
  }

  const query = `
    INSERT INTO case_assignments (case_id, officer_id, assigned_by, assignment_date, notes, status)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?, 'active')
  `;

  let successCount = 0;
  let errorCount = 0;

  officerIds.forEach(officerId => {
    db.run(query, [caseId, officerId, req.user.userId, notes || null], (err) => {
      if (err) {
        errorCount++;
      } else {
        successCount++;
      }

      if (successCount + errorCount === officerIds.length) {
        res.json({
          success: true,
          assigned: successCount,
          failed: errorCount,
          message: `Assigned to ${successCount} officer(s)`
        });
      }
    });
  });
});

module.exports = router;
