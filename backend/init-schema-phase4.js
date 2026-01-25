/**
 * Database Schema Migration - Phase 4
 * Adds tables for case assignments, case notes, document templates, and audit logs
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'police_cases.db');

// Create/open database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
});

// Run migrations
db.serialize(() => {
  // 1. Create case_assignments table
  db.run(`
    CREATE TABLE IF NOT EXISTS case_assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_id INTEGER NOT NULL,
      officer_id INTEGER NOT NULL,
      assigned_by INTEGER NOT NULL,
      assignment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'reassigned', 'inactive')),
      notes TEXT,
      priority TEXT DEFAULT 'normal' CHECK(priority IN ('low', 'normal', 'high', 'critical')),
      due_date TIMESTAMP,
      completion_date TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (case_id) REFERENCES police_cases(id) ON DELETE CASCADE,
      FOREIGN KEY (officer_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
      UNIQUE(case_id, officer_id, status)
    )
  `, (err) => {
    if (err) console.error('Error creating case_assignments table:', err);
    else console.log('✓ case_assignments table ready');
  });

  // Create indexes for case_assignments
  db.run(`CREATE INDEX IF NOT EXISTS idx_case_assignments_case_id ON case_assignments(case_id)`, 
    err => err && console.error('Error creating case_assignments case_id index:', err));
  db.run(`CREATE INDEX IF NOT EXISTS idx_case_assignments_officer_id ON case_assignments(officer_id)`, 
    err => err && console.error('Error creating case_assignments officer_id index:', err));
  db.run(`CREATE INDEX IF NOT EXISTS idx_case_assignments_status ON case_assignments(status)`, 
    err => err && console.error('Error creating case_assignments status index:', err));

  // 2. Create case_notes table
  db.run(`
    CREATE TABLE IF NOT EXISTS case_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      note_type TEXT DEFAULT 'update' CHECK(note_type IN ('update', 'evidence', 'witness', 'investigation', 'status', 'other')),
      severity TEXT DEFAULT 'normal' CHECK(severity IN ('low', 'normal', 'high', 'critical')),
      created_by INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (case_id) REFERENCES police_cases(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `, (err) => {
    if (err) console.error('Error creating case_notes table:', err);
    else console.log('✓ case_notes table ready');
  });

  // Create indexes for case_notes
  db.run(`CREATE INDEX IF NOT EXISTS idx_case_notes_case_id ON case_notes(case_id)`, 
    err => err && console.error('Error creating case_notes case_id index:', err));
  db.run(`CREATE INDEX IF NOT EXISTS idx_case_notes_created_by ON case_notes(created_by)`, 
    err => err && console.error('Error creating case_notes created_by index:', err));
  db.run(`CREATE INDEX IF NOT EXISTS idx_case_notes_note_type ON case_notes(note_type)`, 
    err => err && console.error('Error creating case_notes note_type index:', err));

  // 3. Create document_templates table
  db.run(`
    CREATE TABLE IF NOT EXISTS document_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      template_content TEXT NOT NULL,
      description TEXT,
      created_by INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
      UNIQUE(name, category)
    )
  `, (err) => {
    if (err) console.error('Error creating document_templates table:', err);
    else console.log('✓ document_templates table ready');
  });

  // Create indexes for document_templates
  db.run(`CREATE INDEX IF NOT EXISTS idx_document_templates_category ON document_templates(category)`, 
    err => err && console.error('Error creating document_templates category index:', err));
  db.run(`CREATE INDEX IF NOT EXISTS idx_document_templates_created_by ON document_templates(created_by)`, 
    err => err && console.error('Error creating document_templates created_by index:', err));

  // 4. Create audit_logs table (enhanced from phase 2)
  db.run(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      resource_type TEXT NOT NULL,
      resource_id TEXT,
      old_value TEXT,
      new_value TEXT,
      ip_address TEXT,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `, (err) => {
    if (err) console.error('Error creating audit_logs table:', err);
    else console.log('✓ audit_logs table ready');
  });

  // Create indexes for audit_logs
  db.run(`CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id)`, 
    err => err && console.error('Error creating audit_logs user_id index:', err));
  db.run(`CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type)`, 
    err => err && console.error('Error creating audit_logs resource_type index:', err));
  db.run(`CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp)`, 
    err => err && console.error('Error creating audit_logs timestamp index:', err));
  db.run(`CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action)`, 
    err => err && console.error('Error creating audit_logs action index:', err));

  // Add foreign key constraint to case_documents if template_id doesn't exist
  db.all(
    "PRAGMA table_info(case_documents)",
    (err, columns) => {
      if (!err && columns) {
        const hasTemplateId = columns.some(col => col.name === 'template_id');
        if (!hasTemplateId) {
          db.run(`ALTER TABLE case_documents ADD COLUMN template_id INTEGER`, (err) => {
            if (err) console.error('Error adding template_id to case_documents:', err);
            else console.log('✓ Added template_id column to case_documents');
          });
        }
      }
    }
  );
});

// Insert default document templates
const defaultTemplates = [
  {
    name: 'Arrest Report',
    category: 'Arrest',
    template: `ARREST REPORT
    
Officer Name: _______________
Badge Number: _______________
Date of Arrest: _______________
Time of Arrest: _______________

Suspect Information:
Name: _______________
Date of Birth: _______________
Address: _______________

Charges:
_______________

Circumstances of Arrest:
_______________

Property Seized:
_______________

Officer Signature: _______________ Date: _______________`
  },
  {
    name: 'Witness Statement',
    category: 'Witness',
    template: `WITNESS STATEMENT

Date: _______________
Time: _______________
Location: _______________

Witness Information:
Name: _______________
Contact Number: _______________
Address: _______________

Statement:
_______________

Signature: _______________ Date: _______________`
  },
  {
    name: 'Evidence Log',
    category: 'Evidence',
    template: `EVIDENCE LOG

Case Number: _______________
Date: _______________

Item #1:
Description: _______________
Location Found: _______________
Collected By: _______________
Storage Location: _______________

Item #2:
Description: _______________
Location Found: _______________
Collected By: _______________
Storage Location: _______________

Verified By: _______________ Date: _______________`
  },
  {
    name: 'Interview Notes',
    category: 'Interview',
    template: `INTERVIEW NOTES

Date: _______________
Interviewer: _______________
Subject: _______________

Questions Asked:
1. _______________
   Answer: _______________

2. _______________
   Answer: _______________

Key Information:
_______________

Follow-up Actions:
_______________

Signature: _______________ Date: _______________`
  }
];

// Insert default templates (if they don't exist)
setTimeout(() => {
  defaultTemplates.forEach(template => {
    const query = `
      INSERT OR IGNORE INTO document_templates (name, category, template_content, created_by)
      VALUES (?, ?, ?, ?)
    `;
    
    db.run(query, [template.name, template.category, template.template, 1], (err) => {
      if (err) console.error(`Error inserting template ${template.name}:`, err);
      else console.log(`✓ Default template: ${template.name}`);
    });
  });

  // Close database after migrations
  setTimeout(() => {
    db.close((err) => {
      if (err) console.error('Error closing database:', err);
      else console.log('\nDatabase migration completed successfully!');
    });
  }, 2000);
}, 1000);
