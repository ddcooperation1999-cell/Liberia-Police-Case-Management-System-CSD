/**
 * Notification API Routes
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const notifications = require('../notifications/system');

/**
 * Middleware to verify user is authenticated
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
 * GET /api/notifications - Get user's notifications
 * Query params: limit, skip, read, type, priority
 */
router.get('/', verifyToken, (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const skip = parseInt(req.query.skip) || 0;
    
    const filter = {};
    if (req.query.read !== undefined) {
      filter.read = req.query.read === 'true';
    }
    if (req.query.type) {
      filter.type = req.query.type;
    }
    if (req.query.priority) {
      filter.priority = req.query.priority;
    }

    const result = notifications.getUserNotifications(req.user.userId, {
      filter,
      limit,
      skip
    });

    res.json(result);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

/**
 * GET /api/notifications/unread/count - Get unread notification count
 */
router.get('/unread/count', verifyToken, (req, res) => {
  try {
    const count = notifications.getUnreadCount(req.user.userId);
    res.json({ unreadCount: count });
  } catch (err) {
    console.error('Error fetching unread count:', err);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

/**
 * PUT /api/notifications/:id/read - Mark notification as read
 */
router.put('/:id/read', verifyToken, (req, res) => {
  try {
    const notification = notifications.markNotificationAsRead(req.user.userId, req.params.id);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({
      success: true,
      notification
    });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

/**
 * PUT /api/notifications/read-all - Mark all notifications as read
 */
router.put('/read-all/bulk', verifyToken, (req, res) => {
  try {
    const count = notifications.markAllAsRead(req.user.userId);
    res.json({
      success: true,
      markedAsReadCount: count
    });
  } catch (err) {
    console.error('Error marking all as read:', err);
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

/**
 * DELETE /api/notifications/:id - Delete notification
 */
router.delete('/:id', verifyToken, (req, res) => {
  try {
    const success = notifications.deleteNotification(req.user.userId, req.params.id);
    
    if (!success) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting notification:', err);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

/**
 * GET /api/notifications/types - Get available notification types (public endpoint)
 */
router.get('/types/list', (req, res) => {
  res.json({
    types: notifications.NotificationTypes,
    priorities: notifications.PriorityLevels
  });
});

module.exports = router;
