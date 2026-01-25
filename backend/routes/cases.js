const express = require('express');
const db = require('../db');
const { authMiddleware, officerAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/cases - list all cases with enhanced filtering and pagination
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20); // Reduced from 100 to 50, default 20
    const offset = (page - 1) * limit;
    
    const department = req.query.department || '';
    const status = req.query.status || '';
    const priority = req.query.priority || '';

    let query = `SELECT id, case_number, county, department, case_type, details, month, 
                        disposition, investigator, priority, status, victim_name, location, 
                        incident_date, created_at FROM police_cases WHERE 1=1`;
    let params = [];

    if (req.user.role === 'officer' && req.user.county_id) {
      // Officers can only see cases from their county
      const countyResult = await db.query('SELECT name FROM counties WHERE id = ?', [req.user.county_id]);
      if (countyResult.rows.length > 0) {
        query += ' AND county = ?';
        params.push(countyResult.rows[0].name);
      }
    }

    if (department) {
      query += ' AND department = ?';
      params.push(department);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (priority) {
      query += ' AND priority = ?';
      params.push(priority);
    }

    // Get total count
    const countResult = await db.query(`SELECT COUNT(*) as total FROM (${query})`, params);
    const total = countResult.rows[0].total;

    // Get paginated results
    query += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    const result = await db.query(query, [...params, limit, offset]);
    
    res.json({
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: offset + limit < total
      }
    });
  } catch (err) {
    console.error('Error fetching cases:', err);
    res.status(500).json({ error: 'Failed to fetch cases' });
  }
});

// POST /api/cases - add new case with enhanced fields
router.post('/', authMiddleware, officerAuth, async (req, res, next) => {
  const { county, department, case_type, details, month, disposition, investigator, victim_name, location, incident_date } = req.body;

  // Trim inputs
  const trimmed = {
    county: county?.trim(),
    case_type: case_type?.trim(),
    details: details?.trim(),
    month: month?.trim(),
    disposition: disposition?.trim(),
    investigator: investigator?.trim(),
    department: department?.trim(),
    victim_name: victim_name?.trim(),
    location: location?.trim()
  };

  // Validation
  if (!trimmed.county || !trimmed.case_type || !trimmed.details) {
    return res.status(400).json({ error: 'County, case type, and details are required and cannot be empty' });
  }

  if (trimmed.county.length > 100 || trimmed.case_type.length > 100 || trimmed.details.length > 1000) {
    return res.status(400).json({ error: 'Input fields exceed maximum length' });
  }

  // Officers can only submit to their county
  if (req.user.role === 'officer' && req.user.county_id) {
    try {
      const countyResult = await db.query('SELECT name FROM counties WHERE id = ?', [req.user.county_id]);
      if (countyResult.rows.length === 0 || countyResult.rows[0].name !== trimmed.county) {
        return res.status(403).json({ error: 'You can only submit cases for your assigned county' });
      }
    } catch (err) {
      return res.status(500).json({ error: 'Failed to validate county assignment' });
    }
  }

  try {
    const result = await db.run(
      `INSERT INTO police_cases (county, department, case_type, details, month, disposition, investigator, 
                                 victim_name, location, incident_date, user_id, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [trimmed.county, trimmed.department || null, trimmed.case_type, trimmed.details, trimmed.month || null, 
       trimmed.disposition || null, trimmed.investigator || null, trimmed.victim_name || null, 
       trimmed.location || null, incident_date || null, req.user.id, 'assigned']
    );
    const inserted = await db.query(
      `SELECT id, case_number, county, department, case_type, details, month, disposition, investigator, 
              priority, status, victim_name, location, incident_date FROM police_cases WHERE id = ?`, 
      [result.lastID]
    );
    res.status(201).json(inserted.rows[0]);
  } catch (err) {
    console.error('Database insert error:', err);
    res.status(500).json({ error: 'Failed to create case. Please try again.' });
  }
});

// PUT /api/cases/:id/status - update case status
router.put('/:id/status', authMiddleware, officerAuth, async (req, res) => {
  const { id } = req.params;
  const { new_status, notes } = req.body;

  if (!new_status) {
    return res.status(400).json({ error: 'New status is required' });
  }

  const valid_statuses = ['open', 'closed', 'pending', 'suspended', 'assigned', 'in-progress', 'awaiting-review'];
  if (!valid_statuses.includes(new_status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    // Get current status
    const caseResult = await db.query('SELECT status FROM police_cases WHERE id = ?', [id]);
    if (caseResult.rows.length === 0) {
      return res.status(404).json({ error: 'Case not found' });
    }

    const oldStatus = caseResult.rows[0].status;

    // Update case status
    await db.run('UPDATE police_cases SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [new_status, id]);

    // Record status update
    await db.run(
      `INSERT INTO case_status_updates (case_id, old_status, new_status, updated_by, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [id, oldStatus, new_status, req.user.id, notes || null]
    );

    res.json({ message: 'Case status updated successfully' });
  } catch (err) {
    console.error('Error updating case status:', err);
    res.status(500).json({ error: 'Failed to update case status' });
  }
});

// PUT /api/cases/:id - update
router.put('/:id', authMiddleware, officerAuth, async (req, res) => {
  const { id } = req.params;
  const { county, department, case_type, details, month, disposition, investigator, victim_name, location } = req.body;

  // Trim inputs
  const trimmed = {
    county: county?.trim(),
    case_type: case_type?.trim(),
    details: details?.trim(),
    month: month?.trim(),
    disposition: disposition?.trim(),
    investigator: investigator?.trim(),
    department: department?.trim(),
    victim_name: victim_name?.trim(),
    location: location?.trim()
  };

  // Validation
  if (!trimmed.county || !trimmed.case_type || !trimmed.details) {
    return res.status(400).json({ error: 'County, case type, and details are required and cannot be empty' });
  }

  // Check if case exists and get its current county
  try {
    const existingCase = await db.query('SELECT county FROM police_cases WHERE id = ?', [id]);
    if (existingCase.rows.length === 0) {
      return res.status(404).json({ error: 'Case not found' });
    }

    // Officers can only update cases in their county and cannot change county
    if (req.user.role === 'officer' && req.user.county_id) {
      const countyResult = await db.query('SELECT name FROM counties WHERE id = ?', [req.user.county_id]);
      if (countyResult.rows.length === 0 || countyResult.rows[0].name !== existingCase.rows[0].county) {
        return res.status(403).json({ error: 'You can only update cases in your assigned county' });
      }
      if (trimmed.county !== existingCase.rows[0].county) {
        return res.status(403).json({ error: 'You cannot change the county of a case' });
      }
    }

    const result = await db.run(
      `UPDATE police_cases SET county=?, department=?, case_type=?, details=?, month=?, disposition=?, 
                             investigator=?, victim_name=?, location=? WHERE id=?`,
      [trimmed.county, trimmed.department || null, trimmed.case_type, trimmed.details, trimmed.month || null, 
       trimmed.disposition || null, trimmed.investigator || null, trimmed.victim_name || null, 
       trimmed.location || null, id]
    );
    if (result.changes === 0) return res.status(404).json({ error: 'Case not found' });
    
    const updated = await db.query(
      `SELECT id, case_number, county, department, case_type, details, month, disposition, investigator, 
              priority, status, victim_name, location, incident_date FROM police_cases WHERE id = ?`, 
      [id]
    );
    res.json(updated.rows[0]);
  } catch (err) {
    console.error('Database update error:', err);
    res.status(500).json({ error: 'Failed to update case. Please try again.' });
  }
});

// GET /api/cases/:id - get case details with full history
router.get('/:id', authMiddleware, officerAuth, async (req, res) => {
  const { id } = req.params;

  try {
    // Get case details
    const caseResult = await db.query(
      `SELECT id, case_number, county, department, case_type, details, month, disposition, investigator, 
              priority, status, victim_name, location, incident_date, user_id, created_at, updated_at 
       FROM police_cases WHERE id = ?`,
      [id]
    );

    if (caseResult.rows.length === 0) {
      return res.status(404).json({ error: 'Case not found' });
    }

    const caseData = caseResult.rows[0];

    // Get status update history
    const historyResult = await db.query(
      `SELECT id, old_status, new_status, updated_by, notes, created_at 
       FROM case_status_updates WHERE case_id = ? ORDER BY created_at DESC`,
      [id]
    );

    // Get associated documents
    const docsResult = await db.query(
      `SELECT id, file_name, file_type, file_size, description, uploaded_by, created_at 
       FROM case_documents WHERE case_id = ? ORDER BY created_at DESC`,
      [id]
    );

    // Return comprehensive case details
    res.json({
      ...caseData,
      status_history: historyResult.rows,
      documents: docsResult.rows
    });
  } catch (err) {
    console.error('Error fetching case details:', err);
    res.status(500).json({ error: 'Failed to fetch case details' });
  }
});

// DELETE /api/cases/:id
router.delete('/:id', authMiddleware, officerAuth, async (req, res) => {
  const { id } = req.params;

  // Check if case exists and get its county
  const existingCase = await db.query('SELECT county FROM police_cases WHERE id = ?', [id]);
  if (existingCase.rows.length === 0) {
    return res.status(404).json({ error: 'Case not found' });
  }

  // Officers can only delete cases in their county
  if (req.user.role === 'officer' && req.user.county_id) {
    const countyResult = await db.query('SELECT name FROM counties WHERE id = ?', [req.user.county_id]);
    if (countyResult.rows.length === 0 || countyResult.rows[0].name !== existingCase.rows[0].county) {
      return res.status(403).json({ error: 'You can only delete cases in your assigned county' });
    }
  }

  try {
    const result = await db.run('DELETE FROM police_cases WHERE id=?', [id]);
    if (result.changes === 0) return res.status(404).json({ error: 'Case not found' });
    res.json({ message: 'Case deleted successfully' });
  } catch (err) {
    console.error('Database delete error:', err);
    res.status(500).json({ error: 'Failed to delete case. Please try again.' });
  }
});

module.exports = router;
