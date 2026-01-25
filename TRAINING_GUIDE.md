# LNP Case Management System - Training Guide & Tutorials

## Complete User Training Guide for All 7 Features

---

## Table of Contents
1. [Quick Start (5 Minutes)](#quick-start)
2. [Dashboard Overview](#dashboard-overview)
3. [User Management](#user-management)
4. [Case Management](#case-management)
5. [Department Dashboard](#department-dashboard)
6. [Flagged Individuals](#flagged-individuals)
7. [Analytics & Reporting](#analytics--reporting)
8. [Police Clearance Check](#police-clearance-check)
9. [Notification System](#notification-system)
10. [Advanced Features](#advanced-features)

---

## Quick Start

### Login
1. Open browser: `http://localhost:3000`
2. Enter credentials:
   - **Username:** `dortusnimely`
   - **Password:** `dortusnimely`
3. Click **Login**

### What You Can Do Immediately
- ✅ View system dashboard with key metrics
- ✅ Create and manage users
- ✅ Create and track criminal cases
- ✅ View cases by department
- ✅ Flag high-risk individuals
- ✅ Run analytics reports
- ✅ Perform police clearance checks

---

## Dashboard Overview

### Main Metrics
The Dashboard displays:
- **Total Users:** Count of all system users (admins + officers)
- **Active Users:** Users with "Active" status
- **Total Cases:** All criminal cases in system
- **Open Cases:** Cases not yet closed

### What It Tells You
- Quick overview of system activity
- Identify user and case trends
- Starting point for deeper analysis

### Actions From Dashboard
- Click any metric to drill down
- Navigate to specific features via sidebar
- See real-time system statistics

---

## User Management

### Creating Individual Users

**Steps:**
1. Click **"User Management"** in sidebar
2. Click **"Add User"** button
3. Fill in form:
   - **First Name** (required)
   - **Last Name** (required)
   - **Username** (required, unique)
   - **Password** (required for new users)
   - **Email** (optional)
   - **Phone** (optional)
   - **Badge Number** (optional)
   - **Role:** Choose "Officer" or "Admin"
   - **County:** Assign to county (optional)
   - **Status:** Active/Inactive/Suspended

4. Click **"Save"**

### Bulk Creating Users (Up to 10,000)

**CSV Format Example:**
```
john.doe,SecurePass123!,John,Doe,officer
jane.smith,SecurePass456!,Jane,Smith,admin
james.wilson,SecurePass789!,James,Wilson,officer
```

**JSON Format Example:**
```json
[
  {
    "username": "john.doe",
    "password": "SecurePass123!",
    "first_name": "John",
    "last_name": "Doe",
    "role": "officer"
  },
  {
    "username": "jane.smith",
    "password": "SecurePass456!",
    "first_name": "Jane",
    "last_name": "Smith",
    "role": "admin"
  }
]
```

**Steps:**
1. Click **"Bulk Create (Up to 10,000)"**
2. Paste CSV or JSON data
3. Click **"Create Users"**
4. System creates all users in batch

### Managing Existing Users

**Search & Filter:**
- Search by username, name, or email
- Filter by Role (Admin/Officer)
- Filter by Status (Active/Inactive/Suspended)
- Pagination: 50 users per page

**Edit User:**
1. Find user in table
2. Click **Edit** icon
3. Modify fields (username cannot change)
4. Click **Save**

**Delete User:**
1. Find user in table
2. Click **Delete** icon
3. Confirm deletion

---

## Case Management

### Creating a Case

**Steps:**
1. Click **"Case Management"** in sidebar
2. Click **"Add Case"** button
3. Fill in required information:
   - **Case County:** Select county
   - **Case Type:** Type of criminal case
   - **Case Details:** Full description
   - **Disposition:** Case status (Open, Pending, Closed)
   - **Investigator:** Assigned investigator
   - **Priority:** Normal, High, Critical

4. Click **"Save"**

### Case Types (Examples)
- Murder/Homicide
- Armed Robbery
- Theft/Burglary
- Drug Trafficking
- Assault/Battery
- Sexual Crimes
- Fraud
- Traffic Violations
- Property Crimes

### Case Status Workflow
1. **Open** → Case newly created
2. **Pending** → Investigation in progress
3. **Closed** → Investigation completed

### Case Priority Levels
- **Normal:** Routine cases
- **High:** Serious crimes, imminent threats
- **Critical:** Murder, terrorism, major felonies

### Viewing Cases
- See all cases in table format
- Filter by department, status, priority
- View case history and notes
- See assigned investigator

### Editing Cases
1. Click case in table
2. Modify details
3. Update status in workflow
4. Click **Save**

### Deleting Cases
1. Select case
2. Click **Delete**
3. Confirm deletion (cannot be undone)

---

## Department Dashboard

### Department Types
- **CID** - Criminal Investigation Division
- **Traffic** - Traffic Enforcement
- **Patrol** - General Patrol Division
- **Narcotics** - Drug Enforcement
- **Homicide** - Homicide Investigation

### Viewing Department Cases
1. Click **"Department Dashboard"**
2. Cases automatically grouped by department
3. See real-time statistics for each department

### Department Actions
- **View Cases:** See all cases assigned to department
- **Update Status:** Quickly change case status
- **Filter Cases:** By status, priority, date
- **Delete Cases:** Remove inactive cases

### Real-Time Metrics
Each department shows:
- Total cases assigned
- Open cases count
- Closed cases count
- Cases by priority level
- Officer workload distribution

---

## Flagged Individuals

### Flagging a Suspect

**Steps:**
1. Click **"Flagged Individuals"**
2. Click **"Flag Individual"** button
3. Enter suspect information:
   - **Suspect ID or Name**
   - **Reason for Flagging:** Why they're flagged
   - **Severity Level:**
     - **Critical:** Immediate threat, dangerous
     - **High:** Wanted criminal, flight risk
     - **Medium:** Suspicious behavior, investigation
     - **Low:** Information gathering

4. Click **"Flag"**

### Managing Flags

**View All Flags:**
- List of all flagged individuals
- See severity level (color-coded)
- View who flagged and when
- See reason for flag

**Update Flag Status:**
1. Select flagged individual
2. Change status: Active → Resolved
3. Add notes about resolution
4. Click **Save**

**Remove Flag:**
1. Select individual
2. Click **Delete**
3. Confirm removal

### Flag Severity Colors
- 🔴 **Critical** - Red (Immediate action needed)
- 🟠 **High** - Orange (Important)
- 🟡 **Medium** - Yellow (Monitor)
- 🔵 **Low** - Blue (Information)

### Integration with Clearance Check
When running a police clearance check, system automatically alerts if suspect is flagged.

---

## Analytics & Reporting

### Key Metrics Displayed
- **Total Cases:** All cases in system
- **Open Cases:** Active investigations
- **Pending Cases:** Awaiting action
- **Critical Cases:** High priority cases

### Charts & Visualizations

**1. Cases by Status (Pie Chart)**
- Shows distribution: Open, Pending, Closed
- Identify bottlenecks in workflow
- See case progression

**2. Cases by Department (Bar Chart)**
- Compare workload across departments
- Identify overworked departments
- Plan resource allocation

**3. Criminal Records by Severity (Bar Chart)**
- Distribution of criminal severity
- Identify recidivism patterns
- Plan enforcement strategy

**4. Officer Performance Table**
- Show each officer's statistics:
  - Cases assigned
  - Cases closed
  - Closure rate %
  - Average days to closure
  - Performance ranking

### Using Analytics
1. Click **"Analytics"** in sidebar
2. Review key metrics cards at top
3. Examine charts for trends
4. Check officer performance table
5. Export data if needed

### Insights to Look For
- Which departments need support?
- Are cases being resolved timely?
- Which officers are most productive?
- Are clearance checks catching criminals?
- What case types are most common?

---

## Police Clearance Check

### Running a Clearance Check

**Steps:**
1. Click **"Clearance Check"** in sidebar
2. Enter search criteria:
   - **Suspect ID** (if known), OR
   - **Or Name** (first/last name)

3. Click **"Search"**

### Results Displayed
For each suspect found:
- **Name & ID**
- **Criminal History:**
  - Number of records
  - Case details
  - Severity of charges
  
- **Active Flags:**
  - Any current flags
  - Flag severity
  - Reason flagged

- **Related Cases:**
  - Recent cases
  - Status of cases
  - Assigned investigator

### Clearance Certificate
1. Review suspect information
2. Click **"Print Certificate"**
3. Official police clearance document
4. Contains:
   - Suspect photo/ID
   - Criminal record summary
   - Flag status
   - Clearance determination
   - Date issued & official seal

### Uses for Clearance Checks
- **Employment Screening:** Check job applicants
- **Housing/Rentals:** Verify tenant background
- **Professional Licensing:** Required for some professions
- **Travel Permits:** Some countries require clearance
- **Adoption/Foster Care:** Ensure safety for children
- **Business Transactions:** Large transactions may require checks

---

## Notification System

### Notification Types You'll Receive

**Case-Related:**
- 📋 Case created or assigned
- ✏️ Case updated
- ✅ Case closed
- 📅 Deadline approaching
- ⚠️ Deadline overdue

**Document-Related:**
- 📄 Document uploaded to case
- 📸 Evidence added

**Alert-Related:**
- 🚩 New flag created
- 🚔 Criminal record added
- ⏰ Meeting scheduled/reminder

**System-Related:**
- 🔔 System alerts
- 🔐 Password reset
- ✨ New permissions granted

### Accessing Notifications
1. Click **Bell Icon** in top right
2. See unread notifications badge
3. Click to open notification panel
4. Review recent notifications
5. Mark as read individually or mark all read

### Notification Actions
- **Read:** Click notification to mark read
- **Archive:** Auto-archived after 30 days
- **Clear:** Delete old notifications

### Turning On Alerts
Notifications are enabled by default. To check notification settings:
1. Go to user profile (top right)
2. Click **Settings**
3. Enable/disable notification types
4. Set notification frequency

---

## Advanced Features

### Court System Integration

**What It Does:**
- Connects to external court systems
- Synchronizes case status with court records
- Automatically updates deadlines
- Pulls court decisions into system

**How to Use:**
1. When case is filed to court
2. System automatically syncs status
3. See court hearing dates in case details
4. Get alerts when verdicts come in

**Status Updates From Court:**
- Case filed
- Hearing scheduled
- Hearing completed
- Verdict pending
- Verdict delivered
- Sentencing pending
- Sentenced
- Appealed

### ID Verification Integration

**What It Does:**
- Verifies suspect identity against government database
- Performs facial recognition matching
- Checks fingerprint records
- Validates ID documents

**How to Use:**
1. When entering suspect information
2. Click **"Verify ID"** button
3. System checks government database
4. See verification result (Verified/Failed/Suspicious)
5. Flag if identity cannot be verified

**Verification Methods:**
- Government database lookup
- Facial recognition analysis
- Fingerprint matching
- Document verification
- Multi-modal (combination)

### Mobile Responsiveness

**Mobile Features:**
- Full functionality on tablets & phones
- Touch-optimized buttons
- Swipe navigation for menus
- Mobile-friendly forms
- Offline data sync

**Using on Mobile:**
1. Open `http://localhost:3000` in mobile browser
2. Interface automatically adjusts
3. Tap menu icon to see sidebar
4. All features accessible on mobile

---

## Best Practices

### For Admins
✅ Regularly review analytics for trends
✅ Monitor open cases to ensure timely closure
✅ Check officer performance metrics
✅ Maintain user access control
✅ Review flagged individuals regularly
✅ Audit clearance checks for accuracy

### For Officers
✅ Update case status frequently
✅ Document all case details
✅ Flag suspicious individuals immediately
✅ Review notifications daily
✅ Use clearance checks properly
✅ Coordinate with department

### Case Management
✅ Assign cases quickly
✅ Update status regularly
✅ Document meetings/interviews
✅ Upload evidence properly
✅ Close cases promptly
✅ Review related cases

### Security
✅ Never share passwords
✅ Log out when leaving computer
✅ Change password regularly
✅ Report suspicious activity
✅ Use strong passwords
✅ Follow audit log procedures

---

## Troubleshooting

### Login Issues
- Clear browser cache
- Verify credentials are correct
- Check server is running
- Try different browser

### Case Not Saving
- Ensure all required fields filled
- Check internet connection
- Verify backend server running
- Try refresh page

### Notifications Not Showing
- Check notification settings
- Verify server running
- Clear browser cache
- Check browser console for errors

### Analytics Not Loading
- Ensure you have admin access
- Check database connection
- Verify data exists in system
- Check backend logs

---

## Support & Contact

For technical issues:
1. Check browser console (F12)
2. Review server logs
3. Verify all services running
4. Contact system administrator

**System Status Check:**
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001/health`
- Database: Check via user count

---

## Additional Resources

📖 **Feature Guides:**
- [QUICK_START_LOGIN_GUIDE.md](QUICK_START_LOGIN_GUIDE.md)
- [FEATURES.md](FEATURES.md)
- [ADMIN_FEATURES_GUIDE.md](ADMIN_FEATURES_GUIDE.md)
- [UI_UX_GUIDE.md](UI_UX_GUIDE.md)

🔐 **Security:**
- [SECURITY_IMPLEMENTATION_COMPLETE.md](SECURITY_IMPLEMENTATION_COMPLETE.md)
- [SECURITY_POLICIES.md](SECURITY_POLICIES.md)

📊 **Deployment:**
- [DEPLOYMENT.md](DEPLOYMENT.md)
- [DEPLOYMENT_VERIFICATION_CHECKLIST.md](DEPLOYMENT_VERIFICATION_CHECKLIST.md)

---

## Version Information

- **System:** LNP Case Management System
- **Version:** 4.0
- **Last Updated:** January 18, 2026
- **Status:** Production Ready ✅

---

**Remember:** This system is designed to help law enforcement work more efficiently. Always follow Liberia National Police protocols and procedures when using this system.

Happy policing! 👮‍♂️
