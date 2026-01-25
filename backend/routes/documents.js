const express = require('express');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all documents (root endpoint)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM case_documents
      LIMIT 100
    `);
    res.json(result.rows || result || []);
  } catch (err) {
    console.error('Error fetching documents:', err);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Get all documents for a case
router.get('/case/:caseId', authMiddleware, async (req, res) => {
  try {
    const { caseId } = req.params;
    const result = await db.query(`
      SELECT cd.id, cd.case_id, cd.file_name, cd.file_type, cd.file_size, 
             cd.description, u.username as uploaded_by, cd.created_at
      FROM case_documents cd
      LEFT JOIN users u ON cd.uploaded_by = u.id
      WHERE cd.case_id = ?
      ORDER BY cd.created_at DESC
    `, [caseId]);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching documents:', err);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Add document to case
router.post('/', authMiddleware, async (req, res) => {
  const { case_id, file_name, file_type, file_size, description } = req.body;

  if (!case_id || !file_name) {
    return res.status(400).json({ error: 'Case ID and file name are required' });
  }

  try {
    const result = await db.run(
      `INSERT INTO case_documents (case_id, file_name, file_type, file_size, description, uploaded_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [case_id, file_name, file_type || null, file_size || null, description || null, req.user.id]
    );

    res.status(201).json({
      id: result.lastID,
      message: 'Document added successfully'
    });
  } catch (err) {
    console.error('Error adding document:', err);
    res.status(500).json({ error: 'Failed to add document' });
  }
});

// Delete document
router.delete('/:documentId', authMiddleware, async (req, res) => {
  try {
    const { documentId } = req.params;
    
    // Check if document exists
    const docResult = await db.query('SELECT * FROM case_documents WHERE id = ?', [documentId]);
    if (docResult.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    await db.run('DELETE FROM case_documents WHERE id = ?', [documentId]);
    res.json({ message: 'Document deleted successfully' });
  } catch (err) {
    console.error('Error deleting document:', err);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

module.exports = router;
