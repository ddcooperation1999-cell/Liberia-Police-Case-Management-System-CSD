const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
require('dotenv').config();

// Validate critical environment variables
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('ERROR: JWT_SECRET must be set and at least 32 characters long');
  process.exit(1);
}

const db = require('./db');
const authRoutes = require('./routes/auth');
const casesRoutes = require('./routes/cases');
const usersRoutes = require('./routes/users');
const countiesRoutes = require('./routes/counties');
const criminalRecordsRoutes = require('./routes/criminal-records');
const documentsRoutes = require('./routes/documents');
const flaggedIndividualsRoutes = require('./routes/flagged-individuals');
const analyticsRoutes = require('./routes/analytics');
const notificationRoutes = require('./routes/notifications');
const analyticsEnhancedRoutes = require('./routes/analytics-enhanced');
const caseAssignmentsRoutes = require('./routes/case-assignments');
const caseNotesRoutes = require('./routes/case-notes');
const documentTemplatesRoutes = require('./routes/document-templates');
const searchRoutes = require('./routes/search');
const auditLogsRoutes = require('./routes/audit-logs');
const multiLanguageRoutes = require('./routes/multi-language');
const offlineSyncRoutes = require('./routes/offline-sync');
const geolocationRoutes = require('./routes/geolocation');
const evidenceRoutes = require('./routes/evidence');
const caseClosureRoutes = require('./routes/case-closure');
const { authMiddleware, adminOnly } = require('./middleware/auth');
const notificationSystem = require('./notifications/system');
const { cacheMiddleware, invalidateCacheOnWrite, CACHE_DURATIONS } = require('./middleware/cache');
const { 
  requestTiming, 
  optimizeHeaders, 
  limitRequestSize, 
  limitQueryResults, 
  setConnectionTimeout, 
  bufferResponse,
  deduplicateRequests,
  monitorMemory
} = require('./middleware/performance');

// Initialize database
const initDb = async () => {
  try {
    const dbPath = path.join(__dirname, 'police_cases.db');
    const dbExists = fs.existsSync(dbPath);
    
    if (dbExists) {
      console.log('Database already exists, skipping initialization');
      return;
    }
    
    const sql = fs.readFileSync(path.join(__dirname, 'sql', 'init.sql'), 'utf8');
    
    // Split SQL into individual statements and execute them one by one
    const statements = sql.split(';').filter(stmt => stmt.trim());
    for (const stmt of statements) {
      await new Promise((resolve, reject) => {
        db.db.run(stmt, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
    
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1); // Exit if DB init fails
  }
};

// Start server after DB initialization
const startServer = async () => {
  await initDb();
  
  const app = express();

  // Performance monitoring middlewares - Apply first
  app.use(requestTiming);
  app.use(monitorMemory);
  app.use(setConnectionTimeout(30000));

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15 minutes
    max: process.env.RATE_LIMIT_MAX_REQUESTS || 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);

  // CORS configuration
  const corsOptions = {
    origin: function (origin, callback) {
      const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://192.168.0.153:3000', process.env.FRONTEND_URL];
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(null, true); // Allow all origins for development
      }
    },
    credentials: true,
    optionsSuccessStatus: 200
  };
  app.use(cors(corsOptions));

  // Optimize response headers
  app.use(optimizeHeaders);

  // Compression middleware - dramatically reduces response size
  app.use(compression({
    level: 6, // Balance between compression ratio and speed
    threshold: 1000, // Only compress responses > 1KB
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    }
  }));

  // Body parsing with size limits and deduplication
  app.use(limitRequestSize('5mb'));
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));
  app.use(deduplicateRequests);
  app.use(bufferResponse);
  app.use(limitQueryResults(20, 50)); // Default 20, max 50

  // ====== SERVE REACT BUILD ON PORT 3000 ======
  // Serve static files from React build folder
  const frontendBuildPath = path.join(__dirname, '..', 'frontend', 'build');
  const frontendPublicPath = path.join(__dirname, '..', 'frontend', 'public');
  
  app.use(express.static(frontendBuildPath));
  app.use(express.static(frontendPublicPath));

  // Handle React routing - serve index.html for all non-API routes
  app.get('/', (req, res) => {
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
  
  // ======================================

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/auth/register', authMiddleware, adminOnly); // Protect register

  // Apply caching to read-heavy routes
  app.use('/api/cases', authMiddleware, cacheMiddleware(CACHE_DURATIONS.medium), casesRoutes);
  app.use('/api/users', authMiddleware, adminOnly, cacheMiddleware(CACHE_DURATIONS.medium), usersRoutes);
  app.use('/api/counties', authMiddleware, cacheMiddleware(CACHE_DURATIONS.long), countiesRoutes);
  app.use('/api/criminal-records', authMiddleware, cacheMiddleware(CACHE_DURATIONS.medium), criminalRecordsRoutes);
  app.use('/api/documents', authMiddleware, cacheMiddleware(CACHE_DURATIONS.short), documentsRoutes);
  app.use('/api/flagged-individuals', authMiddleware, cacheMiddleware(CACHE_DURATIONS.medium), flaggedIndividualsRoutes);
  app.use('/api/analytics', authMiddleware, cacheMiddleware(CACHE_DURATIONS.medium), analyticsRoutes);
  app.use('/api/analytics-v2', authMiddleware, cacheMiddleware(CACHE_DURATIONS.medium), analyticsEnhancedRoutes);
  app.use('/api/notifications', cacheMiddleware(CACHE_DURATIONS.short), notificationRoutes);
  app.use('/api/case-assignments', authMiddleware, cacheMiddleware(CACHE_DURATIONS.short), caseAssignmentsRoutes);
  app.use('/api/case-notes', authMiddleware, cacheMiddleware(CACHE_DURATIONS.short), caseNotesRoutes);
  app.use('/api/document-templates', authMiddleware, cacheMiddleware(CACHE_DURATIONS.long), documentTemplatesRoutes);
  app.use('/api/search', authMiddleware, cacheMiddleware(CACHE_DURATIONS.short), searchRoutes);
  app.use('/api/audit-logs', authMiddleware, cacheMiddleware(CACHE_DURATIONS.short), auditLogsRoutes);
  app.use('/api/multi-language', authMiddleware, cacheMiddleware(CACHE_DURATIONS.long), multiLanguageRoutes);
  app.use('/api/offline-sync', authMiddleware, cacheMiddleware(CACHE_DURATIONS.short), offlineSyncRoutes);
  app.use('/api/geolocation', authMiddleware, cacheMiddleware(CACHE_DURATIONS.short), geolocationRoutes);
  app.use('/api/evidence', authMiddleware, cacheMiddleware(CACHE_DURATIONS.short), evidenceRoutes);
  app.use('/api/case-closure', authMiddleware, cacheMiddleware(CACHE_DURATIONS.short), caseClosureRoutes);

  // Initialize notification cleanup schedule
  notificationSystem.scheduleCleanup();

  // Comprehensive error handling middleware
  app.use((err, req, res, next) => {
    console.error('Error:', {
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
    });

    // Default error response
    let statusCode = err.statusCode || err.status || 500;
    let errorMessage = err.message || 'Internal server error';

    // Handle specific error types
    if (err.name === 'SyntaxError') {
      statusCode = 400;
      errorMessage = 'Invalid JSON in request body';
    } else if (err.name === 'ValidationError') {
      statusCode = 400;
      errorMessage = 'Validation error: ' + err.message;
    } else if (err.name === 'CastError') {
      statusCode = 400;
      errorMessage = 'Invalid parameter format';
    } else if (err.code === 'ENOTFOUND') {
      statusCode = 503;
      errorMessage = 'Database connection error';
    }

    res.status(statusCode).json({
      error: errorMessage,
      ...(process.env.NODE_ENV === 'development' && { details: err.stack })
    });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
  });

  // Serve React app as fallback for all other routes (SPA routing)
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });

  const port = process.env.PORT || 3001;
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 LNPMS System running on port ${port}`);
    console.log(`🎨 Frontend: http://localhost:${port}`);
    console.log(`🔌 Backend API: http://localhost:${port}/api`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔒 Security: JWT configured, Rate limiting enabled`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('Process terminated');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
      console.log('Process terminated');
      process.exit(0);
    });
  });
};

// Start the server
startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
