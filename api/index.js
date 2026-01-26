// Vercel Serverless API Handler - Combines Backend + Frontend
const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Enable CORS
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'lnpms-api' });
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Import backend routes
try {
  const authRoutes = require('../backend/routes/auth');
  const casesRoutes = require('../backend/routes/cases');
  const usersRoutes = require('../backend/routes/users');
  const searchRoutes = require('../backend/routes/search');
  const caseNotesRoutes = require('../backend/routes/case-notes');
  const caseAssignmentsRoutes = require('../backend/routes/case-assignments');
  const evidenceRoutes = require('../backend/routes/evidence');
  const geolocationRoutes = require('../backend/routes/geolocation');
  const caseClosureRoutes = require('../backend/routes/case-closure');
  const auditLogsRoutes = require('../backend/routes/audit-logs');
  const analyticsEnhancedRoutes = require('../backend/routes/analytics-enhanced');
  const documentTemplatesRoutes = require('../backend/routes/document-templates');
  const flaggedIndividualsRoutes = require('../backend/routes/flagged-individuals');
  const countiesRoutes = require('../backend/routes/counties');
  const offlineSyncRoutes = require('../backend/routes/offline-sync');
  const multiLanguageRoutes = require('../backend/routes/multi-language');
  
  // Mount API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/cases', casesRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/search', searchRoutes);
  app.use('/api/case-notes', caseNotesRoutes);
  app.use('/api/case-assignments', caseAssignmentsRoutes);
  app.use('/api/evidence', evidenceRoutes);
  app.use('/api/geolocation', geolocationRoutes);
  app.use('/api/case-closure', caseClosureRoutes);
  app.use('/api/audit-logs', auditLogsRoutes);
  app.use('/api/analytics', analyticsEnhancedRoutes);
  app.use('/api/document-templates', documentTemplatesRoutes);
  app.use('/api/flagged-individuals', flaggedIndividualsRoutes);
  app.use('/api/counties', countiesRoutes);
  app.use('/api/offline-sync', offlineSyncRoutes);
  app.use('/api/multi-language', multiLanguageRoutes);
} catch (err) {
  console.error('Warning: Some routes could not be loaded:', err.message);
}

// Catch-all: serve index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Export for Vercel
module.exports = app;
