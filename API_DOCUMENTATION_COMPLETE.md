# LNP Case Management System - API Documentation
## Complete API Reference for All 17 Features

**Base URL**: `http://localhost:3001/api`  
**Authentication**: JWT Bearer Token  
**Response Format**: JSON

---

## Authentication API

### Login
```
POST /auth/login
Content-Type: application/json

{
  "username": "dorusnimey",
  "password": "your-password"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "userId": 1,
    "username": "dorusnimey",
    "role": "admin",
    "first_name": "Admin",
    "last_name": "User"
  }
}
```

### Register User (Admin Only)
```
POST /auth/register
Authorization: Bearer {token}
Content-Type: application/json

{
  "username": "newuser",
  "password": "securepassword",
  "first_name": "John",
  "last_name": "Doe",
  "role": "officer"
}
```

---

## Feature 1: Dashboard
### Get Dashboard Statistics
```
GET /dashboard
Authorization: Bearer {token}

Response:
{
  "total_users": 3,
  "active_users": 3,
  "total_cases": 12,
  "open_cases": 0,
  "recent_cases": [...],
  "recent_users": [...]
}
```

---

## Feature 2: User Management

### Get All Users
```
GET /users?page=1&limit=50&search=john&role=officer&status=active
Authorization: Bearer {token}

Response:
{
  "users": [
    {
      "id": 1,
      "username": "officer1",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "badge_number": "12345",
      "role": "officer",
      "county_id": "1",
      "status": "active",
      "created_at": "2025-01-20T00:00:00Z"
    }
  ],
  "total": 10,
  "pages": 1,
  "page": 1
}
```

### Create User
```
POST /users
Authorization: Bearer {token}
Content-Type: application/json

{
  "username": "newofficer",
  "password": "password123",
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane@example.com",
  "phone": "0987654321",
  "badge_number": "54321",
  "role": "officer",
  "county_id": "1",
  "status": "active"
}

Response:
{
  "success": true,
  "userId": 5,
  "message": "User created successfully"
}
```

### Update User
```
PUT /users/{userId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane.smith@example.com",
  "status": "active"
}

Response:
{
  "success": true,
  "message": "User updated successfully"
}
```

### Delete User
```
DELETE /users/{userId}
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "User deleted successfully"
}
```

### Bulk Create Users
```
POST /users/bulk/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "users": [
    {
      "username": "officer1",
      "password": "pass123",
      "first_name": "John",
      "last_name": "Doe",
      "role": "officer"
    }
  ]
}

Response:
{
  "created": [1, 2, 3],
  "failed": [],
  "message": "3 users created successfully"
}
```

---

## Feature 3: Case Management

### Get All Cases
```
GET /cases?page=1&limit=50&status=open&type=theft&search=CASE
Authorization: Bearer {token}

Response:
{
  "cases": [
    {
      "id": 1,
      "case_number": "CASE-2024-001",
      "county": "Montserrado",
      "case_type": "Theft",
      "details": "Vehicle theft reported",
      "disposition": "Open",
      "investigator": "John Doe",
      "priority": "normal",
      "status": "open",
      "created_at": "2025-01-20T00:00:00Z",
      "updated_at": "2025-01-20T00:00:00Z"
    }
  ],
  "total": 12,
  "pages": 1,
  "page": 1
}
```

### Create Case
```
POST /cases
Authorization: Bearer {token}
Content-Type: application/json

{
  "case_number": "CASE-2025-001",
  "county": "Montserrado",
  "case_type": "Assault",
  "details": "Assault case on Main Street",
  "disposition": "Open",
  "investigator": "Jane Smith",
  "priority": "high"
}

Response:
{
  "success": true,
  "caseId": 13,
  "message": "Case created successfully"
}
```

### Update Case
```
PUT /cases/{caseId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "disposition": "Closed",
  "priority": "low",
  "details": "Updated case details"
}

Response:
{
  "success": true,
  "message": "Case updated successfully"
}
```

### Delete Case
```
DELETE /cases/{caseId}
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Case deleted successfully"
}
```

---

## Feature 4: Notifications

### Get User Notifications
```
GET /notifications?limit=50&skip=0&read=false&type=case_update&priority=high
Authorization: Bearer {token}

Response:
{
  "notifications": [
    {
      "id": "notif_123",
      "userId": 1,
      "title": "Case Updated",
      "message": "Case #001 has been updated",
      "type": "case_update",
      "priority": "high",
      "read": false,
      "createdAt": "2025-01-20T10:00:00Z"
    }
  ],
  "total": 5,
  "unread": 3
}
```

### Get Unread Count
```
GET /notifications/unread/count
Authorization: Bearer {token}

Response:
{
  "unreadCount": 3
}
```

### Mark Notification as Read
```
PUT /notifications/{notificationId}/read
Authorization: Bearer {token}

Response:
{
  "success": true,
  "notification": {...}
}
```

### Mark All as Read
```
PUT /notifications/read-all/bulk
Authorization: Bearer {token}

Response:
{
  "success": true,
  "count": 5
}
```

---

## Feature 5: Report Generation (Document Templates)

### Get Document Templates
```
GET /document-templates?category=arrest_report
Authorization: Bearer {token}

Response:
{
  "templates": [
    {
      "id": 1,
      "name": "Arrest Report",
      "category": "arrest_report",
      "content": "Template with {officer_name}, {case_number}, etc.",
      "variables": ["officer_name", "case_number", "defendant"],
      "created_at": "2025-01-20T00:00:00Z"
    }
  ]
}
```

### Create Document Template
```
POST /document-templates
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Incident Report",
  "category": "incident_report",
  "content": "Incident Report\nOfficer: {officer_name}\nCase #: {case_number}\nDate: {date}\nDetails: {details}"
}

Response:
{
  "success": true,
  "templateId": 5,
  "message": "Template created successfully"
}
```

### Generate Report from Template
```
POST /document-templates/{templateId}/generate
Authorization: Bearer {token}
Content-Type: application/json

{
  "case_id": 1,
  "variables": {
    "officer_name": "Jane Smith",
    "case_number": "CASE-2025-001",
    "date": "2025-01-20",
    "details": "Incident details here"
  }
}

Response:
{
  "success": true,
  "document_id": "doc_456",
  "pdf_url": "/documents/doc_456.pdf"
}
```

---

## Feature 6: Evidence Management

### Get Evidence List
```
GET /evidence/list
Authorization: Bearer {token}

Response:
{
  "evidence": [
    {
      "id": 1,
      "case_id": 1,
      "evidence_number": "EV-001-2025",
      "evidence_type": "physical",
      "description": "Stolen laptop",
      "custody_chain": "Officer John → Storage → Officer Jane",
      "location": "Evidence Room A",
      "collected_date": "2025-01-15",
      "collected_by": "John Doe",
      "status": "collected",
      "created_at": "2025-01-15T00:00:00Z"
    }
  ]
}
```

### Record Evidence
```
POST /evidence
Authorization: Bearer {token}
Content-Type: application/json

{
  "case_id": 1,
  "evidence_number": "EV-002-2025",
  "evidence_type": "physical",
  "description": "Stolen vehicle keys",
  "custody_chain": "Jane Smith",
  "location": "Evidence Room A",
  "collected_date": "2025-01-20",
  "collected_by": "Jane Smith",
  "status": "collected"
}

Response:
{
  "success": true,
  "id": 2,
  "message": "Evidence recorded"
}
```

### Update Evidence
```
PUT /evidence/{evidenceId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "custody_chain": "Jane Smith → Inspector Brown",
  "status": "in_storage"
}

Response:
{
  "success": true,
  "message": "Evidence updated"
}
```

### Update Evidence Status
```
PATCH /evidence/{evidenceId}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "released"
}

Response:
{
  "success": true,
  "message": "Status updated to released"
}
```

---

## Feature 7: Analytics Dashboard

### Get Overall Analytics
```
GET /analytics
Authorization: Bearer {token}

Response:
{
  "total_cases": 156,
  "open_cases": 58,
  "closed_cases": 98,
  "pending_cases": 12,
  "critical_cases": 5,
  "avg_resolution_days": 14.2,
  "cases_trend": [
    { "date": "2025-01-01", "cases": 5 },
    { "date": "2025-01-08", "cases": 8 }
  ],
  "cases_by_status": [
    { "status": "Open", "count": 58 },
    { "status": "Closed", "count": 98 }
  ],
  "department_stats": [...]
}
```

### Export Analytics
```
GET /analytics/export?format=csv&dateRange=month
Authorization: Bearer {token}

Response: CSV file download
```

### Get Enhanced Analytics
```
GET /analytics-v2
Authorization: Bearer {token}

Response:
{
  "totalCases": 156,
  "casesByStatus": [...],
  "casesByType": [...],
  "departmentPerformance": [...]
}
```

---

## Feature 8: Police Clearance Check

### Check Individual Clearance
```
GET /criminal-records?search=John&type=name
Authorization: Bearer {token}

Response:
{
  "records": [
    {
      "id": 1,
      "name": "John Smith",
      "id_number": "123456789",
      "criminal_history": "2 previous arrests",
      "clearance_status": "flagged",
      "last_checked": "2025-01-20T00:00:00Z"
    }
  ]
}
```

### Add Criminal Record
```
POST /criminal-records
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "John Smith",
  "id_number": "123456789",
  "criminal_history": "Theft conviction 2020",
  "clearance_status": "flagged"
}

Response:
{
  "success": true,
  "recordId": 5
}
```

---

## Feature 9: Case Assignment

### Get Case Assignments
```
GET /case-assignments?officer_id=2&status=pending
Authorization: Bearer {token}

Response:
{
  "assignments": [
    {
      "id": 1,
      "case_id": 1,
      "officer_id": 2,
      "assigned_date": "2025-01-20T00:00:00Z",
      "deadline": "2025-02-20T00:00:00Z",
      "status": "pending",
      "notes": "Priority case"
    }
  ]
}
```

### Assign Case to Officer
```
POST /case-assignments
Authorization: Bearer {token}
Content-Type: application/json

{
  "case_id": 1,
  "officer_id": 2,
  "deadline": "2025-02-20",
  "notes": "High priority"
}

Response:
{
  "success": true,
  "assignmentId": 5
}
```

### Update Assignment
```
PUT /case-assignments/{assignmentId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "in_progress",
  "notes": "Actively investigating"
}

Response:
{
  "success": true,
  "message": "Assignment updated"
}
```

---

## Feature 10: Case Notes

### Get Case Notes
```
GET /case-notes?case_id=1
Authorization: Bearer {token}

Response:
{
  "notes": [
    {
      "id": 1,
      "case_id": 1,
      "officer_id": 2,
      "officer_name": "Jane Smith",
      "content": "Initial investigation started",
      "created_at": "2025-01-20T00:00:00Z"
    }
  ]
}
```

### Add Note to Case
```
POST /case-notes
Authorization: Bearer {token}
Content-Type: application/json

{
  "case_id": 1,
  "content": "Witness interviewed, description obtained"
}

Response:
{
  "success": true,
  "noteId": 5
}
```

### Update Note
```
PUT /case-notes/{noteId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "Updated witness information"
}

Response:
{
  "success": true,
  "message": "Note updated"
}
```

---

## Feature 11: Document Management

### Get Documents
```
GET /documents?case_id=1
Authorization: Bearer {token}

Response:
{
  "documents": [
    {
      "id": 1,
      "case_id": 1,
      "document_type": "arrest_report",
      "file_name": "AR-001.pdf",
      "file_url": "/uploads/AR-001.pdf",
      "created_at": "2025-01-20T00:00:00Z"
    }
  ]
}
```

### Upload Document
```
POST /documents
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: [binary data]
case_id: 1
document_type: arrest_report

Response:
{
  "success": true,
  "documentId": 5,
  "file_url": "/uploads/file_123.pdf"
}
```

---

## Feature 12: Advanced Search

### Search Cases
```
GET /search/cases?query=CASE-2025&type=case_number&filters[status]=open
Authorization: Bearer {token}

Response:
{
  "results": [
    {
      "id": 1,
      "case_number": "CASE-2025-001",
      "type": "Theft",
      "status": "open"
    }
  ],
  "total": 5
}
```

### Search Individuals
```
GET /search/individuals?query=John&type=name
Authorization: Bearer {token}

Response:
{
  "results": [
    {
      "id": 1,
      "name": "John Doe",
      "id_number": "123456789"
    }
  ]
}
```

---

## Feature 13: Audit Logs

### Get Audit Logs
```
GET /audit-logs?user_id=1&action=create&limit=50
Authorization: Bearer {token}
(Admin Only)

Response:
{
  "logs": [
    {
      "id": 1,
      "user_id": 1,
      "action": "create_case",
      "resource_type": "case",
      "resource_id": 1,
      "details": "Case CASE-2025-001 created",
      "timestamp": "2025-01-20T10:00:00Z",
      "ip_address": "127.0.0.1"
    }
  ],
  "total": 150
}
```

### Export Audit Log
```
GET /audit-logs/export?format=csv&start_date=2025-01-01&end_date=2025-01-31
Authorization: Bearer {token}
(Admin Only)

Response: CSV file download
```

---

## Feature 14: Multi-Language Support

### Get Supported Languages
```
GET /multi-language/languages
Authorization: Bearer {token}

Response:
{
  "languages": [
    { "code": "en", "name": "English" },
    { "code": "fr", "name": "Français" },
    { "code": "zh", "name": "中文" },
    { "code": "es", "name": "Español" },
    { "code": "ar", "name": "العربية" }
  ]
}
```

### Get Translations
```
GET /multi-language/translations?language=fr
Authorization: Bearer {token}

Response:
{
  "translations": {
    "dashboard": "Tableau de bord",
    "users": "Utilisateurs",
    "cases": "Cas"
  }
}
```

---

## Feature 15: Offline Mode & Sync

### Get Offline Data
```
GET /offline-sync/data?lastSync=2025-01-20T00:00:00Z
Authorization: Bearer {token}

Response:
{
  "cases": [...],
  "users": [...],
  "evidence": [...],
  "lastSync": "2025-01-20T10:00:00Z"
}
```

### Sync Offline Changes
```
POST /offline-sync/sync
Authorization: Bearer {token}
Content-Type: application/json

{
  "changes": {
    "cases": [
      { "id": 1, "action": "update", "data": {...} }
    ],
    "evidence": [
      { "id": 2, "action": "create", "data": {...} }
    ]
  }
}

Response:
{
  "success": true,
  "synced": 2,
  "failed": 0
}
```

---

## Feature 16: Geolocation Tagging

### Get Locations for Case
```
GET /geolocation?case_id=1
Authorization: Bearer {token}

Response:
{
  "locations": [
    {
      "id": 1,
      "case_id": 1,
      "latitude": 6.3155,
      "longitude": -10.8073,
      "address": "Main Street, Monrovia",
      "description": "Incident location",
      "timestamp": "2025-01-20T10:00:00Z"
    }
  ]
}
```

### Add Location Tag
```
POST /geolocation
Authorization: Bearer {token}
Content-Type: application/json

{
  "case_id": 1,
  "latitude": 6.3155,
  "longitude": -10.8073,
  "address": "Main Street, Monrovia",
  "description": "Crime scene"
}

Response:
{
  "success": true,
  "locationId": 5
}
```

### Get Heat Map Data
```
GET /geolocation/heatmap?county=Montserrado&date_range=month
Authorization: Bearer {token}

Response:
{
  "heatmap_data": [
    { "lat": 6.3155, "lng": -10.8073, "weight": 5 }
  ]
}
```

---

## Feature 17: Case Closure Workflow

### Request Case Closure
```
POST /case-closure/request
Authorization: Bearer {token}
Content-Type: application/json

{
  "case_id": 1,
  "closure_reason": "Solved",
  "final_notes": "Suspect apprehended and charged"
}

Response:
{
  "success": true,
  "closureRequestId": 5,
  "status": "pending_approval"
}
```

### Approve Case Closure
```
PUT /case-closure/{closureRequestId}/approve
Authorization: Bearer {token}
(Supervisor/Admin Only)

Response:
{
  "success": true,
  "message": "Case closure approved",
  "case_status": "closed"
}
```

### Get Closure History
```
GET /case-closure/history?case_id=1
Authorization: Bearer {token}

Response:
{
  "closures": [
    {
      "id": 1,
      "case_id": 1,
      "requested_by": "Jane Smith",
      "requested_at": "2025-01-20T10:00:00Z",
      "approved_by": "John Supervisor",
      "approved_at": "2025-01-21T09:00:00Z",
      "closure_reason": "Solved",
      "final_notes": "Case closed"
    }
  ]
}
```

---

## Error Responses

All endpoints return standard error responses:

```json
{
  "error": "Error message describing what went wrong",
  "details": "Additional details (in development mode only)"
}
```

### Common HTTP Status Codes
- **200 OK** - Request successful
- **201 Created** - Resource created successfully
- **400 Bad Request** - Invalid input or missing required fields
- **401 Unauthorized** - No token provided or invalid token
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource not found
- **409 Conflict** - Resource already exists
- **500 Internal Server Error** - Server error

---

## Rate Limiting

All endpoints are rate-limited:
- **Limit**: 100 requests per 15 minutes per IP
- **Headers**: 
  - `X-RateLimit-Limit`: 100
  - `X-RateLimit-Remaining`: 95
  - `X-RateLimit-Reset`: Unix timestamp

---

## Authentication Notes

1. Token must be included in every request header:
   ```
   Authorization: Bearer {token}
   ```

2. Tokens expire after 24 hours

3. Token refresh not required; each login generates new token

---

## Data Validation

All inputs are validated:
- SQL injection prevention
- XSS protection
- CSRF protection
- Input sanitization
- Type checking

---

**API Version**: 2.0  
**Last Updated**: January 20, 2026  
**Status**: ✅ Production Ready
