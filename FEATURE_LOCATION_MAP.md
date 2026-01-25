# LNP Admin Panel - Feature Location Map

## Quick Access Guide

### How to Access Each Feature

#### 1. DASHBOARD TAB
- **Location:** Click "Dashboard" icon in left sidebar or Tab 1
- **What you see:** Quick overview with 4 statistic cards
  - Total Users
  - Active Users
  - Total Cases
  - Open Cases
- **Purpose:** System overview at a glance

---

#### 2. USER MANAGEMENT TAB
- **Location:** Click "User Management" (People icon) or Tab 2
- **Features available:**
  
  **Search & Filter Users**
  - Search box: by username, name, or email
  - Role filter: Admin or Officer
  - Status filter: Active, Inactive, Suspended
  
  **Create Individual User**
  - Button: "Add User" (blue button top right)
  - Fields: First name, Last name, Username, Password, Email, Phone, Badge Number, Role, County, Status
  - Click "Save" to create user
  
  **Bulk Create Users (Up to 10,000)**
  - Button: "Bulk Create (Up to 10,000)" (outlined button top right)
  - Paste CSV or JSON data
  - Format: username,password,first_name,last_name,role
  - Click "Create Users" to import
  
  **View Users Table**
  - See all users with details
  - Edit: Click pencil icon
  - Delete: Click trash icon
  - Pagination: Use page controls at bottom

---

#### 3. CASE MANAGEMENT TAB
- **Location:** Click "Case Management" (Gavel icon) or Tab 3
- **Features available:**
  
  **Create New Case**
  - Button: "Create New Case" (top of page)
  - Form fields:
    - Case Number
    - Department (dropdown)
    - Case Type
    - Victim Name
    - Location
    - Incident Date
    - Case Details
    - Priority
    - Investigator
  - Click "Create Case" to save
  
  **View Cases Table**
  - See all cases with status and details
  - Click case row to view full details
  - Filters: By department, status, type
  
  **Update Case Status**
  - Click on case
  - Status dropdown (Open → Assigned → In Progress → Closed, etc.)
  - Add notes/reason for change
  - Status change is recorded in history

---

#### 4. DEPARTMENT DASHBOARD TAB
- **Location:** Click "Department Dashboard" (Building icon) or Tab 4
- **Features available:**
  
  **Select Department**
  - Dropdown at top: Select from 6 departments
  - CID, Traffic, Patrol, Narcotics, Homicide, Special Operations
  
  **View Department Statistics**
  - Stat cards showing:
    - Total cases in department
    - Cases by status breakdown
    - Open, Closed, Pending counts
  
  **See Department Cases**
  - Table of all cases for selected department
  - Columns: Case Number, Type, Victim, Location, Status, Priority, Investigator
  
  **Filter Cases**
  - Status filter: Open, Closed, Pending, In Progress
  - Quick actions: Update status, delete case
  - Color-coded status chips

---

#### 5. FLAGGED INDIVIDUALS TAB
- **Location:** Click "Flagged Individuals" (Warning icon) or Tab 5
- **Features available:**
  
  **View All Flagged Individuals**
  - Table showing all flagged suspects
  - Columns: Suspect ID, Reason, Severity, Status, Date Flagged, Flagged By
  - Color-coded severity chips (Critical=Red, High=Orange, Medium=Blue, Low=Green)
  
  **Create New Flag**
  - Button: "Flag Individual" (blue button at top)
  - Form fields:
    - Suspect ID (National ID)
    - Reason for flag (text area)
    - Severity: Critical, High, Medium, Low
    - Status: Active, Inactive, Resolved
    - Notes (optional)
  - Click "Create Flag" to save
  
  **Manage Existing Flags**
  - Edit: Click pencil icon to modify flag
  - Delete: Click trash icon to remove flag
  - Critical flags show warning icon and red background
  
  **Search Flags**
  - Search box at top: by suspect ID or name
  - Searchable and sortable columns

---

#### 6. ANALYTICS TAB
- **Location:** Click "Analytics" (Chart icon) or Tab 6
- **Features available:**
  
  **Key Metrics Cards**
  - Total Cases count
  - Open Cases count
  - Pending Cases count
  - Critical Cases count
  
  **Cases by Status - Pie Chart**
  - Visual breakdown showing percentages
  - Hover for exact numbers
  - Shows: Open, Closed, Pending
  
  **Cases by Department - Bar Chart**
  - Horizontal bars for each department
  - CID, Traffic, Patrol, Narcotics, Homicide, Special Operations
  - Compare department workload
  
  **Cases by Type - Bar Chart**
  - Horizontal bars for case types
  - Theft, Assault, Robbery, Homicide, Fraud, Narcotics, etc.
  - Identify crime patterns
  
  **Criminal Records by Severity - Bar Chart**
  - Distribution of record severity
  - Critical, High, Medium, Low
  
  **Officer Performance Table**
  - Officer name
  - Cases assigned
  - Cases closed
  - Closure rate (color-coded: Green >75%, Yellow 50-75%, Red <50%)
  - Average days to close
  - Sortable and filterable columns

---

#### 7. POLICE CLEARANCE CHECK TAB
- **Location:** Click "Clearance Check" (Verified User icon) or Tab 7
- **Features available:**
  
  **Search Interface**
  - Search box 1: Enter National ID to search by ID
  - Search box 2: Enter Suspect name to search by name
  - Auto-complete suggestions
  
  **Clearance Verdict**
  - Large status card: "CLEAR" (green checkmark) or "NOT CLEAR" (red X)
  - Prominent display for quick assessment
  
  **Suspect Information Card**
  - Full name
  - National ID
  - Date of birth
  - Age
  - Status in system
  
  **Criminal Records Table**
  - Charge type
  - Description
  - Date charged
  - Severity (color chips: Red=Critical, Orange=High, Blue=Medium, Green=Low)
  - Status: Active, Inactive, Sealed
  - Related case number
  
  **Active Flags Section**
  - Lists all active flags on suspect
  - Shows: Reason, Severity, Status
  - Critical flags highlighted in red background
  - Warning icon for high-severity flags
  
  **Related Cases Table**
  - Cases involving the suspect
  - Case number, type, department, status
  - Victim information
  
  **Print Function**
  - Button: "Print Clearance Certificate" (top right)
  - Generates PDF-style official document
  - Includes all clearance check information
  - Suitable for court/official use
  - Includes date and officer name

---

## Top Navigation Bar Features

### Right Side of Top Bar
- **Notification Center** (Bell icon)
  - View system notifications
  - Mark as read
  - Clear old notifications
  
- **User Info**
  - Shows: username (role)
  - Example: "dortusnimely (admin)"
  
- **Logout Button**
  - Click to log out safely
  - Clears session token
  - Returns to login page

### Left Sidebar (Desktop)
- Collapsible navigation menu
- All 7 tabs listed with icons
- Logout option at bottom
- Mobile: Click hamburger menu (☰) to show/hide

---

## Common Actions

### To Create a User
1. Go to User Management tab (Tab 2)
2. Click "Add User" button
3. Fill in form fields (all required fields marked)
4. Select role: Admin or Officer
5. Click "Save"

### To Create a Case
1. Go to Case Management tab (Tab 3)
2. Click "Create New Case"
3. Fill in case details
4. Select department
5. Click "Create Case"

### To Flag an Individual
1. Go to Flagged Individuals tab (Tab 5)
2. Click "Flag Individual" button
3. Enter suspect ID
4. Fill in reason and severity
5. Click "Create Flag"

### To Check Police Clearance
1. Go to Police Clearance Check tab (Tab 7)
2. Enter suspect ID or name in search
3. Review verdict (CLEAR or NOT CLEAR)
4. View criminal records if any
5. Check flags if any
6. Click "Print Clearance Certificate" if needed

### To View Analytics
1. Go to Analytics tab (Tab 6)
2. View key metrics cards at top
3. Scroll down to see charts
4. Click on chart elements for details
5. Scroll further to see officer performance

---

## Keyboard Shortcuts

- **Alt + 1** - Dashboard
- **Alt + 2** - User Management
- **Alt + 3** - Case Management
- **Alt + 4** - Department Dashboard
- **Alt + 5** - Flagged Individuals
- **Alt + 6** - Analytics
- **Alt + 7** - Police Clearance Check
- **Ctrl + F** - Search (in tables)
- **Escape** - Close dialogs/modals

---

## Status Color Coding

### Case Status Colors
- 🟢 Open/Active - Green
- 🔵 Pending - Blue
- ⚪ Closed - Gray
- 🟠 In Progress - Orange
- 🟡 Awaiting Review - Yellow
- 🔴 Suspended - Red

### Flag Severity Colors
- 🔴 Critical - Red
- 🟠 High - Orange
- 🔵 Medium - Blue
- 🟢 Low - Green

### Clearance Status
- ✅ CLEAR - Green background
- ❌ NOT CLEAR - Red background

---

## Tips for Best Experience

1. **Use Admin Account** - Demo account "dortusnimely" has all permissions
2. **Desktop View** - Best experience on 1024x768 or larger
3. **Refresh Page** - If data doesn't update, press Ctrl+R
4. **Check Console** - Press F12 to see detailed error messages
5. **Bulk Import** - Use CSV format for fastest bulk user creation
6. **Save Often** - Forms auto-save, but review before final submit
7. **Use Search** - Faster than scrolling through large lists
8. **Print Clearance** - Use Firefox or Chrome for best PDF output

---

## What's NOT in the Admin Panel

These features exist in the backend but aren't in main UI:
- Raw API testing (use PostMan or curl)
- Database management (SQLite admin)
- System logs review (see backend logs)
- Server statistics (check terminal)
- Backup/restore (manual only)

---

**Last Updated:** January 18, 2026  
**All 7 Tabs:** ACTIVE and FULLY FUNCTIONAL ✓
