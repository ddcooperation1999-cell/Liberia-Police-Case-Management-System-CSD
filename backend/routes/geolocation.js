/**
 * Geolocation Tagging Management
 * Handles location tagging for cases and incidents
 */

const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

/**
 * GET /api/geolocation/locations - Get all geotagged locations
 */
router.get('/locations', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT gl.*, c.case_number 
       FROM geolocation_tags gl 
       LEFT JOIN cases c ON gl.case_id = c.id 
       ORDER BY gl.created_at DESC`
    );
    res.json(result.rows || []);
  } catch (err) {
    console.error('Error fetching locations:', err);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

/**
 * GET /api/geolocation/locations/:id - Get specific location
 */
router.get('/locations/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `SELECT gl.*, c.case_number 
       FROM geolocation_tags gl 
       LEFT JOIN cases c ON gl.case_id = c.id 
       WHERE gl.id = ?`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching location:', err);
    res.status(500).json({ error: 'Failed to fetch location' });
  }
});

/**
 * POST /api/geolocation/locations - Create geotagged location
 */
router.post('/locations', authMiddleware, async (req, res) => {
  const { case_id, latitude, longitude, location_name, location_type, description, timestamp } = req.body;

  if (!case_id || !latitude || !longitude) {
    return res.status(400).json({ error: 'Case ID, latitude, and longitude required' });
  }

  if (isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({ error: 'Invalid latitude or longitude' });
  }

  try {
    const result = await db.run(
      `INSERT INTO geolocation_tags 
       (case_id, latitude, longitude, location_name, location_type, description, timestamp, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [case_id, parseFloat(latitude), parseFloat(longitude), location_name, location_type || 'other', description, timestamp || new Date().toISOString()]
    );
    res.status(201).json({ id: result.lastID, message: 'Location tagged successfully' });
  } catch (err) {
    console.error('Error creating location:', err);
    res.status(500).json({ error: 'Failed to create location tag' });
  }
});

/**
 * PUT /api/geolocation/locations/:id - Update location
 */
router.put('/locations/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { case_id, latitude, longitude, location_name, location_type, description, timestamp } = req.body;

  if (latitude && isNaN(latitude)) {
    return res.status(400).json({ error: 'Invalid latitude' });
  }
  if (longitude && isNaN(longitude)) {
    return res.status(400).json({ error: 'Invalid longitude' });
  }

  try {
    await db.run(
      `UPDATE geolocation_tags 
       SET case_id = COALESCE(?, case_id), 
           latitude = COALESCE(?, latitude), 
           longitude = COALESCE(?, longitude), 
           location_name = COALESCE(?, location_name), 
           location_type = COALESCE(?, location_type), 
           description = COALESCE(?, description), 
           timestamp = COALESCE(?, timestamp) 
       WHERE id = ?`,
      [case_id, latitude, longitude, location_name, location_type, description, timestamp, id]
    );
    res.json({ message: 'Location updated' });
  } catch (err) {
    console.error('Error updating location:', err);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

/**
 * DELETE /api/geolocation/locations/:id - Delete location
 */
router.delete('/locations/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    await db.run('DELETE FROM geolocation_tags WHERE id = ?', [id]);
    res.json({ message: 'Location deleted' });
  } catch (err) {
    console.error('Error deleting location:', err);
    res.status(500).json({ error: 'Failed to delete location' });
  }
});

/**
 * GET /api/geolocation/case/:caseId - Get all locations for a case
 */
router.get('/case/:caseId', authMiddleware, async (req, res) => {
  const { caseId } = req.params;

  try {
    const result = await db.query(
      'SELECT * FROM geolocation_tags WHERE case_id = ? ORDER BY created_at DESC',
      [caseId]
    );
    res.json(result.rows || []);
  } catch (err) {
    console.error('Error fetching case locations:', err);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

module.exports = router;
