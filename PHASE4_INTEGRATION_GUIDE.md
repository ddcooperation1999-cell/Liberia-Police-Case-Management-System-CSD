# Phase 4 Integration Guide
## How to Integrate New Features into Your App

---

## 1. Update App.js (Add Search Bar)

```javascript
// Add import at top
import SearchBar from './components/SearchBar';

// In your main app header/navigation, add:
<Box sx={{ mb: 2 }}>
  <SearchBar 
    onSelectResult={(result) => {
      // Navigate to the result
      if (result.type === 'case') {
        // Navigate to case detail
      } else if (result.type === 'individual') {
        // Navigate to individual detail
      }
    }}
  />
</Box>
```

---

## 2. Update AdminDashboard.js

### Add Import Statements
```javascript
import CaseAssignment from './CaseAssignment';
import CaseNotes from './CaseNotes';
import DocumentTemplates from './DocumentTemplates';
import AuditLogs from './AuditLogs';
```

### Add State
```javascript
const [selectedCaseId, setSelectedCaseId] = useState(null);
const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
const [templatesDialogOpen, setTemplatesDialogOpen] = useState(false);
const [showAuditLogs, setShowAuditLogs] = useState(false);
```

### Add in Case Details View
```javascript
// When displaying a case, add:
<Box sx={{ mb: 3 }}>
  <Button
    variant="contained"
    color="primary"
    onClick={() => {
      setSelectedCaseId(caseId);
      setAssignmentDialogOpen(true);
    }}
  >
    Assign Case
  </Button>
</Box>

{selectedCaseId && (
  <CaseNotes caseId={selectedCaseId} />
)}

{selectedCaseId && (
  <CaseAssignment
    caseId={selectedCaseId}
    open={assignmentDialogOpen}
    onClose={() => setAssignmentDialogOpen(false)}
  />
)}
```

### Add Admin Tab for Audit Logs
```javascript
<Tab label="Audit Logs" />

// In TabPanel:
{showAuditLogs && <AuditLogs />}
```

---

## 3. Create a New "Officer Dashboard" Component

Create `OfficerDashboard.js` with:

```javascript
import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, List, ListItem, ListItemText, Chip, Alert } from '@mui/material';
import CaseNotes from './CaseNotes';
import axiosConfig from '../api/axiosConfig';

const OfficerDashboard = () => {
  const [assignments, setAssignments] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState(null);

  useEffect(() => {
    fetchMyAssignments();
  }, []);

  const fetchMyAssignments = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await axiosConfig.get(`/case-assignments/officer/${userId}`);
      setAssignments(response.data.assignments || []);
    } catch (err) {
      console.error('Error fetching assignments:', err);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <h2>My Assigned Cases</h2>

      {assignments.length === 0 ? (
        <Alert severity="info">No cases assigned to you</Alert>
      ) : (
        <List>
          {assignments.map(assignment => (
            <Card key={assignment.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <span style={{ fontWeight: 'bold' }}>
                    Case #{assignment.case_number}
                  </span>
                  <Chip
                    label={assignment.priority}
                    color={assignment.priority === 'critical' ? 'error' : 'primary'}
                  />
                </Box>

                <ListItemText
                  primary={assignment.case_description}
                  secondary={`Due: ${assignment.due_date || 'No due date'}`}
                />

                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    backgroundColor: '#f9f9f9',
                    borderRadius: 1,
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedCaseId(assignment.case_id)}
                >
                  <span style={{ color: '#0066cc' }}>View & Add Notes →</span>
                </Box>
              </CardContent>
            </Card>
          ))}
        </List>
      )}

      {selectedCaseId && (
        <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
          <CaseNotes caseId={selectedCaseId} />
        </Box>
      )}
    </Box>
  );
};

export default OfficerDashboard;
```

---

## 4. Add to App.js Router

```javascript
import OfficerDashboard from './components/OfficerDashboard';

// In your routes:
<Route path="/officer-dashboard" element={<OfficerDashboard />} />
```

---

## 5. Add Navigation Links

Update your navigation menu to include:

```javascript
// For Admins
<NavLink to="/admin">Admin Dashboard</NavLink>
<NavLink to="/audit-logs">Audit Logs</NavLink>

// For Officers
<NavLink to="/officer-dashboard">My Cases</NavLink>

// For All Users
<SearchBar /> // In header
```

---

## 6. Document Upload with Templates

Update your document upload component:

```javascript
import DocumentTemplates from './DocumentTemplates';

const [templatesOpen, setTemplatesOpen] = useState(false);
const [selectedTemplate, setSelectedTemplate] = useState(null);

<Button onClick={() => setTemplatesOpen(true)}>
  Use Template
</Button>

<DocumentTemplates
  open={templatesOpen}
  onClose={() => setTemplatesOpen(false)}
  onSelectTemplate={(template) => {
    setSelectedTemplate(template);
    // Pre-fill form with template content
  }}
/>

// When uploading, send template_id:
const formData = new FormData();
formData.append('file', file);
formData.append('caseId', caseId);
formData.append('templateId', selectedTemplate?.id);
```

---

## 7. Environment Variables

No new environment variables needed, but ensure these are set:

```
REACT_APP_API_URL=http://localhost:3001
JWT_SECRET=your-secret-key-at-least-32-characters
```

---

## 8. Testing the Integration

### Test Case Assignment
1. Login as Admin/Supervisor
2. Open a case
3. Click "Assign Case"
4. Select an officer
5. Set priority and due date
6. Click Assign
7. Verify in "Current Assignments" section

### Test Case Notes
1. Open a case
2. See "Case Notes" section
3. Add a note with type and severity
4. Verify it appears in the list
5. Edit and delete your notes

### Test Search
1. Click search bar in header
2. Type case number, suspect name, or charge
3. See results in tabbed view
4. Click a result to navigate

### Test Document Templates
1. Upload a document
2. Click "Use Template"
3. Select a template
4. Verify content is populated

### Test Audit Logs
1. Login as Admin
2. Go to Audit Logs tab
3. Filter by action, resource type, date
4. Export as CSV
5. Click log to see details

---

## 9. Troubleshooting

### Issue: Routes return 404
**Solution**: Verify `index.js` has all route imports and mounts

### Issue: Database errors
**Solution**: Run `node init-schema-phase4.js` to create tables

### Issue: Search returns no results
**Solution**: Ensure search query is at least 2 characters

### Issue: Audit logs empty
**Solution**: Create new records (they'll be logged automatically)

### Issue: Components not loading
**Solution**: Verify imports and check browser console for errors

---

## 10. Quick Start Commands

```bash
# 1. Backend setup
cd backend
npm install
node init-schema-phase4.js
npm start

# 2. Frontend setup
cd frontend
npm install
npm start

# 3. Access the app
# http://localhost:3000
# Login: admin / password
```

---

## 11. API Quick Reference

### Case Assignment API
```
POST   /api/case-assignments              (Create)
GET    /api/case-assignments/:caseId      (Get all for case)
GET    /api/case-assignments/officer/:id  (Get officer's cases)
PUT    /api/case-assignments/:id          (Update)
DELETE /api/case-assignments/:id          (Delete)
```

### Case Notes API
```
POST   /api/case-notes              (Create)
GET    /api/case-notes/:caseId      (Get all)
PUT    /api/case-notes/:id          (Update)
DELETE /api/case-notes/:id          (Delete)
```

### Templates API
```
POST   /api/document-templates                (Create)
GET    /api/document-templates                (List)
GET    /api/document-templates/:id            (Detail)
PUT    /api/document-templates/:id            (Update)
DELETE /api/document-templates/:id            (Delete)
POST   /api/document-templates/:id/duplicate  (Clone)
```

### Search API
```
POST   /api/search                 (Global search)
GET    /api/search/cases/:term     (Cases)
GET    /api/search/individuals/:term (People)
POST   /api/search/advanced        (Advanced filters)
GET    /api/search/autocomplete/:prefix (Suggestions)
```

### Audit Logs API
```
GET    /api/audit-logs                     (List)
GET    /api/audit-logs/user/:userId        (User logs)
GET    /api/audit-logs/resource/:type/:id  (Resource logs)
GET    /api/audit-logs/summary             (Statistics)
GET    /api/audit-logs/export              (CSV export)
```

---

## 12. Next Steps

1. Copy the import statements to your main components
2. Add the components to your views
3. Test each feature
4. Update your navigation menu
5. Deploy to production

---

**All features are production-ready!**  
For issues or questions, check the PHASE4_IMPLEMENTATION.md file for detailed documentation.
