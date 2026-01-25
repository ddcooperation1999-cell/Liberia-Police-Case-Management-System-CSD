/**
 * Enhanced Analytics Routes
 * Provides detailed analytics and reporting endpoints
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

/**
 * Middleware to verify authentication
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
 * GET /api/analytics - Get overall analytics
 */
router.get('/', verifyToken, (req, res) => {
  const { dateRange = 'month', caseStatus, department } = req.query;
  
  // Mock data - replace with actual database queries
  const analytics = {
    totalCases: 156,
    closedCases: 98,
    openCases: 58,
    casesThisPeriod: 23,
    
    casesTrend: [
      { date: '2024-01-01', created: 5, closed: 3 },
      { date: '2024-01-08', created: 8, closed: 4 },
      { date: '2024-01-15', created: 6, closed: 7 },
      { date: '2024-01-22', created: 4, closed: 5 }
    ],
    
    casesByStatus: [
      { status: 'Open', value: 58 },
      { status: 'Closed', value: 98 },
      { status: 'Pending', value: 12 }
    ],
    
    casesByType: [
      { type: 'Theft', count: 45 },
      { type: 'Assault', count: 32 },
      { type: 'Fraud', count: 28 },
      { type: 'Other', count: 51 }
    ],
    
    departmentPerformance: [
      { department: 'Investigations', resolved: 35, pending: 12 },
      { department: 'Patrol', resolved: 28, pending: 8 },
      { department: 'Narcotics', resolved: 21, pending: 6 },
      { department: 'Community Service', resolved: 14, pending: 4 }
    ],
    
    topCases: [
      {
        id: 1,
        caseNumber: 'CASE-2024-001',
        type: 'Theft',
        status: 'open',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        age: 10
      },
      {
        id: 2,
        caseNumber: 'CASE-2024-002',
        type: 'Assault',
        status: 'closed',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        age: 5
      }
    ]
  };
  
  res.json(analytics);
});

/**
 * GET /api/analytics/export - Export analytics data
 */
router.get('/export', verifyToken, (req, res) => {
  const { format = 'csv', dateRange, caseStatus, department } = req.query;
  
  if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=analytics.csv');
    
    const csv = `Case Number,Type,Status,Created Date,Resolution Time
CASE-2024-001,Theft,Open,2024-01-15,Pending
CASE-2024-002,Assault,Closed,2024-01-10,5 days
CASE-2024-003,Fraud,Open,2024-01-12,Pending`;
    
    res.send(csv);
  } else if (format === 'pdf') {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=analytics.pdf');
    
    // Simple PDF-like text for demo
    const pdf = Buffer.from('PDF Report - Analytics Data');
    res.send(pdf);
  } else {
    res.status(400).json({ error: 'Invalid format' });
  }
});

/**
 * GET /api/analytics/case-trends - Get case trend data
 */
router.get('/case-trends', verifyToken, (req, res) => {
  const trends = [
    { date: 'Week 1', created: 12, closed: 8, pending: 15 },
    { date: 'Week 2', created: 15, closed: 10, pending: 20 },
    { date: 'Week 3', created: 18, closed: 14, pending: 24 },
    { date: 'Week 4', created: 10, closed: 12, pending: 22 }
  ];
  
  res.json({ trends });
});

/**
 * GET /api/analytics/department-stats - Get department statistics
 */
router.get('/department-stats', verifyToken, (req, res) => {
  const stats = [
    { department: 'Investigations', caseLoad: 45, resolution: '7 days', efficiency: 92 },
    { department: 'Patrol', caseLoad: 38, resolution: '5 days', efficiency: 88 },
    { department: 'Narcotics', caseLoad: 28, resolution: '12 days', efficiency: 85 },
    { department: 'Community Service', caseLoad: 22, resolution: '3 days', efficiency: 95 }
  ];
  
  res.json({ stats });
});

/**
 * GET /api/analytics/officer-performance - Get officer performance metrics
 */
router.get('/officer-performance', verifyToken, (req, res) => {
  const performance = [
    { officer: 'John Smith', casesClosed: 28, avgResolutionTime: '5 days', rating: 4.8 },
    { officer: 'Jane Doe', casesClosed: 32, avgResolutionTime: '4 days', rating: 4.9 },
    { officer: 'Michael Johnson', casesClosed: 25, avgResolutionTime: '6 days', rating: 4.6 }
  ];
  
  res.json({ performance });
});

/**
 * GET /api/analytics/case-severity - Get cases by severity
 */
router.get('/case-severity', verifyToken, (req, res) => {
  const severity = [
    { level: 'Critical', count: 8, percentage: 5 },
    { level: 'High', count: 32, percentage: 20 },
    { level: 'Medium', count: 78, percentage: 50 },
    { level: 'Low', count: 38, percentage: 25 }
  ];
  
  res.json({ severity });
});

/**
 * GET /api/analytics/resolution-time - Get average resolution time analysis
 */
router.get('/resolution-time', verifyToken, (req, res) => {
  const resolutionTime = {
    byType: [
      { type: 'Theft', avgDays: 8, minDays: 2, maxDays: 25 },
      { type: 'Assault', avgDays: 12, minDays: 3, maxDays: 45 },
      { type: 'Fraud', avgDays: 20, minDays: 5, maxDays: 90 },
      { type: 'Other', avgDays: 10, minDays: 1, maxDays: 60 }
    ],
    byDepartment: [
      { department: 'Investigations', avgDays: 8 },
      { department: 'Patrol', avgDays: 5 },
      { department: 'Narcotics', avgDays: 15 },
      { department: 'Community Service', avgDays: 3 }
    ]
  };
  
  res.json(resolutionTime);
});

/**
 * GET /api/analytics/flagged-individuals - Get flagged individuals statistics
 */
router.get('/flagged-individuals', verifyToken, (req, res) => {
  const flaggedStats = {
    totalFlagged: 156,
    recentFlags: 12,
    byReason: [
      { reason: 'Dangerous', count: 45 },
      { reason: 'Wanted', count: 28 },
      { reason: 'High Risk', count: 38 },
      { reason: 'Witness', count: 45 }
    ],
    recentFlaggedCases: [
      {
        id: 1,
        name: 'John Suspect',
        reason: 'Dangerous',
        flaggedDate: '2024-01-20',
        status: 'Active'
      },
      {
        id: 2,
        name: 'Jane Criminal',
        reason: 'Wanted',
        flaggedDate: '2024-01-18',
        status: 'Active'
      }
    ]
  };
  
  res.json(flaggedStats);
});

module.exports = router;
