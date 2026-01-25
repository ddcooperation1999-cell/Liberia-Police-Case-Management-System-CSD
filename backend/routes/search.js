/**
 * Search Functionality
 * Comprehensive search across cases, individuals, documents, and criminal records
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
 * POST /api/search - Perform global search
 */
router.post('/', verifyToken, (req, res) => {
  const { query, searchType = 'all', limit = 20 } = req.body;

  if (!query || query.trim().length < 2) {
    return res.status(400).json({ 
      error: 'Search query must be at least 2 characters' 
    });
  }

  const searchTerm = `%${query}%`;
  const results = {};
  let remainingQueries = 0;

  // Cases search
  if (searchType === 'all' || searchType === 'cases') {
    remainingQueries++;
    const casesQuery = `
      SELECT id, case_number, description, status, created_at, 'case' as type
      FROM police_cases
      WHERE case_number LIKE ? OR description LIKE ?
      ORDER BY created_at DESC
      LIMIT ?
    `;

    db.all(casesQuery, [searchTerm, searchTerm, parseInt(limit)], (err, rows) => {
      if (err) {
        console.error('Error searching cases:', err);
        results.cases = [];
      } else {
        results.cases = rows || [];
      }
      remainingQueries--;
      if (remainingQueries === 0) sendResults();
    });
  }

  // Suspects/Individuals search
  if (searchType === 'all' || searchType === 'individuals') {
    remainingQueries++;
    const individualsQuery = `
      SELECT id, first_name, last_name, date_of_birth, phone, email, 'individual' as type
      FROM suspects
      WHERE first_name LIKE ? OR last_name LIKE ? OR phone LIKE ? OR email LIKE ?
      ORDER BY first_name, last_name
      LIMIT ?
    `;

    db.all(
      individualsQuery,
      [searchTerm, searchTerm, searchTerm, searchTerm, parseInt(limit)],
      (err, rows) => {
        if (err) {
          console.error('Error searching individuals:', err);
          results.individuals = [];
        } else {
          results.individuals = rows || [];
        }
        remainingQueries--;
        if (remainingQueries === 0) sendResults();
      }
    );
  }

  // Criminal records search
  if (searchType === 'all' || searchType === 'records') {
    remainingQueries++;
    const recordsQuery = `
      SELECT cr.id, s.first_name, s.last_name, cr.charge, cr.status, cr.arrest_date, 'record' as type
      FROM criminal_records cr
      JOIN suspects s ON cr.suspect_id = s.id
      WHERE cr.charge LIKE ? OR s.first_name LIKE ? OR s.last_name LIKE ?
      ORDER BY cr.arrest_date DESC
      LIMIT ?
    `;

    db.all(recordsQuery, [searchTerm, searchTerm, searchTerm, parseInt(limit)], (err, rows) => {
      if (err) {
        console.error('Error searching records:', err);
        results.records = [];
      } else {
        results.records = rows || [];
      }
      remainingQueries--;
      if (remainingQueries === 0) sendResults();
    });
  }

  // Documents search
  if (searchType === 'all' || searchType === 'documents') {
    remainingQueries++;
    const docsQuery = `
      SELECT id, file_name, document_type, case_id, uploaded_at, 'document' as type
      FROM case_documents
      WHERE file_name LIKE ? OR document_type LIKE ?
      ORDER BY uploaded_at DESC
      LIMIT ?
    `;

    db.all(docsQuery, [searchTerm, searchTerm, parseInt(limit)], (err, rows) => {
      if (err) {
        console.error('Error searching documents:', err);
        results.documents = [];
      } else {
        results.documents = rows || [];
      }
      remainingQueries--;
      if (remainingQueries === 0) sendResults();
    });
  }

  function sendResults() {
    res.json({
      query: query,
      results: results,
      timestamp: new Date()
    });
  }
});

/**
 * GET /api/search/cases/:searchTerm - Search cases by term
 */
router.get('/cases/:searchTerm', verifyToken, (req, res) => {
  const searchTerm = `%${req.params.searchTerm}%`;
  const { limit = 20 } = req.query;

  const query = `
    SELECT pc.id, pc.case_number, pc.description, pc.status, pc.created_at,
      COUNT(DISTINCT fd.id) as flagged_count,
      COUNT(DISTINCT cd.id) as document_count
    FROM police_cases pc
    LEFT JOIN flagged_individuals fi ON pc.id = fi.case_id
    LEFT JOIN case_documents cd ON pc.id = cd.case_id
    WHERE pc.case_number LIKE ? OR pc.description LIKE ?
    GROUP BY pc.id
    ORDER BY pc.created_at DESC
    LIMIT ?
  `;

  db.all(query, [searchTerm, searchTerm, parseInt(limit)], (err, rows) => {
    if (err) {
      console.error('Error searching cases:', err);
      return res.status(500).json({ error: 'Failed to search cases' });
    }

    res.json({
      results: rows || [],
      count: rows ? rows.length : 0
    });
  });
});

/**
 * GET /api/search/individuals/:searchTerm - Search individuals by name, phone, email
 */
router.get('/individuals/:searchTerm', verifyToken, (req, res) => {
  const searchTerm = `%${req.params.searchTerm}%`;
  const { limit = 20 } = req.query;

  const query = `
    SELECT s.id, s.first_name, s.last_name, s.date_of_birth, s.phone, s.email,
      COUNT(DISTINCT cr.id) as record_count,
      COUNT(DISTINCT pc.id) as case_count
    FROM suspects s
    LEFT JOIN criminal_records cr ON s.id = cr.suspect_id
    LEFT JOIN police_cases pc ON s.id = pc.suspect_id
    WHERE s.first_name LIKE ? OR s.last_name LIKE ? OR s.phone LIKE ? OR s.email LIKE ?
    GROUP BY s.id
    ORDER BY s.first_name, s.last_name
    LIMIT ?
  `;

  db.all(
    query,
    [searchTerm, searchTerm, searchTerm, searchTerm, parseInt(limit)],
    (err, rows) => {
      if (err) {
        console.error('Error searching individuals:', err);
        return res.status(500).json({ error: 'Failed to search individuals' });
      }

      res.json({
        results: rows || [],
        count: rows ? rows.length : 0
      });
    }
  );
});

/**
 * GET /api/search/records/:searchTerm - Search criminal records
 */
router.get('/records/:searchTerm', verifyToken, (req, res) => {
  const searchTerm = `%${req.params.searchTerm}%`;
  const { limit = 20 } = req.query;

  const query = `
    SELECT cr.id, cr.charge, cr.status, cr.arrest_date, cr.case_number,
      s.id as suspect_id, s.first_name, s.last_name, s.date_of_birth
    FROM criminal_records cr
    JOIN suspects s ON cr.suspect_id = s.id
    WHERE cr.charge LIKE ? OR cr.case_number LIKE ? OR s.first_name LIKE ? OR s.last_name LIKE ?
    ORDER BY cr.arrest_date DESC
    LIMIT ?
  `;

  db.all(
    query,
    [searchTerm, searchTerm, searchTerm, searchTerm, parseInt(limit)],
    (err, rows) => {
      if (err) {
        console.error('Error searching records:', err);
        return res.status(500).json({ error: 'Failed to search records' });
      }

      res.json({
        results: rows || [],
        count: rows ? rows.length : 0
      });
    }
  );
});

/**
 * POST /api/search/advanced - Advanced search with filters
 */
router.post('/advanced', verifyToken, (req, res) => {
  const { 
    searchType = 'cases',
    query,
    filters = {},
    limit = 20,
    offset = 0
  } = req.body;

  let sql = '';
  let params = [];

  if (searchType === 'cases') {
    sql = `
      SELECT pc.*, 
        COUNT(DISTINCT ca.id) as assignment_count,
        COUNT(DISTINCT cd.id) as document_count,
        COUNT(DISTINCT cn.id) as note_count
      FROM police_cases pc
      LEFT JOIN case_assignments ca ON pc.id = ca.case_id AND ca.status != 'inactive'
      LEFT JOIN case_documents cd ON pc.id = cd.case_id
      LEFT JOIN case_notes cn ON pc.id = cn.case_id
      WHERE 1=1
    `;

    if (query) {
      sql += ' AND (pc.case_number LIKE ? OR pc.description LIKE ?)';
      params.push(`%${query}%`, `%${query}%`);
    }

    if (filters.status) {
      sql += ' AND pc.status = ?';
      params.push(filters.status);
    }

    if (filters.startDate) {
      sql += ' AND pc.created_at >= ?';
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      sql += ' AND pc.created_at <= ?';
      params.push(filters.endDate);
    }

    sql += ' GROUP BY pc.id ORDER BY pc.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
  } else if (searchType === 'individuals') {
    sql = `
      SELECT s.*,
        COUNT(DISTINCT cr.id) as record_count,
        COUNT(DISTINCT pc.id) as case_count
      FROM suspects s
      LEFT JOIN criminal_records cr ON s.id = cr.suspect_id
      LEFT JOIN police_cases pc ON s.id = pc.suspect_id
      WHERE 1=1
    `;

    if (query) {
      sql += ' AND (s.first_name LIKE ? OR s.last_name LIKE ? OR s.email LIKE ? OR s.phone LIKE ?)';
      params.push(`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`);
    }

    if (filters.dobStart) {
      sql += ' AND s.date_of_birth >= ?';
      params.push(filters.dobStart);
    }

    if (filters.dobEnd) {
      sql += ' AND s.date_of_birth <= ?';
      params.push(filters.dobEnd);
    }

    sql += ' GROUP BY s.id ORDER BY s.first_name, s.last_name LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
  }

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error('Error in advanced search:', err);
      return res.status(500).json({ error: 'Failed to perform search' });
    }

    res.json({
      results: rows || [],
      count: rows ? rows.length : 0,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  });
});

/**
 * GET /api/search/autocomplete/:prefix - Autocomplete suggestions
 */
router.get('/autocomplete/:prefix', verifyToken, (req, res) => {
  const prefix = `${req.params.prefix}%`;
  const { type = 'all', limit = 10 } = req.query;

  let queries = [];
  let results = {};
  let pending = 0;

  if (type === 'all' || type === 'cases') {
    pending++;
    const casesQ = `
      SELECT DISTINCT case_number
      FROM police_cases
      WHERE case_number LIKE ?
      LIMIT ?
    `;
    
    db.all(casesQ, [prefix, parseInt(limit)], (err, rows) => {
      results.cases = !err ? (rows || []).map(r => r.case_number) : [];
      pending--;
      if (pending === 0) sendResults();
    });
  }

  if (type === 'all' || type === 'individuals') {
    pending++;
    const individualsQ = `
      SELECT DISTINCT 
        first_name || ' ' || last_name as name
      FROM suspects
      WHERE first_name LIKE ? OR last_name LIKE ?
      LIMIT ?
    `;
    
    db.all(individualsQ, [prefix, prefix, parseInt(limit)], (err, rows) => {
      results.individuals = !err ? (rows || []).map(r => r.name) : [];
      pending--;
      if (pending === 0) sendResults();
    });
  }

  if (type === 'all' || type === 'charges') {
    pending++;
    const chargesQ = `
      SELECT DISTINCT charge
      FROM criminal_records
      WHERE charge LIKE ?
      LIMIT ?
    `;
    
    db.all(chargesQ, [prefix, parseInt(limit)], (err, rows) => {
      results.charges = !err ? (rows || []).map(r => r.charge) : [];
      pending--;
      if (pending === 0) sendResults();
    });
  }

  function sendResults() {
    res.json({
      suggestions: results
    });
  }
});

module.exports = router;
