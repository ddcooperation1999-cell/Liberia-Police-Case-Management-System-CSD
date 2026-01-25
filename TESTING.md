# Testing Guide for CSD Police Case Management System

## Quick Start (15 minutes)

### Step 1: Start the Application
```powershell
# Terminal 1 - Backend
cd c:\Users\user\Desktop\LNPMS\backend
node index.js
# Wait for: "🚀 Liberia National Police CMS Backend running on port 3001"

# Terminal 2 - Frontend (in new terminal)
cd c:\Users\user\Desktop\LNPMS\frontend
npm start
# Application opens on http://localhost:3000
```

### Step 2: Login
- Navigate to http://localhost:3000
- **Username:** dortusnimely
- **Password:** dortusnimely
- Click "Login"

---

## Feature Testing Checklist

### ✅ 1. Case Creation & Tracking

**Test Case Creation:**
1. Navigate to **Case Management** tab
2. Click "Add New Case"
3. Fill in:
   - County: Select from dropdown
   - Department: CID, Traffic, Patrol, Narcotics, or Homicide
   - Case Type: Theft, Assault, Robbery, etc.
   - Details: Enter case description
   - Victim Name: Enter victim name
   - Location: Enter incident location
   - Incident Date: Select date when crime occurred
4. Click "Create Case"
5. Verify case appears in case list

**Test Status Updates:**
1. In Case Management, find the created case
2. Click the case number to view details
3. Scroll to "Status History" section
4. Change status from "assigned" to "in-progress"
5. Add notes: "Investigation started"
6. Click "Update Status"
7. Verify status changed and shows in history

---

### ✅ 2. Department-Specific Dashboards

**Test Department Dashboard:**
1. Navigate to **Department Dashboard** tab
2. Note: All departments are visible (admin feature)
3. In Department selector, choose "CID"
4. Verify case count for CID updates
5. Filter by Status: "Open"
6. Verify only open CID cases display
7. Change Department to "Traffic"
8. Verify case list updates for Traffic department
9. Try Status: "Closed" filter
10. Observe cases filtered accordingly

**Test Case Management in Department View:**
1. Find a case in the department list
2. Click "Update" button
3. Select new status (e.g., "closed")
4. Click "Update Status"
5. Verify case status changed in department list
6. Delete a test case (click "Delete")
7. Confirm deletion dialog

---

### ✅ 3. Document Management

**Test Document Upload (when implemented in frontend):**
1. In Case Management, view a case detail
2. Documents section shows uploaded files (if any)
3. Documents are displayed with:
   - File name
   - Upload date
   - File type

*Note: Full document upload UI implementation in progress*

---

### ✅ 4. Analytics & Reporting

**Test Analytics Dashboard:**
1. Navigate to **Analytics** tab
2. Observe Key Metrics:
   - Total Cases (should be > 0)
   - Open Cases
   - Pending Cases
   - Critical Cases

3. **Charts Verification:**
   - **Pie Chart (Cases by Status):** Should show distribution
   - **Bar Chart (By Department):** Should show each department
   - **Bar Chart (By Type):** Should show case types
   - **Bar Chart (Criminal Records):** Shows severity distribution

4. **Performance Table:**
   - Scroll down to see Officer Performance
   - Should show officers with cases assigned
   - Closure rates color-coded (green > yellow > red)

5. **Test Data:**
   - Create 3-5 cases with different departments/types
   - Update some to "closed" status
   - Return to Analytics to see updated charts

---

### ✅ 5. Criminal Record Tracking & Clearance Checks

**Test Police Clearance Check:**
1. Navigate to **Clearance Check** tab
2. Test Case A - Search for Non-Existent Suspect:
   - Enter Suspect ID: "TEST123"
   - Click "Search"
   - Should show: "Suspect not found" error

3. Test Case B - Create Suspect with Records (via API for testing):
   ```bash
   # This is for backend verification
   # In production, suspects are added through cases
   ```

4. **Expected Clearance Verdict:**
   - ✅ CLEAR - No criminal records, no flags
   - ❌ NOT CLEAR - Has criminal records or active flags

5. **Certificate Printing:**
   - After search, click "Print Certificate"
   - Click "Print" button
   - Should open print dialog
   - Select "Save as PDF" to verify content

---

### ✅ 6. Flagged Individuals System

**Test Flagging:**
1. Navigate to **Flagged Individuals** tab
2. Click "Flag Individual" button
3. Fill form:
   - Suspect ID: "SUSPECT001"
   - Reason: "Wanted for grand theft"
   - Severity: "Critical"
   - Status: "Active"
   - Notes: "Dangerous individual"
4. Click "Flag"
5. Verify flag appears in table with red background (critical)

**Test Flag Management:**
1. In the flags table, find the created flag
2. Click "Edit":
   - Change Severity to "High"
   - Click "Update"
   - Verify severity changed and color updated
3. Click "Remove":
   - Confirm deletion
   - Verify flag removed from table

**Test Flag Display in Clearance Check:**
1. After flagging individual, go to **Clearance Check** tab
2. Search for the flagged suspect ID: "SUSPECT001"
3. Verify:
   - Verdict shows "NOT CLEAR"
   - "Active Flags" section appears
   - Shows flag with reason and severity
   - Flag highlighted with warning color

---

### ✅ 7. User Management

**Test User Pagination:**
1. Navigate to **User Management** tab
2. Observe users per page: 50
3. At bottom, check pagination controls
4. If > 50 users exist, click "Next" to load page 2
5. Click "Previous" to return

**Test Search:**
1. In search box, type: "user"
2. Table updates to show matching users
3. Clear search to show all users

**Test Filtering:**
1. Role Filter: Select "Admin"
2. Table shows only admin users
3. Status Filter: Select "Inactive"
4. Combined with role filter, shows inactive admins
5. Reset filters to show all users

**Test Bulk User Creation:**
1. Click "Bulk Create Users" button
2. Paste CSV data:
```
username,password,first_name,last_name,role,department,county_id,status
testuser1,TempPass123,Test,User,officer,CID,1,active
testuser2,TempPass456,Another,Officer,officer,Traffic,2,active
```
3. Click "Create Users"
4. Verify users appear in table
5. Search for "testuser1" to confirm creation

---

## Database Verification Commands

### Check Database Contents

**Backend Terminal - Check case count:**
```javascript
// Navigate to backend directory and verify in database:
// - 1 default admin user
// - Multiple test cases with different departments
// - Flagged individuals created during testing
```

---

## Error Scenarios to Test

### 1. Token Expiration
- Login with demo account
- Wait 8 hours (or manually expire token by restarting backend)
- Try to access another tab
- Should auto-logout and return to login

### 2. Invalid Department
- Try to create case with invalid department
- System should reject or use NULL

### 3. Duplicate Case Numbers
- Create case with number "CASE-2024-001"
- Try to create another with same number
- Should show error: "Case number already exists"

### 4. Unauthorized Access
- Officer tries to access cases from different county
- Should see only their county cases
- Officer tries to access Admin-only features
- Should see permission denied error

---

## Performance Testing

### Test with Large Dataset
1. **Bulk create 1000 users:**
   - Click "Bulk Create Users"
   - Use JSON format for bulk import
   - Measure: Should complete in < 30 seconds

2. **Case pagination:**
   - Navigate through pages
   - Should load instantly with 50 cases per page

3. **Analytics loading:**
   - Open Analytics tab
   - Should show all charts within 2-3 seconds

---

## Browser Console Debugging

Open browser DevTools (F12) and check Console for:

1. **JWT Token Errors:**
   - Should not see: "Invalid token" repeatedly
   - Auth errors only on login failure

2. **API Errors:**
   - Check Network tab for failed requests
   - Should be < 5% failure rate
   - Most requests return 200 or 201

3. **Component Warnings:**
   - No "Missing key prop" warnings
   - No "setState on unmounted component" errors

---

## Success Criteria

✅ **All 6 Feature Categories Working:**
1. ✅ Case creation with status tracking and history
2. ✅ Department-specific dashboard filtering
3. ✅ Document management (API ready)
4. ✅ Analytics with multiple chart types
5. ✅ Criminal records and clearance checks
6. ✅ Suspect flagging with severity levels

✅ **User Management:**
- ✅ Pagination working
- ✅ Search filtering
- ✅ Role/status filtering
- ✅ Bulk user import

✅ **Performance:**
- ✅ Pages load within 2 seconds
- ✅ Charts render within 3 seconds
- ✅ No console errors

✅ **Security:**
- ✅ Token validation on every request
- ✅ Unauthorized requests rejected
- ✅ Department-based data isolation

---

## Common Issues & Solutions

### Issue: "Cannot connect to server"
**Solution:** 
- Verify backend is running: `http://localhost:3001/health`
- Check backend port: Should be 3001
- Restart backend server

### Issue: Charts not showing in Analytics
**Solution:**
- Verify recharts installed: `npm list recharts`
- Check browser console for errors
- Create some test cases first (charts need data)

### Issue: Login fails with "Too many attempts"
**Solution:**
- Wait 15 minutes for rate limit to reset
- Or restart backend server

### Issue: Cases not showing in Department Dashboard
**Solution:**
- Create a case first in Case Management
- Assign case to a department
- Refresh Department Dashboard
- Make sure department filter matches case department

---

## Final Verification Checklist

- [ ] Backend server running on port 3001
- [ ] Frontend server running on port 3000
- [ ] Can login with demo credentials
- [ ] All 7 navigation tabs visible
- [ ] Can create a case with all fields
- [ ] Can update case status
- [ ] Can flag a suspect
- [ ] Can search for clearance
- [ ] Analytics charts displaying
- [ ] No console errors
- [ ] Pagination working in user management
- [ ] Can bulk import users
- [ ] Department filtering works

**When all items checked: ✅ System Ready for Use**

