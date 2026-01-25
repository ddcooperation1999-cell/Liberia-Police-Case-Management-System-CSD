const express = require('express');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(compression());
app.use(express.json());

app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LNP Police CMS - Admin Portal</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }
    .container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 60px;
      max-width: 1200px;
      width: 100%;
      align-items: center;
    }
    @media(max-width: 768px) {
      .container { grid-template-columns: 1fr; gap: 40px; }
    }
    .left {
      color: white;
    }
    .left h1 {
      font-size: 48px;
      font-weight: 700;
      margin-bottom: 20px;
      line-height: 1.2;
    }
    .left p {
      font-size: 18px;
      opacity: 0.95;
      margin-bottom: 30px;
      line-height: 1.6;
    }
    .features {
      list-style: none;
    }
    .features li {
      margin: 12px 0;
      display: flex;
      align-items: center;
      font-size: 16px;
    }
    .features li::before {
      content: '✓';
      display: inline-block;
      width: 30px;
      height: 30px;
      background: rgba(255,255,255,0.2);
      border-radius: 50%;
      text-align: center;
      line-height: 30px;
      margin-right: 12px;
      font-weight: bold;
    }
    .right {
      background: white;
      border-radius: 16px;
      padding: 48px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .header {
      text-align: center;
      margin-bottom: 32px;
    }
    .header h2 {
      color: #1f2937;
      font-size: 28px;
      margin-bottom: 8px;
    }
    .header p {
      color: #6b7280;
      font-size: 16px;
    }
    .form-group {
      margin-bottom: 24px;
    }
    label {
      display: block;
      color: #1f2937;
      font-weight: 600;
      margin-bottom: 8px;
      font-size: 14px;
    }
    input {
      width: 100%;
      padding: 12px 14px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 16px;
      transition: all 0.3s ease;
      background: #f3f4f6;
    }
    input:focus {
      outline: 0;
      border-color: #2563eb;
      background: white;
      box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
    }
    button {
      width: 100%;
      padding: 12px;
      background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 24px;
      transition: all 0.3s ease;
    }
    button:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(37,99,235,0.3); }
    button:disabled { opacity: 0.6; cursor: not-allowed; }
    .error {
      color: #dc2626;
      font-size: 14px;
      padding: 12px;
      background: #fee2e2;
      border-left: 4px solid #dc2626;
      border-radius: 4px;
      margin-bottom: 20px;
      display: none;
    }
    .success {
      color: #059669;
      font-size: 14px;
      padding: 12px;
      background: #d1fae5;
      border-left: 4px solid #059669;
      border-radius: 4px;
      margin-bottom: 20px;
      display: none;
    }
    .loading { display: none; text-align: center; }
    .spinner {
      border: 3px solid #e5e7eb;
      border-top: 3px solid #2563eb;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 12px;
    }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .dashboard { display: none; }
    .dash-header {
      background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
      color: white;
      padding: 32px;
      border-radius: 12px;
      margin-bottom: 32px;
      text-align: center;
    }
    .dash-header h2 { font-size: 28px; margin-bottom: 12px; }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 24px;
    }
    .info-card {
      background: #f3f4f6;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #2563eb;
    }
    .info-card label {
      margin: 0;
      font-size: 12px;
      text-transform: uppercase;
      color: #6b7280;
    }
    .info-card span {
      display: block;
      margin-top: 8px;
      color: #1f2937;
      word-break: break-all;
      font-family: monospace;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="left">
      <h1>Liberia National Police</h1>
      <p>Secure Case Management System</p>
      <ul class="features">
        <li>Role-based Access Control</li>
        <li>Encrypted Authentication</li>
        <li>Real-time Monitoring</li>
        <li>Audit Trail Logging</li>
        <li>Enterprise Security</li>
      </ul>
    </div>

    <div class="right">
      <div id="loginSection">
        <div class="header">
          <h2>Admin Login</h2>
          <p>Access your secure admin portal</p>
        </div>

        <div id="errorMsg" class="error"></div>
        <div id="successMsg" class="success"></div>

        <form id="loginForm">
          <div class="form-group">
            <label for="username">Username</label>
            <input type="text" id="username" name="username" value="deca" required>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" value="SecureAdminPass123!" required>
          </div>
          <div id="loading" class="loading">
            <div class="spinner"></div>
            <p>Authenticating...</p>
          </div>
          <button type="submit" id="loginBtn">Sign In</button>
        </form>
      </div>

      <div id="dashboardSection" class="dashboard">
        <div class="dash-header">
          <h2>✅ Welcome Back!</h2>
          <p>You are authenticated</p>
        </div>
        <div class="info-grid">
          <div class="info-card">
            <label>Username</label>
            <span id="dashUsername">-</span>
          </div>
          <div class="info-card">
            <label>Role</label>
            <span id="dashRole">-</span>
          </div>
          <div class="info-card">
            <label>User ID</label>
            <span id="dashUserId">-</span>
          </div>
          <div class="info-card">
            <label>Status</label>
            <span style="color: #059669; font-weight: 600;">✅ Active</span>
          </div>
        </div>
        <div class="info-card">
          <label>JWT Token (Preview)</label>
          <span id="tokenPreview" style="font-size: 11px;">-</span>
        </div>
        <button id="logoutBtn" style="background: #dc2626; margin-top: 24px;">Logout</button>
      </div>
    </div>
  </div>

  <script>
    const API_URL = 'http://localhost:3001';
    
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      
      document.getElementById('errorMsg').style.display = 'none';
      document.getElementById('successMsg').style.display = 'none';
      document.getElementById('loginBtn').style.display = 'none';
      document.getElementById('loading').style.display = 'block';
      
      try {
        const response = await fetch(API_URL + '/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        
        if (!response.ok) throw new Error('Invalid credentials');
        
        const data = await response.json();
        
        if (data.success && data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          document.getElementById('successMsg').textContent = '✅ Login successful!';
          document.getElementById('successMsg').style.display = 'block';
          
          setTimeout(() => {
            document.getElementById('loginSection').style.display = 'none';
            document.getElementById('dashboardSection').style.display = 'block';
            
            document.getElementById('dashUsername').textContent = data.user.username;
            document.getElementById('dashRole').textContent = data.user.role.toUpperCase();
            document.getElementById('dashUserId').textContent = data.user.id;
            document.getElementById('tokenPreview').textContent = data.token.substring(0, 70) + '...';
          }, 1500);
        } else {
          throw new Error('Login failed');
        }
      } catch (error) {
        document.getElementById('errorMsg').textContent = '❌ ' + error.message;
        document.getElementById('errorMsg').style.display = 'block';
        document.getElementById('loginBtn').style.display = 'block';
        document.getElementById('loading').style.display = 'none';
      }
    });
    
    document.getElementById('logoutBtn').addEventListener('click', () => {
      localStorage.clear();
      document.getElementById('loginSection').style.display = 'block';
      document.getElementById('dashboardSection').style.display = 'none';
      document.getElementById('loginBtn').style.display = 'block';
      document.getElementById('loading').style.display = 'none';
      document.getElementById('errorMsg').style.display = 'none';
      document.getElementById('successMsg').style.display = 'none';
    });
    
    // Check if already logged in
    window.addEventListener('load', () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (token && user) {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('dashboardSection').style.display = 'block';
        
        const userData = JSON.parse(user);
        document.getElementById('dashUsername').textContent = userData.username;
        document.getElementById('dashRole').textContent = userData.role.toUpperCase();
        document.getElementById('dashUserId').textContent = userData.id;
        document.getElementById('tokenPreview').textContent = token.substring(0, 70) + '...';
      }
    });
  </script>
</body>
</html>
  `);
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Frontend running on http://localhost:${PORT}`);
});
