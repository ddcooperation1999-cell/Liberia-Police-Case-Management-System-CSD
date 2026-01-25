/**
 * Offline Sync Management
 * Handles synchronization of offline data when connection is restored
 */

const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

/**
 * GET /api/offline-sync/pending - Get pending offline changes
 */
router.get('/pending', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM offline_queue WHERE synced = 0 ORDER BY created_at DESC'
    );
    res.json(result.rows || []);
  } catch (err) {
    console.error('Error fetching pending data:', err);
    res.status(500).json({ error: 'Failed to fetch pending data' });
  }
});

/**
 * POST /api/offline-sync/sync - Sync offline data to server
 */
router.post('/sync', authMiddleware, async (req, res) => {
  const { data } = req.body;

  if (!Array.isArray(data)) {
    return res.status(400).json({ error: 'Data must be an array' });
  }

  let synced = 0;
  const errors = [];

  try {
    for (const item of data) {
      try {
        // Process each offline item
        if (item.action === 'create') {
          await db.run(
            `INSERT INTO ${item.table} (${Object.keys(item.data).join(', ')}) VALUES (${Object.keys(item.data).map(() => '?').join(', ')})`,
            Object.values(item.data)
          );
        } else if (item.action === 'update') {
          const setClauses = Object.keys(item.data).map(k => `${k} = ?`).join(', ');
          await db.run(
            `UPDATE ${item.table} SET ${setClauses} WHERE id = ?`,
            [...Object.values(item.data), item.id]
          );
        } else if (item.action === 'delete') {
          await db.run(`DELETE FROM ${item.table} WHERE id = ?`, [item.id]);
        }

        // Mark as synced
        await db.run(
          'UPDATE offline_queue SET synced = 1, synced_at = CURRENT_TIMESTAMP WHERE id = ?',
          [item.queue_id]
        );
        synced++;
      } catch (itemErr) {
        console.error('Error syncing item:', itemErr);
        errors.push({ item: item.id, error: itemErr.message });
      }
    }

    res.json({ synced, errors, message: `${synced} items synced successfully` });
  } catch (err) {
    console.error('Error during sync:', err);
    res.status(500).json({ error: 'Sync failed' });
  }
});

/**
 * POST /api/offline-sync/queue - Queue offline change
 */
router.post('/queue', authMiddleware, async (req, res) => {
  const { action, table, data, id } = req.body;

  if (!action || !table) {
    return res.status(400).json({ error: 'Action and table required' });
  }

  try {
    await db.run(
      'INSERT INTO offline_queue (action, table_name, data, record_id, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
      [action, table, JSON.stringify(data), id || null]
    );
    res.status(201).json({ message: 'Change queued for sync' });
  } catch (err) {
    console.error('Error queueing change:', err);
    res.status(500).json({ error: 'Failed to queue change' });
  }
});

/**
 * DELETE /api/offline-sync/clear - Clear all synced items
 */
router.delete('/clear', authMiddleware, async (req, res) => {
  try {
    await db.run('DELETE FROM offline_queue WHERE synced = 1');
    res.json({ message: 'Synced items cleared' });
  } catch (err) {
    console.error('Error clearing synced items:', err);
    res.status(500).json({ error: 'Failed to clear items' });
  }
});

module.exports = router;
