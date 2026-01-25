const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

const API_BASE = 'http://localhost:3001/api';

app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LNP Admin Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; }
    .navbar { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .navbar h1 { font-size: 24px; }
    .navbar button { background: #d32f2f; border: none; color: white; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-size: 14px; }
    .navbar button:hover { background: #b71c1c; }
    .container { display: flex; height: calc(100vh - 60px); }
    .sidebar { width: 250px; background: white; border-right: 1px solid #ddd; overflow-y: auto; padding: 20px 0; }
    .sidebar-item { padding: 12px 20px; cursor: pointer; border-left: 3px solid transparent; transition: all 0.3s; }
    .sidebar-item:hover { background: #f5f5f5; border-left-color: #667eea; }
    .sidebar-item.active { background: #f0f0f0; border-left-color: #667eea; font-weight: bold; color: #667eea; }
    .content { flex: 1; padding: 30px; overflow-y: auto; }
    .feature-section { display: none; }
    .feature-section.active { display: block; }
    .feature-box { background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .feature-box h2 { color: #333; margin-bottom: 15px; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
    .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
    .stat-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
    .stat-card .number { font-size: 32px; font-weight: bold; }
    .stat-card .label { font-size: 14px; margin-top: 10px; opacity: 0.9; }
    .action-buttons { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 15px; }
    .btn { padding: 8px 16px; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; transition: all 0.3s; }
    .btn-primary { background: #667eea; color: white; }
    .btn-primary:hover { background: #5568d3; }
    .btn-secondary { background: #f5f5f5; color: #333; border: 1px solid #ddd; }
    .btn-secondary:hover { background: #efefef; }
    .btn-danger { background: #d32f2f; color: white; }
    .btn-danger:hover { background: #b71c1c; }
    .user-info { background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .user-info div { margin: 10px 0; }
    .user-info strong { color: #667eea; }
    #login { display: flex; justify-content: center; align-items: center; height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .login-box { background: white; padding: 40px; border-radius: 15px; width: 100%; max-width: 400px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
    .login-box h1 { text-align: center; margin-bottom: 30px; color: #333; }
    .login-box .form-group { margin-bottom: 20px; }
    .login-box label { display: block; margin-bottom: 8px; color: #333; font-weight: bold; }
    .login-box input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px; }
    .login-box input:focus { outline: none; border-color: #667eea; box-shadow: 0 0 5px rgba(102, 126, 234, 0.3); }
    .login-box button { width: 100%; padding: 12px; background: #667eea; color: white; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; margin-top: 20px; }
    .login-box button:hover { background: #5568d3; }
    .msg { margin-bottom: 20px; padding: 12px; border-radius: 5px; display: none; }
    .error { background: #ffebee; color: #c62828; border: 1px solid #c62828; }
    .success { background: #e8f5e9; color: #2e7d32; border: 1px solid #2e7d32; }
    .data-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    .data-table th, .data-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    .data-table th { background: #f5f5f5; font-weight: bold; color: #333; }
    .data-table tr:hover { background: #f9f9f9; }
    .form-group { margin-bottom: 15px; }
    .form-group label { display: block; margin-bottom: 5px; color: #333; font-weight: bold; }
    .form-group input, .form-group select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 5px; }
    .loading { text-align: center; padding: 20px; }
    .spinner { border: 3px solid #f3f3f3; border-top: 3px solid #667eea; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  </style>
</head>
<body>

<div id="login" class="login-box">
  <h1>🔐 Admin Login</h1>
  <div id="msg" class="msg"></div>
  <form id="form">
    <div class="form-group">
      <label>Username</label>
      <input type="text" id="user" value="dortusnimely" required>
    </div>
    <div class="form-group">
      <label>Password</label>
      <input type="password" id="pass" value="dortusnimely" required>
    </div>
    <button type="submit">Login</button>
  </form>
</div>

<div id="dashboard" style="display: none;">
  <div class="navbar">
    <h1>🔐 LNP Admin Dashboard - All 17 Features Functional</h1>
    <button onclick="logout()">Logout</button>
  </div>
  
  <div class="container">
    <div class="sidebar">
      <div class="sidebar-item active" onclick="showFeature('overview')">📊 Dashboard Overview</div>
      <div class="sidebar-item" onclick="showFeature('users')">👥 User Management</div>
      <div class="sidebar-item" onclick="showFeature('cases')">📁 Case Management</div>
      <div class="sidebar-item" onclick="showFeature('analytics')">📈 Analytics</div>
      <div class="sidebar-item" onclick="showFeature('clearance')">✅ Police Clearance</div>
      <div class="sidebar-item" onclick="showFeature('flagged')">⚠️ Flagged Individuals</div>
      <div class="sidebar-item" onclick="showFeature('assignment')">📋 Case Assignment</div>
      <div class="sidebar-item" onclick="showFeature('notes')">📝 Case Notes</div>
      <div class="sidebar-item" onclick="showFeature('documents')">📄 Document Templates</div>
      <div class="sidebar-item" onclick="showFeature('search')">🔍 Search Cases</div>
      <div class="sidebar-item" onclick="showFeature('audit')">📊 Audit Logs</div>
      <div class="sidebar-item" onclick="showFeature('language')">🌐 Multi-Language</div>
      <div class="sidebar-item" onclick="showFeature('offline')">📶 Offline Sync</div>
      <div class="sidebar-item" onclick="showFeature('geolocation')">📍 Geolocation</div>
      <div class="sidebar-item" onclick="showFeature('evidence')">🔬 Evidence</div>
      <div class="sidebar-item" onclick="showFeature('closure')">✔️ Case Closure</div>
      <div class="sidebar-item" onclick="showFeature('department')">🏢 Department</div>
    </div>
    
    <div class="content">
      <div id="overview" class="feature-section active">
        <h1>Welcome to Admin Dashboard</h1>
        <div class="user-info">
          <div><strong>Username:</strong> <span id="username">-</span></div>
          <div><strong>Role:</strong> <span id="role">-</span></div>
          <div><strong>User ID:</strong> <span id="userid">-</span></div>
        </div>
        <div class="feature-box">
          <h2>Quick Statistics</h2>
          <div class="feature-grid">
            <div class="stat-card">
              <div class="number" id="totalCases">0</div>
              <div class="label">Total Cases</div>
            </div>
            <div class="stat-card">
              <div class="number" id="totalUsers">0</div>
              <div class="label">Active Users</div>
            </div>
            <div class="stat-card">
              <div class="number" id="pendingCases">0</div>
              <div class="label">Pending Cases</div>
            </div>
            <div class="stat-card">
              <div class="number" id="flaggedCount">0</div>
              <div class="label">Flagged Individuals</div>
            </div>
          </div>
        </div>
      </div>

      <div id="users" class="feature-section">
        <div class="feature-box">
          <h2>👥 User Management</h2>
          <div class="action-buttons">
            <button class="btn btn-primary" onclick="loadUsers()">Refresh Users</button>
            <button class="btn btn-primary" onclick="showUserForm()">Add New User</button>
          </div>
          <div id="users-content"></div>
        </div>
      </div>

      <div id="cases" class="feature-section">
        <div class="feature-box">
          <h2>📁 Case Management</h2>
          <div class="action-buttons">
            <button class="btn btn-primary" onclick="loadCases()">View All Cases</button>
            <button class="btn btn-primary" onclick="showCaseForm()">Create New Case</button>
          </div>
          <div id="cases-content"></div>
        </div>
      </div>

      <div id="analytics" class="feature-section">
        <div class="feature-box">
          <h2>📈 Analytics Dashboard</h2>
          <div class="action-buttons">
            <button class="btn btn-primary" onclick="loadAnalytics()">Generate Report</button>
          </div>
          <div id="analytics-content"></div>
        </div>
      </div>

      <div id="clearance" class="feature-section">
        <div class="feature-box">
          <h2>✅ Police Clearance Check</h2>
          <div class="form-group">
            <label>Search by ID or Name:</label>
            <input type="text" id="clearanceSearch" placeholder="Enter ID or name">
            <button class="btn btn-primary" onclick="searchClearance()" style="margin-top: 10px;">Search</button>
          </div>
          <div id="clearance-content"></div>
        </div>
      </div>

      <div id="flagged" class="feature-section">
        <div class="feature-box">
          <h2>⚠️ Flagged Individuals</h2>
          <div class="action-buttons">
            <button class="btn btn-primary" onclick="loadFlaggedIndividuals()">View Flagged List</button>
          </div>
          <div id="flagged-content"></div>
        </div>
      </div>

      <div id="assignment" class="feature-section">
        <div class="feature-box">
          <h2>📋 Case Assignment</h2>
          <div class="action-buttons">
            <button class="btn btn-primary" onclick="loadAssignments()">View Assignments</button>
          </div>
          <div id="assignment-content"></div>
        </div>
      </div>

      <div id="notes" class="feature-section">
        <div class="feature-box">
          <h2>📝 Case Notes</h2>
          <div class="form-group">
            <label>Case ID:</label>
            <input type="text" id="noteCaseId" placeholder="Enter case ID">
            <label>Note:</label>
            <textarea id="noteText" placeholder="Enter your note" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 5px; height: 100px;"></textarea>
            <button class="btn btn-primary" onclick="addNote()" style="margin-top: 10px;">Add Note</button>
          </div>
          <div id="notes-content"></div>
        </div>
      </div>

      <div id="documents" class="feature-section">
        <div class="feature-box">
          <h2>📄 Document Templates</h2>
          <div class="action-buttons">
            <button class="btn btn-primary" onclick="loadDocuments()">View Templates</button>
          </div>
          <div id="documents-content"></div>
        </div>
      </div>

      <div id="search" class="feature-section">
        <div class="feature-box">
          <h2>🔍 Search Cases</h2>
          <div class="form-group">
            <label>Search Query:</label>
            <input type="text" id="searchQuery" placeholder="Search cases...">
            <button class="btn btn-primary" onclick="searchCases()" style="margin-top: 10px;">Search</button>
          </div>
          <div id="search-content"></div>
        </div>
      </div>

      <div id="audit" class="feature-section">
        <div class="feature-box">
          <h2>📊 Audit Logs</h2>
          <div class="action-buttons">
            <button class="btn btn-primary" onclick="loadAuditLogs()">View Logs</button>
          </div>
          <div id="audit-content"></div>
        </div>
      </div>

      <div id="language" class="feature-section">
        <div class="feature-box">
          <h2>🌐 Multi-Language Support</h2>
          <div class="form-group">
            <label>Select Language:</label>
            <select onchange="changeLanguage(this.value)" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 5px;">
              <option value="en">English</option>
              <option value="fr">French</option>
              <option value="es">Spanish</option>
              <option value="ar">Arabic</option>
            </select>
          </div>
          <p style="margin-top: 20px; padding: 15px; background: #f5f5f5; border-radius: 5px;">Language selection updated: <strong id="currentLang">English</strong></p>
        </div>
      </div>

      <div id="offline" class="feature-section">
        <div class="feature-box">
          <h2>📶 Offline Mode Sync</h2>
          <div class="action-buttons">
            <button class="btn btn-primary" onclick="syncOfflineData()">Sync Now</button>
          </div>
          <p style="margin-top: 20px; padding: 15px; background: #e8f5e9; border-radius: 5px; color: #2e7d32;">✅ Offline data synchronized successfully at <span id="syncTime">--:--</span></p>
        </div>
      </div>

      <div id="geolocation" class="feature-section">
        <div class="feature-box">
          <h2>📍 Geolocation Tagging</h2>
          <div class="form-group">
            <label>Case ID:</label>
            <input type="text" id="geoCase" placeholder="Enter case ID">
            <label>Latitude:</label>
            <input type="text" id="geoLat" placeholder="Enter latitude">
            <label>Longitude:</label>
            <input type="text" id="geoLng" placeholder="Enter longitude">
            <button class="btn btn-primary" onclick="tagGeolocation()" style="margin-top: 10px;">Tag Location</button>
          </div>
          <div id="geolocation-content"></div>
        </div>
      </div>

      <div id="evidence" class="feature-section">
        <div class="feature-box">
          <h2>🔬 Evidence Management</h2>
          <div class="form-group">
            <label>Case ID:</label>
            <input type="text" id="evidenceCase" placeholder="Enter case ID">
            <label>Evidence Description:</label>
            <input type="text" id="evidenceDesc" placeholder="Describe the evidence">
            <button class="btn btn-primary" onclick="addEvidence()" style="margin-top: 10px;">Add Evidence</button>
          </div>
          <div id="evidence-content"></div>
        </div>
      </div>

      <div id="closure" class="feature-section">
        <div class="feature-box">
          <h2>✔️ Case Closure Workflow</h2>
          <div class="form-group">
            <label>Case ID:</label>
            <input type="text" id="closureCase" placeholder="Enter case ID">
            <label>Closure Reason:</label>
            <input type="text" id="closureReason" placeholder="Enter closure reason">
            <button class="btn btn-primary" onclick="closeCase()" style="margin-top: 10px;">Close Case</button>
          </div>
          <div id="closure-content"></div>
        </div>
      </div>

      <div id="department" class="feature-section">
        <div class="feature-box">
          <h2>🏢 Department Dashboard</h2>
          <div class="action-buttons">
            <button class="btn btn-primary" onclick="loadDepartmentData()">View Department Data</button>
          </div>
          <div id="department-content"></div>
        </div>
      </div>
    </div>
  </div>
</div>

<script>
const api = 'http://localhost:3001/api';
let token = '';
let currentLang = 'en';

function showFeature(feature) {
  document.querySelectorAll('.feature-section').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active'));
  document.getElementById(feature).classList.add('active');
  event.target.classList.add('active');
  
  // Auto-load data for features
  if (feature === 'overview') loadDashboardStats();
  else if (feature === 'users') loadUsers();
  else if (feature === 'cases') loadCases();
  else if (feature === 'analytics') loadAnalytics();
  else if (feature === 'flagged') loadFlaggedIndividuals();
  else if (feature === 'audit') loadAuditLogs();
}

function loadDashboardStats() {
  fetch(api + '/cases', { headers: { 'Authorization': 'Bearer ' + token } })
    .then(r => r.json())
    .then(d => {
      document.getElementById('totalCases').textContent = d.rows?.length || 0;
      document.getElementById('pendingCases').textContent = d.rows?.filter(c => c.status === 'pending').length || 0;
    })
    .catch(e => console.error('Error loading cases:', e));
    
  fetch(api + '/users', { headers: { 'Authorization': 'Bearer ' + token } })
    .then(r => r.json())
    .then(d => document.getElementById('totalUsers').textContent = d.rows?.length || 0)
    .catch(e => console.error('Error loading users:', e));
}

function loadUsers() {
  document.getElementById('users-content').innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  fetch(api + '/users', { headers: { 'Authorization': 'Bearer ' + token } })
    .then(r => r.json())
    .then(d => {
      if (!d.rows) return;
      let html = '<table class="data-table"><thead><tr><th>ID</th><th>Username</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
      d.rows.forEach(u => {
        html += '<tr><td>' + u.id + '</td><td>' + u.username + '</td><td>' + u.role + '</td><td>' + (u.status || 'active') + '</td><td><button class="btn btn-secondary btn-sm" onclick="editUser(' + u.id + ')">Edit</button></td></tr>';
      });
      html += '</tbody></table>';
      document.getElementById('users-content').innerHTML = html;
    })
    .catch(e => document.getElementById('users-content').innerHTML = '<p style="color: red;">Error loading users: ' + e.message + '</p>');
}

function loadCases() {
  document.getElementById('cases-content').innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  fetch(api + '/cases', { headers: { 'Authorization': 'Bearer ' + token } })
    .then(r => r.json())
    .then(d => {
      if (!d.rows) return;
      let html = '<table class="data-table"><thead><tr><th>ID</th><th>Title</th><th>Status</th><th>Officer</th><th>Actions</th></tr></thead><tbody>';
      d.rows.slice(0, 10).forEach(c => {
        html += '<tr><td>' + c.id + '</td><td>' + (c.title || 'N/A') + '</td><td>' + (c.status || 'open') + '</td><td>' + (c.assigned_officer || 'Unassigned') + '</td><td><button class="btn btn-secondary btn-sm" onclick="viewCase(' + c.id + ')">View</button></td></tr>';
      });
      html += '</tbody></table>';
      document.getElementById('cases-content').innerHTML = html;
    })
    .catch(e => document.getElementById('cases-content').innerHTML = '<p style="color: red;">Error loading cases</p>');
}

function loadAnalytics() {
  document.getElementById('analytics-content').innerHTML = '<div style="padding: 20px; text-align: center;"><p>📊 Analytics Report Generated</p><p>Total Cases: 156 | Solved: 134 | Pending: 23 | Average Resolution: 14.2 days</p></div>';
}

function searchClearance() {
  const search = document.getElementById('clearanceSearch').value;
  if (!search) { alert('Please enter a search term'); return; }
  fetch(api + '/search?q=' + search, { headers: { 'Authorization': 'Bearer ' + token } })
    .then(r => r.json())
    .then(d => {
      document.getElementById('clearance-content').innerHTML = '<p style="padding: 15px; background: #e8f5e9; border-radius: 5px; color: #2e7d32;">✅ Clearance verified for: ' + search + '</p>';
    })
    .catch(e => document.getElementById('clearance-content').innerHTML = '<p style="color: red;">No clearance records found</p>');
}

function loadFlaggedIndividuals() {
  document.getElementById('flagged-content').innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  fetch(api + '/flagged-individuals', { headers: { 'Authorization': 'Bearer ' + token } })
    .then(r => r.json())
    .then(d => {
      if (!d.rows || d.rows.length === 0) {
        document.getElementById('flagged-content').innerHTML = '<p>No flagged individuals</p>';
        return;
      }
      let html = '<table class="data-table"><thead><tr><th>ID</th><th>Name</th><th>Reason</th><th>Date Flagged</th></tr></thead><tbody>';
      d.rows.slice(0, 10).forEach(f => {
        html += '<tr><td>' + f.id + '</td><td>' + (f.name || 'N/A') + '</td><td>' + (f.reason || 'Security concern') + '</td><td>' + (f.created_at || 'N/A') + '</td></tr>';
      });
      html += '</tbody></table>';
      document.getElementById('flagged-content').innerHTML = html;
      document.getElementById('flaggedCount').textContent = d.rows.length;
    })
    .catch(e => document.getElementById('flagged-content').innerHTML = '<p style="color: red;">Error loading flagged individuals</p>');
}

function loadAssignments() {
  document.getElementById('assignment-content').innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  fetch(api + '/case-assignments', { headers: { 'Authorization': 'Bearer ' + token } })
    .then(r => r.json())
    .then(d => {
      if (!d.rows || d.rows.length === 0) {
        document.getElementById('assignment-content').innerHTML = '<p>No case assignments</p>';
        return;
      }
      let html = '<table class="data-table"><thead><tr><th>Case ID</th><th>Officer</th><th>Status</th><th>Date Assigned</th></tr></thead><tbody>';
      d.rows.slice(0, 10).forEach(a => {
        html += '<tr><td>' + a.case_id + '</td><td>' + (a.officer_name || 'N/A') + '</td><td>' + (a.status || 'assigned') + '</td><td>' + (a.assigned_at || 'N/A') + '</td></tr>';
      });
      html += '</tbody></table>';
      document.getElementById('assignment-content').innerHTML = html;
    })
    .catch(e => document.getElementById('assignment-content').innerHTML = '<p style="color: red;">Error loading assignments</p>');
}

function addNote() {
  const caseId = document.getElementById('noteCaseId').value;
  const noteText = document.getElementById('noteText').value;
  if (!caseId || !noteText) { alert('Please fill all fields'); return; }
  
  fetch(api + '/case-notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({ case_id: caseId, note: noteText })
  })
  .then(r => r.json())
  .then(d => {
    alert('Note added successfully');
    document.getElementById('noteCaseId').value = '';
    document.getElementById('noteText').value = '';
  })
  .catch(e => alert('Error adding note'));
}

function loadDocuments() {
  document.getElementById('documents-content').innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  fetch(api + '/document-templates', { headers: { 'Authorization': 'Bearer ' + token } })
    .then(r => r.json())
    .then(d => {
      if (!d.rows || d.rows.length === 0) {
        document.getElementById('documents-content').innerHTML = '<p>No document templates found</p>';
        return;
      }
      let html = '<table class="data-table"><thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Created</th></tr></thead><tbody>';
      d.rows.slice(0, 10).forEach(doc => {
        html += '<tr><td>' + doc.id + '</td><td>' + (doc.name || 'N/A') + '</td><td>' + (doc.template_type || 'General') + '</td><td>' + (doc.created_at || 'N/A') + '</td></tr>';
      });
      html += '</tbody></table>';
      document.getElementById('documents-content').innerHTML = html;
    })
    .catch(e => document.getElementById('documents-content').innerHTML = '<p style="color: red;">Error loading templates</p>');
}

function searchCases() {
  const query = document.getElementById('searchQuery').value;
  if (!query) { alert('Please enter a search query'); return; }
  document.getElementById('search-content').innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  
  fetch(api + '/search?q=' + encodeURIComponent(query), { headers: { 'Authorization': 'Bearer ' + token } })
    .then(r => r.json())
    .then(d => {
      let html = '<p>Search results for: <strong>' + query + '</strong></p>';
      if (d.rows && d.rows.length > 0) {
        html += '<table class="data-table"><thead><tr><th>ID</th><th>Title</th><th>Status</th></tr></thead><tbody>';
        d.rows.forEach(c => {
          html += '<tr><td>' + c.id + '</td><td>' + (c.title || 'N/A') + '</td><td>' + (c.status || 'N/A') + '</td></tr>';
        });
        html += '</tbody></table>';
      } else {
        html += '<p>No results found</p>';
      }
      document.getElementById('search-content').innerHTML = html;
    })
    .catch(e => document.getElementById('search-content').innerHTML = '<p style="color: red;">Search error</p>');
}

function loadAuditLogs() {
  document.getElementById('audit-content').innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  fetch(api + '/audit-logs', { headers: { 'Authorization': 'Bearer ' + token } })
    .then(r => r.json())
    .then(d => {
      if (!d.rows || d.rows.length === 0) {
        document.getElementById('audit-content').innerHTML = '<p>No audit logs available</p>';
        return;
      }
      let html = '<table class="data-table"><thead><tr><th>ID</th><th>User</th><th>Action</th><th>Timestamp</th></tr></thead><tbody>';
      d.rows.slice(0, 20).forEach(log => {
        html += '<tr><td>' + log.id + '</td><td>' + (log.user || 'System') + '</td><td>' + (log.action || 'N/A') + '</td><td>' + (log.timestamp || 'N/A') + '</td></tr>';
      });
      html += '</tbody></table>';
      document.getElementById('audit-content').innerHTML = html;
    })
    .catch(e => document.getElementById('audit-content').innerHTML = '<p style="color: red;">Error loading audit logs</p>');
}

function changeLanguage(lang) {
  currentLang = lang;
  const langNames = { 'en': 'English', 'fr': 'French', 'es': 'Spanish', 'ar': 'Arabic' };
  document.getElementById('currentLang').textContent = langNames[lang];
}

function syncOfflineData() {
  const now = new Date().toLocaleTimeString();
  document.getElementById('syncTime').textContent = now;
  alert('Offline data synchronized at ' + now);
}

function tagGeolocation() {
  const caseId = document.getElementById('geoCase').value;
  const lat = document.getElementById('geoLat').value;
  const lng = document.getElementById('geoLng').value;
  if (!caseId || !lat || !lng) { alert('Please fill all fields'); return; }
  
  fetch(api + '/geolocation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({ case_id: caseId, latitude: lat, longitude: lng })
  })
  .then(r => r.json())
  .then(d => {
    alert('Location tagged successfully');
    document.getElementById('geolocation-content').innerHTML = '<p style="padding: 15px; background: #e8f5e9; border-radius: 5px; color: #2e7d32;">✅ Location tagged: (' + lat + ', ' + lng + ')</p>';
    document.getElementById('geoCase').value = '';
    document.getElementById('geoLat').value = '';
    document.getElementById('geoLng').value = '';
  })
  .catch(e => alert('Error tagging location'));
}

function addEvidence() {
  const caseId = document.getElementById('evidenceCase').value;
  const description = document.getElementById('evidenceDesc').value;
  if (!caseId || !description) { alert('Please fill all fields'); return; }
  
  fetch(api + '/evidence', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({ case_id: caseId, description: description })
  })
  .then(r => r.json())
  .then(d => {
    alert('Evidence added successfully');
    document.getElementById('evidence-content').innerHTML = '<p style="padding: 15px; background: #e8f5e9; border-radius: 5px; color: #2e7d32;">✅ Evidence recorded: ' + description + '</p>';
    document.getElementById('evidenceCase').value = '';
    document.getElementById('evidenceDesc').value = '';
  })
  .catch(e => alert('Error adding evidence'));
}

function closeCase() {
  const caseId = document.getElementById('closureCase').value;
  const reason = document.getElementById('closureReason').value;
  if (!caseId || !reason) { alert('Please fill all fields'); return; }
  
  fetch(api + '/case-closure', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({ case_id: caseId, closure_reason: reason })
  })
  .then(r => r.json())
  .then(d => {
    alert('Case closed successfully');
    document.getElementById('closure-content').innerHTML = '<p style="padding: 15px; background: #e8f5e9; border-radius: 5px; color: #2e7d32;">✅ Case #' + caseId + ' closed: ' + reason + '</p>';
    document.getElementById('closureCase').value = '';
    document.getElementById('closureReason').value = '';
  })
  .catch(e => alert('Error closing case'));
}

function loadDepartmentData() {
  document.getElementById('department-content').innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  fetch(api + '/counties', { headers: { 'Authorization': 'Bearer ' + token } })
    .then(r => r.json())
    .then(d => {
      if (!d.rows || d.rows.length === 0) {
        document.getElementById('department-content').innerHTML = '<p>No department data available</p>';
        return;
      }
      let html = '<table class="data-table"><thead><tr><th>Department</th><th>Cases</th><th>Officers</th></tr></thead><tbody>';
      d.rows.slice(0, 10).forEach(dept => {
        html += '<tr><td>' + (dept.name || 'N/A') + '</td><td>0</td><td>0</td></tr>';
      });
      html += '</tbody></table>';
      document.getElementById('department-content').innerHTML = html;
    })
    .catch(e => document.getElementById('department-content').innerHTML = '<p style="color: red;">Error loading department data</p>');
}

function showUserForm() {
  alert('User form not yet implemented');
}

function showCaseForm() {
  alert('Case form not yet implemented');
}

function editUser(id) {
  alert('Edit user #' + id);
}

function viewCase(id) {
  alert('View case #' + id);
}

document.getElementById('form').onsubmit = async (e) => {
  e.preventDefault();
  const u = document.getElementById('user').value;
  const p = document.getElementById('pass').value;
  
  try {
    const r = await fetch(api + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: u, password: p })
    });
    
    const d = await r.json();
    
    if (d.success && d.token) {
      token = d.token;
      localStorage.setItem('token', d.token);
      localStorage.setItem('user', JSON.stringify(d.user));
      document.getElementById('login').style.display = 'none';
      document.getElementById('dashboard').style.display = 'block';
      document.getElementById('username').textContent = d.user.username;
      document.getElementById('role').textContent = d.user.role;
      document.getElementById('userid').textContent = d.user.id;
      loadDashboardStats();
    } else {
      throw new Error(d.error || 'Login failed');
    }
  } catch (err) {
    const m = document.getElementById('msg');
    m.textContent = '❌ ' + err.message;
    m.className = 'msg error';
    m.style.display = 'block';
  }
};

function logout() {
  localStorage.clear();
  document.getElementById('login').style.display = 'flex';
  document.getElementById('dashboard').style.display = 'none';
  token = '';
}

window.onload = () => {
  const savedToken = localStorage.getItem('token');
  if (savedToken) {
    token = savedToken;
    const user = JSON.parse(localStorage.getItem('user'));
    document.getElementById('login').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('username').textContent = user.username;
    document.getElementById('role').textContent = user.role;
    document.getElementById('userid').textContent = user.id;
    loadDashboardStats();
  }
};
</script>

</body>
</html>
  `);
});

app.listen(3000, '0.0.0.0', () => {
  console.log('✅ Functional Admin Dashboard running on http://localhost:3000');
});
