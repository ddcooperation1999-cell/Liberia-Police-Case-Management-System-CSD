-- =====================================================
-- LNP Case Management System - New Features Database Schema
-- =====================================================
-- This schema creates the necessary tables for the 5 new features
-- Created: January 18, 2026

-- =====================================================
-- 1. MULTI-LANGUAGE SUPPORT TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS translations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  english TEXT NOT NULL,
  kpelle TEXT,
  mandingo TEXT,
  context TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_translations_key ON translations(key);

-- =====================================================
-- 2. OFFLINE SYNC TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS offline_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action TEXT NOT NULL CHECK(action IN ('create', 'update', 'delete')),
  table_name TEXT NOT NULL,
  data TEXT,
  record_id INTEGER,
  synced INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  synced_at TIMESTAMP
);

-- Index for finding pending syncs
CREATE INDEX IF NOT EXISTS idx_offline_queue_synced ON offline_queue(synced);
CREATE INDEX IF NOT EXISTS idx_offline_queue_created ON offline_queue(created_at);

-- =====================================================
-- 3. GEOLOCATION TAGGING TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS geolocation_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id INTEGER NOT NULL,
  latitude REAL NOT NULL CHECK(latitude >= -90 AND latitude <= 90),
  longitude REAL NOT NULL CHECK(longitude >= -180 AND longitude <= 180),
  location_name TEXT,
  location_type TEXT DEFAULT 'other' CHECK(location_type IN ('scene', 'station', 'arrest', 'evidence', 'other')),
  description TEXT,
  timestamp TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

-- Indexes for geolocation queries
CREATE INDEX IF NOT EXISTS idx_geolocation_case ON geolocation_tags(case_id);
CREATE INDEX IF NOT EXISTS idx_geolocation_type ON geolocation_tags(location_type);
CREATE INDEX IF NOT EXISTS idx_geolocation_created ON geolocation_tags(created_at);

-- =====================================================
-- 4. EVIDENCE MANAGEMENT TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS evidence (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id INTEGER NOT NULL,
  evidence_number TEXT UNIQUE NOT NULL,
  evidence_type TEXT DEFAULT 'physical' CHECK(evidence_type IN ('physical', 'digital', 'documentary')),
  description TEXT NOT NULL,
  custody_chain TEXT,
  location TEXT,
  collected_date DATE,
  collected_by TEXT,
  status TEXT DEFAULT 'collected' CHECK(status IN ('collected', 'stored', 'released', 'destroyed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

-- Indexes for evidence queries
CREATE INDEX IF NOT EXISTS idx_evidence_case ON evidence(case_id);
CREATE INDEX IF NOT EXISTS idx_evidence_number ON evidence(evidence_number);
CREATE INDEX IF NOT EXISTS idx_evidence_type ON evidence(evidence_type);
CREATE INDEX IF NOT EXISTS idx_evidence_status ON evidence(status);
CREATE INDEX IF NOT EXISTS idx_evidence_created ON evidence(created_at);

-- =====================================================
-- 5. CASE CLOSURE WORKFLOW TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS case_closures (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id INTEGER NOT NULL UNIQUE,
  closing_reason TEXT NOT NULL CHECK(closing_reason IN ('solved', 'inactive', 'dismissed', 'transferred')),
  closure_date DATE,
  disposition TEXT CHECK(disposition IN ('guilty', 'not_guilty', 'acquitted', 'insufficient_evidence', 'pending')),
  notes TEXT,
  assigned_to TEXT,
  status TEXT DEFAULT 'initiated' CHECK(status IN ('initiated', 'review', 'approved', 'closed')),
  approved_at TIMESTAMP,
  rejected_at TIMESTAMP,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

-- Indexes for closure workflow
CREATE INDEX IF NOT EXISTS idx_case_closure_case ON case_closures(case_id);
CREATE INDEX IF NOT EXISTS idx_case_closure_status ON case_closures(status);
CREATE INDEX IF NOT EXISTS idx_case_closure_reason ON case_closures(closing_reason);
CREATE INDEX IF NOT EXISTS idx_case_closure_created ON case_closures(created_at);

-- =====================================================
-- SAMPLE DATA INSERTION (OPTIONAL)
-- =====================================================

-- Insert sample translations
INSERT OR IGNORE INTO translations (key, english, kpelle, mandingo, context) VALUES
('case.status.open', 'Open', 'Kali', 'Fure', 'Used in case management'),
('case.status.closed', 'Closed', 'Wili', 'Seefe', 'Used in case management'),
('case.status.pending', 'Pending', 'Keli', 'Jongo', 'Used in case management'),
('user.role.admin', 'Administrator', 'Kɔŋ', 'Kadi', 'System administrator role'),
('user.role.officer', 'Police Officer', 'Polisa', 'Polisaa', 'Field police officer role'),
('evidence.type.physical', 'Physical Evidence', 'Kele-kele', 'Niyaa', 'Tangible evidence'),
('evidence.type.digital', 'Digital Evidence', 'Koŋ-koŋ', 'Elekita', 'Electronic/digital evidence');

-- =====================================================
-- VIEWS FOR EASIER QUERYING
-- =====================================================

-- View for case closure workflow status
CREATE VIEW IF NOT EXISTS case_closure_status_view AS
SELECT 
  cc.id,
  c.id as case_id,
  c.case_number,
  c.case_type,
  cc.closing_reason,
  cc.disposition,
  cc.status,
  cc.assigned_to,
  cc.closure_date,
  cc.created_at
FROM case_closures cc
JOIN cases c ON cc.case_id = c.id
ORDER BY cc.created_at DESC;

-- View for evidence by case
CREATE VIEW IF NOT EXISTS evidence_by_case_view AS
SELECT 
  e.id,
  e.evidence_number,
  e.evidence_type,
  e.status,
  c.id as case_id,
  c.case_number,
  c.case_type,
  e.collected_date,
  e.collected_by,
  e.location
FROM evidence e
JOIN cases c ON e.case_id = c.id
ORDER BY e.created_at DESC;

-- View for geolocation tags by case
CREATE VIEW IF NOT EXISTS geolocation_by_case_view AS
SELECT 
  gt.id,
  gt.location_name,
  gt.location_type,
  gt.latitude,
  gt.longitude,
  c.id as case_id,
  c.case_number,
  c.case_type,
  gt.created_at
FROM geolocation_tags gt
JOIN cases c ON gt.case_id = c.id
ORDER BY gt.created_at DESC;

-- =====================================================
-- STORED PROCEDURES / FUNCTIONS
-- =====================================================

-- Note: SQLite has limited support for stored procedures.
-- Use these queries in your application code instead.

-- Get case closure progress (which step is it on)
-- SELECT 
--   cc.id,
--   cc.case_id,
--   cc.status,
--   CASE 
--     WHEN cc.status = 'initiated' THEN 1
--     WHEN cc.status = 'review' THEN 2
--     WHEN cc.status = 'approved' THEN 3
--     WHEN cc.status = 'closed' THEN 4
--   END as step_number,
--   4 as total_steps
-- FROM case_closures cc
-- WHERE cc.id = ?;

-- Get evidence statistics by case
-- SELECT 
--   c.id,
--   c.case_number,
--   COUNT(e.id) as total_evidence,
--   SUM(CASE WHEN e.evidence_type = 'physical' THEN 1 ELSE 0 END) as physical_count,
--   SUM(CASE WHEN e.evidence_type = 'digital' THEN 1 ELSE 0 END) as digital_count,
--   SUM(CASE WHEN e.status = 'stored' THEN 1 ELSE 0 END) as stored_count
-- FROM cases c
-- LEFT JOIN evidence e ON c.id = e.case_id
-- GROUP BY c.id;

-- =====================================================
-- DATA INTEGRITY TRIGGERS
-- =====================================================

-- Update timestamp on translations update
CREATE TRIGGER IF NOT EXISTS update_translations_timestamp 
AFTER UPDATE ON translations
FOR EACH ROW
BEGIN
  UPDATE translations SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Update timestamp on geolocation update
CREATE TRIGGER IF NOT EXISTS update_geolocation_timestamp 
AFTER UPDATE ON geolocation_tags
FOR EACH ROW
BEGIN
  UPDATE geolocation_tags SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Update timestamp on evidence update
CREATE TRIGGER IF NOT EXISTS update_evidence_timestamp 
AFTER UPDATE ON evidence
FOR EACH ROW
BEGIN
  UPDATE evidence SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Update timestamp on case closure update
CREATE TRIGGER IF NOT EXISTS update_case_closure_timestamp 
AFTER UPDATE ON case_closures
FOR EACH ROW
BEGIN
  UPDATE case_closures SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- =====================================================
-- END OF SCHEMA
-- =====================================================
