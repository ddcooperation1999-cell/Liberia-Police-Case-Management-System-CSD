/**
 * Notification System
 * Handles user notifications for case updates, deadlines, alerts
 */

const fs = require('fs');
const path = require('path');

// Ensure notifications directory exists
const notificationsDir = path.join(__dirname, '..', 'logs', 'notifications');
if (!fs.existsSync(notificationsDir)) {
  fs.mkdirSync(notificationsDir, { recursive: true });
}

/**
 * Notification Types
 */
const NotificationTypes = {
  CASE_CREATED: 'case_created',
  CASE_UPDATED: 'case_updated',
  CASE_CLOSED: 'case_closed',
  CASE_ASSIGNED: 'case_assigned',
  DEADLINE_APPROACHING: 'deadline_approaching',
  DEADLINE_OVERDUE: 'deadline_overdue',
  DOCUMENT_UPLOADED: 'document_uploaded',
  FLAG_CREATED: 'flag_created',
  CRIMINAL_RECORD_ADDED: 'criminal_record_added',
  MEETING_SCHEDULED: 'meeting_scheduled',
  MEETING_REMINDER: 'meeting_reminder',
  SYSTEM_ALERT: 'system_alert',
  PERMISSION_GRANTED: 'permission_granted',
  PASSWORD_RESET: 'password_reset'
};

/**
 * Priority Levels
 */
const PriorityLevels = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

/**
 * Create notification
 */
const createNotification = (userId, type, title, message, options = {}) => {
  return {
    id: Math.random().toString(36).substring(7),
    userId,
    type,
    title,
    message,
    priority: options.priority || PriorityLevels.MEDIUM,
    relatedCaseId: options.relatedCaseId || null,
    relatedDocumentId: options.relatedDocumentId || null,
    data: options.data || {},
    read: false,
    createdAt: new Date().toISOString(),
    expiresAt: options.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    actionUrl: options.actionUrl || null,
    actionLabel: options.actionLabel || 'View'
  };
};

/**
 * Store notification (in-memory + file backup)
 */
let notificationsStore = new Map(); // userId -> [notifications]

const saveNotification = (notification) => {
  // Store in memory
  if (!notificationsStore.has(notification.userId)) {
    notificationsStore.set(notification.userId, []);
  }
  notificationsStore.get(notification.userId).push(notification);

  // Save to file for persistence
  const userNotifFile = path.join(notificationsDir, `${notification.userId}.json`);
  try {
    let userNotifications = [];
    if (fs.existsSync(userNotifFile)) {
      userNotifications = JSON.parse(fs.readFileSync(userNotifFile, 'utf8'));
    }
    userNotifications.push(notification);
    // Keep only last 1000 notifications per user
    userNotifications = userNotifications.slice(-1000);
    fs.writeFileSync(userNotifFile, JSON.stringify(userNotifications, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving notification:', err);
  }

  return notification;
};

/**
 * Get user notifications
 */
const getUserNotifications = (userId, options = {}) => {
  const filter = options.filter || {}; // { read: false, type: 'case_updated' }
  const limit = options.limit || 50;
  const skip = options.skip || 0;

  // Load from file
  const userNotifFile = path.join(notificationsDir, `${userId}.json`);
  let userNotifications = [];
  
  if (fs.existsSync(userNotifFile)) {
    try {
      userNotifications = JSON.parse(fs.readFileSync(userNotifFile, 'utf8'));
    } catch (err) {
      console.error('Error loading notifications:', err);
    }
  }

  // Apply filters
  if (filter.read !== undefined) {
    userNotifications = userNotifications.filter(n => n.read === filter.read);
  }
  if (filter.type) {
    userNotifications = userNotifications.filter(n => n.type === filter.type);
  }
  if (filter.priority) {
    userNotifications = userNotifications.filter(n => n.priority === filter.priority);
  }

  // Sort by newest first
  userNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Paginate
  const total = userNotifications.length;
  userNotifications = userNotifications.slice(skip, skip + limit);

  return {
    notifications: userNotifications,
    total,
    hasMore: skip + limit < total
  };
};

/**
 * Mark notification as read
 */
const markNotificationAsRead = (userId, notificationId) => {
  const userNotifFile = path.join(notificationsDir, `${userId}.json`);
  
  try {
    let userNotifications = [];
    if (fs.existsSync(userNotifFile)) {
      userNotifications = JSON.parse(fs.readFileSync(userNotifFile, 'utf8'));
    }

    const notification = userNotifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      notification.readAt = new Date().toISOString();
      fs.writeFileSync(userNotifFile, JSON.stringify(userNotifications, null, 2), 'utf8');
      return notification;
    }
  } catch (err) {
    console.error('Error marking notification as read:', err);
  }

  return null;
};

/**
 * Mark all notifications as read
 */
const markAllAsRead = (userId) => {
  const userNotifFile = path.join(notificationsDir, `${userId}.json`);
  
  try {
    let userNotifications = [];
    if (fs.existsSync(userNotifFile)) {
      userNotifications = JSON.parse(fs.readFileSync(userNotifFile, 'utf8'));
    }

    let count = 0;
    userNotifications.forEach(n => {
      if (!n.read) {
        n.read = true;
        n.readAt = new Date().toISOString();
        count++;
      }
    });

    fs.writeFileSync(userNotifFile, JSON.stringify(userNotifications, null, 2), 'utf8');
    return count;
  } catch (err) {
    console.error('Error marking all as read:', err);
  }

  return 0;
};

/**
 * Get unread count
 */
const getUnreadCount = (userId) => {
  const userNotifFile = path.join(notificationsDir, `${userId}.json`);
  
  try {
    if (fs.existsSync(userNotifFile)) {
      const userNotifications = JSON.parse(fs.readFileSync(userNotifFile, 'utf8'));
      return userNotifications.filter(n => !n.read).length;
    }
  } catch (err) {
    console.error('Error getting unread count:', err);
  }

  return 0;
};

/**
 * Delete notification
 */
const deleteNotification = (userId, notificationId) => {
  const userNotifFile = path.join(notificationsDir, `${userId}.json`);
  
  try {
    let userNotifications = [];
    if (fs.existsSync(userNotifFile)) {
      userNotifications = JSON.parse(fs.readFileSync(userNotifFile, 'utf8'));
    }

    userNotifications = userNotifications.filter(n => n.id !== notificationId);
    fs.writeFileSync(userNotifFile, JSON.stringify(userNotifications, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error deleting notification:', err);
    return false;
  }
};

/**
 * Notify case update
 */
const notifyCaseUpdate = (caseId, caseNumber, updates, assignedToUserIds = []) => {
  assignedToUserIds.forEach(userId => {
    const notification = createNotification(
      userId,
      NotificationTypes.CASE_UPDATED,
      `Case ${caseNumber} Updated`,
      `Case details have been updated`,
      {
        priority: PriorityLevels.MEDIUM,
        relatedCaseId: caseId,
        data: { updates },
        actionUrl: `/cases/${caseId}`,
        actionLabel: 'View Case'
      }
    );
    saveNotification(notification);
  });
};

/**
 * Notify deadline approaching
 */
const notifyDeadlineApproaching = (userId, caseId, caseNumber, deadlineDate) => {
  const daysUntil = Math.ceil((new Date(deadlineDate) - new Date()) / (1000 * 60 * 60 * 24));
  
  const notification = createNotification(
    userId,
    NotificationTypes.DEADLINE_APPROACHING,
    `Deadline Approaching: ${caseNumber}`,
    `Deadline is ${daysUntil} days away`,
    {
      priority: daysUntil <= 3 ? PriorityLevels.HIGH : PriorityLevels.MEDIUM,
      relatedCaseId: caseId,
      data: { daysUntil, deadlineDate },
      actionUrl: `/cases/${caseId}`,
      actionLabel: 'View Case'
    }
  );
  saveNotification(notification);
};

/**
 * Notify case assignment
 */
const notifyCaseAssignment = (userId, caseId, caseNumber, assignedBy) => {
  const notification = createNotification(
    userId,
    NotificationTypes.CASE_ASSIGNED,
    `New Case Assignment: ${caseNumber}`,
    `You have been assigned to case ${caseNumber} by ${assignedBy}`,
    {
      priority: PriorityLevels.HIGH,
      relatedCaseId: caseId,
      data: { assignedBy },
      actionUrl: `/cases/${caseId}`,
      actionLabel: 'View Case'
    }
  );
  saveNotification(notification);
};

/**
 * Notify document upload
 */
const notifyDocumentUpload = (userId, caseId, caseNumber, documentName, uploadedBy) => {
  const notification = createNotification(
    userId,
    NotificationTypes.DOCUMENT_UPLOADED,
    `Document Uploaded: ${caseNumber}`,
    `${uploadedBy} uploaded ${documentName}`,
    {
      priority: PriorityLevels.MEDIUM,
      relatedCaseId: caseId,
      data: { documentName, uploadedBy },
      actionUrl: `/cases/${caseId}/documents`,
      actionLabel: 'View Documents'
    }
  );
  saveNotification(notification);
};

/**
 * Notify system alert
 */
const notifySystemAlert = (userIds, title, message, severity = 'medium') => {
  userIds.forEach(userId => {
    const notification = createNotification(
      userId,
      NotificationTypes.SYSTEM_ALERT,
      title,
      message,
      {
        priority: severity === 'critical' ? PriorityLevels.CRITICAL : PriorityLevels.HIGH,
        data: { severity }
      }
    );
    saveNotification(notification);
  });
};

/**
 * Clean expired notifications (run periodically)
 */
const cleanExpiredNotifications = () => {
  try {
    const files = fs.readdirSync(notificationsDir);
    
    files.forEach(file => {
      const filePath = path.join(notificationsDir, file);
      let notifications = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Remove expired notifications
      const beforeCount = notifications.length;
      notifications = notifications.filter(n => new Date(n.expiresAt) > new Date());
      
      if (notifications.length < beforeCount) {
        fs.writeFileSync(filePath, JSON.stringify(notifications, null, 2), 'utf8');
        console.log(`Cleaned ${beforeCount - notifications.length} expired notifications from ${file}`);
      }
    });
  } catch (err) {
    console.error('Error cleaning expired notifications:', err);
  }
};

/**
 * Schedule cleanup (run daily)
 */
const scheduleCleanup = () => {
  const cron = require('node-cron');
  // Run at 3 AM daily
  cron.schedule('0 3 * * *', () => {
    console.log('Running notification cleanup...');
    cleanExpiredNotifications();
  });
};

module.exports = {
  NotificationTypes,
  PriorityLevels,
  createNotification,
  saveNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification,
  notifyCaseUpdate,
  notifyDeadlineApproaching,
  notifyCaseAssignment,
  notifyDocumentUpload,
  notifySystemAlert,
  cleanExpiredNotifications,
  scheduleCleanup
};
