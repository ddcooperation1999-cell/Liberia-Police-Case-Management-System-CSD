/**
 * Case Closure Workflow Management
 * Handles automated case closure workflow with approval steps
 */

const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const CLOSURE_STEPS = ['initiated', 'review', 'approved', 'closed'];

/**
 * GET /api/case-closure - Get all case closures (root endpoint)
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT cc.*, c.case_number FROM case_closures cc 
       LEFT JOIN cases c ON cc.case_id = c.id 
       ORDER BY cc.created_at DESC LIMIT 100`
    );
    res.json(result.rows || result || []);
  } catch (err) {
    console.error('Error fetching case closures:', err);
    res.status(500).json({ error: 'Failed to fetch case closures' });
  }
});

/**
 * GET /api/case-closure/history - Get closure history (compatibility endpoint)
 */
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT cc.*, c.case_number FROM case_closures cc 
       LEFT JOIN cases c ON cc.case_id = c.id 
       ORDER BY cc.created_at DESC`
    );
    res.json(result.rows || result || []);
  } catch (err) {
    console.error('Error fetching closure history:', err);
    res.status(500).json({ error: 'Failed to fetch closure history' });
  }
});

/**
 * GET /api/case-closure/list - Get all case closures
 */
router.get('/list', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT cc.*, c.case_number, c.case_type 
       FROM case_closures cc 
       LEFT JOIN cases c ON cc.case_id = c.id 
       ORDER BY cc.created_at DESC`
    );
    res.json(result.rows || []);
  } catch (err) {
    console.error('Error fetching closures:', err);
    res.status(500).json({ error: 'Failed to fetch closures' });
  }
});

/**
 * POST /api/case-closure - Initiate case closure
 */
router.post('/', authMiddleware, async (req, res) => {
  const { case_id, closing_reason, closure_date, disposition, notes, assigned_to } = req.body;

  if (!case_id || !closing_reason) {
    return res.status(400).json({ error: 'Case ID and closing reason required' });
  }

  try {
    const result = await db.run(
      `INSERT INTO case_closures 
       (case_id, closing_reason, closure_date, disposition, notes, assigned_to, status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [case_id, closing_reason, closure_date, disposition || 'pending', notes, assigned_to, 'initiated']
    );
    res.status(201).json({ id: result.lastID, message: 'Case closure initiated' });
  } catch (err) {
    console.error('Error creating closure:', err);
    res.status(500).json({ error: 'Failed to initiate closure' });
  }
});

/**
 * PUT /api/case-closure/:id - Update case closure
 */
router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { case_id, closing_reason, closure_date, disposition, notes, assigned_to } = req.body;

  try {
    await db.run(
      `UPDATE case_closures 
       SET case_id = COALESCE(?, case_id),
           closing_reason = COALESCE(?, closing_reason),
           closure_date = COALESCE(?, closure_date),
           disposition = COALESCE(?, disposition),
           notes = COALESCE(?, notes),
           assigned_to = COALESCE(?, assigned_to)
       WHERE id = ?`,
      [case_id, closing_reason, closure_date, disposition, notes, assigned_to, id]
    );
    res.json({ message: 'Case closure updated' });
  } catch (err) {
    console.error('Error updating closure:', err);
    res.status(500).json({ error: 'Failed to update closure' });
  }
});

/**
 * PATCH /api/case-closure/:id/step - Advance workflow step
 */
router.patch('/:id/step', authMiddleware, adminOnly, async (req, res) => {
  const { id } = req.params;
  const { step } = req.body;

  if (!CLOSURE_STEPS.includes(step)) {
    return res.status(400).json({ error: 'Invalid workflow step' });
  }

  try {
    await db.run(
      'UPDATE case_closures SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [step, id]
    );
    res.json({ message: `Case closure advanced to ${step}` });
  } catch (err) {
    console.error('Error updating step:', err);
    res.status(500).json({ error: 'Failed to update step' });
  }
});

/**
 * POST /api/case-closure/:id/approve - Approve case closure
 */
router.post('/:id/approve', authMiddleware, adminOnly, async (req, res) => {
  const { id } = req.params;

  try {
    // Get current status
    const result = await db.query('SELECT status FROM case_closures WHERE id = ?', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Closure not found' });
    }

    const currentStatus = result.rows[0].status;
    const currentIndex = CLOSURE_STEPS.indexOf(currentStatus);
    
    if (currentIndex === -1 || currentIndex >= CLOSURE_STEPS.length - 1) {
      return res.status(400).json({ error: 'Cannot advance further' });
    }

    const nextStep = CLOSURE_STEPS[currentIndex + 1];
    await db.run(
      'UPDATE case_closures SET status = ?, approved_at = CURRENT_TIMESTAMP WHERE id = ?',
      [nextStep, id]
    );

    // If approved, close the case
    if (nextStep === 'closed') {
      const closure = await db.query('SELECT case_id FROM case_closures WHERE id = ?', [id]);
      if (closure.rows.length > 0) {
        await db.run(
          'UPDATE cases SET status = ?, closed_date = CURRENT_TIMESTAMP WHERE id = ?',
          ['closed', closure.rows[0].case_id]
        );
      }
    }

    res.json({ message: 'Case closure approved', nextStep });
  } catch (err) {
    console.error('Error approving closure:', err);
    res.status(500).json({ error: 'Failed to approve closure' });
  }
});

/**
 * POST /api/case-closure/:id/reject - Reject case closure
 */
router.post('/:id/reject', authMiddleware, adminOnly, async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  try {
    await db.run(
      'UPDATE case_closures SET status = ?, rejection_reason = ?, rejected_at = CURRENT_TIMESTAMP WHERE id = ?',
      ['initiated', reason || null, id]
    );
    res.json({ message: 'Case closure rejected and reset to initiated' });
  } catch (err) {
    console.error('Error rejecting closure:', err);
    res.status(500).json({ error: 'Failed to reject closure' });
  }
});

/**
 * DELETE /api/case-closure/:id - Delete case closure
 */
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  const { id } = req.params;

  try {
    await db.run('DELETE FROM case_closures WHERE id = ?', [id]);
    res.json({ message: 'Case closure deleted' });
  } catch (err) {
    console.error('Error deleting closure:', err);
    res.status(500).json({ error: 'Failed to delete closure' });
  }
});

/**
 * GET /api/case-closure/case/:caseId - Get closure info for case
 */
router.get('/case/:caseId', authMiddleware, async (req, res) => {
  const { caseId } = req.params;

  try {
    const result = await db.query(
      'SELECT * FROM case_closures WHERE case_id = ? ORDER BY created_at DESC LIMIT 1',
      [caseId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No closure found for this case' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching closure:', err);
    res.status(500).json({ error: 'Failed to fetch closure' });
  }
});

module.exports = router;
