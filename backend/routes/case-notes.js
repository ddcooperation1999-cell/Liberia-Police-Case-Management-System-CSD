/**
 * Case Notes Management
 * Handles notes, updates, and comments on cases
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
 * GET /api/case-notes - Get all case notes
 */
router.get('/', verifyToken, (req, res) => {
  db.all('SELECT * FROM case_notes ORDER BY created_at DESC LIMIT 100', (err, rows) => {
    if (err) {
      console.error('Error:', err);
      return res.status(500).json({ error: 'Failed to fetch notes' });
    }
    res.json(rows || []);
  });
});

/**
 * POST /api/case-notes - Add note to case
 */
router.post('/', verifyToken, (req, res) => {
  const { caseId, content, noteType = 'update', severity = 'normal' } = req.body;

  if (!caseId || !content) {
    return res.status(400).json({ error: 'caseId and content required' });
  }

  const query = `
    INSERT INTO case_notes (case_id, content, note_type, severity, created_by, created_at)
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `;

  db.run(query, [caseId, content, noteType, severity, req.user.userId], function(err) {
    if (err) {
      console.error('Error creating note:', err);
      return res.status(500).json({ error: 'Failed to create note' });
    }

    res.json({
      success: true,
      noteId: this.lastID,
      message: 'Note added successfully'
    });
  });
});

/**
 * GET /api/case-notes/:caseId - Get all notes for a case
 */
router.get('/:caseId', verifyToken, (req, res) => {
  const { limit = 50, offset = 0, type } = req.query;

  let query = `
    SELECT cn.*, u.username, u.first_name, u.last_name
    FROM case_notes cn
    JOIN users u ON cn.created_by = u.id
    WHERE cn.case_id = ?
  `;
  
  const params = [req.params.caseId];

  if (type) {
    query += ' AND cn.note_type = ?';
    params.push(type);
  }

  query += ' ORDER BY cn.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching notes:', err);
      return res.status(500).json({ error: 'Failed to fetch notes' });
    }

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM case_notes WHERE case_id = ?';
    const countParams = [req.params.caseId];

    if (type) {
      countQuery += ' AND note_type = ?';
      countParams.push(type);
    }

    db.get(countQuery, countParams, (err, countRow) => {
      res.json({
        notes: rows || [],
        total: countRow ? countRow.total : 0,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    });
  });
});

/**
 * PUT /api/case-notes/:noteId - Update note
 */
router.put('/:noteId', verifyToken, (req, res) => {
  const { content, severity } = req.body;

  // First check if user is the author
  const query = 'SELECT created_by FROM case_notes WHERE id = ?';
  
  db.get(query, [req.params.noteId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch note' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Note not found' });
    }

    if (row.created_by !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to edit this note' });
    }

    let updateQuery = 'UPDATE case_notes SET ';
    const params = [];

    if (content) {
      updateQuery += 'content = ? ';
      params.push(content);
    }

    if (severity) {
      if (params.length > 0) updateQuery += ', ';
      updateQuery += 'severity = ? ';
      params.push(severity);
    }

    if (content || severity) {
      updateQuery += ', updated_at = CURRENT_TIMESTAMP ';
    }

    updateQuery += 'WHERE id = ?';
    params.push(req.params.noteId);

    db.run(updateQuery, params, function(err) {
      if (err) {
        console.error('Error updating note:', err);
        return res.status(500).json({ error: 'Failed to update note' });
      }

      res.json({
        success: true,
        message: 'Note updated successfully'
      });
    });
  });
});

/**
 * DELETE /api/case-notes/:noteId - Delete note
 */
router.delete('/:noteId', verifyToken, (req, res) => {
  const query = 'SELECT created_by FROM case_notes WHERE id = ?';
  
  db.get(query, [req.params.noteId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch note' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Note not found' });
    }

    if (row.created_by !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this note' });
    }

    const deleteQuery = 'DELETE FROM case_notes WHERE id = ?';
    
    db.run(deleteQuery, [req.params.noteId], function(err) {
      if (err) {
        console.error('Error deleting note:', err);
        return res.status(500).json({ error: 'Failed to delete note' });
      }

      res.json({
        success: true,
        message: 'Note deleted successfully'
      });
    });
  });
});

/**
 * GET /api/case-notes/:caseId/summary - Get case notes summary
 */
router.get('/:caseId/summary', verifyToken, (req, res) => {
  const query = `
    SELECT 
      note_type,
      COUNT(*) as count,
      MAX(created_at) as last_updated
    FROM case_notes
    WHERE case_id = ?
    GROUP BY note_type
  `;

  db.all(query, [req.params.caseId], (err, rows) => {
    if (err) {
      console.error('Error fetching notes summary:', err);
      return res.status(500).json({ error: 'Failed to fetch notes summary' });
    }

    res.json({
      summary: rows || []
    });
  });
});

module.exports = router;
