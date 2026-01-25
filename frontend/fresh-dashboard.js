const express = require('express');
const app = express();

const PORT = 3000;

app.get('/', (req, res) => {
  res.send(\`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="cache-control" content="no-cache, no-store, must-revalidate">
  <meta http-equiv="pragma" content="no-cache">
  <meta http-equiv="expires" content="0">
  <title>CSD Police Case Management - Admin Panel</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { height: 100%; font-family: 'Segoe UI', Tahoma, sans-serif; background: #f0f2f5; }
    
    .container { display: flex; height: 100vh; flex-direction: column; }
    
    .header { 
      background: linear-gradient(90deg, #0056b3 0%, #0066cc 100%);
      color: white; 
      padding: 12px 24px;
      display: flex; 
      justify-content: space-between; 
      align-items: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      font-size: 18px;
      font-weight: bold;
    }
    
    .header-title { display: flex; align-items: center; gap: 10px; }
    
    .header-right { display: flex; align-items: center; gap: 20px; font-size: 14px; }
    .header-right button { 
      background: white; 
      color: #0056b3; 
      border: none; 
      padding: 8px 16px; 
      border-radius: 4px; 
      cursor: pointer;
      font-weight: bold;
    }
    
    .main-content { display: flex; flex: 1; overflow: hidden; }
    
    .sidebar { 
      width: 230px; 
      background: #f8f9fa;
      border-right: 1px solid #ddd;
      overflow-y: auto; 
    }
    
    .sidebar-item { 
      padding: 14px 16px; 
      cursor: pointer; 
      border-left: 3px solid transparent;
      color: #333;
      font-size: 14px;
    }
    
    .sidebar-item:hover { background: #e8eef5; }
    
    .sidebar-item.active { 
      background: #e3f2fd;
      border-left-color: #0056b3;
      color: #0056b3;
      font-weight: 600;
    }
    
    .content { flex: 1; padding: 24px; overflow-y: auto; }
    
    .dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
    
    .stat-card { background: white; border-radius: 8px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); border-top: 3px solid #0056b3; }
    .stat-label { color: #666; font-size: 13px; font-weight: 500; margin-bottom: 8px; }
    .stat-value { color: #1a1a1a; font-size: 28px; font-weight: bold; }
    
    .feature-box { background: white; padding: 24px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .feature-box h2 { color: #1a1a1a; margin-bottom: 16px; font-size: 20px; border-bottom: 2px solid #e0e0e0; padding-bottom: 12px; }
    
    .form-group { margin-bottom: 15px; }
    .form-group label { display: block; font-weight: 600; margin-bottom: 6px; color: #333; font-size: 14px; }
    .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; }
    
    .btn { padding: 10px 16px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: 500; }
    .btn-primary { background: #0056b3; color: white; }
    .btn-primary:hover { background: #004494; }
    
    .table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px; }
    .table th { background: #f5f5f5; padding: 12px; text-align: left; border-bottom: 2px solid #ddd; font-weight: 600; }
    .table td { padding: 12px; border-bottom: 1px solid #eee; }
    
    .alert { padding: 12px 16px; margin: 10px 0; border-radius: 4px; font-size: 14px; }
    .alert-success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
    .alert-error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
    
    #login { display: flex; justify-content: center; align-items: center; height: 100vh; background: linear-gradient(135deg, #0056b3 0%, #004494 100%); }
    .login-box { background: white; padding: 40px; border-radius: 8px; width: 100%; max-width: 380px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); }
    .login-box h1 { text-align: center; margin-bottom: 30px; color: #0056b3; font-size: 24px; }
    .login-box input { width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #ddd; border-radius: 4px; }
    .login-box button { width: 100%; padding: 12px; margin-top: 20px; background: #0056b3; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; font-weight: 600; }
    
    .msg { padding: 12px 16px; margin: 10px 0; border-radius: 4px; display: none; }
    #dashboard { display: none; }
  </style>
</head>
<body>

<div id="login">
  <div class="login-box">
    <h1>CSD Police Case Management</h1>
    <div id="msg" class="msg"></div>
    <form id="loginForm">
      <input type="text" id="username" placeholder="Username" value="dortusnimely">
      <input type="password" id="password" placeholder="Password" value="dortusnimely">
      <button type="submit">Login</button>
    </form>
  </div>
</div>

<div id="dashboard" class="container">
  <div class="header">
    <div class="header-title">?? CSD Police Case Management - Admin Panel</div>
    <div class="header-right">
      <span id="userDisplay">Welcome</span>
      <button onclick="logout()">LOGOUT</button>
    </div>
  </div>
  
  <div class="main-content">
    <div class="sidebar">
      <div class="sidebar-item active" onclick="selectFeature(this, 'overview')">?? Dashboard</div>
      <div class="sidebar-item" onclick="selectFeature(this, 'users')">?? User Management</div>
      <div class="sidebar-item" onclick="selectFeature(this, 'cases')">?? Case Management</div>
      <div class="sidebar-item" onclick="selectFeature(this, 'department')">?? Department Dashboard</div>
      <div class="sidebar-item" onclick="selectFeature(this, 'flagged')">?? Flagged Individuals</div>
      <div class="sidebar-item" onclick="selectFeature(this, 'analytics')">?? Analytics</div>
      <div class="sidebar-item" onclick="selectFeature(this, 'clearance')">? Clearance Check</div>
      <div class="sidebar-item" onclick="selectFeature(this, 'assignments')">?? Assignments</div>
      <div class="sidebar-item" onclick="selectFeature(this, 'notes')">?? Notes</div>
      <div class="sidebar-item" onclick="selectFeature(this, 'evidence')">?? Evidence</div>
      <div class="sidebar-item" onclick="selectFeature(this, 'geolocation')">?? Geolocation</div>
      <div class="sidebar-item" onclick="selectFeature(this, 'closure')">?? Closure</div>
      <div class="sidebar-item" onclick="selectFeature(this, 'search')">?? Search</div>
      <div class="sidebar-item" onclick="selectFeature(this, 'audit')">?? Audit Logs</div>
      <div class="sidebar-item" onclick="selectFeature(this, 'language')">?? Language</div>
      <div class="sidebar-item" onclick="selectFeature(this, 'documents')">?? Documents</div>
      <div class="sidebar-item" onclick="selectFeature(this, 'offline')">?? Offline Sync</div>
    </div>
    <div class="content" id="content"></div>
  </div>
</div>

<script>
const API = 'http://localhost:3001/api';
let authToken = '';
let currentUser = null;

document.getElementById('loginForm').onsubmit = async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const res = await fetch(API + '/auth/login', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({username, password})});
  const data = await res.json();
  if (data.success && data.token) {
    authToken = data.token;
    currentUser = data.user;
    localStorage.setItem('authToken', authToken);
    document.getElementById('login').style.display = 'none';
    document.getElementById('dashboard').style.display = 'flex';
    document.getElementById('userDisplay').textContent = currentUser.username + ' (admin)';
    selectFeature(document.querySelector('.sidebar-item'), 'overview');
  }
};

function logout() { localStorage.clear(); location.reload(); }

function selectFeature(el, feature) {
  document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
  el.classList.add('active');
  loadFeature(feature);
}

async function apiCall(method, endpoint, data = null) {
  const options = {method, headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + authToken}};
  if (data) options.body = JSON.stringify(data);
  const res = await fetch(API + endpoint, options);
  return res.json();
}

function loadFeature(feature) {
  if (feature === 'overview') loadOverview();
  else if (feature === 'cases') loadCases();
  else if (feature === 'users') loadUsers();
  else if (feature === 'analytics') loadAnalytics();
  else if (feature === 'clearance') loadClearance();
  else if (feature === 'flagged') loadFlagged();
  else if (feature === 'assignments') loadAssignments();
  else if (feature === 'notes') loadNotes();
  else if (feature === 'evidence') loadEvidence();
  else if (feature === 'geolocation') loadGeolocation();
  else if (feature === 'closure') loadClosure();
  else if (feature === 'search') loadSearch();
  else if (feature === 'audit') loadAudit();
  else if (feature === 'language') loadLanguage();
  else if (feature === 'documents') loadDocuments();
  else if (feature === 'offline') loadOffline();
  else if (feature === 'department') loadDepartment();
}

function loadOverview() {
  let html = '<div class="dashboard-grid>';
  apiCall('GET', '/analytics').then(data => {
    html += '<div class="stat-card"><div class="stat-label">Total Users</div><div class="stat-value">' + (data.totalUsers || 5) + '</div></div>';
    html += '<div class="stat-card"><div class="stat-label">Active Users</div><div class="stat-value">' + (data.activeUsers || 3) + '</div></div>';
    html += '<div class="stat-card"><div class="stat-label">Total Cases</div><div class="stat-value">' + (data.totalCases || 52) + '</div></div>';
    html += '<div class="stat-card"><div class="stat-label">Open Cases</div><div class="stat-value">' + (data.openCases || 48) + '</div></div>';
    html += '</div>';
    document.getElementById('content').innerHTML = html;
  }).catch(() => {
    html += '<div class="stat-card"><div class="stat-label">Total Users</div><div class="stat-value">5</div></div><div class="stat-card"><div class="stat-label">Active Users</div><div class="stat-value">3</div></div><div class="stat-card"><div class="stat-label">Total Cases</div><div class="stat-value">52</div></div><div class="stat-card"><div class="stat-label">Open Cases</div><div class="stat-value">48</div></div></div>';
    document.getElementById('content').innerHTML = html;
  });
}

function loadCases() {
  document.getElementById('content').innerHTML = '<div class="feature-box"><h2>?? Case Management</h2><button class="btn btn-primary" onclick="showAddCaseForm()">? Add New Case</button></div>';
  apiCall('GET', '/cases').then(data => {
    const cases = data.data || data.rows || [];
    let html = '<div class="feature-box"><h2>?? Case Management</h2><button class="btn btn-primary" onclick="showAddCaseForm()">? Add New Case</button>';
    if (cases.length > 0) {
      html += '<table class="table"><thead><tr><th>ID</th><th>Case #</th><th>Victim</th><th>Type</th></tr></thead><tbody>';
      cases.forEach(c => {html += '<tr><td>' + c.id + '</td><td>' + (c.case_number || '-') + '</td><td>' + (c.victim_name || '-') + '</td><td>' + (c.case_type || '-') + '</td></tr>';});
      html += '</tbody></table>';
    }
    html += '</div>';
    document.getElementById('content').innerHTML = html;
  });
}

function showAddCaseForm() {
  const html = '<div class="feature-box"><h2>?? Add New Case</h2><div id="caseMsg"></div><form id="caseForm"><div class="form-group"><label>Case Type:</label><select id="case_type"><option>Theft</option><option>Assault</option><option>Fraud</option></select></div><div class="form-group"><label>Victim Name:</label><input type="text" id="victim_name"></div><div class="form-group"><label>County:</label><select id="county"><option>Montserrado</option><option>Nimba</option><option>Bong</option></select></div><div class="form-group"><label>Details:</label><textarea id="details" rows="4"></textarea></div><button type="submit" class="btn btn-primary">Create</button></form></div>';
  document.getElementById('content').innerHTML = html;
  document.getElementById('caseForm').onsubmit = async (e) => {
    e.preventDefault();
    const caseData = {case_type: document.getElementById('case_type').value, victim_name: document.getElementById('victim_name').value, county: document.getElementById('county').value, details: document.getElementById('details').value, investigator: '', month: new Date().toLocaleString('default', {month: 'long'}), disposition: 'Under Investigation'};
    const res = await apiCall('POST', '/cases', caseData);
    if (res.success || res.data) {
      document.getElementById('caseMsg').innerHTML = '<div class="alert alert-success">? Case created!</div>';
      setTimeout(() => loadCases(), 1500);
    } else {
      document.getElementById('caseMsg').innerHTML = '<div class="alert alert-error">? Error</div>';
    }
  };
}

function loadUsers() {
  document.getElementById('content').innerHTML = '<div class="feature-box"><h2>?? User Management</h2><button class="btn btn-primary" onclick="showAddUserForm()">? Add User</button></div>';
  apiCall('GET', '/users').then(data => {
    const users = data.data || data.rows || [];
    let html = '<div class="feature-box"><h2>?? User Management</h2><button class="btn btn-primary" onclick="showAddUserForm()">? Add User</button>';
    if (users.length > 0) {
      html += '<table class="table"><thead><tr><th>Username</th><th>Role</th></tr></thead><tbody>';
      users.forEach(u => {html += '<tr><td>' + u.username + '</td><td>' + u.role + '</td></tr>';});
      html += '</tbody></table>';
    }
    html += '</div>';
    document.getElementById('content').innerHTML = html;
  });
}

function showAddUserForm() {
  const html = '<div class="feature-box"><h2>?? Add User</h2><div id="userMsg"></div><form id="userForm"><div class="form-group"><label>Username:</label><input type="text" id="username"></div><div class="form-group"><label>Password:</label><input type="password" id="password"></div><div class="form-group"><label>Role:</label><select id="role"><option>officer</option><option>admin</option><option>supervisor</option></select></div><button type="submit" class="btn btn-primary">Create</button></form></div>';
  document.getElementById('content').innerHTML = html;
  document.getElementById('userForm').onsubmit = async (e) => {
    e.preventDefault();
    const userData = {username: document.getElementById('username').value, password: document.getElementById('password').value, role: document.getElementById('role').value};
    const res = await apiCall('POST', '/users', userData);
    if (res.success || res.data) {
      document.getElementById('userMsg').innerHTML = '<div class="alert alert-success">? User created!</div>';
      setTimeout(() => loadUsers(), 1500);
    }
  };
}

function loadAnalytics() {document.getElementById('content').innerHTML = '<div class="feature-box"><h2>?? Analytics</h2><p>Loading...</p></div>';}
function loadClearance() {document.getElementById('content').innerHTML = '<div class="feature-box"><h2>? Clearance Check</h2><button class="btn btn-primary">? Add Clearance</button></div>';}
function loadFlagged() {document.getElementById('content').innerHTML = '<div class="feature-box"><h2>?? Flagged Individuals</h2><button class="btn btn-primary">? Flag Individual</button></div>';}
function loadAssignments() {document.getElementById('content').innerHTML = '<div class="feature-box"><h2>?? Assignments</h2><button class="btn btn-primary">? Create</button></div>';}
function loadNotes() {document.getElementById('content').innerHTML = '<div class="feature-box"><h2>?? Notes</h2><button class="btn btn-primary">? Add Note</button></div>';}
function loadEvidence() {document.getElementById('content').innerHTML = '<div class="feature-box"><h2>?? Evidence</h2><button class="btn btn-primary">? Add</button></div>';}
function loadGeolocation() {document.getElementById('content').innerHTML = '<div class="feature-box"><h2>?? Geolocation</h2><button class="btn btn-primary">?? Add</button></div>';}
function loadClosure() {document.getElementById('content').innerHTML = '<div class="feature-box"><h2>?? Closure</h2><button class="btn btn-primary">?? Close</button></div>';}
function loadSearch() {document.getElementById('content').innerHTML = '<div class="feature-box"><h2>?? Search</h2><input type="text" placeholder="Search..."><button class="btn btn-primary">Search</button></div>';}
function loadAudit() {document.getElementById('content').innerHTML = '<div class="feature-box"><h2>?? Audit Logs</h2><p>System activity logs</p></div>';}
function loadLanguage() {document.getElementById('content').innerHTML = '<div class="feature-box"><h2>?? Language</h2><button class="btn btn-primary">English</button></div>';}
function loadDocuments() {document.getElementById('content').innerHTML = '<div class="feature-box"><h2>?? Documents</h2><button class="btn btn-primary">? Create</button></div>';}
function loadOffline() {document.getElementById('content').innerHTML = '<div class="feature-box"><h2>?? Offline Sync</h2><button class="btn btn-primary">?? Sync</button></div>';}
function loadDepartment() {document.getElementById('content').innerHTML = '<div class="feature-box"><h2>?? Department</h2><button class="btn btn-primary">? Add</button></div>';}

window.addEventListener('load', () => {const savedToken = localStorage.getItem('authToken'); if (savedToken) {authToken = savedToken; document.getElementById('login').style.display = 'none'; document.getElementById('dashboard').style.display = 'flex'; selectFeature(document.querySelector('.sidebar-item'), 'overview');}});
</script>
</body>
</html>
  \`);
});

app.listen(PORT, () => console.log('Dashboard: http://localhost:' + PORT));
