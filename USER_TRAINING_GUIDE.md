# LNP Case Management System - User Training Guide

## Table of Contents

1. [Getting Started](#getting-started)
2. [User Authentication](#user-authentication)
3. [Dashboard Overview](#dashboard-overview)
4. [Case Management](#case-management)
5. [Criminal Records](#criminal-records)
6. [Flagged Individuals](#flagged-individuals)
7. [Analytics & Reporting](#analytics--reporting)
8. [Notifications System](#notifications-system)
9. [Court Integration](#court-integration)
10. [ID Verification](#id-verification)
11. [Troubleshooting](#troubleshooting)
12. [FAQ](#faq)

---

## Getting Started

### System Requirements

- **Web Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Internet Connection**: High-speed connection (minimum 5 Mbps)
- **Device**: Desktop, tablet, or mobile phone
- **Screen Resolution**: Minimum 320px (mobile) to 1920px (desktop)

### First Login

1. Open your web browser and navigate to `https://your-police-department.lnp.local`
2. You will see the login page with two fields:
   - **Username**: Your assigned username
   - **Password**: Your assigned password
3. Click the **"Login"** button
4. Upon successful login, you'll be directed to your dashboard

**Note**: Your account is role-based. You will see only the functions and data relevant to your role.

### User Roles & Permissions

#### Admin
- Full system access
- User management
- System configuration
- View all cases and data
- Generate reports
- Manage audit logs

#### Supervisor
- Case management and assignment
- Officer oversight
- Team performance monitoring
- Restricted user management
- Report generation

#### Officer
- Create and update cases
- Add criminal records
- Document management
- View assigned cases only
- Submit flagged individuals

---

## User Authentication

### Changing Your Password

1. Click your **profile icon** in the top-right corner
2. Select **"Change Password"**
3. Enter your **current password**
4. Enter your **new password** (min. 8 characters, mix of uppercase, lowercase, numbers, special characters)
5. Confirm the **new password**
6. Click **"Update Password"**

### Password Requirements

- **Minimum length**: 8 characters
- **Must contain**:
  - At least one uppercase letter (A-Z)
  - At least one lowercase letter (a-z)
  - At least one number (0-9)
  - At least one special character (!@#$%^&*)
- **Cannot contain** username or parts of it

### Session Timeout

- Sessions expire after **30 minutes** of inactivity
- You will be automatically logged out
- Any unsaved work will be lost
- Log back in to continue

### Logout

1. Click your **profile icon** in the top-right corner
2. Select **"Logout"**
3. You will be redirected to the login page

---

## Dashboard Overview

### Dashboard Components

#### 1. Header
- **Logo**: Identifies the system and organization
- **Notifications**: Shows real-time alerts and updates (red badge shows count)
- **User Menu**: Access profile, settings, and logout
- **Search Bar**: Quick search for cases, individuals, documents

#### 2. Sidebar Navigation
- **Dashboard**: Main overview page
- **Cases**: Case management and tracking
- **Criminal Records**: Individual record management
- **Flagged Individuals**: High-risk person monitoring
- **Analytics**: Statistics and reports
- **Users** (Admin only): User account management
- **Departments** (Admin only): Department configuration

#### 3. Quick Stats
- **Total Cases**: All cases in the system
- **Open Cases**: Cases currently active
- **Closed Cases**: Resolved cases
- **Recent Activity**: Latest actions in the system

### Mobile Responsive Design

The system automatically adjusts to your screen size:
- **Desktop (1280px+)**: Full layout with sidebar
- **Tablet (768-1279px)**: Collapsible sidebar
- **Mobile (320-767px)**: Bottom navigation menu

On mobile devices:
- Tap the **hamburger menu** (☰) to open navigation
- Use **swipe gestures** to navigate between sections
- Forms stack vertically for easy input

---

## Case Management

### Creating a New Case

1. Navigate to **Cases** from the sidebar
2. Click the **"+ New Case"** button
3. Fill in the following information:

#### Case Details Form

| Field | Description | Required |
|-------|-------------|----------|
| Case Number | Unique case identifier (auto-generated) | Yes |
| Case Type | Category of case (Theft, Assault, Fraud, etc.) | Yes |
| Description | Detailed description of the incident | Yes |
| Incident Date | Date when incident occurred | Yes |
| Location | Geographic location of incident | Yes |
| County | County jurisdiction | Yes |
| Priority | Case urgency level (Low, Medium, High, Critical) | Yes |
| Assigned Officer | Officer assigned to this case | Yes |
| Status | Current case status (Open, Pending, Closed) | Yes |

4. Click **"Save Case"** to create the case
5. You will receive a confirmation message with the case number

### Viewing Case Details

1. Click on any case from the **Cases list**
2. The case detail view shows:
   - All case information
   - Assigned officers
   - Related documents
   - Timeline of updates
   - Criminal records of individuals
   - Court case information
   - Verdict and sentencing details

### Updating Case Status

1. Open the case you want to update
2. Scroll to the **"Status"** section
3. Click the **"Change Status"** button
4. Select the new status from the dropdown
5. Add any notes or comments
6. Click **"Update Status"**

**Status Workflow**:
- **Open** → **Pending** (Investigation ongoing)
- **Pending** → **Closed** (Case resolved)
- **Closed** → **Reopened** (If needed) [Admin only]

### Case Assignment

1. Open the case
2. Scroll to **"Assigned Officers"** section
3. Click **"Assign Officer"**
4. Select officer(s) from the list
5. Set assignment date and deadline
6. Click **"Assign"**

Officers will receive notifications of new assignments.

### Case Documents

#### Uploading Documents

1. Open the case
2. Scroll to **"Documents"** section
3. Click **"+ Upload Document"**
4. Select document type from dropdown:
   - Evidence Report
   - Witness Statement
   - Lab Report
   - Arrest Report
   - Other
5. Click **"Choose File"** and select from your computer
6. Add optional description
7. Click **"Upload"**

#### Viewing Documents

1. In the case, documents are listed with:
   - Document name and type
   - Upload date
   - File size
   - Uploaded by (officer name)
2. Click any document to **preview** or **download**

#### Document Management

- **Download**: Click the download icon to save to your computer
- **Share**: Click the share icon to email document to colleagues
- **Delete**: Click the trash icon (Admin/case owner only)

---

## Criminal Records

### Searching Criminal Records

1. Navigate to **Criminal Records** from sidebar
2. Use the search form with any of these criteria:
   - Name (first, last, or full name)
   - Government ID number
   - Date of birth
   - Address

3. Click **"Search"** button
4. Results will display in table format

### Viewing Full Record

1. Click on a person from the search results
2. The record shows:
   - Personal information
   - Criminal history
   - Arrests and convictions
   - Sentence information
   - Current status (incarcerated, on parole, etc.)
   - Known associates
   - Mugshots and identification photos

### Creating a Criminal Record

1. Click **"+ New Record"** button
2. Fill in personal information:
   - Full name
   - Date of birth
   - Government ID
   - Contact information
3. Add arrest information:
   - Arrest date
   - Charges
   - Arresting officer
   - Location
4. Add case information and outcome
5. Click **"Save Record"**

### ID Verification

When adding a suspect to a case:

1. System can verify identity through:
   - **Government Database**: Official ID verification
   - **Facial Recognition**: Photo comparison
   - **Fingerprint Analysis**: Biometric match
   - **Document Verification**: ID card/passport scan
   - **Multi-Modal**: Combination of above

2. Click **"Verify Identity"** button
3. Select verification method
4. Upload required documents or photos
5. System will confirm match or alert if suspicious
6. Verification status saved to record

---

## Flagged Individuals

### Understanding Flagged Individuals

Flagged individuals are people of special interest due to:
- Active warrants
- Wanted for questioning
- Dangerous individuals
- Key witnesses
- Persons of interest

### Flagging an Individual

1. Navigate to **Flagged Individuals**
2. Click **"+ Flag Individual"**
3. Select the individual from existing records or create new entry
4. Choose flag reason:
   - Dangerous
   - Wanted
   - High Risk
   - Witness
   - Person of Interest
5. Add priority level (Low, Medium, High, Critical)
6. Add detailed notes explaining the flag
7. Upload photo if available
8. Click **"Create Flag"**

### Monitoring Flagged Individuals

The dashboard shows:
- **Active Flags**: Current flagged individuals
- **Flag Status**: Active, Resolved, Expired
- **Case Count**: Related cases
- **Last Sighting**: Date/location of last known contact

### Updating Flag Status

1. Click on flagged individual
2. Click **"Update Status"** button
3. Change status to:
   - Active (Continue monitoring)
   - Apprehended (Person arrested)
   - Resolved (No longer relevant)
   - Expired (Warrant expired)
4. Add any notes
5. Click **"Update"**

---

## Analytics & Reporting

### Accessing Analytics

1. Navigate to **Analytics** from sidebar
2. You'll see dashboard with key metrics

### Available Reports

#### Case Statistics
- Total cases (open, closed, pending)
- Cases created this period
- Case resolution trends
- Cases by type and status

#### Department Performance
- Cases by department
- Resolution time comparison
- Officer productivity metrics
- Department efficiency ratings

#### Case Trends
- Case creation over time
- Resolution rate trends
- Type distribution changes
- Seasonal patterns

#### Officer Performance
- Cases handled
- Average resolution time
- Case closure rate
- Performance ratings

### Filtering Reports

Use the filter options at the top of analytics:

1. **Date Range**:
   - This Week
   - This Month
   - This Quarter
   - This Year
   - Custom Range

2. **Case Status**:
   - All Cases
   - Open Cases
   - Closed Cases
   - Pending Cases

3. **Department**:
   - Select specific department
   - All Departments

4. Click **"Refresh"** to update report

### Exporting Reports

1. Click **"Export"** button
2. Choose format:
   - **CSV**: Spreadsheet format (Excel)
   - **PDF**: Print-ready format
3. File will download to your computer

---

## Notifications System

### Understanding Notifications

The notification system alerts you to:
- **Case Updates**: Changes to assigned cases
- **Case Assignment**: New case assignments
- **Deadlines**: Approaching deadlines (3, 7, 14 days)
- **Document Uploads**: New documents in your cases
- **Flagged Alerts**: Updates on flagged individuals
- **System Alerts**: Important system messages

### Accessing Notifications

1. Click the **bell icon** (🔔) in the top-right corner
2. A panel shows your recent notifications
3. Unread notifications have a **blue indicator**

### Managing Notifications

#### Mark as Read
1. Click the **checkmark icon** on a notification
2. Notification will no longer show as unread

#### Mark All as Read
1. Click **"Mark All Read"** button at top of notifications panel
2. All notifications marked as read

#### Delete Notification
1. Click the **X icon** on the notification
2. Notification removed from your list

#### View Details
1. Click on the notification
2. Taken to relevant case or page
3. Provides context for the alert

### Notification Settings

1. Click your **profile icon** → **"Settings"**
2. Scroll to **"Notifications"** section
3. Toggle notification types on/off:
   - Case Updates
   - Assignments
   - Deadlines
   - Documents
   - System Alerts
4. Choose notification method:
   - In-app (default)
   - Email
   - Both
5. Click **"Save Settings"**

---

## Court Integration

### Court Case Synchronization

The system can automatically sync with court systems to:
- Track case status in court
- Retrieve hearing dates
- Get verdict information
- Manage sentencing details
- Access court documents

### Searching Court Cases

1. Open a case in the system
2. Scroll to **"Court Information"** section
3. Click **"Search Court Cases"**
4. Enter search criteria:
   - Case number (if known)
   - Defendant name
   - Filing date range
5. System searches court database
6. Click **"Link Case"** to sync court case

### Viewing Court Case Details

Once linked, you can view:
- **Case Status**: Current court status
- **Judges**: Assigned judges
- **Attorneys**: Case attorneys
- **Hearing Schedule**: Upcoming hearings
- **Hearing History**: Past hearings and outcomes
- **Documents**: Filed court documents
- **Verdict**: Case verdict (if available)
- **Sentencing**: Sentencing information

### Next Hearing Notification

The system automatically sends notifications:
- **7 days before** hearing date
- **1 day before** hearing date
- **Day of** hearing

### Filing Court Documents

1. Open case with linked court case
2. Scroll to **"Court Documents"**
3. Click **"+ File Document"**
4. Select document type
5. Upload document file
6. Add filing description
7. Click **"File"**

Document is submitted to court system automatically.

### Court Case Status

Status mapping between police and court systems:

| Police Status | Court Status |
|---------------|--------------|
| Case Filed | Filed in Court |
| Investigation | Pending Hearing |
| Arrest | Hearing Held |
| Charged | Verdict Pending |
| Prosecution | Sentencing |
| Sentence | Sentenced |
| Appeal | Appealed |
| Closed | Closed |

---

## ID Verification

### When ID Verification is Used

ID verification happens when:
- Adding new suspects to cases
- Flagging individuals
- Recording arrests
- Creating criminal records
- Verifying witness identity

### Verification Methods

#### 1. Government Database Verification
- Official government ID number
- Cross-references national database
- Returns personal details
- Checks for criminal records
- **Time**: Usually instant

#### 2. Facial Recognition
- Photo comparison
- Biometric matching
- Confirms identity from photo
- 95%+ accuracy
- **Time**: 10-30 seconds

#### 3. Fingerprint Verification
- Fingerprint scan analysis
- Database comparison
- Highest accuracy method
- Requires fingerprint reader
- **Time**: 20-60 seconds

#### 4. Document Verification
- Scans ID documents
- Validates authenticity
- Checks expiration
- Extracts personal information
- **Time**: Instant

#### 5. Multi-Modal Verification
- Combines multiple methods
- Highest confidence
- Recommended for critical cases
- **Time**: 1-2 minutes

### Running ID Verification

1. Click **"Verify Identity"** button in suspect/individual section
2. Choose verification method
3. Provide required information/uploads:
   - Government ID number, or
   - Photo, or
   - Fingerprint image, or
   - ID document scan
4. Click **"Verify"**
5. System processes and returns results:
   - **Verified**: Identity confirmed (green)
   - **Failed**: No match found (red)
   - **Suspicious**: Possible match discrepancy (orange)

### Verification Results

The system returns:
- **Match Score**: Confidence percentage (90-100%)
- **Personal Details**: Confirmed information
- **Criminal Status**: Any criminal records found
- **Verification ID**: Reference number for record
- **Timestamp**: When verification occurred

---

## Troubleshooting

### Common Issues & Solutions

#### 1. Cannot Login
**Problem**: Getting error "Invalid username or password"

**Solutions**:
- Verify username is correct (case-sensitive)
- Check caps lock is not on for password
- Reset password using "Forgot Password" link
- Contact your system administrator

#### 2. Page Not Loading
**Problem**: Blank or error page

**Solutions**:
- Refresh page (Ctrl+R or Cmd+R)
- Clear browser cache (Settings → Clear browsing data)
- Try different browser
- Check internet connection

#### 3. Cases Not Showing
**Problem**: Case list is empty

**Solutions**:
- Check your user role and permissions
- Apply filters (status, department) - remove if needed
- Refresh the page
- Check date range in filters

#### 4. Upload Fails
**Problem**: Document upload error

**Solutions**:
- Check file size (max 50 MB)
- Use supported file type (.pdf, .doc, .jpg, .png, etc.)
- Check internet connection stability
- Try uploading again

#### 5. Slow Performance
**Problem**: System is sluggish

**Solutions**:
- Close other browser tabs
- Clear browser cache
- Disable browser extensions
- Try modern browser (Chrome, Firefox, Edge)
- Check internet speed

### Getting Help

1. **In-App Help**: Click **"?"** icon anywhere for context help
2. **Documentation**: Visit Help section in main menu
3. **Contact Admin**: email to `support@police.local`
4. **Emergency Support**: Call IT support at `(555) 123-4567`

---

## FAQ

### Q: How long does a case stay in the system?
**A**: Cases are retained indefinitely for historical records. Closed cases can be archived after 5 years with admin approval.

### Q: Can I edit a case after closing it?
**A**: Admin and supervisors can reopen closed cases. Officers can only edit open cases. All edits are logged in audit trail.

### Q: How are notifications delivered?
**A**: Notifications appear in-app by default. You can configure email notifications in settings.

### Q: What happens if I forget my password?
**A**: Click "Forgot Password" on login page. You'll receive a reset link via email (sent by admin).

### Q: How often should I change my password?
**A**: Your organization's security policy recommends changing passwords every 90 days.

### Q: Can multiple officers work on same case?
**A**: Yes, multiple officers can be assigned to a case. All updates are visible to all assigned officers.

### Q: How is data backed up?
**A**: System automatically backs up data daily. Encrypted backups stored on secure cloud servers.

### Q: Can I access from mobile phone?
**A**: Yes, the system is fully responsive and works on smartphones and tablets.

### Q: How is sensitive data protected?
**A**: Data is encrypted in transit (HTTPS) and at rest. Access controlled by role-based permissions. All access logged.

### Q: What is HIPAA compliance?
**A**: The system meets HIPAA requirements for health-related criminal records. Contact admin for details.

### Q: How do I print a case report?
**A**: Open case, click "Print" button or use browser print function (Ctrl+P). Choose PDF printer to save as file.

---

## Additional Resources

- **System Status**: https://status.police.local
- **Security Policy**: See SECURITY_POLICIES.md
- **Compliance Info**: See SECURITY_COMPLIANCE.md
- **Quick Reference**: See README_QUICK_START.md

---

**Last Updated**: January 2024
**Version**: 1.0
**Support Email**: support@police.local
