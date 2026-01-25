# Liberia National Police - Case Management System
## Admin Panel Features Guide

### System Overview
This guide documents all features available in the Liberia National Police Case Management System Admin Panel. The system is designed to help law enforcement manage criminal cases, track suspects, maintain documentation, and provide analytics on case trends.

**Default Admin Credentials:**
- **Username:** `dortusnimely`
- **Password:** `dortusnimely`

---

## Tab-Based Navigation

The Admin Panel contains 7 main tabs accessible from the sidebar:

### Tab 1: Dashboard (Home)
**Location:** First tab in the navigation menu

**Features:**
- Summary cards displaying:
  - Total Users count
  - Active Users count  
  - Total Cases count
  - Open Cases count
- Quick overview of system statistics
- Starting point for admin workflow

---

### Tab 2: User Management
**Location:** Second tab - "User Management" with People icon

**Features:**

#### View All Users
- Display all system users in a sortable table
- Shows: Username, Full Name, Email, Role, Status, County Assignment
- Pagination support (50 users per page)
- Real-time user count

#### Search and Filter Users
- **Search:** By username, full name, or email
- **Filter by Role:** Admin or Officer
- **Filter by Status:** Active, Inactive, or Suspended
- Combine multiple filters for precise search

#### Add Individual User
- Create new user account
- Fields:
  - First Name (required)
  - Last Name (required)
  - Username (required, unique)
  - Password (required for new users)
  - Email (optional)
  - Phone (optional)
  - Badge Number (optional)
  - Role: Admin or Officer
  - County Assignment (dropdown)
  - Status: Active, Inactive, or Suspended
- Secure password handling with bcrypt encryption

#### Bulk Create Users (Up to 10,000)
- Import multiple users at once
- Two format options:
  1. **CSV Format:** username,password,first_name,last_name,role
  2. **JSON Array:** [{"username":"...","password":"..."}]
- Example CSV format:
  ```
  john.doe,Pass123!,John,Doe,officer
  jane.smith,Pass456!,Jane,Smith,admin
  ```
- Maximum 10,000 users per batch
- Validation and error handling for invalid entries

#### Edit Users
- Click Edit button on any user row
- Modify all user fields except username
- Password reset capability
- Save changes with validation

#### Delete Users
- Delete user accounts with confirmation
- Preserves audit trail
- Cannot delete current logged-in user

---

### Tab 3: Case Management
**Location:** Third tab - "Case Management" with Gavel icon

**Features:**

#### Create New Cases
- Case creation form with fields:
  - Case Number (unique identifier)
  - Department: CID, Traffic, Patrol, Narcotics, Homicide, Special Operations
  - Case Type: Theft, Assault, Robbery, Homicide, Fraud, Narcotics, etc.
  - Victim Name
  - Location of Incident
  - Incident Date & Time
  - Case Details/Description
  - Priority: Normal, High, Critical
  - Investigator Assignment
  - Initial Status: Open (automatically set)

#### View All Cases
- Comprehensive case list table
- Display: Case Number, Type, Department, Victim, Location, Status, Priority
- Color-coded status chips:
  - Green: Open/Active
  - Blue: Pending
  - Gray: Closed
  - Orange: In Progress
  - Yellow: Awaiting Review
  - Red: Suspended

#### Update Case Status
- Status workflow support:
  - Open → Assigned → In Progress → Awaiting Review → Closed
  - Can also set to: Pending, Suspended
- Add notes/reason for status change
- Automatic status change history tracking
- Only authorized users can update status

#### Case Details
- Full case information display
- Associated documents list
- Case status change history
- Related criminal records
- Connected suspects/witnesses
- Case notes and updates

#### Manage Cases
- Edit case details
- Update priority levels
- Reassign investigators
- Add supporting documents
- Delete cases (with confirmation)

---

### Tab 4: Department Dashboard
**Location:** Fourth tab - "Department Dashboard" with Building icon

**Features:**

#### Department Overview
- Select from dropdown:
  - CID (Criminal Investigation Department)
  - Traffic Division
  - Patrol Division
  - Narcotics Division
  - Homicide Squad
  - Special Operations

#### Real-Time Case Statistics
- Cases by Status breakdown:
  - Total count per department
  - Open cases
  - Closed cases
  - Pending cases
  - In Progress cases
  - Awaiting Review cases
  - Suspended cases

#### Interactive Case List by Department
- Department-specific case table
- Columns: Case Number, Type, Victim, Location, Status, Priority, Investigator
- Color-coded status indicators
- Real-time data refresh

#### Department Filters
- Filter by Case Status:
  - Open
  - Closed  
  - Pending
  - In Progress
- Quick status update inline
- Delete case from department
- View case details

#### Features
- Admins see all departments
- Officers see only their assigned department
- Real-time statistics on case distribution
- Visual status indicators for quick assessment
- Department-based access control

---

### Tab 5: Flagged Individuals
**Location:** Fifth tab - "Flagged Individuals" with Warning icon

**Features:**

#### Flag Management System
- Comprehensive list of all flagged individuals
- Track individuals of interest or concern

#### Flag Information Display
- Suspect ID (National ID)
- Reason for flag
- Severity Level (color-coded):
  - Red: Critical
  - Orange: High
  - Blue: Medium
  - Green: Low
- Flag Status:
  - Active (currently under observation)
  - Inactive (resolved or archived)
  - Resolved (case closed)
- When Flagged (timestamp)
- Flagged By (officer name)
- Additional Notes

#### Create New Flag
- Flag individual form:
  - Suspect ID (National ID - required)
  - Reason for Flag (text - required)
  - Severity Level: Critical, High, Medium, Low (required)
  - Status: Active, Inactive, Resolved (default: Active)
  - Additional Notes (optional)

#### Manage Flags
- Edit flag details:
  - Update reason
  - Change severity level
  - Modify status
  - Update notes
- Remove flags (with confirmation)
- View flag history

#### Visual Organization
- Critical flags highlighted with warning icons
- Critical flagged individuals have light red background
- Severity chips for visual quick identification
- Sortable table by any column
- Searchable flags list

#### Integration Features
- Automatic flagging for high-severity criminal charges
- Links to related cases
- Integration with Police Clearance Check system
- Connected to Criminal Records database

---

### Tab 6: Analytics Dashboard
**Location:** Sixth tab - "Analytics" with Chart icon

**Features:**

#### Key Metrics Cards
Display real-time statistics:
- **Total Cases:** Overall case count in system
- **Open Cases:** Cases still being investigated
- **Pending Cases:** Cases awaiting action
- **Critical Cases:** High-priority cases requiring attention

#### Interactive Charts & Visualizations

**Pie Chart: Cases by Status**
- Visual breakdown of case distribution
- Shows: Open, Closed, Pending percentages
- Hover for exact counts
- Color-coded by status

**Bar Chart: Cases by Department**
- Cases assigned to each department
- CID, Traffic, Patrol, Narcotics, Homicide, Special Operations
- Compare department workload
- Identify department needs

**Bar Chart: Cases by Type**
- Distribution of case types
- Theft, Assault, Robbery, Homicide, Fraud, Narcotics, etc.
- Identify crime patterns
- Inform resource allocation

**Bar Chart: Criminal Records by Severity**
- Records distribution: Critical, High, Medium, Low
- Track severity trends
- Identify repeat offenders
- Assess criminal landscape

#### Officer Performance Table
- Individual officer metrics:
  - Officer name
  - Cases assigned to officer
  - Cases closed by officer
  - Closure rate percentage (color-coded):
    - Green: >75% closure rate
    - Yellow: 50-75% closure rate
    - Red: <50% closure rate
  - Average days to close cases
- Performance evaluation data
- Sortable and filterable columns

#### Features
- Real-time statistics updated on demand
- Multiple visualization types for comprehensive analysis
- Color-coded metrics for quick assessment
- Sortable and filterable performance data
- Responsive design for mobile and desktop
- Professional presentation suitable for reports

---

### Tab 7: Police Clearance Check
**Location:** Seventh tab - "Clearance Check" with Verified User icon

**Features:**

#### Search Interface
- **Search by Suspect ID:** Enter national ID number
- **Search by Name:** Enter suspect name (first or last)
- Real-time search results
- Auto-complete suggestions

#### Clearance Verdict
- **Status Indicator:**
  - ✓ CLEAR (green) - No criminal history, not flagged
  - ✗ NOT CLEAR (red) - Has criminal records or flags
- Large, prominent display for quick assessment
- Icon indicators for visual clarity

#### Suspect Information Display
- Full Name
- National ID Number
- Date of Birth
- Age (calculated)
- Status (active/inactive in system)
- Location/County

#### Criminal Records Table
- Complete criminal history
- Columns:
  - Charge Type (Theft, Assault, etc.)
  - Description/Details
  - Date Charged
  - Severity (color-coded chips):
    - Critical - Red
    - High - Orange
    - Medium - Blue
    - Low - Green
  - Status: Active, Inactive, Sealed
  - Related Case Number

#### Active Flags Section
- Displays any active flags on suspect
- Critical flags highlighted in red background
- Flag Details:
  - Reason for flag
  - Severity level
  - When flagged
  - Status
  - Flagged by (officer)
- Warning icon for high-severity flags

#### Related Cases Table
- Cases involving the suspect
- Case Number, Type, Department, Status
- Links to case details
- Victim information when available

#### Print Functionality
- Generate professional clearance certificate
- PDF-style format
- Includes all relevant information:
  - Suspect details
  - Clearance status
  - Criminal history summary
  - Flag information
  - Date of check
  - Officer name
- Suitable for official documentation
- Court-ready format

#### Features
- Instant clearance assessment
- Comprehensive suspect history
- Warning indicators for multiple records/flags
- Printable certificates for legal documentation
- Full integration with Case and Flag systems
- Audit trail of all checks performed

---

## Key Security Features

### Authentication & Authorization
- JWT token-based authentication (8-hour expiration)
- Role-based access control (RBAC):
  - **Admin Role:** Full system access
  - **Officer Role:** Limited to assigned county/department
- Secure password hashing (bcrypt, 12 rounds)
- Session management with automatic timeout

### Data Protection
- Input validation on all forms
- SQL injection prevention via parameterized queries
- Cross-Site Scripting (XSS) protection via Content Security Policy
- CORS configured for frontend-backend communication
- HTTPS support in production

### Audit Trail
- All case status changes logged with:
  - Officer who made change
  - Old and new status
  - Timestamp
  - Reason/notes
- User creation/deletion recorded
- Flagging actions audited
- Clearance check history maintained

---

## Notification System

### Real-Time Alerts
- Case status update notifications
- New case assignments
- Flagged individual alerts
- System alerts (maintenance, updates)
- Notification Center (bell icon in top bar)

### Notification Management
- Mark notifications as read
- Clear old notifications
- Notification history
- Custom notification preferences

---

## Data Validation & Error Handling

### Form Validation
- Required field checking
- Email format validation
- Unique username enforcement
- County/Department validation
- Date/Time format validation
- Password strength requirements (if configured)

### Error Messages
- User-friendly error descriptions
- Specific guidance for resolution
- API error details logged for debugging
- Connection error handling
- Server error notifications

---

## Mobile Responsiveness

### Responsive Design
- Optimized for mobile devices
- Collapsible sidebar navigation
- Responsive tables and charts
- Touch-friendly buttons and inputs
- Adaptive layouts for all screen sizes

### Device Support
- Desktop browsers (Chrome, Firefox, Safari, Edge)
- Tablet view (iPad, Android tablets)
- Mobile phones (iOS, Android)
- All modern browsers supported

---

## Getting Started

### First Time Login
1. Navigate to http://localhost:3000
2. Enter credentials:
   - Username: `dortusnimely`
   - Password: `dortusnimely`
3. Click "Login" button
4. You'll be redirected to the Admin Dashboard

### Typical Workflow
1. **Start at Dashboard tab** - Review system overview
2. **Check Department Dashboard** - See cases by department
3. **Go to Case Management** - Create or update cases
4. **Use Flagged Individuals** - Track high-risk individuals
5. **Review Analytics** - Generate reports and insights
6. **Use Clearance Check** - Verify suspect backgrounds

---

## System Requirements

### Technology Stack
- **Frontend:** React 18.2.0 with Material-UI 5.14.0
- **Backend:** Node.js/Express 4.18.2
- **Database:** SQLite3
- **Authentication:** JWT tokens
- **Charts:** Recharts library
- **Styling:** Material-UI components

### Browser Requirements
- Modern browser with JavaScript enabled
- Cookies/Local Storage enabled (for token storage)
- Screen resolution: 1024x768 or larger recommended

---

## Troubleshooting

### Cannot Login
- Verify username and password are correct
- Ensure backend server is running (port 3001)
- Check browser console for detailed error messages
- Clear browser cache and try again

### Pages Not Loading
- Refresh the page (Ctrl+R / Cmd+R)
- Check network connection
- Verify frontend server is running (port 3000)
- Check for JavaScript errors in browser console

### Data Not Updating
- Refresh the page
- Check that you have proper permissions (admin role)
- Verify the backend database has data
- Check for API errors in browser developer tools

### Performance Issues
- Clear browser cache
- Close other browser tabs
- Check available disk space
- Restart servers if necessary

---

## Support & Documentation

For additional information, refer to:
- [README.md](README.md) - System overview
- [FEATURES.md](FEATURES.md) - Detailed feature documentation
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment instructions
- [TESTING.md](TESTING.md) - Testing procedures
- [SECURITY_IMPLEMENTATION_COMPLETE.md](SECURITY_IMPLEMENTATION_COMPLETE.md) - Security details

---

**Last Updated:** January 18, 2026
**System Version:** Phase 4 Complete
**Status:** Production Ready
