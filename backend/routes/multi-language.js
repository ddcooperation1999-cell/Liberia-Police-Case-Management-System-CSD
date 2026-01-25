/**
 * Multi-Language Support Management
 * Handles translations for English, Kpelle, and Mandingo
 */

const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

/**
 * GET /api/multi-language/translations - Get all translations
 */
router.get('/translations', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM translations ORDER BY key');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching translations:', err);
    res.status(500).json({ error: 'Failed to fetch translations' });
  }
});

/**
 * POST /api/multi-language/translations - Create translation
 */
router.post('/translations', authMiddleware, async (req, res) => {
  const { key, english, kpelle, mandingo, context } = req.body;

  if (!key || !english) {
    return res.status(400).json({ error: 'Key and English translation required' });
  }

  try {
    const result = await db.run(
      'INSERT INTO translations (key, english, kpelle, mandingo, context, created_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
      [key, english, kpelle || null, mandingo || null, context || null]
    );
    res.status(201).json({ id: result.lastID, message: 'Translation created' });
  } catch (err) {
    console.error('Error creating translation:', err);
    if (err.message.includes('UNIQUE constraint')) {
      res.status(400).json({ error: 'Translation key already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create translation' });
    }
  }
});

/**
 * PUT /api/multi-language/translations/:id - Update translation
 */
router.put('/translations/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { key, english, kpelle, mandingo, context } = req.body;

  if (!english) {
    return res.status(400).json({ error: 'English translation required' });
  }

  try {
    await db.run(
      'UPDATE translations SET english = ?, kpelle = ?, mandingo = ?, context = ? WHERE id = ?',
      [english, kpelle || null, mandingo || null, context || null, id]
    );
    res.json({ message: 'Translation updated' });
  } catch (err) {
    console.error('Error updating translation:', err);
    res.status(500).json({ error: 'Failed to update translation' });
  }
});

/**
 * DELETE /api/multi-language/translations/:id - Delete translation
 */
router.delete('/translations/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    await db.run('DELETE FROM translations WHERE id = ?', [id]);
    res.json({ message: 'Translation deleted' });
  } catch (err) {
    console.error('Error deleting translation:', err);
    res.status(500).json({ error: 'Failed to delete translation' });
  }
});

/**
 * GET /api/multi-language/export - Export translations as JSON
 */
router.get('/export', authMiddleware, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM translations ORDER BY key');
    const translations = result.rows.reduce((acc, row) => {
      acc[row.key] = {
        english: row.english,
        kpelle: row.kpelle,
        mandingo: row.mandingo,
      };
      return acc;
    }, {});
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=translations.json');
    res.json(translations);
  } catch (err) {
    console.error('Error exporting translations:', err);
    res.status(500).json({ error: 'Failed to export translations' });
  }
});

module.exports = router;
