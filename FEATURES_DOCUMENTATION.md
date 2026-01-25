# LNP Case Management System - New Features Documentation

**Last Updated:** January 18, 2026  
**Version:** 2.0 (With 5 New Features)

---

## Table of Contents
1. [Overview](#overview)
2. [Feature Descriptions](#feature-descriptions)
3. [Database Schema](#database-schema)
4. [API Documentation](#api-documentation)
5. [Frontend Components](#frontend-components)
6. [Installation & Setup](#installation--setup)
7. [Usage Examples](#usage-examples)
8. [Testing Guide](#testing-guide)

---

## Overview

The LNP Case Management System has been extended with 5 powerful new features:

| # | Feature | Tab | Purpose |
|---|---------|-----|---------|
| 1 | Multi-Language Support | 12 | Support English, Kpelle, Mandingo translations |
| 2 | Offline Mode with Sync | 13 | Work offline, sync when connection restored |
| 3 | Geolocation Tagging | 14 | Tag case locations with GPS coordinates |
| 4 | Evidence Management | 15 | Track physical & digital evidence with custody chain |
| 5 | Case Closure Workflow | 16 | Automated 4-step case closure workflow |

---

## Feature Descriptions

### 1. Multi-Language Support (Tab 12)

**Purpose:** Enable the system to support multiple languages for accessibility across Liberia's diverse communities.

**Key Features:**
- Support for 3 languages: English, Kpelle, Mandingo
- Create and manage translations
- Export translations as JSON
- Contextual notes for translators
- Search and filter translations

**Database Table:** `translations`

**Columns:**
- `id` - Primary key
- `key` - Unique translation key (e.g., 'case.status.open')
- `english` - English text
- `kpelle` - Kpelle translation
- `mandingo` - Mandingo translation
- `context` - Context for translators
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

**Use Cases:**
- Support officers who speak Kpelle or Mandingo
- Ensure community accessibility
- Generate translated reports
- Localize UI elements

**Workflow:**
1. Admin opens "Multi-Language Support" tab
2. Clicks "Add Translation"
3. Enters key (e.g., 'case.status.open')
4. Provides translations in all 3 languages
5. Saves and exports for system integration

---

### 2. Offline Mode with Sync (Tab 13)

**Purpose:** Allow officers to work offline in areas with poor connectivity and sync when connection is restored.

**Key Features:**
- Automatic offline/online detection
- Queue changes made offline
- Sync pending data when online
- Backup offline data
- Track last sync time
- View pending changes

**Database Table:** `offline_queue`

**Columns:**
- `id` - Primary key
- `action` - Action type (create, update, delete)
- `table_name` - Target database table
- `data` - JSON data to sync
- `record_id` - ID of record affected
- `synced` - Boolean flag (0 = pending, 1 = synced)
- `created_at` - When change was made
- `synced_at` - When synced to server

**Use Cases:**
- Officers in remote areas
- Temporary connectivity loss
- Backup critical data
- Reliable data synchronization

**Workflow:**
1. Officer works normally (system queues offline changes)
2. When offline: red indicator shows "Offline" status
3. When online: blue "Online" indicator shows
4. Click "Sync Now" to upload pending changes
5. Use "Backup" to save local copy

**Status Indicators:**
- 🔵 Online: Connected and ready
- 🔴 Offline: No connection, changes queued

---

### 3. Geolocation Tagging (Tab 14)

**Purpose:** Tag crime scenes and case-related locations with GPS coordinates for spatial analysis and record-keeping.

**Key Features:**
- GPS-based location capture
- Manual coordinate entry
- Multiple location types (scene, station, arrest, evidence)
- View locations on Google Maps
- Timestamp tracking
- Description and notes

**Database Table:** `geolocation_tags`

**Columns:**
- `id` - Primary key
- `case_id` - Associated case (FK)
- `latitude` - Latitude coordinate (-90 to 90)
- `longitude` - Longitude coordinate (-180 to 180)
- `location_name` - Human-readable name
- `location_type` - Type (scene, station, arrest, evidence, other)
- `description` - Additional details
- `timestamp` - Time of occurrence
- `created_at` - Record creation time
- `updated_at` - Last update time

**Location Types:**
- **scene** - Crime scene location
- **station** - Police station
- **arrest** - Arrest location
- **evidence** - Evidence recovery location
- **other** - Other relevant location

**Use Cases:**
- Map crime scene locations
- Track suspect movements
- Document evidence recovery points
- Spatial case analysis
- Geographic patterns

**Workflow:**
1. Open case in "Geolocation Tagging"
2. Click "Add Location"
3. Use "Get Current Location" (requires GPS)
4. Or manually enter latitude/longitude
5. Select location type
6. Add description
7. Click "Save"
8. Click map icon to view on Google Maps

---

### 4. Evidence Management (Tab 15)

**Purpose:** Maintain comprehensive physical and digital evidence tracking with detailed custody chain documentation.

**Key Features:**
- Physical and digital evidence tracking
- Evidence categorization
- Custody chain documentation
- Status management
- Evidence export to CSV
- Statistical overview

**Database Table:** `evidence`

**Columns:**
- `id` - Primary key
- `case_id` - Associated case (FK)
- `evidence_number` - Unique evidence identifier
- `evidence_type` - Type (physical, digital, documentary)
- `description` - Detailed description
- `custody_chain` - Chain of custody records
- `location` - Storage location
- `collected_date` - Date collected
- `collected_by` - Officer who collected
- `status` - Current status
- `created_at` - Record creation
- `updated_at` - Last update

**Evidence Types:**
- **physical** - Tangible items (weapons, documents, etc.)
- **digital** - Electronic evidence (phones, drives, etc.)
- **documentary** - Written evidence (records, reports, etc.)

**Status Progression:**
1. **collected** - Initial evidence collection
2. **stored** - Evidence in proper storage
3. **released** - Evidence released (court, person)
4. **destroyed** - Evidence destroyed per protocol

**Custody Chain:**
- Document every person who handles evidence
- Record dates and times
- Note any concerns or anomalies

**Use Cases:**
- Legal compliance and court evidence
- Evidence tracking for investigations
- Chain of custody maintenance
- Evidence statistics
- Audit trails

**Workflow:**
1. Open case in "Evidence Management"
2. Click "Add Evidence"
3. Select case
4. Enter unique evidence number (e.g., EV-2024-001)
5. Choose evidence type
6. Add detailed description
7. Enter storage location
8. Document collection date/officer
9. Record custody chain
10. Save and monitor status

---

### 5. Case Closure Workflow (Tab 16)

**Purpose:** Automate and standardize the case closure process with required approval steps.

**Key Features:**
- 4-step automated workflow
- Closure reasons and dispositions
- Approval/rejection mechanism
- Status tracking
- Statistical overview
- Automated case status update

**Database Table:** `case_closures`

**Columns:**
- `id` - Primary key
- `case_id` - Associated case (FK, UNIQUE)
- `closing_reason` - Why case is closing
- `closure_date` - Effective closure date
- `disposition` - Final verdict
- `notes` - Additional notes
- `assigned_to` - Officer handling closure
- `status` - Current workflow step
- `approved_at` - Approval timestamp
- `rejected_at` - Rejection timestamp
- `rejection_reason` - Why rejected
- `created_at` - Record creation
- `updated_at` - Last update

**Workflow Steps:**
1. **initiated** - Closure request created
2. **review** - Evidence review in progress
3. **approved** - Supervisory approval granted
4. **closed** - Case officially closed

**Closing Reasons:**
- **solved** - Case solved through investigation
- **inactive** - No activity in specified period
- **dismissed** - Charges dismissed
- **transferred** - Transferred to other jurisdiction

**Dispositions:**
- **guilty** - Suspect found guilty
- **not_guilty** - Suspect found not guilty
- **acquitted** - Acquitted after trial
- **insufficient_evidence** - Insufficient evidence for prosecution
- **pending** - Awaiting determination

**Use Cases:**
- Standard case closure procedures
- Compliance tracking
- Oversight and approval
- Case statistics
- Legal documentation

**Workflow:**
1. Open case in "Case Closure Workflow"
2. Click "Initiate Closure"
3. Select case
4. Choose closing reason
5. Enter closure date
6. Select disposition
7. Assign to officer
8. Add notes
9. Submit for review
10. Review officer examines details
11. Approves (advances) or rejects
12. If rejected, returns to initiated for revision
13. Final approval closes case

**Workflow Visualization:**
```
Initiated → Review → Approved → Closed
   ↑         ↓
   └─ Rejected
```

---

## Database Schema

### Table: translations
```sql
CREATE TABLE translations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  english TEXT NOT NULL,
  kpelle TEXT,
  mandingo TEXT,
  context TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Table: offline_queue
```sql
CREATE TABLE offline_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  data TEXT,
  record_id INTEGER,
  synced INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  synced_at TIMESTAMP
);
```

### Table: geolocation_tags
```sql
CREATE TABLE geolocation_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id INTEGER NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  location_name TEXT,
  location_type TEXT DEFAULT 'other',
  description TEXT,
  timestamp TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);
```

### Table: evidence
```sql
CREATE TABLE evidence (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id INTEGER NOT NULL,
  evidence_number TEXT UNIQUE NOT NULL,
  evidence_type TEXT DEFAULT 'physical',
  description TEXT NOT NULL,
  custody_chain TEXT,
  location TEXT,
  collected_date DATE,
  collected_by TEXT,
  status TEXT DEFAULT 'collected',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);
```

### Table: case_closures
```sql
CREATE TABLE case_closures (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id INTEGER NOT NULL UNIQUE,
  closing_reason TEXT NOT NULL,
  closure_date DATE,
  disposition TEXT,
  notes TEXT,
  assigned_to TEXT,
  status TEXT DEFAULT 'initiated',
  approved_at TIMESTAMP,
  rejected_at TIMESTAMP,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);
```

### Indexes Created
- `translations(key)` - Fast translation lookup
- `offline_queue(synced, created_at)` - Find pending syncs
- `geolocation_tags(case_id, location_type, created_at)` - Location queries
- `evidence(case_id, evidence_number, type, status)` - Evidence queries
- `case_closures(case_id, status, closing_reason)` - Closure workflow queries

### Views Created
1. `case_closure_status_view` - Case closure status with case details
2. `evidence_by_case_view` - Evidence organized by case
3. `geolocation_by_case_view` - Locations organized by case

---

## API Documentation

### 1. Multi-Language Endpoints

**GET** `/api/multi-language/translations`
- Get all translations
- Response: Array of translation objects

**POST** `/api/multi-language/translations`
- Create new translation
- Body: `{ key, english, kpelle, mandingo, context }`
- Response: `{ id, message }`

**PUT** `/api/multi-language/translations/:id`
- Update translation
- Body: `{ key, english, kpelle, mandingo, context }`
- Response: `{ message }`

**DELETE** `/api/multi-language/translations/:id`
- Delete translation
- Response: `{ message }`

**GET** `/api/multi-language/export`
- Export translations as JSON file
- Response: JSON file download

### 2. Offline Sync Endpoints

**GET** `/api/offline-sync/pending`
- Get pending offline changes
- Response: Array of pending items

**POST** `/api/offline-sync/sync`
- Sync queued data to server
- Body: `{ data: [...] }`
- Response: `{ synced, errors, message }`

**POST** `/api/offline-sync/queue`
- Queue offline change
- Body: `{ action, table, data, id }`
- Response: `{ message }`

**DELETE** `/api/offline-sync/clear`
- Clear synced items
- Response: `{ message }`

### 3. Geolocation Endpoints

**GET** `/api/geolocation/locations`
- Get all geotagged locations
- Response: Array of location objects

**POST** `/api/geolocation/locations`
- Create geotagged location
- Body: `{ case_id, latitude, longitude, location_name, location_type, description, timestamp }`
- Response: `{ id, message }`

**PUT** `/api/geolocation/locations/:id`
- Update location
- Body: `{ case_id, latitude, longitude, ... }`
- Response: `{ message }`

**DELETE** `/api/geolocation/locations/:id`
- Delete location
- Response: `{ message }`

**GET** `/api/geolocation/case/:caseId`
- Get locations for specific case
- Response: Array of locations for case

### 4. Evidence Endpoints

**GET** `/api/evidence/list`
- Get all evidence
- Response: Array of evidence objects

**POST** `/api/evidence`
- Create evidence record
- Body: `{ case_id, evidence_number, evidence_type, description, custody_chain, location, collected_date, collected_by, status }`
- Response: `{ id, message }`

**PUT** `/api/evidence/:id`
- Update evidence
- Body: `{ case_id, evidence_number, ... }`
- Response: `{ message }`

**PATCH** `/api/evidence/:id/status`
- Update evidence status
- Body: `{ status }`
- Response: `{ message }`

**DELETE** `/api/evidence/:id`
- Delete evidence
- Response: `{ message }`

**GET** `/api/evidence/case/:caseId`
- Get evidence for specific case
- Response: Array of evidence for case

**GET** `/api/evidence/export`
- Export evidence as CSV file
- Response: CSV file download

### 5. Case Closure Endpoints

**GET** `/api/case-closure/list`
- Get all case closures
- Response: Array of closure objects

**POST** `/api/case-closure`
- Initiate case closure
- Body: `{ case_id, closing_reason, closure_date, disposition, notes, assigned_to }`
- Response: `{ id, message }`

**PUT** `/api/case-closure/:id`
- Update closure information
- Body: `{ case_id, closing_reason, ... }`
- Response: `{ message }`

**PATCH** `/api/case-closure/:id/step`
- Advance workflow step
- Body: `{ step }`
- Response: `{ message }`

**POST** `/api/case-closure/:id/approve`
- Approve and advance closure workflow
- Response: `{ message, nextStep }`

**POST** `/api/case-closure/:id/reject`
- Reject closure (returns to initiated)
- Body: `{ reason }`
- Response: `{ message }`

**DELETE** `/api/case-closure/:id`
- Delete closure
- Response: `{ message }`

**GET** `/api/case-closure/case/:caseId`
- Get closure info for specific case
- Response: Closure object

---

## Frontend Components

### Component Files
1. **MultiLanguageSupport.js** - Manage translations (Tab 12)
2. **OfflineModeSync.js** - Handle offline/sync (Tab 13)
3. **GeolocationTagging.js** - Tag locations (Tab 14)
4. **EvidenceManagement.js** - Track evidence (Tab 15)
5. **CaseClosureWorkflow.js** - Closure workflow (Tab 16)

### Component Props
All components receive:
- `token` - JWT authentication token
- `user` - Current user object

### UI Components Used
- Material-UI (MUI) for consistent design
- Tables for data display
- Dialogs for data entry
- Charts for statistics
- Maps integration (Google Maps)

---

## Installation & Setup

### Step 1: Create Database Tables
Run the SQL schema:
```bash
sqlite3 police_cases.db < backend/sql/new_features_schema.sql
```

Or copy the schema from [new_features_schema.sql](../sql/new_features_schema.sql)

### Step 2: Restart Backend
```bash
cd backend
npm start
```

The backend will initialize all tables on startup.

### Step 3: Access Features
1. Login with credentials
2. Navigate to Tabs 12-16 in admin panel
3. Start using the new features

### Step 4: Verify Installation
Check each feature:
- Multi-Language: Can add translations
- Offline: See online/offline indicator
- Geolocation: Can tag locations
- Evidence: Can add evidence records
- Case Closure: Can initiate closures

---

## Usage Examples

### Example 1: Add Translation

**Action:** Admin adds "Open" in Kpelle and Mandingo

**Request:**
```javascript
POST /api/multi-language/translations
{
  "key": "case.status.open",
  "english": "Open",
  "kpelle": "Kali",
  "mandingo": "Fure",
  "context": "Used in case management UI"
}
```

**Response:**
```json
{
  "id": 1,
  "message": "Translation created"
}
```

### Example 2: Sync Offline Data

**Action:** Officer syncs data after regaining connection

**Request:**
```javascript
POST /api/offline-sync/sync
{
  "data": [
    {
      "type": "case_note",
      "action": "create",
      "data": { "case_id": 5, "content": "Suspect interviewed" },
      "timestamp": "2024-01-18T10:30:00Z"
    }
  ]
}
```

**Response:**
```json
{
  "synced": 1,
  "errors": [],
  "message": "1 items synced successfully"
}
```

### Example 3: Tag Crime Scene Location

**Action:** Officer tags crime scene GPS location

**Request:**
```javascript
POST /api/geolocation/locations
{
  "case_id": 5,
  "latitude": 6.3155,
  "longitude": -10.8073,
  "location_name": "Monrovia Downtown",
  "location_type": "scene",
  "description": "Crime occurred at intersection of Broad & Lynch Streets",
  "timestamp": "2024-01-18T14:30:00Z"
}
```

**Response:**
```json
{
  "id": 1,
  "message": "Location tagged successfully"
}
```

### Example 4: Record Evidence

**Action:** Evidence officer documents seized items

**Request:**
```javascript
POST /api/evidence
{
  "case_id": 5,
  "evidence_number": "EV-2024-0015",
  "evidence_type": "physical",
  "description": "Pistol 9mm, silver colored, serial ABC123",
  "custody_chain": "Officer John Doe - 2024-01-18 14:45\nEvidence Room - 2024-01-18 15:30",
  "location": "Evidence Locker A-15",
  "collected_date": "2024-01-18",
  "collected_by": "Officer John Doe",
  "status": "collected"
}
```

**Response:**
```json
{
  "id": 1,
  "message": "Evidence recorded"
}
```

### Example 5: Initiate Case Closure

**Action:** Detective initiates case closure workflow

**Request:**
```javascript
POST /api/case-closure
{
  "case_id": 5,
  "closing_reason": "solved",
  "closure_date": "2024-01-18",
  "disposition": "guilty",
  "notes": "Suspect confessed. All evidence secured. Ready for prosecution.",
  "assigned_to": "Detective Sarah Johnson"
}
```

**Response:**
```json
{
  "id": 1,
  "message": "Case closure initiated"
}
```

---

## Testing Guide

### Test Environment Setup
1. Login as admin: `dortusnimely` / `dortusnimely`
2. Navigate to each tab (12-16)
3. Test CRUD operations

### Test Cases

#### Multi-Language Testing
- [ ] Create translation with all 3 languages
- [ ] Edit translation
- [ ] Delete translation
- [ ] Export translations
- [ ] Verify translations in database

#### Offline Mode Testing
- [ ] Disconnect internet (simulate offline)
- [ ] Make changes (should queue)
- [ ] Reconnect internet
- [ ] Click "Sync Now"
- [ ] Verify data synced
- [ ] Check "Last Sync Time" updated

#### Geolocation Testing
- [ ] Grant GPS permission
- [ ] Use "Get Current Location"
- [ ] Manually enter coordinates
- [ ] Click "View on Google Maps"
- [ ] Verify location saved

#### Evidence Testing
- [ ] Add physical evidence
- [ ] Add digital evidence
- [ ] Update evidence status
- [ ] Export evidence to CSV
- [ ] Verify custody chain saved

#### Case Closure Testing
- [ ] Initiate closure
- [ ] Advance to review step
- [ ] Approve closure
- [ ] Verify case marked as closed
- [ ] Test rejection workflow

---

## Summary

These 5 new features significantly enhance the LNP Case Management System:

✅ **Multi-Language Support** - Accessibility for all communities  
✅ **Offline Mode** - Works in areas with poor connectivity  
✅ **Geolocation Tagging** - Spatial case analysis  
✅ **Evidence Management** - Legal compliance and audit trails  
✅ **Case Closure Workflow** - Standardized procedures  

All features are fully integrated, tested, and ready for production use.

---

**For questions or issues, refer to the main README.md or contact the development team.**
