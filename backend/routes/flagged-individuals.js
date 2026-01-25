const express = require('express');
const db = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Get all flagged individuals
router.get('/', authMiddleware, async (req, res) => {
  try {
    const status = req.query.status || '';
    const severity = req.query.severity || '';
    
    let query = `
      SELECT fi.id, fi.suspect_id, fi.flag_reason, fi.severity, fi.flag_status,
             fi.notes, u.username as flagged_by, fi.created_at,
             s.first_name, s.last_name, s.national_id
      FROM flagged_individuals fi
      LEFT JOIN users u ON fi.flagged_by = u.id
      LEFT JOIN suspects s ON fi.suspect_id = s.id
      WHERE 1=1
    `;
    let params = [];

    if (status) {
      query += ` AND fi.flag_status = ?`;
      params.push(status);
    }

    if (severity) {
      query += ` AND fi.severity = ?`;
      params.push(severity);
    }

    query += ` ORDER BY fi.created_at DESC`;
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching flagged individuals:', err);
    res.status(500).json({ error: 'Failed to fetch flagged individuals' });
  }
});

// Check if suspect is flagged
router.get('/suspect/:suspectId', authMiddleware, async (req, res) => {
  try {
    const { suspectId } = req.params;
    const result = await db.query(`
      SELECT fi.id, fi.flag_reason, fi.severity, fi.flag_status, fi.notes, fi.created_at,
             u.username as flagged_by
      FROM flagged_individuals fi
      LEFT JOIN users u ON fi.flagged_by = u.id
      WHERE fi.suspect_id = ? AND fi.flag_status = 'active'
      ORDER BY fi.created_at DESC
    `, [suspectId]);
    
    res.json({
      is_flagged: result.rows.length > 0,
      flags: result.rows
    });
  } catch (err) {
    console.error('Error checking suspect flag:', err);
    res.status(500).json({ error: 'Failed to check suspect flag' });
  }
});

// Flag an individual (admin only)
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  const { suspect_id, flag_reason, severity, notes } = req.body;

  if (!suspect_id || !flag_reason || !severity) {
    return res.status(400).json({ error: 'Suspect ID, flag reason, and severity are required' });
  }

  if (!['low', 'medium', 'high', 'critical'].includes(severity)) {
    return res.status(400).json({ error: 'Invalid severity level' });
  }

  try {
    // Check if suspect exists
    const suspectResult = await db.query('SELECT * FROM suspects WHERE id = ?', [suspect_id]);
    if (suspectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Suspect not found' });
    }

    const result = await db.run(
      `INSERT INTO flagged_individuals (suspect_id, flag_reason, severity, flagged_by, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [suspect_id, flag_reason, severity, req.user.id, notes || null]
    );

    res.status(201).json({
      id: result.lastID,
      message: 'Individual flagged successfully'
    });
  } catch (err) {
    console.error('Error flagging individual:', err);
    res.status(500).json({ error: 'Failed to flag individual' });
  }
});

// Update flag status
router.put('/:flagId', authMiddleware, adminOnly, async (req, res) => {
  const { flag_status, notes } = req.body;

  if (!flag_status) {
    return res.status(400).json({ error: 'Flag status is required' });
  }

  if (!['active', 'inactive', 'resolved'].includes(flag_status)) {
    return res.status(400).json({ error: 'Invalid flag status' });
  }

  try {
    await db.run(
      `UPDATE flagged_individuals 
       SET flag_status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [flag_status, notes || null, req.params.flagId]
    );

    res.json({ message: 'Flag updated successfully' });
  } catch (err) {
    console.error('Error updating flag:', err);
    res.status(500).json({ error: 'Failed to update flag' });
  }
});

// Delete flag
router.delete('/:flagId', authMiddleware, adminOnly, async (req, res) => {
  try {
    const flagResult = await db.query('SELECT * FROM flagged_individuals WHERE id = ?', [req.params.flagId]);
    if (flagResult.rows.length === 0) {
      return res.status(404).json({ error: 'Flag not found' });
    }

    await db.run('DELETE FROM flagged_individuals WHERE id = ?', [req.params.flagId]);
    res.json({ message: 'Flag deleted successfully' });
  } catch (err) {
    console.error('Error deleting flag:', err);
    res.status(500).json({ error: 'Failed to delete flag' });
  }
});

module.exports = router;
