const express = require('express');
const app = express();

const PORT = 3000;

app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LNPMS - Admin Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { height: 100%; font-family: 'Segoe UI', Tahoma, sans-serif; background: #f5f5f5; }
    .container { display: flex; height: 100vh; }
    .sidebar { width: 250px; background: #1a237e; color: white; overflow-y: auto; padding: 20px 0; }
    .sidebar-item { padding: 15px 20px; cursor: pointer; border-left: 3px solid transparent; transition: all 0.3s; }
    .sidebar-item:hover { background: #283593; border-left-color: #5c6bc0; }
    .sidebar-item.active { background: #283593; border-left-color: #5c6bc0; font-weight: bold; }
    .main { flex: 1; display: flex; flex-direction: column; }
    .navbar { background: #1a237e; color: white; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; }
    .content { flex: 1; padding: 20px; overflow-y: auto; }
    .feature-box { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .feature-box h2 { color: #1a237e; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #5c6bc0; }
    .form-group { margin-bottom: 15px; }
    .form-group label { display: block; font-weight: bold; margin-bottom: 5px; }
    .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px; }
    .btn { padding: 10px 16px; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; }
    .btn-primary { background: #5c6bc0; color: white; }
    .btn-primary:hover { background: #3f51b5; }
    .btn-secondary { background: #f0f0f0; color: #333; }
    .table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    .table th { background: #f5f5f5; padding: 12px; text-align: left; border-bottom: 2px solid #ddd; font-weight: bold; }
    .table td { padding: 12px; border-bottom: 1px solid #ddd; }
    .table tr:hover { background: #f9f9f9; }
    .status-open { background: #ff9800; color: white; padding: 4px 8px; border-radius: 3px; }
    .status-active { background: #2196f3; color: white; padding: 4px 8px; border-radius: 3px; }
    .status-closed { background: #4caf50; color: white; padding: 4px 8px; border-radius: 3px; }
    .priority-critical { background: #d32f2f; color: white; padding: 4px 8px; border-radius: 3px; }
    .priority-high { background: #ff6f00; color: white; padding: 4px 8px; border-radius: 3px; }
    .priority-medium { background: #fbc02d; color: white; padding: 4px 8px; border-radius: 3px; }
    .priority-low { background: #8bc34a; color: white; padding: 4px 8px; border-radius: 3px; }
    .alert { padding: 12px; margin: 10px 0; border-radius: 5px; }
    .alert-success { background: #e8f5e9; color: #2e7d32; border: 1px solid #2e7d32; }
    .alert-error { background: #ffebee; color: #c62828; border: 1px solid #c62828; }
    .alert-info { background: #e3f2fd; color: #1565c0; border: 1px solid #1565c0; }
    .loading { text-align: center; padding: 40px; }
    .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #5c6bc0; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    #login { display: flex; justify-content: center; align-items: center; height: 100vh; background: linear-gradient(135deg, #5c6bc0 0%, #1a237e 100%); }
    .login-box { background: white; padding: 40px; border-radius: 10px; width: 100%; max-width: 400px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
    .login-box h1 { text-align: center; margin-bottom: 30px; color: #1a237e; }
    .login-box input { width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #ddd; border-radius: 5px; }
    .login-box button { width: 100%; padding: 12px; margin-top: 20px; background: #5c6bc0; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; }
    .login-box button:hover { background: #3f51b5; }
    .msg { padding: 12px; margin: 10px 0; border-radius: 5px; display: none; }
    #dashboard { display: none; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    button[onclick] { cursor: pointer; }
  </style>
</head>
<body>

<div id="login" class="login-box">
  <h1>LNPMS Admin</h1>
  <div id="msg" class="msg"></div>
  <form id="loginForm">
    <input type="text" id="username" placeholder="Username" value="dortusnimely" required>
    <input type="password" id="password" placeholder="Password" value="dortusnimely" required>
    <button type="submit">Login</button>
  </form>
</div>

<div id="dashboard" class="container">
  <div class="sidebar">
    <div class="sidebar-item active" onclick="selectFeature(this, 'overview')">📊 Overview</div>
    <div class="sidebar-item" onclick="selectFeature(this, 'cases')">📁 Cases</div>
    <div class="sidebar-item" onclick="selectFeature(this, 'users')">👥 Users</div>
    <div class="sidebar-item" onclick="selectFeature(this, 'analytics')">📈 Analytics</div>
    <div class="sidebar-item" onclick="selectFeature(this, 'clearance')">✅ Clearance</div>
    <div class="sidebar-item" onclick="selectFeature(this, 'flagged')">⚠️ Flagged</div>
    <div class="sidebar-item" onclick="selectFeature(this, 'assignments')">📋 Assignments</div>
    <div class="sidebar-item" onclick="selectFeature(this, 'notes')">📝 Notes</div>
    <div class="sidebar-item" onclick="selectFeature(this, 'evidence')">🔬 Evidence</div>
    <div class="sidebar-item" onclick="selectFeature(this, 'geolocation')">📍 Geolocation</div>
    <div class="sidebar-item" onclick="selectFeature(this, 'closure')">✔️ Closure</div>
    <div class="sidebar-item" onclick="selectFeature(this, 'search')">🔍 Search</div>
    <div class="sidebar-item" onclick="selectFeature(this, 'audit')">📊 Audit</div>
    <div class="sidebar-item" onclick="selectFeature(this, 'language')">🌐 Language</div>
    <div class="sidebar-item" onclick="selectFeature(this, 'documents')">📄 Documents</div>
    <div class="sidebar-item" onclick="selectFeature(this, 'offline')">📶 Offline</div>
    <div class="sidebar-item" onclick="selectFeature(this, 'department')">🏢 Department</div>
  </div>
  <div class="main">
    <div class="navbar">
      <h1>LNPMS Dashboard</h1>
      <div>
        <span id="userDisplay">Welcome</span>
        <button class="btn btn-secondary" onclick="logout()">Logout</button>
      </div>
    </div>
    <div class="content" id="content"></div>
  </div>
</div>

<script>
const API = 'http://localhost:3001/api';
let authToken = '';
let currentUser = null;

// LOGIN HANDLER
document.getElementById('loginForm').onsubmit = async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const res = await fetch(API + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    const data = await res.json();
    
    if (data.success && data.token) {
      authToken = data.token;
      currentUser = data.user;
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      document.getElementById('login').style.display = 'none';
      document.getElementById('dashboard').style.display = 'flex';
      document.getElementById('userDisplay').textContent = 'Welcome, ' + currentUser.username;
      selectFeature(document.querySelector('.sidebar-item'), 'overview');
    } else {
      showMsg('Login failed: ' + (data.error || 'Unknown error'), 'error');
    }
  } catch (err) {
    showMsg('Error: ' + err.message, 'error');
  }
};

function showMsg(text, type) {
  const msg = document.getElementById('msg');
  msg.textContent = text;
  msg.className = 'msg alert-' + type;
  msg.style.display = 'block';
  setTimeout(() => msg.style.display = 'none', 5000);
}

function logout() {
  localStorage.clear();
  authToken = '';
  currentUser = null;
  location.reload();
}

// FEATURE SELECTION
function selectFeature(el, feature) {
  document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
  el.classList.add('active');
  loadFeature(feature);
}

async function loadFeature(feature) {
  const content = document.getElementById('content');
  
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

// API CALL HELPER
async function apiCall(method, endpoint, data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + authToken
    }
  };
  
  if (data) options.body = JSON.stringify(data);
  
  const res = await fetch(API + endpoint, options);
  return res.json();
}

function loadOverview() {
  document.getElementById('content').innerHTML = \`
    <div class="feature-box">
      <h2>📊 Dashboard Overview</h2>
      <p>Welcome, \${currentUser.username}</p>
      <p>Token: \${authToken.substring(0, 20)}...</p>
    </div>
  \`;
}

function loadCases() {
  document.getElementById('content').innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  apiCall('GET', '/cases').then(data => {
    const cases = data.data || data.rows || [];
    let html = '<div class="feature-box"><h2>📁 Cases</h2>';
    html += '<div style="margin-bottom: 20px;">';
    html += '<button class="btn btn-primary" onclick="showAddCaseForm()">➕ Add New Case</button>';
    html += '<button class="btn btn-secondary" style="margin-left: 10px;" onclick="loadCases()">🔄 Refresh</button>';
    html += '</div>';
    if (cases.length === 0) {
      html += '<p>No cases found</p>';
    } else {
      html += '<table class="table"><thead><tr><th>ID</th><th>Case #</th><th>Victim</th><th>Type</th><th>Status</th></tr></thead><tbody>';
      cases.forEach(c => {
        const statusClass = 'status-' + (c.status || 'open');
        html += '<tr><td>' + c.id + '</td><td>' + (c.case_number || '-') + '</td><td>' + (c.victim_name || '-') + '</td><td>' + (c.case_type || '-') + '</td><td><span class="' + statusClass + '">' + (c.status || 'open') + '</span></td></tr>';
      });
      html += '</tbody></table>';
    }
    html += '</div>';
    document.getElementById('content').innerHTML = html;
  }).catch(err => {
    document.getElementById('content').innerHTML = '<div class="feature-box"><div class="alert alert-error">Error: ' + err.message + '</div></div>';
  });
}

function showAddCaseForm() {
  const html = `
    <div class="feature-box">
      <h2>📁 Add New Case</h2>
      <div id="addCaseMsg"></div>
      <form id="addCaseForm" style="max-width: 600px;">
        <div class="form-group">
          <label>Case Type:</label>
          <select id="case_type" required>
            <option value="">-- Select Type --</option>
            <option value="Theft">Theft</option>
            <option value="Assault">Assault</option>
            <option value="Fraud">Fraud</option>
            <option value="Vandalism">Vandalism</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div class="form-group">
          <label>Victim Name:</label>
          <input type="text" id="victim_name" placeholder="Victim name" required>
        </div>
        <div class="form-group">
          <label>County:</label>
          <select id="county" required>
            <option value="">-- Select County --</option>
            <option value="Montserrado">Montserrado</option>
            <option value="Nimba">Nimba</option>
            <option value="Bong">Bong</option>
            <option value="Grand Cape Mount">Grand Cape Mount</option>
            <option value="River Gee">River Gee</option>
            <option value="Sinoe">Sinoe</option>
            <option value="Margibi">Margibi</option>
            <option value="Lofa">Lofa</option>
            <option value="Gbarpolu">Gbarpolu</option>
            <option value="Grand Gedeh">Grand Gedeh</option>
          </select>
        </div>
        <div class="form-group">
          <label>Details:</label>
          <textarea id="details" placeholder="Case details" rows="4" required></textarea>
        </div>
        <div class="form-group">
          <label>Investigator:</label>
          <input type="text" id="investigator" placeholder="Officer name">
        </div>
        <div style="margin-top: 20px;">
          <button type="submit" class="btn btn-primary">✅ Create Case</button>
          <button type="button" class="btn btn-secondary" style="margin-left: 10px;" onclick="loadCases()">❌ Cancel</button>
        </div>
      </form>
    </div>
  `;
  
  document.getElementById('content').innerHTML = html;
  
  document.getElementById('addCaseForm').onsubmit = async (e) => {
    e.preventDefault();
    
    const caseData = {
      case_type: document.getElementById('case_type').value,
      victim_name: document.getElementById('victim_name').value,
      county: document.getElementById('county').value,
      details: document.getElementById('details').value,
      investigator: document.getElementById('investigator').value,
      month: new Date().toLocaleString('default', { month: 'long' }),
      disposition: 'Under Investigation'
    };
    
    try {
      const res = await apiCall('POST', '/cases', caseData);
      const msgEl = document.getElementById('addCaseMsg');
      
      if (res.success || res.data) {
        msgEl.className = 'alert alert-success';
        msgEl.textContent = '✅ Case created successfully!';
        msgEl.style.display = 'block';
        
        setTimeout(() => {
          loadCases();
        }, 1500);
      } else {
        msgEl.className = 'alert alert-error';
        msgEl.textContent = '❌ Error: ' + (res.error || 'Failed to create case');
        msgEl.style.display = 'block';
      }
    } catch (err) {
      const msgEl = document.getElementById('addCaseMsg');
      msgEl.className = 'alert alert-error';
      msgEl.textContent = '❌ Error: ' + err.message;
      msgEl.style.display = 'block';
    }
  };
}

function loadUsers() {
  document.getElementById('content').innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  apiCall('GET', '/users').then(data => {
    const users = data.data || data.rows || [];
    let html = '<div class="feature-box"><h2>👥 Users</h2>';
    html += '<div style="margin-bottom: 20px;">';
    html += '<button class="btn btn-primary" onclick="showAddUserForm()">➕ Add New User</button>';
    html += '<button class="btn btn-secondary" style="margin-left: 10px;" onclick="loadUsers()">🔄 Refresh</button>';
    html += '</div>';
    if (users.length === 0) {
      html += '<p>No users found</p>';
    } else {
      html += '<table class="table"><thead><tr><th>ID</th><th>Username</th><th>Role</th><th>Email</th><th>Status</th></tr></thead><tbody>';
      users.forEach(u => {
        html += '<tr><td>' + u.id + '</td><td>' + u.username + '</td><td>' + u.role + '</td><td>' + (u.email || '-') + '</td><td>' + (u.status || 'active') + '</td></tr>';
      });
      html += '</tbody></table>';
    }
    html += '</div>';
    document.getElementById('content').innerHTML = html;
  }).catch(err => {
    document.getElementById('content').innerHTML = '<div class="feature-box"><div class="alert alert-error">Error: ' + err.message + '</div></div>';
  });
}

function showAddUserForm() {
  const html = `
    <div class="feature-box">
      <h2>👥 Add New User</h2>
      <div id="addUserMsg"></div>
      <form id="addUserForm" style="max-width: 600px;">
        <div class="form-group">
          <label>Username:</label>
          <input type="text" id="username" placeholder="Username" required>
        </div>
        <div class="form-group">
          <label>Password:</label>
          <input type="password" id="password" placeholder="Password" required>
        </div>
        <div class="form-group">
          <label>First Name:</label>
          <input type="text" id="first_name" placeholder="First name">
        </div>
        <div class="form-group">
          <label>Last Name:</label>
          <input type="text" id="last_name" placeholder="Last name">
        </div>
        <div class="form-group">
          <label>Email:</label>
          <input type="email" id="email" placeholder="Email address">
        </div>
        <div class="form-group">
          <label>Role:</label>
          <select id="role" required>
            <option value="officer">Officer</option>
            <option value="admin">Admin</option>
            <option value="supervisor">Supervisor</option>
          </select>
        </div>
        <div style="margin-top: 20px;">
          <button type="submit" class="btn btn-primary">✅ Create User</button>
          <button type="button" class="btn btn-secondary" style="margin-left: 10px;" onclick="loadUsers()">❌ Cancel</button>
        </div>
      </form>
    </div>
  `;
  
  document.getElementById('content').innerHTML = html;
  
  document.getElementById('addUserForm').onsubmit = async (e) => {
    e.preventDefault();
    
    const userData = {
      username: document.getElementById('username').value,
      password: document.getElementById('password').value,
      first_name: document.getElementById('first_name').value,
      last_name: document.getElementById('last_name').value,
      email: document.getElementById('email').value,
      role: document.getElementById('role').value
    };
    
    try {
      const res = await apiCall('POST', '/users', userData);
      const msgEl = document.getElementById('addUserMsg');
      
      if (res.success || res.data) {
        msgEl.className = 'alert alert-success';
        msgEl.textContent = '✅ User created successfully!';
        msgEl.style.display = 'block';
        
        setTimeout(() => {
          loadUsers();
        }, 1500);
      } else {
        msgEl.className = 'alert alert-error';
        msgEl.textContent = '❌ Error: ' + (res.error || 'Failed to create user');
        msgEl.style.display = 'block';
      }
    } catch (err) {
      const msgEl = document.getElementById('addUserMsg');
      msgEl.className = 'alert alert-error';
      msgEl.textContent = '❌ Error: ' + err.message;
      msgEl.style.display = 'block';
    }
  };
}

function loadAnalytics() {
  document.getElementById('content').innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  apiCall('GET', '/analytics').then(data => {
    let html = '<div class="feature-box"><h2>📈 Analytics</h2>';
    html += '<p>Total Cases: ' + (data.totalCases || 0) + '</p>';
    html += '<p>Solved: ' + (data.solved || 0) + '</p>';
    html += '<p>Pending: ' + (data.pending || 0) + '</p>';
    html += '</div>';
    document.getElementById('content').innerHTML = html;
  }).catch(err => {
    document.getElementById('content').innerHTML = '<div class="feature-box"><div class="alert alert-error">Error: ' + err.message + '</div></div>';
  });
}

function loadClearance() {
  const html = `
    <div class="feature-box">
      <h2>✅ Police Clearance Check</h2>
      <div style="margin-bottom: 20px;">
        <button class="btn btn-primary" onclick="showAddClearanceForm()">➕ Add Clearance Record</button>
      </div>
      <div id="clearanceContent"></div>
    </div>
  `;
  
  document.getElementById('content').innerHTML = html;
  loadClearanceList();
}

function loadClearanceList() {
  apiCall('GET', '/clearance').then(data => {
    const records = data.data || data.rows || [];
    let html = '';
    
    if (records.length === 0) {
      html += '<p>No clearance records found</p>';
    } else {
      html += '<table class="table"><thead><tr><th>ID</th><th>Subject Name</th><th>Status</th><th>Date</th></tr></thead><tbody>';
      records.forEach(r => {
        html += '<tr><td>' + r.id + '</td><td>' + (r.name || '-') + '</td><td>' + (r.status || 'pending') + '</td><td>' + (r.date || '-') + '</td></tr>';
      });
      html += '</tbody></table>';
    }
    
    document.getElementById('clearanceContent').innerHTML = html;
  }).catch(err => {
    document.getElementById('clearanceContent').innerHTML = '<div class="alert alert-error">Error loading records: ' + err.message + '</div>';
  });
}

function showAddClearanceForm() {
  const html = `
    <div class="feature-box">
      <h2>✅ Add Clearance Record</h2>
      <div id="clearanceMsg"></div>
      <form id="clearanceForm" style="max-width: 600px;">
        <div class="form-group">
          <label>Subject Name:</label>
          <input type="text" id="name" placeholder="Full name" required>
        </div>
        <div class="form-group">
          <label>ID Number:</label>
          <input type="text" id="id_number" placeholder="National ID or Passport" required>
        </div>
        <div class="form-group">
          <label>Date of Birth:</label>
          <input type="date" id="dob" required>
        </div>
        <div class="form-group">
          <label>Reason for Check:</label>
          <select id="reason" required>
            <option value="">-- Select Reason --</option>
            <option value="Employment">Employment</option>
            <option value="Visa">Visa Application</option>
            <option value="Travel">Travel</option>
            <option value="Adoption">Adoption</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div class="form-group">
          <label>Status:</label>
          <select id="status">
            <option value="pending" selected>Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div class="form-group">
          <label>Notes:</label>
          <textarea id="notes" placeholder="Additional notes" rows="3"></textarea>
        </div>
        <div style="margin-top: 20px;">
          <button type="submit" class="btn btn-primary">✅ Submit Clearance</button>
          <button type="button" class="btn btn-secondary" style="margin-left: 10px;" onclick="loadClearance()">❌ Cancel</button>
        </div>
      </form>
    </div>
  `;
  
  document.getElementById('content').innerHTML = html;
  
  document.getElementById('clearanceForm').onsubmit = async (e) => {
    e.preventDefault();
    
    const clearanceData = {
      name: document.getElementById('name').value,
      id_number: document.getElementById('id_number').value,
      dob: document.getElementById('dob').value,
      reason: document.getElementById('reason').value,
      status: document.getElementById('status').value,
      notes: document.getElementById('notes').value
    };
    
    try {
      const res = await apiCall('POST', '/clearance', clearanceData);
      const msgEl = document.getElementById('clearanceMsg');
      
      if (res.success || res.data) {
        msgEl.className = 'alert alert-success';
        msgEl.textContent = '✅ Clearance record created successfully!';
        msgEl.style.display = 'block';
        
        setTimeout(() => {
          loadClearance();
        }, 1500);
      } else {
        msgEl.className = 'alert alert-error';
        msgEl.textContent = '❌ Error: ' + (res.error || 'Failed to create clearance record');
        msgEl.style.display = 'block';
      }
    } catch (err) {
      const msgEl = document.getElementById('clearanceMsg');
      msgEl.className = 'alert alert-error';
      msgEl.textContent = '❌ Error: ' + err.message;
      msgEl.style.display = 'block';
    }
  };
}

function loadFlagged() {
  document.getElementById('content').innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  apiCall('GET', '/flagged-individuals').then(data => {
    const flagged = data.data || data.rows || [];
    let html = '<div class="feature-box"><h2>⚠️ Flagged Individuals</h2>';
    if (flagged.length === 0) {
      html += '<p>No flagged individuals</p>';
    } else {
      html += '<table class="table"><thead><tr><th>ID</th><th>Name</th><th>Reason</th></tr></thead><tbody>';
      flagged.forEach(f => {
        html += '<tr><td>' + f.id + '</td><td>' + (f.name || '-') + '</td><td>' + (f.reason || '-') + '</td></tr>';
      });
      html += '</tbody></table>';
    }
    html += '</div>';
    document.getElementById('content').innerHTML = html;
  }).catch(err => {
    document.getElementById('content').innerHTML = '<div class="feature-box"><div class="alert alert-error">Error: ' + err.message + '</div></div>';
  });
}

function loadAssignments() {
  document.getElementById('content').innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  apiCall('GET', '/case-assignments').then(data => {
    const assignments = data.data || data.rows || [];
    let html = '<div class="feature-box"><h2>📋 Case Assignments</h2>';
    html += '<div style="margin-bottom: 20px;">';
    html += '<button class="btn btn-primary" onclick="showAddAssignmentForm()">➕ Assign Case</button>';
    html += '<button class="btn btn-secondary" style="margin-left: 10px;" onclick="loadAssignments()">🔄 Refresh</button>';
    html += '</div>';
    
    if (assignments.length === 0) {
      html += '<p>No assignments found</p>';
    } else {
      html += '<table class="table"><thead><tr><th>Case ID</th><th>Officer</th><th>Status</th><th>Date</th></tr></thead><tbody>';
      assignments.forEach(a => {
        html += '<tr><td>' + (a.case_id || '-') + '</td><td>' + (a.officer || '-') + '</td><td>' + (a.status || 'pending') + '</td><td>' + (a.date || '-') + '</td></tr>';
      });
      html += '</tbody></table>';
    }
    html += '</div>';
    document.getElementById('content').innerHTML = html;
  }).catch(err => {
    document.getElementById('content').innerHTML = '<div class="feature-box"><div class="alert alert-error">Error: ' + err.message + '</div></div>';
  });
}

function showAddAssignmentForm() {
  const html = `
    <div class="feature-box">
      <h2>📋 Assign Case to Officer</h2>
      <div id="assignmentMsg"></div>
      <form id="assignmentForm" style="max-width: 600px;">
        <div class="form-group">
          <label>Case ID:</label>
          <input type="number" id="case_id" placeholder="Case ID" required>
        </div>
        <div class="form-group">
          <label>Officer:</label>
          <input type="text" id="officer" placeholder="Officer name" required>
        </div>
        <div class="form-group">
          <label>Priority:</label>
          <select id="priority">
            <option value="normal" selected>Normal</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <div class="form-group">
          <label>Status:</label>
          <select id="status">
            <option value="pending" selected>Pending</option>
            <option value="assigned">Assigned</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div style="margin-top: 20px;">
          <button type="submit" class="btn btn-primary">✅ Assign Case</button>
          <button type="button" class="btn btn-secondary" style="margin-left: 10px;" onclick="loadAssignments()">❌ Cancel</button>
        </div>
      </form>
    </div>
  `;
  
  document.getElementById('content').innerHTML = html;
  
  document.getElementById('assignmentForm').onsubmit = async (e) => {
    e.preventDefault();
    
    const assignData = {
      case_id: document.getElementById('case_id').value,
      officer: document.getElementById('officer').value,
      priority: document.getElementById('priority').value,
      status: document.getElementById('status').value
    };
    
    try {
      const res = await apiCall('POST', '/case-assignments', assignData);
      const msgEl = document.getElementById('assignmentMsg');
      
      if (res.success || res.data) {
        msgEl.className = 'alert alert-success';
        msgEl.textContent = '✅ Case assigned successfully!';
        msgEl.style.display = 'block';
        
        setTimeout(() => {
          loadAssignments();
        }, 1500);
      } else {
        msgEl.className = 'alert alert-error';
        msgEl.textContent = '❌ Error: ' + (res.error || 'Failed to assign case');
        msgEl.style.display = 'block';
      }
    } catch (err) {
      const msgEl = document.getElementById('assignmentMsg');
      msgEl.className = 'alert alert-error';
      msgEl.textContent = '❌ Error: ' + err.message;
      msgEl.style.display = 'block';
    }
  };
}

function loadNotes() {
  document.getElementById('content').innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  apiCall('GET', '/case-notes').then(data => {
    const notes = data.data || data.rows || [];
    let html = '<div class="feature-box"><h2>📝 Case Notes</h2>';
    html += '<div style="margin-bottom: 20px;">';
    html += '<button class="btn btn-primary" onclick="showAddNoteForm()">➕ Add Note</button>';
    html += '<button class="btn btn-secondary" style="margin-left: 10px;" onclick="loadNotes()">🔄 Refresh</button>';
    html += '</div>';
    
    if (notes.length === 0) {
      html += '<p>No notes found</p>';
    } else {
      html += '<table class="table"><thead><tr><th>Case ID</th><th>Note</th><th>Author</th><th>Date</th></tr></thead><tbody>';
      notes.forEach(n => {
        html += '<tr><td>' + (n.case_id || '-') + '</td><td>' + (n.note ? n.note.substring(0, 50) + '...' : '-') + '</td><td>' + (n.author || '-') + '</td><td>' + (n.created_at || '-') + '</td></tr>';
      });
      html += '</tbody></table>';
    }
    html += '</div>';
    document.getElementById('content').innerHTML = html;
  }).catch(err => {
    document.getElementById('content').innerHTML = '<div class="feature-box"><div class="alert alert-error">Error: ' + err.message + '</div></div>';
  });
}

function showAddNoteForm() {
  const html = `
    <div class="feature-box">
      <h2>📝 Add Case Note</h2>
      <div id="noteMsg"></div>
      <form id="noteForm" style="max-width: 600px;">
        <div class="form-group">
          <label>Case ID:</label>
          <input type="number" id="case_id" placeholder="Case ID" required>
        </div>
        <div class="form-group">
          <label>Note:</label>
          <textarea id="note" placeholder="Enter note details" rows="5" required></textarea>
        </div>
        <div class="form-group">
          <label>Author:</label>
          <input type="text" id="author" placeholder="Your name" required>
        </div>
        <div style="margin-top: 20px;">
          <button type="submit" class="btn btn-primary">✅ Save Note</button>
          <button type="button" class="btn btn-secondary" style="margin-left: 10px;" onclick="loadNotes()">❌ Cancel</button>
        </div>
      </form>
    </div>
  `;
  
  document.getElementById('content').innerHTML = html;
  
  document.getElementById('noteForm').onsubmit = async (e) => {
    e.preventDefault();
    
    const noteData = {
      case_id: document.getElementById('case_id').value,
      note: document.getElementById('note').value,
      author: document.getElementById('author').value
    };
    
    try {
      const res = await apiCall('POST', '/case-notes', noteData);
      const msgEl = document.getElementById('noteMsg');
      
      if (res.success || res.data) {
        msgEl.className = 'alert alert-success';
        msgEl.textContent = '✅ Note added successfully!';
        msgEl.style.display = 'block';
        
        setTimeout(() => {
          loadNotes();
        }, 1500);
      } else {
        msgEl.className = 'alert alert-error';
        msgEl.textContent = '❌ Error: ' + (res.error || 'Failed to add note');
        msgEl.style.display = 'block';
      }
    } catch (err) {
      const msgEl = document.getElementById('noteMsg');
      msgEl.className = 'alert alert-error';
      msgEl.textContent = '❌ Error: ' + err.message;
      msgEl.style.display = 'block';
    }
  };
}

function loadEvidence() {
  document.getElementById('content').innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  apiCall('GET', '/evidence').then(data => {
    const evidence = data.data || data.rows || [];
    let html = '<div class="feature-box"><h2>🔬 Evidence Management</h2>';
    html += '<div style="margin-bottom: 20px;">';
    html += '<button class="btn btn-primary" onclick="showAddEvidenceForm()">➕ Add Evidence</button>';
    html += '<button class="btn btn-secondary" style="margin-left: 10px;" onclick="loadEvidence()">🔄 Refresh</button>';
    html += '</div>';
    
    if (evidence.length === 0) {
      html += '<p>No evidence records found</p>';
    } else {
      html += '<table class="table"><thead><tr><th>Case ID</th><th>Item</th><th>Status</th><th>Location</th></tr></thead><tbody>';
      evidence.forEach(e => {
        html += '<tr><td>' + (e.case_id || '-') + '</td><td>' + (e.item || '-') + '</td><td>' + (e.status || 'stored') + '</td><td>' + (e.location || '-') + '</td></tr>';
      });
      html += '</tbody></table>';
    }
    html += '</div>';
    document.getElementById('content').innerHTML = html;
  }).catch(err => {
    document.getElementById('content').innerHTML = '<div class="feature-box"><div class="alert alert-error">Error: ' + err.message + '</div></div>';
  });
}

function showAddEvidenceForm() {
  const html = `
    <div class="feature-box">
      <h2>🔬 Add Evidence</h2>
      <div id="evidenceMsg"></div>
      <form id="evidenceForm" style="max-width: 600px;">
        <div class="form-group">
          <label>Case ID:</label>
          <input type="number" id="case_id" placeholder="Case ID" required>
        </div>
        <div class="form-group">
          <label>Item Description:</label>
          <input type="text" id="item" placeholder="What evidence item?" required>
        </div>
        <div class="form-group">
          <label>Storage Location:</label>
          <input type="text" id="location" placeholder="Storage location" required>
        </div>
        <div class="form-group">
          <label>Status:</label>
          <select id="status">
            <option value="stored" selected>Stored</option>
            <option value="collected">Collected</option>
            <option value="processed">Processed</option>
            <option value="released">Released</option>
          </select>
        </div>
        <div class="form-group">
          <label>Notes:</label>
          <textarea id="notes" placeholder="Evidence notes" rows="3"></textarea>
        </div>
        <div style="margin-top: 20px;">
          <button type="submit" class="btn btn-primary">✅ Add Evidence</button>
          <button type="button" class="btn btn-secondary" style="margin-left: 10px;" onclick="loadEvidence()">❌ Cancel</button>
        </div>
      </form>
    </div>
  `;
  
  document.getElementById('content').innerHTML = html;
  
  document.getElementById('evidenceForm').onsubmit = async (e) => {
    e.preventDefault();
    
    const evidenceData = {
      case_id: document.getElementById('case_id').value,
      item: document.getElementById('item').value,
      location: document.getElementById('location').value,
      status: document.getElementById('status').value,
      notes: document.getElementById('notes').value
    };
    
    try {
      const res = await apiCall('POST', '/evidence', evidenceData);
      const msgEl = document.getElementById('evidenceMsg');
      
      if (res.success || res.data) {
        msgEl.className = 'alert alert-success';
        msgEl.textContent = '✅ Evidence added successfully!';
        msgEl.style.display = 'block';
        
        setTimeout(() => {
          loadEvidence();
        }, 1500);
      } else {
        msgEl.className = 'alert alert-error';
        msgEl.textContent = '❌ Error: ' + (res.error || 'Failed to add evidence');
        msgEl.style.display = 'block';
      }
    } catch (err) {
      const msgEl = document.getElementById('evidenceMsg');
      msgEl.className = 'alert alert-error';
      msgEl.textContent = '❌ Error: ' + err.message;
      msgEl.style.display = 'block';
    }
  };
}

function loadGeolocation() {
  document.getElementById('content').innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  apiCall('GET', '/geolocation').then(data => {
    const locations = data.data || data.rows || [];
    let html = '<div class="feature-box"><h2>📍 Geolocation Tracking</h2>';
    html += '<div style="margin-bottom: 20px;">';
    html += '<button class="btn btn-primary" onclick="showAddLocationForm()">📍 Add Location</button>';
    html += '<button class="btn btn-secondary" style="margin-left: 10px;" onclick="loadGeolocation()">🔄 Refresh</button>';
    html += '</div>';
    
    if (locations.length === 0) {
      html += '<p>No location records found</p>';
    } else {
      html += '<table class="table"><thead><tr><th>Case ID</th><th>Latitude</th><th>Longitude</th><th>Location</th><th>Date</th></tr></thead><tbody>';
      locations.forEach(l => {
        html += '<tr><td>' + (l.case_id || '-') + '</td><td>' + (l.latitude || '-') + '</td><td>' + (l.longitude || '-') + '</td><td>' + (l.location || '-') + '</td><td>' + (l.date || '-') + '</td></tr>';
      });
      html += '</tbody></table>';
    }
    html += '</div>';
    document.getElementById('content').innerHTML = html;
  }).catch(err => {
    document.getElementById('content').innerHTML = '<div class="feature-box"><div class="alert alert-error">Error: ' + err.message + '</div></div>';
  });
}

function showAddLocationForm() {
  const html = `
    <div class="feature-box">
      <h2>📍 Add Location Record</h2>
      <div id="locationMsg"></div>
      <form id="locationForm" style="max-width: 600px;">
        <div class="form-group">
          <label>Case ID:</label>
          <input type="number" id="case_id" placeholder="Case ID" required>
        </div>
        <div class="form-group">
          <label>Location Name:</label>
          <input type="text" id="location" placeholder="Location description" required>
        </div>
        <div class="form-group">
          <label>Latitude:</label>
          <input type="number" id="latitude" step="0.0001" placeholder="Latitude" required>
        </div>
        <div class="form-group">
          <label>Longitude:</label>
          <input type="number" id="longitude" step="0.0001" placeholder="Longitude" required>
        </div>
        <div class="form-group">
          <label>Date/Time:</label>
          <input type="datetime-local" id="date" required>
        </div>
        <div style="margin-top: 20px;">
          <button type="submit" class="btn btn-primary">✅ Add Location</button>
          <button type="button" class="btn btn-secondary" style="margin-left: 10px;" onclick="loadGeolocation()">❌ Cancel</button>
        </div>
      </form>
    </div>
  `;
  
  document.getElementById('content').innerHTML = html;
  
  document.getElementById('locationForm').onsubmit = async (e) => {
    e.preventDefault();
    
    const locationData = {
      case_id: document.getElementById('case_id').value,
      location: document.getElementById('location').value,
      latitude: document.getElementById('latitude').value,
      longitude: document.getElementById('longitude').value,
      date: document.getElementById('date').value
    };
    
    try {
      const res = await apiCall('POST', '/geolocation', locationData);
      const msgEl = document.getElementById('locationMsg');
      
      if (res.success || res.data) {
        msgEl.className = 'alert alert-success';
        msgEl.textContent = '✅ Location added successfully!';
        msgEl.style.display = 'block';
        
        setTimeout(() => {
          loadGeolocation();
        }, 1500);
      } else {
        msgEl.className = 'alert alert-error';
        msgEl.textContent = '❌ Error: ' + (res.error || 'Failed to add location');
        msgEl.style.display = 'block';
      }
    } catch (err) {
      const msgEl = document.getElementById('locationMsg');
      msgEl.className = 'alert alert-error';
      msgEl.textContent = '❌ Error: ' + err.message;
      msgEl.style.display = 'block';
    }
  };
}

function loadClosure() {
  document.getElementById('content').innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  apiCall('GET', '/case-closure').then(data => {
    const closures = data.data || data.rows || [];
    let html = '<div class="feature-box"><h2>✔️ Case Closure</h2>';
    html += '<div style="margin-bottom: 20px;">';
    html += '<button class="btn btn-primary" onclick="showClosureForm()">✔️ Close Case</button>';
    html += '<button class="btn btn-secondary" style="margin-left: 10px;" onclick="loadClosure()">🔄 Refresh</button>';
    html += '</div>';
    
    if (closures.length === 0) {
      html += '<p>No closed cases found</p>';
    } else {
      html += '<table class="table"><thead><tr><th>Case ID</th><th>Status</th><th>Reason</th><th>Date</th></tr></thead><tbody>';
      closures.forEach(c => {
        html += '<tr><td>' + (c.case_id || '-') + '</td><td>' + (c.status || '-') + '</td><td>' + (c.reason || '-') + '</td><td>' + (c.date || '-') + '</td></tr>';
      });
      html += '</tbody></table>';
    }
    html += '</div>';
    document.getElementById('content').innerHTML = html;
  }).catch(err => {
    document.getElementById('content').innerHTML = '<div class="feature-box"><div class="alert alert-error">Error: ' + err.message + '</div></div>';
  });
}

function showClosureForm() {
  const html = `
    <div class="feature-box">
      <h2>✔️ Close Case</h2>
      <div id="closureMsg"></div>
      <form id="closureForm" style="max-width: 600px;">
        <div class="form-group">
          <label>Case ID:</label>
          <input type="number" id="case_id" placeholder="Case ID" required>
        </div>
        <div class="form-group">
          <label>Closure Reason:</label>
          <select id="reason" required>
            <option value="">-- Select Reason --</option>
            <option value="Solved">Solved</option>
            <option value="Dismissed">Dismissed</option>
            <option value="No Evidence">No Evidence</option>
            <option value="Statute of Limitations">Statute of Limitations</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div class="form-group">
          <label>Notes:</label>
          <textarea id="notes" placeholder="Closure details" rows="4" required></textarea>
        </div>
        <div class="form-group">
          <label>Closed By:</label>
          <input type="text" id="closed_by" placeholder="Your name" required>
        </div>
        <div style="margin-top: 20px;">
          <button type="submit" class="btn btn-primary">✅ Close Case</button>
          <button type="button" class="btn btn-secondary" style="margin-left: 10px;" onclick="loadClosure()">❌ Cancel</button>
        </div>
      </form>
    </div>
  `;
  
  document.getElementById('content').innerHTML = html;
  
  document.getElementById('closureForm').onsubmit = async (e) => {
    e.preventDefault();
    
    const closureData = {
      case_id: document.getElementById('case_id').value,
      reason: document.getElementById('reason').value,
      notes: document.getElementById('notes').value,
      closed_by: document.getElementById('closed_by').value
    };
    
    try {
      const res = await apiCall('POST', '/case-closure', closureData);
      const msgEl = document.getElementById('closureMsg');
      
      if (res.success || res.data) {
        msgEl.className = 'alert alert-success';
        msgEl.textContent = '✅ Case closed successfully!';
        msgEl.style.display = 'block';
        
        setTimeout(() => {
          loadClosure();
        }, 1500);
      } else {
        msgEl.className = 'alert alert-error';
        msgEl.textContent = '❌ Error: ' + (res.error || 'Failed to close case');
        msgEl.style.display = 'block';
      }
    } catch (err) {
      const msgEl = document.getElementById('closureMsg');
      msgEl.className = 'alert alert-error';
      msgEl.textContent = '❌ Error: ' + err.message;
      msgEl.style.display = 'block';
    }
  };
}

function loadSearch() {
  const html = `
    <div class="feature-box">
      <h2>🔍 Search Cases</h2>
      <div id="searchResults"></div>
      <form id="searchForm" style="max-width: 600px;" onsubmit="performSearch(event)">
        <div class="form-group">
          <label>Search:</label>
          <input type="text" id="searchQuery" placeholder="Case number, victim name, case type, or details" required>
        </div>
        <div class="form-group">
          <label>Filter By:</label>
          <select id="filterType">
            <option value="all">All Fields</option>
            <option value="case_number">Case Number</option>
            <option value="victim_name">Victim Name</option>
            <option value="case_type">Case Type</option>
            <option value="status">Status</option>
          </select>
        </div>
        <div style="margin-top: 20px;">
          <button type="submit" class="btn btn-primary">🔍 Search</button>
        </div>
      </form>
    </div>
  `;
  
  document.getElementById('content').innerHTML = html;
}

function performSearch(e) {
  e.preventDefault();
  const query = document.getElementById('searchQuery').value;
  const filterType = document.getElementById('filterType').value;
  
  document.getElementById('searchResults').innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  
  apiCall('GET', '/search?q=' + encodeURIComponent(query) + '&filter=' + filterType).then(data => {
    const results = data.data || data.rows || [];
    let html = '';
    
    if (results.length === 0) {
      html = '<div class="alert alert-info">No cases found matching your search</div>';
    } else {
      html = '<h3>Search Results (' + results.length + ' found)</h3>';
      html += '<table class="table"><thead><tr><th>ID</th><th>Case #</th><th>Victim</th><th>Type</th><th>Status</th></tr></thead><tbody>';
      results.forEach(r => {
        const statusClass = 'status-' + (r.status || 'open');
        html += '<tr><td>' + r.id + '</td><td>' + (r.case_number || '-') + '</td><td>' + (r.victim_name || '-') + '</td><td>' + (r.case_type || '-') + '</td><td><span class="' + statusClass + '">' + (r.status || 'open') + '</span></td></tr>';
      });
      html += '</tbody></table>';
    }
    
    document.getElementById('searchResults').innerHTML = html;
  }).catch(err => {
    document.getElementById('searchResults').innerHTML = '<div class="alert alert-error">Error: ' + err.message + '</div>';
  });
}

function loadAudit() {
  document.getElementById('content').innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  apiCall('GET', '/audit-logs').then(data => {
    const logs = data.data || data.rows || [];
    let html = '<div class="feature-box"><h2>📊 Audit Logs</h2>';
    if (logs.length === 0) {
      html += '<p>No audit logs</p>';
    } else {
      html += '<table class="table"><thead><tr><th>ID</th><th>User</th><th>Action</th><th>Timestamp</th></tr></thead><tbody>';
      logs.slice(0, 20).forEach(log => {
        html += '<tr><td>' + log.id + '</td><td>' + (log.user || '-') + '</td><td>' + (log.action || '-') + '</td><td>' + (log.timestamp || '-') + '</td></tr>';
      });
      html += '</tbody></table>';
    }
    html += '</div>';
    document.getElementById('content').innerHTML = html;
  }).catch(err => {
    document.getElementById('content').innerHTML = '<div class="feature-box"><div class="alert alert-error">Error: ' + err.message + '</div></div>';
  });
}

function loadLanguage() {
  const html = `
    <div class="feature-box">
      <h2>🌐 Multi-Language Support</h2>
      <p>Select your preferred language:</p>
      <div style="margin-top: 20px;">
        <button class="btn btn-primary" onclick="setLanguage('en')">🇺🇸 English</button>
        <button class="btn btn-primary" style="margin-left: 10px;" onclick="setLanguage('fr')">🇫🇷 Français</button>
        <button class="btn btn-primary" style="margin-left: 10px;" onclick="setLanguage('pt')">🇵🇹 Português</button>
        <button class="btn btn-primary" style="margin-left: 10px;" onclick="setLanguage('es')">🇪🇸 Español</button>
      </div>
      <div style="margin-top: 30px;" id="languageInfo"></div>
    </div>
  `;
  
  document.getElementById('content').innerHTML = html;
  loadLanguageInfo();
}

function loadLanguageInfo() {
  apiCall('GET', '/multi-language').then(data => {
    const info = data.data || {};
    let html = '<h3>Supported Languages:</h3><ul>';
    Object.keys(info).forEach(key => {
      html += '<li><strong>' + key + ':</strong> ' + info[key] + '</li>';
    });
    html += '</ul>';
    document.getElementById('languageInfo').innerHTML = html;
  }).catch(err => {
    document.getElementById('languageInfo').innerHTML = '<div class="alert alert-error">Error: ' + err.message + '</div>';
  });
}

function setLanguage(lang) {
  localStorage.setItem('language', lang);
  const langNames = { en: 'English', fr: 'Français', pt: 'Português', es: 'Español' };
  alert('Language changed to ' + langNames[lang]);
}

function loadDocuments() {
  document.getElementById('content').innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  apiCall('GET', '/document-templates').then(data => {
    const templates = data.data || data.rows || [];
    let html = '<div class="feature-box"><h2>📄 Document Templates</h2>';
    html += '<div style="margin-bottom: 20px;">';
    html += '<button class="btn btn-primary" onclick="showAddTemplateForm()">➕ Create Template</button>';
    html += '</div>';
    
    if (templates.length === 0) {
      html += '<p>No document templates found</p>';
    } else {
      html += '<table class="table"><thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Created</th></tr></thead><tbody>';
      templates.forEach(t => {
        html += '<tr><td>' + t.id + '</td><td>' + (t.name || '-') + '</td><td>' + (t.type || '-') + '</td><td>' + (t.created_at || '-') + '</td></tr>';
      });
      html += '</tbody></table>';
    }
    html += '</div>';
    document.getElementById('content').innerHTML = html;
  }).catch(err => {
    document.getElementById('content').innerHTML = '<div class="feature-box"><div class="alert alert-error">Error: ' + err.message + '</div></div>';
  });
}

function showAddTemplateForm() {
  const html = `
    <div class="feature-box">
      <h2>📄 Create Document Template</h2>
      <div id="templateMsg"></div>
      <form id="templateForm" style="max-width: 600px;">
        <div class="form-group">
          <label>Template Name:</label>
          <input type="text" id="name" placeholder="Template name" required>
        </div>
        <div class="form-group">
          <label>Document Type:</label>
          <select id="type" required>
            <option value="">-- Select Type --</option>
            <option value="Report">Report</option>
            <option value="Statement">Statement</option>
            <option value="Summons">Summons</option>
            <option value="Warrant">Warrant</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div class="form-group">
          <label>Template Content:</label>
          <textarea id="content" placeholder="Template text" rows="6" required></textarea>
        </div>
        <div style="margin-top: 20px;">
          <button type="submit" class="btn btn-primary">✅ Create Template</button>
          <button type="button" class="btn btn-secondary" style="margin-left: 10px;" onclick="loadDocuments()">❌ Cancel</button>
        </div>
      </form>
    </div>
  `;
  
  document.getElementById('content').innerHTML = html;
  
  document.getElementById('templateForm').onsubmit = async (e) => {
    e.preventDefault();
    
    const templateData = {
      name: document.getElementById('name').value,
      type: document.getElementById('type').value,
      content: document.getElementById('content').value
    };
    
    try {
      const res = await apiCall('POST', '/document-templates', templateData);
      const msgEl = document.getElementById('templateMsg');
      
      if (res.success || res.data) {
        msgEl.className = 'alert alert-success';
        msgEl.textContent = '✅ Template created successfully!';
        msgEl.style.display = 'block';
        
        setTimeout(() => {
          loadDocuments();
        }, 1500);
      } else {
        msgEl.className = 'alert alert-error';
        msgEl.textContent = '❌ Error: ' + (res.error || 'Failed to create template');
        msgEl.style.display = 'block';
      }
    } catch (err) {
      const msgEl = document.getElementById('templateMsg');
      msgEl.className = 'alert alert-error';
      msgEl.textContent = '❌ Error: ' + err.message;
      msgEl.style.display = 'block';
    }
  };
}

function loadOffline() {
  const html = `
    <div class="feature-box">
      <h2>📶 Offline Synchronization</h2>
      <div style="margin-bottom: 20px;">
        <button class="btn btn-primary" onclick="syncOfflineData()">🔄 Sync Now</button>
        <button class="btn btn-secondary" style="margin-left: 10px;" onclick="clearOfflineData()">🗑️ Clear Cache</button>
      </div>
      <div id="syncStatus"></div>
    </div>
  `;
  
  document.getElementById('content').innerHTML = html;
  checkSyncStatus();
}

function checkSyncStatus() {
  apiCall('GET', '/offline-sync').then(data => {
    let html = '<h3>Sync Status:</h3>';
    html += '<p><strong>Last Sync:</strong> ' + (data.lastSync || 'Never') + '</p>';
    html += '<p><strong>Pending Items:</strong> ' + (data.pending || 0) + '</p>';
    html += '<p><strong>Synced Items:</strong> ' + (data.synced || 0) + '</p>';
    document.getElementById('syncStatus').innerHTML = html;
  }).catch(err => {
    document.getElementById('syncStatus').innerHTML = '<div class="alert alert-error">Error: ' + err.message + '</div>';
  });
}

function syncOfflineData() {
  document.getElementById('syncStatus').innerHTML = '<div class="loading"><div class="spinner"></div> Syncing...</div>';
  apiCall('POST', '/offline-sync', { action: 'sync' }).then(data => {
    document.getElementById('syncStatus').innerHTML = '<div class="alert alert-success">✅ Sync completed! ' + (data.synced || 0) + ' items synchronized.</div>';
    setTimeout(checkSyncStatus, 2000);
  }).catch(err => {
    document.getElementById('syncStatus').innerHTML = '<div class="alert alert-error">❌ Sync failed: ' + err.message + '</div>';
  });
}

function clearOfflineData() {
  if (confirm('Are you sure? This will clear all offline cached data.')) {
    localStorage.removeItem('offlineData');
    document.getElementById('syncStatus').innerHTML = '<div class="alert alert-success">✅ Offline cache cleared.</div>';
  }
}

function loadDepartment() {
  document.getElementById('content').innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  apiCall('GET', '/departments').then(data => {
    const departments = data.data || data.rows || [];
    let html = '<div class="feature-box"><h2>🏢 Department Management</h2>';
    html += '<div style="margin-bottom: 20px;">';
    html += '<button class="btn btn-primary" onclick="showAddDepartmentForm()">➕ Add Department</button>';
    html += '<button class="btn btn-secondary" style="margin-left: 10px;" onclick="loadDepartment()">🔄 Refresh</button>';
    html += '</div>';
    
    if (departments.length === 0) {
      html += '<p>No departments found</p>';
    } else {
      html += '<table class="table"><thead><tr><th>ID</th><th>Department</th><th>Head</th><th>Active Cases</th></tr></thead><tbody>';
      departments.forEach(d => {
        html += '<tr><td>' + d.id + '</td><td>' + (d.name || '-') + '</td><td>' + (d.head || '-') + '</td><td>' + (d.active_cases || 0) + '</td></tr>';
      });
      html += '</tbody></table>';
    }
    html += '</div>';
    document.getElementById('content').innerHTML = html;
  }).catch(err => {
    document.getElementById('content').innerHTML = '<div class="feature-box"><div class="alert alert-error">Error: ' + err.message + '</div></div>';
  });
}

function showAddDepartmentForm() {
  const html = `
    <div class="feature-box">
      <h2>🏢 Add Department</h2>
      <div id="deptMsg"></div>
      <form id="deptForm" style="max-width: 600px;">
        <div class="form-group">
          <label>Department Name:</label>
          <input type="text" id="name" placeholder="Department name" required>
        </div>
        <div class="form-group">
          <label>Department Head:</label>
          <input type="text" id="head" placeholder="Department head name" required>
        </div>
        <div class="form-group">
          <label>Budget:</label>
          <input type="number" id="budget" placeholder="Budget amount" step="0.01">
        </div>
        <div class="form-group">
          <label>Description:</label>
          <textarea id="description" placeholder="Department description" rows="3"></textarea>
        </div>
        <div style="margin-top: 20px;">
          <button type="submit" class="btn btn-primary">✅ Create Department</button>
          <button type="button" class="btn btn-secondary" style="margin-left: 10px;" onclick="loadDepartment()">❌ Cancel</button>
        </div>
      </form>
    </div>
  `;
  
  document.getElementById('content').innerHTML = html;
  
  document.getElementById('deptForm').onsubmit = async (e) => {
    e.preventDefault();
    
    const deptData = {
      name: document.getElementById('name').value,
      head: document.getElementById('head').value,
      budget: document.getElementById('budget').value,
      description: document.getElementById('description').value
    };
    
    try {
      const res = await apiCall('POST', '/departments', deptData);
      const msgEl = document.getElementById('deptMsg');
      
      if (res.success || res.data) {
        msgEl.className = 'alert alert-success';
        msgEl.textContent = '✅ Department created successfully!';
        msgEl.style.display = 'block';
        
        setTimeout(() => {
          loadDepartment();
        }, 1500);
      } else {
        msgEl.className = 'alert alert-error';
        msgEl.textContent = '❌ Error: ' + (res.error || 'Failed to create department');
        msgEl.style.display = 'block';
      }
    } catch (err) {
      const msgEl = document.getElementById('deptMsg');
      msgEl.className = 'alert alert-error';
      msgEl.textContent = '❌ Error: ' + err.message;
      msgEl.style.display = 'block';
    }
  };
}

// Check for existing token on page load
window.addEventListener('load', () => {
  const savedToken = localStorage.getItem('authToken');
  const savedUser = localStorage.getItem('currentUser');
  
  if (savedToken && savedUser) {
    authToken = savedToken;
    currentUser = JSON.parse(savedUser);
    document.getElementById('login').style.display = 'none';
    document.getElementById('dashboard').style.display = 'flex';
    document.getElementById('userDisplay').textContent = 'Welcome, ' + currentUser.username;
    selectFeature(document.querySelector('.sidebar-item'), 'overview');
  }
});
</script>

</body>
</html>
  `);
});

app.listen(PORT, () => {
  console.log(`✅ LNPMS Dashboard - All APIs Working on http://localhost:${PORT}`);
  console.log(`Backend API: http://localhost:3001`);
});
