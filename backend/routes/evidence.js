/**
 * Evidence Management
 * Handles physical and digital evidence tracking with custody chain
 */

const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');

/**
 * GET /api/evidence - Get all evidence (root endpoint)
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT e.*, c.case_number 
       FROM evidence e 
       LEFT JOIN cases c ON e.case_id = c.id 
       ORDER BY e.created_at DESC`
    );
    res.json(result.rows || []);
  } catch (err) {
    console.error('Error fetching evidence:', err);
    res.status(500).json({ error: 'Failed to fetch evidence' });
  }
});

/**
 * GET /api/evidence/list - Get all evidence
 */
router.get('/list', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT e.*, c.case_number 
       FROM evidence e 
       LEFT JOIN cases c ON e.case_id = c.id 
       ORDER BY e.created_at DESC`
    );
    res.json(result.rows || []);
  } catch (err) {
    console.error('Error fetching evidence:', err);
    res.status(500).json({ error: 'Failed to fetch evidence' });
  }
});

/**
 * POST /api/evidence - Create evidence record
 */
router.post('/', authMiddleware, async (req, res) => {
  const { case_id, evidence_number, evidence_type, description, custody_chain, location, collected_date, collected_by, status } = req.body;

  if (!case_id || !evidence_number || !description) {
    return res.status(400).json({ error: 'Case ID, evidence number, and description required' });
  }

  try {
    const result = await db.run(
      `INSERT INTO evidence 
       (case_id, evidence_number, evidence_type, description, custody_chain, location, collected_date, collected_by, status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [case_id, evidence_number, evidence_type || 'physical', description, custody_chain, location, collected_date, collected_by, status || 'collected']
    );
    res.status(201).json({ id: result.lastID, message: 'Evidence recorded' });
  } catch (err) {
    console.error('Error creating evidence:', err);
    if (err.message.includes('UNIQUE constraint')) {
      res.status(400).json({ error: 'Evidence number already exists' });
    } else {
      res.status(500).json({ error: 'Failed to record evidence' });
    }
  }
});

/**
 * PUT /api/evidence/:id - Update evidence
 */
router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { case_id, evidence_number, evidence_type, description, custody_chain, location, collected_date, collected_by, status } = req.body;

  try {
    await db.run(
      `UPDATE evidence 
       SET case_id = COALESCE(?, case_id),
           evidence_number = COALESCE(?, evidence_number),
           evidence_type = COALESCE(?, evidence_type),
           description = COALESCE(?, description),
           custody_chain = COALESCE(?, custody_chain),
           location = COALESCE(?, location),
           collected_date = COALESCE(?, collected_date),
           collected_by = COALESCE(?, collected_by),
           status = COALESCE(?, status)
       WHERE id = ?`,
      [case_id, evidence_number, evidence_type, description, custody_chain, location, collected_date, collected_by, status, id]
    );
    res.json({ message: 'Evidence updated' });
  } catch (err) {
    console.error('Error updating evidence:', err);
    res.status(500).json({ error: 'Failed to update evidence' });
  }
});

/**
 * PATCH /api/evidence/:id/status - Update evidence status
 */
router.patch('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status required' });
  }

  try {
    await db.run(
      'UPDATE evidence SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );
    res.json({ message: 'Evidence status updated' });
  } catch (err) {
    console.error('Error updating status:', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

/**
 * DELETE /api/evidence/:id - Delete evidence
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    await db.run('DELETE FROM evidence WHERE id = ?', [id]);
    res.json({ message: 'Evidence deleted' });
  } catch (err) {
    console.error('Error deleting evidence:', err);
    res.status(500).json({ error: 'Failed to delete evidence' });
  }
});

/**
 * GET /api/evidence/case/:caseId - Get evidence for case
 */
router.get('/case/:caseId', authMiddleware, async (req, res) => {
  const { caseId } = req.params;

  try {
    const result = await db.query(
      'SELECT * FROM evidence WHERE case_id = ? ORDER BY created_at DESC',
      [caseId]
    );
    res.json(result.rows || []);
  } catch (err) {
    console.error('Error fetching case evidence:', err);
    res.status(500).json({ error: 'Failed to fetch evidence' });
  }
});

/**
 * GET /api/evidence/export - Export evidence as CSV
 */
router.get('/export', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT e.*, c.case_number 
       FROM evidence e 
       LEFT JOIN cases c ON e.case_id = c.id 
       ORDER BY e.created_at DESC`
    );

    const csv = [
      ['Evidence Number', 'Case', 'Type', 'Description', 'Location', 'Collected By', 'Date', 'Status'],
      ...result.rows.map(e => [
        e.evidence_number,
        e.case_number || e.case_id,
        e.evidence_type,
        e.description,
        e.location,
        e.collected_by,
        e.collected_date,
        e.status
      ])
    ].map(row => row.map(cell => `"${cell || ''}"`).join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=evidence-${new Date().toISOString()}.csv`);
    res.send(csv);
  } catch (err) {
    console.error('Error exporting evidence:', err);
    res.status(500).json({ error: 'Failed to export evidence' });
  }
});

module.exports = router;
