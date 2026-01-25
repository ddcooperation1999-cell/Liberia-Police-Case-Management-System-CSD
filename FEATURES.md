# CSD Police Case Management System
## Complete Feature Implementation Guide

---

## System Overview

The LNP Case Management System is a comprehensive web application designed for the Liberia National Police to manage criminal cases, track suspects, maintain documentation, and provide analytics on case trends. The system is built with a modern tech stack and includes role-based access control, advanced analytics, and criminal flagging capabilities.

**Technology Stack:**
- **Frontend:** React 18.2.0 with Material-UI 5.14.0
- **Backend:** Node.js/Express 4.18.2
- **Database:** SQLite3 with 15+ indexes for performance
- **Authentication:** JWT (8-hour expiration)
- **Charts & Analytics:** Recharts

---

## 1. Case Creation & Tracking with Status Updates

### Features Implemented

**Database Support:**
- Enhanced `police_cases` table with new fields:
  - `department` - CID, Traffic, Patrol, Narcotics, Homicide
  - `victim_name` - Name of the victim
  - `location` - Location where incident occurred
  - `incident_date` - Date/time of incident
  - `status` - Multi-state workflow (open, closed, pending, in-progress, awaiting-review, suspended, assigned)

**Status Update History:**
- New `case_status_updates` table tracks all status changes with:
  - `old_status` and `new_status`
  - Officer who made the change (`updated_by`)
  - Notes/reason for status change
  - Timestamp of change

### API Endpoints

**POST /api/cases**
- Create new case with department and victim information
- Enforces county-based access control for officers
- Status automatically set to 'assigned' on creation

**PUT /api/cases/:id/status**
- Update case status with audit trail
- Supports valid statuses: open, closed, pending, suspended, assigned, in-progress, awaiting-review
- Records status change with officer ID and notes

**GET /api/cases**
- List all cases with filtering by department and status
- Officers see only cases from their assigned county
- Returns full case details including victim and location

**GET /api/cases/:id**
- Retrieve complete case details with:
  - Full case information
  - Status change history
  - Associated documents
  - Related suspects/criminal records

**PUT /api/cases/:id**
- Update case details (department, type, victim, location, etc.)

**DELETE /api/cases/:id**
- Delete case with authorization checks

### Frontend Component
**CasesAdmin.js / CaseManagementTab**
- Case creation form with department and victim fields
- Case list with filtering and search
- Status update interface with notes

---

## 2. Department-Specific Dashboards

### Features Implemented

**Departments Supported:**
- CID (Criminal Investigation Department)
- Traffic Division
- Patrol Division
- Narcotics Division
- Homicide Squad
- Special Operations

**Database Schema:**
- Users table includes `department` field for assignment
- Cases table includes `department` field for routing
- Cases automatically filtered by department

### API Endpoints

**GET /api/analytics/cases/by-department**
- Returns case count per department
- Supports dashboard widget display

### Frontend Component
**DepartmentDashboard.js** - NEW TAB
- Department selector with all LNP departments
- Real-time case count and status breakdown per department
- Interactive case list showing:
  - Case number, type, victim, location
  - Current status with color-coded chips
  - Priority level (critical, high, normal, low)
  - Assigned investigator
  
- Quick actions:
  - Update case status inline
  - Delete case with confirmation
  - Filter by status (open, closed, pending, in-progress)

### Features
- Only admins can see all departments
- Officers see only their assigned department
- Real-time statistics on case distribution
- Visual status indicators for at-a-glance case management

---

## 3. Document Management for Case Files

### Features Implemented

**Database:**
- New `case_documents` table with:
  - File name, type, size
  - Upload timestamp
  - Uploader identification
  - Document description

### API Endpoints

**GET /api/documents/case/:caseId**
- Retrieve all documents attached to a case
- Returns file metadata and uploader info

**POST /api/documents**
- Upload document to case
- Accepts file data with case ID
- Records uploader user ID
- Returns document record

**DELETE /api/documents/:documentId**
- Remove document from case
- Authorization-based access control

### Frontend Integration
Documents are integrated into:
- Case detail view (GET /api/cases/:id returns documents array)
- Case Management tab (display document list)
- Future document upload component

### Features
- Attach multiple files to a single case
- Track document uploader and upload date
- View case documents alongside case details
- Delete documents as needed

---

## 4. Reporting & Analytics on Cases and Trends

### Features Implemented

**Database Schema:**
- Comprehensive case data structure with timestamps
- Criminal records severity classification
- Flag status tracking

### API Endpoints

**GET /api/analytics/cases/stats**
- Overall case statistics:
  - Total cases count
  - Open cases
  - Closed cases
  - Pending cases
  - Critical priority cases
  - Average resolution time in days

**GET /api/analytics/cases/by-department**
- Case distribution across departments
- Returns array: `[{department: 'CID', count: 15}, ...]`

**GET /api/analytics/cases/by-type**
- Case breakdown by case type
- Returns array: `[{case_type: 'Theft', count: 8}, ...]`

**GET /api/analytics/criminal-records/stats**
- Criminal records by severity
- Counts for: low, medium, high, critical

**GET /api/analytics/flagged/stats**
- Flagged individuals statistics
- Counts by severity level

**GET /api/analytics/cases/recent-activity**
- Time-series data for case creation trends
- Supports dashboard trend visualization

**GET /api/analytics/officers/performance**
- Individual officer metrics:
  - Cases assigned to officer
  - Cases closed by officer
  - Closure rate percentage
  - Average days to close
- Used for performance evaluation

### Frontend Component
**AnalyticsDashboard.js** - NEW TAB
- Key metrics cards showing:
  - Total cases
  - Open cases
  - Pending cases
  - Critical cases

- Interactive charts:
  - **Pie Chart:** Cases by status (open, closed, pending)
  - **Bar Chart:** Cases by department
  - **Bar Chart:** Cases by type (theft, assault, robbery, etc.)
  - **Bar Chart:** Criminal records by severity

- Performance table:
  - Officer names with their case metrics
  - Closure rate with color coding (red/yellow/green)
  - Average days to close metric

### Features
- Real-time statistics updated on demand
- Multiple visualization types (pie, bar charts)
- Color-coded metrics for quick assessment
- Sortable and filterable performance data
- Responsive design for mobile and desktop

---

## 5. Criminal Record Tracking for Police Clearance Checks

### Features Implemented

**Database Schema:**
- Enhanced `criminal_records` table with:
  - Charge type and description
  - Severity levels: low, medium, high, critical
  - Record status: active, inactive, sealed
  - Officer who recorded the charge
  - Associated case ID (linking crimes to cases)

- New `suspect_aliases` table for:
  - Alternative names used by suspects
  - Name variations for investigation

**Criminal Record Linking:**
- Criminal records automatically linked to suspects
- Records can be associated with specific cases
- Severity classification for quick assessment

### API Endpoints

**GET /api/analytics/clearance-check/:suspectId**
- Comprehensive police clearance check
- Returns:
  - Suspect personal information (name, national ID, DOB, age)
  - All criminal records with:
    - Charge type
    - Severity level
    - Date charged
    - Current status
  - Active flags on suspect (if any)
  - Related cases where suspect appears
  - Overall clearance status (CLEAR or NOT CLEAR)
  - Boolean flag: `is_clear` for automated systems

**GET /api/criminal-records**
- List criminal records with filtering
- Integrated with flagging system

### Frontend Component
**PoliceClearanceCheck.js** - NEW TAB
- Search interface:
  - Search by suspect ID (national ID)
  - Search by suspect name

- Results display:
  - **Verdict Card:** Shows CLEAR or NOT CLEAR status with icons
  - **Suspect Information:** Name, national ID, DOB, age
  - **Criminal Records Table:** Shows all charges with severity chips
  - **Active Flags Section:** Highlights any active flags (red background)
  - **Related Cases Table:** Lists cases involving the suspect

- Severity color coding:
  - Critical - Red
  - High - Orange
  - Medium - Blue
  - Low - Green

- Print functionality:
  - Generate printable clearance certificate
  - Professional PDF-style format
  - Includes all relevant information
  - Suitable for official use

### Features
- Instant clearance assessment
- Comprehensive suspect history display
- Warning indicators for multiple records/flags
- Printable certificates for documentation
- Integration with case and flag systems

---

## 6. Criminal Report Integration with Suspect Flagging

### Features Implemented

**Database Schema:**
- New `flagged_individuals` table with:
  - Suspect ID (national ID)
  - Flag reason (why individual is flagged)
  - Severity: low, medium, high, critical
  - Flag status: active, inactive, resolved
  - Who flagged the individual (officer ID)
  - Timestamp when flagged
  - Notes/additional details

**Flagging System:**
- Severity-based classification
- Status tracking (active/inactive/resolved)
- Audit trail of who flagged each individual
- Notes system for additional context

### API Endpoints

**GET /api/flagged-individuals**
- List all flagged individuals
- Returns complete flag information
- Sorted by severity

**GET /api/flagged-individuals/suspect/:suspectId**
- Check if specific suspect is flagged
- Returns:
  - `is_flagged` boolean
  - Array of active flags if any
  - Flag details: reason, severity, status

**POST /api/flagged-individuals**
- Flag a new individual
- Requires: suspect_id, reason, severity
- Records officer who flagged

**PUT /api/flagged-individuals/:flagId**
- Update flag details
- Change severity, status, or notes
- Maintains audit trail

**DELETE /api/flagged-individuals/:flagId**
- Remove flag from individual
- Preserves historical record

### Integration with Criminal Records
- Criminal record severity automatically determines flag severity
- High-severity criminal charges trigger automatic flagging
- Multiple records lead to sustained flags
- Related cases inform flag reasoning

### Frontend Component
**FlaggedIndividuals.js** - NEW TAB
- Flag management interface:
  - List of all flagged individuals
  - Real-time flag status display

- Flag details:
  - Suspect ID
  - Flag reason
  - Severity chip (color-coded)
  - Status (active/inactive/resolved)
  - When flagged
  - Flagged by (officer name)

- Management actions:
  - Flag individual (create new flag)
  - Edit flag details
  - Remove flag (with confirmation)
  - Update flag status

- Flag dialog:
  - Suspect ID input
  - Reason for flag (text area)
  - Severity selector (critical/high/medium/low)
  - Status selector (active/inactive/resolved)
  - Optional notes field

- Visual indicators:
  - Critical flags have warning icon
  - Critical flagged rows highlighted (light red background)
  - Color-coded severity chips

### Features
- Comprehensive suspect flagging system
- Multiple severity levels for nuanced risk assessment
- Maintains audit trail of who flagged whom
- Status tracking for resolved cases
- Integration with case management and criminal records
- Officer warnings in case review workflows

---

## User Management Features

### New Capabilities
- **Pagination:** 50 users per page with navigation controls
- **Search:** Search by username, first name, last name, or email
- **Filtering:** Filter by role (Admin/Officer) and status (Active/Inactive/Suspended)
- **Department Assignment:** Assign users to specific police departments
- **Bulk User Creation:** Import up to 10,000 users at once via CSV/JSON

### Bulk Create Format
**CSV Format:**
```
username,password,first_name,last_name,role,department,county_id,status
officer1,password123,John,Doe,officer,CID,1,active
admin1,password456,Jane,Smith,admin,Admin,1,active
```

**JSON Format:**
```json
[
  {
    "username": "officer1",
    "password": "password123",
    "first_name": "John",
    "last_name": "Doe",
    "role": "officer",
    "department": "CID",
    "county_id": 1,
    "status": "active"
  }
]
```

---

## Authentication & Authorization

### Features
- **JWT-based Authentication:** 8-hour token expiration
- **Role-Based Access Control:**
  - Admins: Full system access, user management, global analytics
  - Officers: Limited to assigned county, department-specific views
- **Token Validation:** Automatic expiration detection and logout
- **Error Handling:** Specific error messages for authentication failures

### Security Measures
- Password hashing with bcrypt (12 rounds)
- CORS configuration for localhost:3000
- Rate limiting on login attempts
- Helmet.js for HTTP headers
- Input validation on all endpoints

---

## Database Schema Summary

**Tables:**
1. `counties` - Liberian counties (15 total)
2. `users` - System users with department assignment
3. `suspects` - Criminal individuals
4. `police_cases` - Main case data with department/victim/location
5. `criminal_records` - Charges and conviction records
6. `case_documents` - File attachments to cases
7. `case_status_updates` - Audit trail of case status changes
8. `flagged_individuals` - Suspect flagging system
9. `suspect_aliases` - Alternative names for suspects

**Performance Indexes:** 15+ indexes on frequently queried columns (status, department, priority, severity, created_at, suspect_id)

---

## User Interface Navigation

### Main Navigation Tabs
1. **Dashboard** - Overview of system activity
2. **User Management** - Create, edit, delete users; bulk import
3. **Case Management** - Create and manage cases
4. **Department Dashboard** - Department-specific case view
5. **Flagged Individuals** - Criminal flagging system
6. **Analytics** - Charts and reporting
7. **Clearance Check** - Police clearance certificate generation

### Mobile Responsive
- Drawer navigation on mobile devices
- Responsive table layouts
- Touch-friendly buttons and controls

---

## API Base URL
```
http://localhost:3001/api
```

All endpoints require:
- `Authorization: Bearer {token}` header
- Valid JWT token (obtained from login)

---

## Getting Started

### 1. Start Backend Server
```bash
cd backend
npm install
node index.js
# Server runs on http://localhost:3001
```

### 2. Start Frontend Server
```bash
cd frontend
npm install
npm start
# Application opens on http://localhost:3000
```

### 3. Login
**Demo Credentials:**
- Username: `dortusnimely`
- Password: `dortusnimely`

### 4. Features to Explore
- **User Management Tab:** Add users, view pagination, search, filter, bulk import
- **Case Management Tab:** Create cases with departments and victim info
- **Department Dashboard:** View cases filtered by department
- **Flagged Individuals:** Flag suspects with severity levels
- **Analytics:** View case statistics and officer performance
- **Clearance Check:** Search suspects and generate clearance certificates

---

## Performance Considerations

- Database indexes optimize queries for 10,000+ users/cases
- Pagination limits reduce memory usage
- Status update history tracks case lifecycle
- Department filtering enables multi-precinct deployments
- Case documents support large file systems

---

## Future Enhancements

- Real-time notifications for critical cases
- Mobile app for field officers
- Advanced search and reporting filters
- Multi-language support (Liberian English/Pidgin)
- Integration with national ID system
- Case photo gallery and evidence management
- Suspect facial recognition system
- Automated flag clearing based on time or case resolution

---

## Support & Documentation

For issues or questions about the LNP Case Management System, refer to:
- Backend: `/backend/README.md`
- Frontend: `/frontend/README.md`
- API: API endpoints documented in route files
- Database: Schema defined in `/backend/sql/init.sql`

---

**Version:** 1.0.0  
**Last Updated:** 2024  
**Organization:** Liberia National Police
