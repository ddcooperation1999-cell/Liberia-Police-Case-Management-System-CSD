const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Get all users with pagination (admin only)
router.get('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20); // Reduced from 100 to 50, default 20
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const role = req.query.role || ''; // Filter by role
    const status = req.query.status || ''; // Filter by status

    // Build query with filters
    let whereClause = '';
    let params = [];

    if (search) {
      whereClause = ` WHERE (u.username LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)`;
      const searchTerm = `%${search}%`;
      params = [searchTerm, searchTerm, searchTerm, searchTerm];
    }

    if (role) {
      if (whereClause) {
        whereClause += ` AND u.role = ?`;
      } else {
        whereClause = ` WHERE u.role = ?`;
      }
      params.push(role);
    }

    if (status) {
      if (whereClause) {
        whereClause += ` AND u.status = ?`;
      } else {
        whereClause = ` WHERE u.status = ?`;
      }
      params.push(status);
    }

    // Get total count
    const countResult = await db.query(`SELECT COUNT(*) as total FROM users u ${whereClause}`, params);
    const total = countResult.rows[0].total;

    // Get paginated results with only essential fields
    const result = await db.query(`
      SELECT u.id, u.username, u.first_name, u.last_name, u.email, u.phone, 
             u.badge_number, u.role, u.status, u.county_id, c.name as county_name, u.created_at
      FROM users u
      LEFT JOIN counties c ON u.county_id = c.id
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);

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
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT u.id, u.username, u.first_name, u.last_name, u.email, u.phone,
             u.badge_number, u.role, u.status, u.county_id, c.name as county_name, u.created_at
      FROM users u
      LEFT JOIN counties c ON u.county_id = c.id
      WHERE u.id = ?
    `, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create new user (admin only)
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  const { username, password, first_name, last_name, email, phone, badge_number, role, county_id, status } = req.body;

  if (!username || !password || !first_name || !last_name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const hash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 12);
    const result = await db.run(
      `INSERT INTO users (username, password_hash, first_name, last_name, email, phone, badge_number, role, county_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [username, hash, first_name, last_name, email || null, phone || null, badge_number || null, role || 'officer', county_id || null, status || 'active']
    );
    res.status(201).json({ id: result.lastID, message: 'User created successfully' });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Username or badge number already exists' });
    }
    console.error('Error creating user:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Bulk create users (admin only) - Can handle up to 10000 users
router.post('/bulk/create', authMiddleware, adminOnly, async (req, res) => {
  const { users: usersToCreate } = req.body;

  if (!Array.isArray(usersToCreate)) {
    return res.status(400).json({ error: 'Expected array of users' });
  }

  if (usersToCreate.length === 0 || usersToCreate.length > 10000) {
    return res.status(400).json({ error: 'Provide between 1 and 10000 users' });
  }

  // Validate all users first
  const validationErrors = [];
  for (let i = 0; i < usersToCreate.length; i++) {
    const user = usersToCreate[i];
    if (!user.username || !user.password || !user.first_name || !user.last_name) {
      validationErrors.push(`User ${i + 1}: Missing required fields (username, password, first_name, last_name)`);
    }
    if (user.password && user.password.length < 6) {
      validationErrors.push(`User ${i + 1}: Password must be at least 6 characters`);
    }
  }

  if (validationErrors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: validationErrors });
  }

  try {
    const results = {
      created: [],
      failed: [],
      total: usersToCreate.length
    };

    for (let i = 0; i < usersToCreate.length; i++) {
      try {
        const user = usersToCreate[i];
        const hash = await bcrypt.hash(user.password, parseInt(process.env.BCRYPT_ROUNDS) || 12);
        const result = await db.run(
          `INSERT INTO users (username, password_hash, first_name, last_name, email, phone, badge_number, role, county_id, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            user.username,
            hash,
            user.first_name,
            user.last_name,
            user.email || null,
            user.phone || null,
            user.badge_number || null,
            user.role || 'officer',
            user.county_id || null,
            user.status || 'active'
          ]
        );
        results.created.push({
          id: result.lastID,
          username: user.username
        });
      } catch (err) {
        results.failed.push({
          username: usersToCreate[i].username,
          error: err.message.includes('UNIQUE') ? 'Username or badge number already exists' : 'Failed to create user'
        });
      }
    }

    res.status(201).json({
      message: `Bulk user creation completed. ${results.created.length} created, ${results.failed.length} failed.`,
      ...results
    });
  } catch (err) {
    console.error('Bulk create error:', err);
    res.status(500).json({ error: 'Bulk user creation failed' });
  }
});

// Update user (admin only)
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  const { first_name, last_name, email, phone, badge_number, role, county_id, status } = req.body;

  try {
    await db.run(
      `UPDATE users SET first_name = ?, last_name = ?, email = ?, phone = ?, badge_number = ?, role = ?, county_id = ?, status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [first_name, last_name, email, phone, badge_number, role, county_id, status, req.params.id]
    );
    res.json({ message: 'User updated successfully' });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (admin only)
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const userResult = await db.query('SELECT * FROM users WHERE id=?', [req.params.id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (userResult.rows[0].role === 'admin') {
      const adminCount = await db.query('SELECT COUNT(*) as count FROM users WHERE role = ?', ['admin']);
      if (adminCount.rows[0].count <= 1) {
        return res.status(400).json({ error: 'Cannot delete the last admin user' });
      }
    }

    await db.run('DELETE FROM users WHERE id=?', [req.params.id]);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Delete failed' });
  }
});

// Change user password
router.post('/:id/change-password', authMiddleware, async (req, res) => {
  const { current_password, new_password } = req.body;
  const userId = req.params.id;

  // Users can only change their own password unless they're admin
  if (req.user.id !== parseInt(userId) && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  if (!new_password || new_password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    const user = await db.query('SELECT password_hash FROM users WHERE id = ?', [userId]);
    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isValid = await bcrypt.compare(current_password, user.rows[0].password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hash = await bcrypt.hash(new_password, parseInt(process.env.BCRYPT_ROUNDS) || 12);
    await db.run('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [hash, userId]);
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Error changing password:', err);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

module.exports = router;
