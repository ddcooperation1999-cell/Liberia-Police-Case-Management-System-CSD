/**
 * Document Templates Management
 * Handles creation and management of document templates for common forms
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
 * Middleware to check admin role
 */
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'supervisor') {
    return res.status(403).json({ error: 'Admin/Supervisor access required' });
  }
  next();
};

/**
 * POST /api/document-templates - Create new template
 */
router.post('/', verifyToken, requireAdmin, (req, res) => {
  const { name, category, templateContent, description } = req.body;

  if (!name || !category || !templateContent) {
    return res.status(400).json({ 
      error: 'name, category, and templateContent are required' 
    });
  }

  const query = `
    INSERT INTO document_templates 
    (name, category, template_content, description, created_by, created_at)
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `;

  db.run(
    query,
    [name, category, templateContent, description || '', req.user.userId],
    function(err) {
      if (err) {
        console.error('Error creating template:', err);
        return res.status(500).json({ error: 'Failed to create template' });
      }

      res.status(201).json({
        success: true,
        templateId: this.lastID,
        message: 'Template created successfully'
      });
    }
  );
});

/**
 * GET /api/document-templates - List all templates
 */
router.get('/', verifyToken, (req, res) => {
  const { category, limit = 50, offset = 0 } = req.query;

  let query = `
    SELECT dt.*, u.username, u.first_name, u.last_name,
      (SELECT COUNT(*) FROM case_documents WHERE template_id = dt.id) as usage_count
    FROM document_templates dt
    LEFT JOIN users u ON dt.created_by = u.id
    WHERE 1=1
  `;

  const params = [];

  if (category) {
    query += ' AND dt.category = ?';
    params.push(category);
  }

  query += ' ORDER BY dt.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching templates:', err);
      return res.status(500).json({ error: 'Failed to fetch templates' });
    }

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM document_templates WHERE 1=1';
    const countParams = [];

    if (category) {
      countQuery += ' AND category = ?';
      countParams.push(category);
    }

    db.get(countQuery, countParams, (err, countRow) => {
      res.json({
        templates: rows || [],
        total: countRow ? countRow.total : 0,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    });
  });
});

/**
 * GET /api/document-templates/categories - List template categories
 */
router.get('/categories/list', verifyToken, (req, res) => {
  const query = `
    SELECT DISTINCT category, COUNT(*) as template_count
    FROM document_templates
    GROUP BY category
    ORDER BY category
  `;

  db.all(query, (err, rows) => {
    if (err) {
      console.error('Error fetching categories:', err);
      return res.status(500).json({ error: 'Failed to fetch categories' });
    }

    res.json({
      categories: rows || []
    });
  });
});

/**
 * GET /api/document-templates/:templateId - Get template details
 */
router.get('/:templateId', verifyToken, (req, res) => {
  const query = `
    SELECT dt.*, u.username, u.first_name, u.last_name
    FROM document_templates dt
    LEFT JOIN users u ON dt.created_by = u.id
    WHERE dt.id = ?
  `;

  db.get(query, [req.params.templateId], (err, row) => {
    if (err) {
      console.error('Error fetching template:', err);
      return res.status(500).json({ error: 'Failed to fetch template' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json(row);
  });
});

/**
 * PUT /api/document-templates/:templateId - Update template
 */
router.put('/:templateId', verifyToken, requireAdmin, (req, res) => {
  const { name, category, templateContent, description } = req.body;

  let query = 'UPDATE document_templates SET ';
  const params = [];

  if (name) {
    query += 'name = ?';
    params.push(name);
  }

  if (category) {
    if (params.length > 0) query += ', ';
    query += 'category = ?';
    params.push(category);
  }

  if (templateContent) {
    if (params.length > 0) query += ', ';
    query += 'template_content = ?';
    params.push(templateContent);
  }

  if (description !== undefined) {
    if (params.length > 0) query += ', ';
    query += 'description = ?';
    params.push(description);
  }

  if (params.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  query += ', updated_at = CURRENT_TIMESTAMP WHERE id = ?';
  params.push(req.params.templateId);

  db.run(query, params, function(err) {
    if (err) {
      console.error('Error updating template:', err);
      return res.status(500).json({ error: 'Failed to update template' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({
      success: true,
      message: 'Template updated successfully'
    });
  });
});

/**
 * DELETE /api/document-templates/:templateId - Delete template
 */
router.delete('/:templateId', verifyToken, requireAdmin, (req, res) => {
  // Check if template is in use
  const checkQuery = 'SELECT COUNT(*) as count FROM case_documents WHERE template_id = ?';

  db.get(checkQuery, [req.params.templateId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to check template usage' });
    }

    if (row && row.count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete template - it is in use by documents' 
      });
    }

    const deleteQuery = 'DELETE FROM document_templates WHERE id = ?';

    db.run(deleteQuery, [req.params.templateId], function(err) {
      if (err) {
        console.error('Error deleting template:', err);
        return res.status(500).json({ error: 'Failed to delete template' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Template not found' });
      }

      res.json({
        success: true,
        message: 'Template deleted successfully'
      });
    });
  });
});

/**
 * POST /api/document-templates/:templateId/duplicate - Duplicate template
 */
router.post('/:templateId/duplicate', verifyToken, requireAdmin, (req, res) => {
  const { newName } = req.body;

  const selectQuery = `
    SELECT category, template_content, description
    FROM document_templates
    WHERE id = ?
  `;

  db.get(selectQuery, [req.params.templateId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch template' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const insertQuery = `
      INSERT INTO document_templates 
      (name, category, template_content, description, created_by, created_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;

    const duplicateName = newName || `${row.category} - Copy`;

    db.run(
      insertQuery,
      [duplicateName, row.category, row.template_content, row.description, req.user.userId],
      function(err) {
        if (err) {
          console.error('Error duplicating template:', err);
          return res.status(500).json({ error: 'Failed to duplicate template' });
        }

        res.status(201).json({
          success: true,
          templateId: this.lastID,
          message: 'Template duplicated successfully'
        });
      }
    );
  });
});

module.exports = router;
