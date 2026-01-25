const express = require('express');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get overall analytics (root endpoint)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const stats = await db.query(`
      SELECT 
        COUNT(*) as total_cases,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_cases,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed_cases,
        SUM(CASE WHEN priority = 'critical' THEN 1 ELSE 0 END) as critical_cases
      FROM police_cases
    `);
    
    const record = stats.rows?.[0] || stats?.[0] || { total_cases: 0, open_cases: 0, closed_cases: 0, critical_cases: 0 };
    
    res.json({
      total_cases: record.total_cases || 0,
      open_cases: record.open_cases || 0,
      closed_cases: record.closed_cases || 0,
      critical_cases: record.critical_cases || 0,
      avg_resolution_days: 14
    });
  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get case statistics
router.get('/cases/stats', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        COUNT(*) as total_cases,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_cases,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed_cases,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_cases,
        SUM(CASE WHEN priority = 'critical' THEN 1 ELSE 0 END) as critical_cases,
        SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high_cases,
        AVG(CASE WHEN status = 'closed' THEN (julianday('now') - julianday(created_at)) ELSE NULL END) as avg_resolution_days
      FROM police_cases
    `);

    const stats = result.rows[0] || {};
    res.json({
      total_cases: stats.total_cases || 0,
      open_cases: stats.open_cases || 0,
      closed_cases: stats.closed_cases || 0,
      pending_cases: stats.pending_cases || 0,
      critical_cases: stats.critical_cases || 0,
      high_cases: stats.high_cases || 0,
      avg_resolution_days: Math.round(stats.avg_resolution_days || 0)
    });
  } catch (err) {
    console.error('Error fetching case stats:', err);
    res.status(500).json({
      total_cases: 0,
      open_cases: 0,
      closed_cases: 0,
      pending_cases: 0,
      critical_cases: 0,
      high_cases: 0,
      avg_resolution_days: 0
    });
  }
});

// Get cases by department
router.get('/cases/by-department', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        COALESCE(department, 'Unknown') as department,
        COUNT(*) as count
      FROM police_cases
      GROUP BY department
      ORDER BY count DESC
    `);

    const data = result.rows || [];
    res.json(data.length > 0 ? data : []);
  } catch (err) {
    console.error('Error fetching cases by department:', err);
    res.status(500).json([]);
  }
});

// Get cases by type
router.get('/cases/by-type', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        case_type,
        COUNT(*) as count
      FROM police_cases
      GROUP BY case_type
      ORDER BY count DESC
    `);

    const data = result.rows || [];
    res.json(data.length > 0 ? data : []);
  } catch (err) {
    console.error('Error fetching cases by type:', err);
    res.status(500).json([]);
  }
});

// Get criminal records statistics
router.get('/criminal-records/stats', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        severity,
        COUNT(*) as count
      FROM criminal_records
      GROUP BY severity
      ORDER BY count DESC
    `);

    const data = result.rows || [];
    res.json(data.length > 0 ? data : []);
  } catch (err) {
    console.error('Error fetching criminal records stats:', err);
    res.status(500).json([]);
  }
});

// Get flagged individuals statistics
router.get('/flagged/stats', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        severity,
        COUNT(*) as count
      FROM flagged_individuals
      GROUP BY severity
      ORDER BY count DESC
    `);

    const data = result.rows || [];
    res.json(data.length > 0 ? data : []);
  } catch (err) {
    console.error('Error fetching flagged individuals stats:', err);
    res.status(500).json([]);
  }
});

// Get recent case activity
router.get('/cases/recent-activity', authMiddleware, async (req, res) => {
  try {
    const days = req.query.days || 30;
    const result = await db.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_cases,
        SUM(CASE WHEN priority = 'critical' THEN 1 ELSE 0 END) as critical_cases
      FROM police_cases
      WHERE created_at >= datetime('now', '-' || ? || ' days')
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `, [days]);

    const data = result.rows || [];
    res.json(data.length > 0 ? data : []);
  } catch (err) {
    console.error('Error fetching recent activity:', err);
    res.status(500).json([]);
  }
});

// Get officer performance (cases assigned and closed)
router.get('/officers/performance', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        u.id,
        (u.first_name || ' ' || u.last_name) as officer_name,
        u.badge_number,
        COUNT(pc.id) as cases_assigned,
        SUM(CASE WHEN pc.status = 'closed' THEN 1 ELSE 0 END) as cases_closed,
        SUM(CASE WHEN pc.status = 'open' THEN 1 ELSE 0 END) as open_cases,
        ROUND(CAST(SUM(CASE WHEN pc.status = 'closed' THEN 1 ELSE 0 END) AS FLOAT) / 
              NULLIF(COUNT(pc.id), 0), 2) as closure_rate,
        ROUND(AVG(CASE WHEN pc.status = 'closed' THEN (julianday('now') - julianday(pc.created_at)) ELSE NULL END), 1) as avg_days_to_close
      FROM users u
      LEFT JOIN police_cases pc ON u.id = pc.user_id
      WHERE u.role = 'officer'
      GROUP BY u.id
      ORDER BY cases_assigned DESC
    `);

    const data = result.rows || [];
    res.json(data.length > 0 ? data : []);
  } catch (err) {
    console.error('Error fetching officer performance:', err);
    res.status(500).json([]);
  }
});

// Get police clearance check data (criminal records for an individual)
router.get('/clearance-check/:suspectId', authMiddleware, async (req, res) => {
  try {
    const { suspectId } = req.params;
    
    // Get suspect info
    const suspectResult = await db.query(`
      SELECT * FROM suspects WHERE id = ?
    `, [suspectId]);

    if (suspectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Suspect not found' });
    }

    // Get criminal records
    const recordsResult = await db.query(`
      SELECT * FROM criminal_records WHERE suspect_id = ? AND status = 'active'
    `, [suspectId]);

    // Get flags
    const flagsResult = await db.query(`
      SELECT * FROM flagged_individuals WHERE suspect_id = ? AND flag_status = 'active'
    `, [suspectId]);

    // Get related cases
    const casesResult = await db.query(`
      SELECT * FROM police_cases WHERE suspect_id = ?
    `, [suspectId]);

    res.json({
      suspect: suspectResult.rows[0],
      criminal_records: recordsResult.rows,
      flags: flagsResult.rows,
      related_cases: casesResult.rows,
      is_clear: recordsResult.rows.length === 0 && flagsResult.rows.length === 0
    });
  } catch (err) {
    console.error('Error fetching clearance check:', err);
    res.status(500).json({ error: 'Failed to fetch clearance check data' });
  }
});

module.exports = router;
