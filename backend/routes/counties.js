const express = require('express');
const db = require('../db');

const router = express.Router();

// GET /api/counties - list all counties
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT id, name FROM counties ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;