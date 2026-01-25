const express = require('express');
const db = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Get all suspects/criminal records (root endpoint)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT s.id, s.first_name, s.last_name, s.national_id
      FROM suspects s
      LIMIT 100
    `);
    res.json(result.rows || result || []);
  } catch (err) {
    console.error('Error fetching criminal records:', err);
    res.status(500).json({ error: 'Failed to fetch criminal records' });
  }
});

// Get all suspects with their criminal records
router.get('/suspects', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT s.id, s.first_name, s.last_name, s.date_of_birth, s.gender, 
             s.national_id, s.phone, s.address, s.created_at,
             COUNT(cr.id) as criminal_record_count
      FROM suspects s
      LEFT JOIN criminal_records cr ON s.id = cr.suspect_id AND cr.status = 'active'
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching suspects:', err);
    res.status(500).json({ error: 'Failed to fetch suspects' });
  }
});

// Get suspect details with criminal records
router.get('/suspects/:id', authMiddleware, async (req, res) => {
  try {
    const suspect = await db.query(`
      SELECT * FROM suspects WHERE id = ?
    `, [req.params.id]);

    if (suspect.rows.length === 0) {
      return res.status(404).json({ error: 'Suspect not found' });
    }

    const records = await db.query(`
      SELECT cr.id, cr.charge_type, cr.description, cr.severity, cr.record_date,
             cr.status, u.first_name, u.last_name, pc.case_number
      FROM criminal_records cr
      LEFT JOIN users u ON cr.officer_id = u.id
      LEFT JOIN police_cases pc ON cr.case_id = pc.id
      WHERE cr.suspect_id = ?
      ORDER BY cr.record_date DESC
    `, [req.params.id]);

    res.json({
      suspect: suspect.rows[0],
      records: records.rows
    });
  } catch (err) {
    console.error('Error fetching suspect details:', err);
    res.status(500).json({ error: 'Failed to fetch suspect details' });
  }
});

// Check if suspect has criminal record
router.get('/check/:national_id', authMiddleware, async (req, res) => {
  try {
    const suspect = await db.query(`
      SELECT s.id, s.first_name, s.last_name, s.national_id
      FROM suspects s
      WHERE s.national_id = ?
    `, [req.params.national_id]);

    if (suspect.rows.length === 0) {
      return res.json({ has_record: false, suspect: null });
    }

    const records = await db.query(`
      SELECT COUNT(*) as count FROM criminal_records
      WHERE suspect_id = ? AND status = 'active'
    `, [suspect.rows[0].id]);

    res.json({
      has_record: records.rows[0].count > 0,
      record_count: records.rows[0].count,
      suspect: suspect.rows[0]
    });
  } catch (err) {
    console.error('Error checking criminal record:', err);
    res.status(500).json({ error: 'Failed to check criminal record' });
  }
});

// Create new suspect
router.post('/suspects', authMiddleware, async (req, res) => {
  const { first_name, last_name, date_of_birth, gender, national_id, phone, address } = req.body;

  if (!first_name || !last_name || !national_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = await db.run(
      `INSERT INTO suspects (first_name, last_name, date_of_birth, gender, national_id, phone, address)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, date_of_birth || null, gender || null, national_id, phone || null, address || null]
    );
    res.status(201).json({ id: result.lastID, message: 'Suspect created successfully' });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'National ID already exists' });
    }
    console.error('Error creating suspect:', err);
    res.status(500).json({ error: 'Failed to create suspect' });
  }
});

// Add criminal record
router.post('/records', authMiddleware, async (req, res) => {
  const { suspect_id, case_id, charge_type, description, severity, record_date } = req.body;

  if (!suspect_id || !charge_type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = await db.run(
      `INSERT INTO criminal_records (suspect_id, case_id, charge_type, description, severity, record_date, officer_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`,
      [suspect_id, case_id || null, charge_type, description || null, severity || 'medium', record_date || new Date().toISOString(), req.user.id]
    );
    res.status(201).json({ id: result.lastID, message: 'Criminal record created successfully' });
  } catch (err) {
    console.error('Error creating criminal record:', err);
    res.status(500).json({ error: 'Failed to create criminal record' });
  }
});

// Update criminal record
router.put('/records/:id', authMiddleware, adminOnly, async (req, res) => {
  const { charge_type, description, severity, status } = req.body;

  try {
    await db.run(
      `UPDATE criminal_records SET charge_type = ?, description = ?, severity = ?, status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [charge_type, description, severity, status, req.params.id]
    );
    res.json({ message: 'Criminal record updated successfully' });
  } catch (err) {
    console.error('Error updating criminal record:', err);
    res.status(500).json({ error: 'Failed to update criminal record' });
  }
});

// Delete criminal record (admin only - seal it)
router.delete('/records/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await db.run(`UPDATE criminal_records SET status = 'sealed', updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [req.params.id]);
    res.json({ message: 'Criminal record sealed successfully' });
  } catch (err) {
    console.error('Error sealing criminal record:', err);
    res.status(500).json({ error: 'Failed to seal criminal record' });
  }
});

module.exports = router;
