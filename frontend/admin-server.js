const express = require('express');
const app = express();

app.use(express.json());

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
    <h1>🔐 LNP Admin Dashboard</h1>
    <button onclick="logout()">Logout</button>
  </div>
  
  <div class="container">
    <div class="sidebar">
      <div class="sidebar-item active" onclick="showFeature('overview')">📊 Dashboard Overview</div>
      <div class="sidebar-item" onclick="showFeature('users')">👥 User Management</div>
      <div class="sidebar-item" onclick="showFeature('cases')">📁 Case Management</div>
      <div class="sidebar-item" onclick="showFeature('analytics')">📈 Analytics</div>
      <div class="sidebar-item" onclick="showFeature('clearance')">✅ Police Clearance</div>
      <div class="sidebar-item" onclick="showFeature('department')">🏢 Department Dashboard</div>
      <div class="sidebar-item" onclick="showFeature('flagged')">⚠️ Flagged Individuals</div>
      <div class="sidebar-item" onclick="showFeature('assignment')">📋 Case Assignment</div>
      <div class="sidebar-item" onclick="showFeature('notes')">📝 Case Notes</div>
      <div class="sidebar-item" onclick="showFeature('documents')">📄 Document Templates</div>
      <div class="sidebar-item" onclick="showFeature('search')">🔍 Search Cases</div>
      <div class="sidebar-item" onclick="showFeature('audit')">📊 Audit Logs</div>
      <div class="sidebar-item" onclick="showFeature('language')">🌐 Multi-Language Support</div>
      <div class="sidebar-item" onclick="showFeature('offline')">📶 Offline Mode Sync</div>
      <div class="sidebar-item" onclick="showFeature('geolocation')">📍 Geolocation Tagging</div>
      <div class="sidebar-item" onclick="showFeature('evidence')">🔬 Evidence Management</div>
      <div class="sidebar-item" onclick="showFeature('closure')">✔️ Case Closure Workflow</div>
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
              <div class="number">156</div>
              <div class="label">Total Cases</div>
            </div>
            <div class="stat-card">
              <div class="number">45</div>
              <div class="label">Active Users</div>
            </div>
            <div class="stat-card">
              <div class="number">23</div>
              <div class="label">Pending Cases</div>
            </div>
            <div class="stat-card">
              <div class="number">12</div>
              <div class="label">Closed Today</div>
            </div>
          </div>
        </div>
      </div>

      <div id="users" class="feature-section">
        <div class="feature-box">
          <h2>👥 User Management</h2>
          <p>Manage system users, roles, and permissions. Create new users, edit existing ones, and manage user access levels.</p>
          <div class="action-buttons">
            <button class="btn btn-primary" onclick="loadUsers()">View All Users</button>
            <button class="btn btn-primary" onclick="showAddUserForm()">Add New User</button>
          </div>
          <div id="users-list" style="margin-top: 20px;"></div>
        </div>
      </div>

      <div id="cases" class="feature-section">
        <div class="feature-box">
          <h2>📁 Case Management</h2>
          <p>View, create, and manage police cases. Track case status, assign cases to officers, and manage case details.</p>
          <div class="action-buttons">
            <button class="btn btn-primary">Create New Case</button>
            <button class="btn btn-secondary">View All Cases</button>
            <button class="btn btn-secondary">Filter Cases</button>
          </div>
        </div>
      </div>

      <div id="analytics" class="feature-section">
        <div class="feature-box">
          <h2>📈 Analytics Dashboard</h2>
          <p>View detailed analytics and reports about cases, users, and system performance.</p>
          <div class="action-buttons">
            <button class="btn btn-primary">Generate Report</button>
            <button class="btn btn-secondary">View Charts</button>
          </div>
        </div>
      </div>

      <div id="clearance" class="feature-section">
        <div class="feature-box">
          <h2>✅ Police Clearance Check</h2>
          <p>Check and verify police clearance for individuals and manage clearance records.</p>
          <div class="action-buttons">
            <button class="btn btn-primary">New Clearance Check</button>
            <button class="btn btn-secondary">View History</button>
          </div>
        </div>
      </div>

      <div id="department" class="feature-section">
        <div class="feature-box">
          <h2>🏢 Department Dashboard</h2>
          <p>View department-specific information and manage department operations.</p>
          <div class="action-buttons">
            <button class="btn btn-primary">View Departments</button>
            <button class="btn btn-secondary">Department Reports</button>
          </div>
        </div>
      </div>

      <div id="flagged" class="feature-section">
        <div class="feature-box">
          <h2>⚠️ Flagged Individuals</h2>
          <p>Track and manage flagged individuals in the system.</p>
          <div class="action-buttons">
            <button class="btn btn-primary">View Flagged List</button>
            <button class="btn btn-secondary">Add to Flagged</button>
          </div>
        </div>
      </div>

      <div id="assignment" class="feature-section">
        <div class="feature-box">
          <h2>📋 Case Assignment</h2>
          <p>Assign cases to officers and manage case workflows.</p>
          <div class="action-buttons">
            <button class="btn btn-primary">Assign Case</button>
            <button class="btn btn-secondary">View Assignments</button>
          </div>
        </div>
      </div>

      <div id="notes" class="feature-section">
        <div class="feature-box">
          <h2>📝 Case Notes</h2>
          <p>Add and manage detailed notes for cases.</p>
          <div class="action-buttons">
            <button class="btn btn-primary">Add Note</button>
            <button class="btn btn-secondary">View Notes</button>
          </div>
        </div>
      </div>

      <div id="documents" class="feature-section">
        <div class="feature-box">
          <h2>📄 Document Templates</h2>
          <p>Manage document templates for various case types and operations.</p>
          <div class="action-buttons">
            <button class="btn btn-primary">Create Template</button>
            <button class="btn btn-secondary">View Templates</button>
          </div>
        </div>
      </div>

      <div id="search" class="feature-section">
        <div class="feature-box">
          <h2>🔍 Search Cases</h2>
          <p>Advanced search functionality for cases, users, and documents.</p>
          <div class="action-buttons">
            <button class="btn btn-primary">Advanced Search</button>
            <button class="btn btn-secondary">Save Searches</button>
          </div>
        </div>
      </div>

      <div id="audit" class="feature-section">
        <div class="feature-box">
          <h2>📊 Audit Logs</h2>
          <p>View system audit logs and track all user activities.</p>
          <div class="action-buttons">
            <button class="btn btn-primary">View Audit Log</button>
            <button class="btn btn-secondary">Export Report</button>
          </div>
        </div>
      </div>

      <div id="language" class="feature-section">
        <div class="feature-box">
          <h2>🌐 Multi-Language Support</h2>
          <p>Manage multi-language support for the system.</p>
          <div class="action-buttons">
            <button class="btn btn-primary">Manage Languages</button>
            <button class="btn btn-secondary">Translations</button>
          </div>
        </div>
      </div>

      <div id="offline" class="feature-section">
        <div class="feature-box">
          <h2>📶 Offline Mode Sync</h2>
          <p>Manage offline mode synchronization and data integrity.</p>
          <div class="action-buttons">
            <button class="btn btn-primary">Sync Now</button>
            <button class="btn btn-secondary">View Status</button>
          </div>
        </div>
      </div>

      <div id="geolocation" class="feature-section">
        <div class="feature-box">
          <h2>📍 Geolocation Tagging</h2>
          <p>Tag and manage geolocation data for cases and incidents.</p>
          <div class="action-buttons">
            <button class="btn btn-primary">View Map</button>
            <button class="btn btn-secondary">Tag Location</button>
          </div>
        </div>
      </div>

      <div id="evidence" class="feature-section">
        <div class="feature-box">
          <h2>🔬 Evidence Management</h2>
          <p>Manage and track evidence for cases.</p>
          <div class="action-buttons">
            <button class="btn btn-primary">Add Evidence</button>
            <button class="btn btn-secondary">View Evidence</button>
          </div>
        </div>
      </div>

      <div id="closure" class="feature-section">
        <div class="feature-box">
          <h2>✔️ Case Closure Workflow</h2>
          <p>Manage case closure process and workflows.</p>
          <div class="action-buttons">
            <button class="btn btn-primary">Close Case</button>
            <button class="btn btn-secondary">View Closed Cases</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<script>
const api = 'http://localhost:3001';

function showFeature(feature) {
  document.querySelectorAll('.feature-section').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active'));
  document.getElementById(feature).classList.add('active');
  event.target.classList.add('active');
}

document.getElementById('form').onsubmit = async (e) => {
  e.preventDefault();
  const u = document.getElementById('user').value;
  const p = document.getElementById('pass').value;
  
  try {
    const r = await fetch(api + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: u, password: p })
    });
    
    const d = await r.json();
    
    if (d.success && d.token) {
      localStorage.setItem('token', d.token);
      localStorage.setItem('user', JSON.stringify(d.user));
      document.getElementById('login').style.display = 'none';
      document.getElementById('dashboard').style.display = 'block';
      document.getElementById('username').textContent = d.user.username;
      document.getElementById('role').textContent = d.user.role;
      document.getElementById('userid').textContent = d.user.id;
    } else {
      throw new Error('Login failed');
    }
  } catch (err) {
    const m = document.getElementById('msg');
    m.textContent = '❌ ' + (err.message || 'Invalid credentials');
    m.className = 'msg error';
    m.style.display = 'block';
  }
};

function logout() {
  localStorage.clear();
  document.getElementById('login').style.display = 'flex';
  document.getElementById('dashboard').style.display = 'none';
}

window.onload = () => {
  if (localStorage.getItem('token')) {
    const user = JSON.parse(localStorage.getItem('user'));
    document.getElementById('login').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('username').textContent = user.username;
    document.getElementById('role').textContent = user.role;
    document.getElementById('userid').textContent = user.id;
  }
};
</script>

</body>
</html>
  `);
});

app.listen(3000, '0.0.0.0', () => {
  console.log('✅ Server running on http://localhost:3000');
});
