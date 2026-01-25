-- Create table counties
CREATE TABLE IF NOT EXISTS counties (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

-- Create table users
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'officer')),
  department TEXT CHECK (department IN ('CID', 'Traffic', 'Patrol', 'Narcotics', 'Homicide', 'Admin', NULL)),
  county_id INTEGER,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  badge_number TEXT UNIQUE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (county_id) REFERENCES counties(id)
);

-- Create indexes for better performance with large datasets
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_county_id ON users(county_id);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Create table suspects
CREATE TABLE IF NOT EXISTS suspects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth TEXT,
  gender TEXT,
  national_id TEXT UNIQUE,
  phone TEXT,
  address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create table criminal_records
CREATE TABLE IF NOT EXISTS criminal_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  suspect_id INTEGER NOT NULL,
  case_id INTEGER,
  charge_type TEXT NOT NULL,
  description TEXT,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  record_date DATETIME,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'sealed')),
  officer_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (suspect_id) REFERENCES suspects(id),
  FOREIGN KEY (case_id) REFERENCES police_cases(id),
  FOREIGN KEY (officer_id) REFERENCES users(id)
);

-- Create table police_cases
CREATE TABLE IF NOT EXISTS police_cases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_number TEXT UNIQUE,
  county TEXT NOT NULL,
  department TEXT CHECK (department IN ('CID', 'Traffic', 'Patrol', 'Narcotics', 'Homicide', 'Other')),
  case_type TEXT NOT NULL,
  details TEXT,
  month TEXT,
  disposition TEXT CHECK (disposition IN ('Open', 'Closed', 'Under Investigation', 'Pending', 'Suspended')),
  investigator TEXT,
  suspect_id INTEGER,
  victim_name TEXT,
  location TEXT,
  incident_date DATETIME,
  user_id INTEGER,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'pending', 'suspended', 'assigned', 'in-progress', 'awaiting-review')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (suspect_id) REFERENCES suspects(id)
);

-- Create indexes for case queries
CREATE INDEX IF NOT EXISTS idx_cases_status ON police_cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_department ON police_cases(department);
CREATE INDEX IF NOT EXISTS idx_cases_priority ON police_cases(priority);
CREATE INDEX IF NOT EXISTS idx_cases_created_at ON police_cases(created_at);
CREATE INDEX IF NOT EXISTS idx_cases_suspect_id ON police_cases(suspect_id);

-- Create table for case documents/files
CREATE TABLE IF NOT EXISTS case_documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id INTEGER NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  file_path TEXT,
  description TEXT,
  uploaded_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES police_cases(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- Create index for case documents
CREATE INDEX IF NOT EXISTS idx_documents_case_id ON case_documents(case_id);

-- Create table for case status history/updates
CREATE TABLE IF NOT EXISTS case_status_updates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id INTEGER NOT NULL,
  old_status TEXT,
  new_status TEXT,
  updated_by INTEGER,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES police_cases(id) ON DELETE CASCADE,
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Create index for case status updates
CREATE INDEX IF NOT EXISTS idx_status_updates_case_id ON case_status_updates(case_id);

-- Create table for flagged individuals (based on criminal records)
CREATE TABLE IF NOT EXISTS flagged_individuals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  suspect_id INTEGER NOT NULL,
  flag_reason TEXT,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  flag_status TEXT DEFAULT 'active' CHECK (flag_status IN ('active', 'inactive', 'resolved')),
  related_criminal_records TEXT, -- JSON array of criminal record IDs
  flagged_by INTEGER,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (suspect_id) REFERENCES suspects(id) ON DELETE CASCADE,
  FOREIGN KEY (flagged_by) REFERENCES users(id)
);

-- Create indexes for flagged individuals
CREATE INDEX IF NOT EXISTS idx_flagged_suspect_id ON flagged_individuals(suspect_id);
CREATE INDEX IF NOT EXISTS idx_flagged_status ON flagged_individuals(flag_status);
CREATE INDEX IF NOT EXISTS idx_flagged_severity ON flagged_individuals(severity);

-- Create table for enhanced suspects with additional fields
CREATE TABLE IF NOT EXISTS suspect_aliases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  suspect_id INTEGER NOT NULL,
  alias_name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (suspect_id) REFERENCES suspects(id) ON DELETE CASCADE
);

-- Insert counties
INSERT OR IGNORE INTO counties (name) VALUES
('Bomi'), ('Bong'), ('Gbarpolu'), ('Grand Bassa'), ('Grand Cape Mount'),
('Grand Gedeh'), ('Grand Kru'), ('Lofa'), ('Margibi'), ('Maryland'),
('Montserrado'), ('Nimba'), ('River Cess'), ('River Gee'), ('Sinoe');

-- Insert admin user (password: deca)
INSERT OR IGNORE INTO users (username, password_hash, role) VALUES
('deca', '$2b$10$tSzuUIzNP7YJ.m0JwikiDe7MOVAeDUh3XdKpAjfZyzx3r5XiBfm4q', 'admin');

-- Insert sample officer
INSERT OR IGNORE INTO users (username, password_hash, role, county_id) VALUES
('officer1', '$2b$10$euEYvMCK3covPnGyvo9POOkjwtmYYQHKns4vD1L7CCOvUWVe4TG36', 'officer', 11); -- Montserrado

-- Insert sample rows
INSERT INTO police_cases (county, case_type, details, month, disposition, investigator, user_id)
VALUES
('Montserrado', 'Theft', 'Reported burglary at 123 Main St', 'January', 'Under Investigation', 'Officer Johnson', 2),
('Bong', 'Assault', 'Two-vehicle altercation', 'February', 'Closed', 'Officer Smith', 2),
('Nimba', 'Vandalism', 'Graffiti on public property', 'March', 'Pending', 'Officer Brown', 2);

-- =====================================================
-- NEW FEATURES TABLES (for 5 additional features)
-- =====================================================

-- ===== 1. MULTI-LANGUAGE SUPPORT TABLES =====
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

CREATE INDEX IF NOT EXISTS idx_translations_key ON translations(key);

-- ===== 2. OFFLINE SYNC TABLES =====
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

CREATE INDEX IF NOT EXISTS idx_offline_queue_synced ON offline_queue(synced);
CREATE INDEX IF NOT EXISTS idx_offline_queue_created ON offline_queue(created_at);

-- ===== 3. GEOLOCATION TAGGING TABLES =====
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
  FOREIGN KEY (case_id) REFERENCES police_cases(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_geolocation_case ON geolocation_tags(case_id);
CREATE INDEX IF NOT EXISTS idx_geolocation_type ON geolocation_tags(location_type);
CREATE INDEX IF NOT EXISTS idx_geolocation_created ON geolocation_tags(created_at);

-- ===== 4. EVIDENCE MANAGEMENT TABLES =====
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
  FOREIGN KEY (case_id) REFERENCES police_cases(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_evidence_case ON evidence(case_id);
CREATE INDEX IF NOT EXISTS idx_evidence_number ON evidence(evidence_number);
CREATE INDEX IF NOT EXISTS idx_evidence_type ON evidence(evidence_type);
CREATE INDEX IF NOT EXISTS idx_evidence_status ON evidence(status);
CREATE INDEX IF NOT EXISTS idx_evidence_created ON evidence(created_at);

-- ===== 5. CASE CLOSURE WORKFLOW TABLES =====
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
  FOREIGN KEY (case_id) REFERENCES police_cases(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_case_closure_case ON case_closures(case_id);
CREATE INDEX IF NOT EXISTS idx_case_closure_status ON case_closures(status);
CREATE INDEX IF NOT EXISTS idx_case_closure_reason ON case_closures(closing_reason);
CREATE INDEX IF NOT EXISTS idx_case_closure_created ON case_closures(created_at);

-- ===== ADDITIONAL REQUIRED TABLES =====
CREATE TABLE IF NOT EXISTS cases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_number TEXT UNIQUE NOT NULL,
  case_type TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS case_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id INTEGER NOT NULL,
  officer_id INTEGER,
  officer_name TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
  FOREIGN KEY (officer_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_case_notes_case ON case_notes(case_id);

CREATE TABLE IF NOT EXISTS case_assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id INTEGER NOT NULL,
  officer_id INTEGER NOT NULL,
  assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deadline TIMESTAMP,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed')),
  notes TEXT,
  FOREIGN KEY (case_id) REFERENCES police_cases(id) ON DELETE CASCADE,
  FOREIGN KEY (officer_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_case_assignments_case ON case_assignments(case_id);
CREATE INDEX IF NOT EXISTS idx_case_assignments_officer ON case_assignments(officer_id);

CREATE TABLE IF NOT EXISTS document_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT,
  content TEXT NOT NULL,
  variables TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id INTEGER,
  document_type TEXT,
  file_name TEXT NOT NULL,
  file_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_documents_case ON documents(case_id);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id INTEGER,
  title TEXT,
  message TEXT,
  type TEXT,
  priority TEXT,
  read INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id INTEGER,
  details TEXT,
  ip_address TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
