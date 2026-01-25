/**
 * Audit Logging Module
 * Tracks all critical operations for compliance and security monitoring
 */

const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const auditLogFile = path.join(logsDir, 'audit.log');

/**
 * Log event types
 */
const EventTypes = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  FAILED_LOGIN: 'FAILED_LOGIN',
  USER_CREATE: 'USER_CREATE',
  USER_UPDATE: 'USER_UPDATE',
  USER_DELETE: 'USER_DELETE',
  USER_STATUS_CHANGE: 'USER_STATUS_CHANGE',
  CASE_CREATE: 'CASE_CREATE',
  CASE_UPDATE: 'CASE_UPDATE',
  CASE_DELETE: 'CASE_DELETE',
  DOCUMENT_UPLOAD: 'DOCUMENT_UPLOAD',
  DOCUMENT_DELETE: 'DOCUMENT_DELETE',
  CRIMINAL_RECORD_CREATE: 'CRIMINAL_RECORD_CREATE',
  CRIMINAL_RECORD_UPDATE: 'CRIMINAL_RECORD_UPDATE',
  CRIMINAL_RECORD_DELETE: 'CRIMINAL_RECORD_DELETE',
  FLAG_CREATE: 'FLAG_CREATE',
  FLAG_UPDATE: 'FLAG_UPDATE',
  FLAG_DELETE: 'FLAG_DELETE',
  CLEARANCE_CHECK: 'CLEARANCE_CHECK',
  EXPORT_DATA: 'EXPORT_DATA',
  ACCESS_DENIED: 'ACCESS_DENIED',
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
  SYSTEM_ERROR: 'SYSTEM_ERROR',
  PERMISSION_ESCALATION: 'PERMISSION_ESCALATION'
};

/**
 * Severity levels
 */
const SeverityLevels = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

/**
 * Determine severity based on event type
 */
const getSeverity = (eventType) => {
  const criticalEvents = [
    EventTypes.USER_DELETE,
    EventTypes.CRIMINAL_RECORD_DELETE,
    EventTypes.UNAUTHORIZED_ACCESS,
    EventTypes.PERMISSION_ESCALATION,
    EventTypes.FAILED_LOGIN
  ];

  const highEvents = [
    EventTypes.USER_CREATE,
    EventTypes.USER_UPDATE,
    EventTypes.USER_STATUS_CHANGE,
    EventTypes.CASE_DELETE,
    EventTypes.DOCUMENT_DELETE,
    EventTypes.FLAG_DELETE,
    EventTypes.ACCESS_DENIED
  ];

  if (criticalEvents.includes(eventType)) {
    return SeverityLevels.CRITICAL;
  }
  if (highEvents.includes(eventType)) {
    return SeverityLevels.HIGH;
  }
  return SeverityLevels.MEDIUM;
};

/**
 * Create audit log entry
 */
const createAuditEntry = (eventType, userId, username, userRole, details = {}) => {
  return {
    timestamp: new Date().toISOString(),
    eventType,
    severity: getSeverity(eventType),
    userId,
    username,
    userRole,
    ipAddress: details.ipAddress || 'unknown',
    userAgent: details.userAgent || 'unknown',
    resourceId: details.resourceId || null,
    resourceType: details.resourceType || null,
    action: details.action || null,
    changes: details.changes || null,
    status: details.status || 'success',
    errorMessage: details.errorMessage || null,
    metadata: details.metadata || {}
  };
};

/**
 * Write audit log to file (append)
 */
const logToFile = (entry) => {
  try {
    const logLine = JSON.stringify(entry) + '\n';
    fs.appendFileSync(auditLogFile, logLine, 'utf8');
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
};

/**
 * Log event (main function)
 */
const logEvent = (eventType, userId, username, userRole, details = {}) => {
  const entry = createAuditEntry(eventType, userId, username, userRole, details);
  
  // Log to file
  logToFile(entry);

  // Log to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[AUDIT] ${eventType}:`, {
      user: username,
      resource: details.resourceType,
      status: entry.status
    });
  }

  return entry;
};

/**
 * Middleware to attach audit logging to request
 */
const auditMiddleware = (req, res, next) => {
  // Attach logging function to request
  req.audit = {
    log: (eventType, details = {}) => {
      logEvent(eventType, req.user?.id, req.user?.username, req.user?.role, {
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        ...details
      });
    }
  };

  // Intercept response to log certain operations
  const originalJson = res.json;
  res.json = function(data) {
    // Log successful operations
    if (res.statusCode < 400 && req.user) {
      // This will be handled by individual route handlers
    }
    return originalJson.call(this, data);
  };

  next();
};

/**
 * Read audit logs with filtering
 */
const readAuditLogs = (filters = {}) => {
  try {
    if (!fs.existsSync(auditLogFile)) {
      return [];
    }

    const content = fs.readFileSync(auditLogFile, 'utf8');
    let logs = content.split('\n')
      .filter(line => line.trim())
      .map(line => JSON.parse(line));

    // Apply filters
    if (filters.eventType) {
      logs = logs.filter(log => log.eventType === filters.eventType);
    }

    if (filters.userId) {
      logs = logs.filter(log => log.userId === filters.userId);
    }

    if (filters.severity) {
      logs = logs.filter(log => log.severity === filters.severity);
    }

    if (filters.startDate) {
      logs = logs.filter(log => new Date(log.timestamp) >= new Date(filters.startDate));
    }

    if (filters.endDate) {
      logs = logs.filter(log => new Date(log.timestamp) <= new Date(filters.endDate));
    }

    if (filters.limit) {
      logs = logs.slice(-filters.limit);
    }

    return logs;
  } catch (err) {
    console.error('Error reading audit logs:', err);
    return [];
  }
};

/**
 * Get audit statistics
 */
const getAuditStats = (startDate, endDate) => {
  const logs = readAuditLogs({
    startDate,
    endDate
  });

  const stats = {
    totalEvents: logs.length,
    byEventType: {},
    bySeverity: {},
    byUser: {},
    failedAttempts: 0
  };

  logs.forEach(log => {
    // Count by event type
    stats.byEventType[log.eventType] = (stats.byEventType[log.eventType] || 0) + 1;

    // Count by severity
    stats.bySeverity[log.severity] = (stats.bySeverity[log.severity] || 0) + 1;

    // Count by user
    stats.byUser[log.username] = (stats.byUser[log.username] || 0) + 1;

    // Count failed attempts
    if (log.status === 'failure' || log.eventType === EventTypes.FAILED_LOGIN) {
      stats.failedAttempts++;
    }
  });

  return stats;
};

/**
 * Export audit logs (for compliance reporting)
 */
const exportAuditLogs = (format = 'json', filters = {}) => {
  const logs = readAuditLogs(filters);

  if (format === 'csv') {
    // Convert to CSV
    const headers = ['Timestamp', 'Event Type', 'Severity', 'User', 'Resource', 'Status'];
    const csvLines = [headers.join(',')];
    
    logs.forEach(log => {
      csvLines.push([
        log.timestamp,
        log.eventType,
        log.severity,
        log.username,
        log.resourceType || '-',
        log.status
      ].join(','));
    });

    return csvLines.join('\n');
  }

  // JSON format (default)
  return JSON.stringify(logs, null, 2);
};

module.exports = {
  EventTypes,
  SeverityLevels,
  logEvent,
  logToFile,
  auditMiddleware,
  readAuditLogs,
  getAuditStats,
  exportAuditLogs,
  createAuditEntry
};
