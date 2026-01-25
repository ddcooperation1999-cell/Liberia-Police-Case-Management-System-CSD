const express = require('express');
const path = require('path');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable compression
app.use(compression());
app.use(express.json());

// Serve static files from public directory if it exists
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// Simple login page - serves directly without React build
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LNP Case Management System - Admin Login</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .login-container {
      background: white;
      border-radius: 10px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      padding: 40px;
      width: 100%;
      max-width: 400px;
    }
    .logo {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo h1 {
      color: #333;
      font-size: 24px;
      margin-bottom: 10px;
    }
    .logo p {
      color: #666;
      font-size: 14px;
    }
    .form-group {
      margin-bottom: 20px;
    }
    label {
      display: block;
      color: #333;
      font-weight: 600;
      margin-bottom: 8px;
      font-size: 14px;
    }
    input {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 14px;
      transition: border-color 0.3s;
    }
    input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 5px rgba(102, 126, 234, 0.3);
    }
    button {
      width: 100%;
      padding: 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 5px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }
    button:active {
      transform: translateY(0);
    }
    .error {
      color: #d32f2f;
      font-size: 14px;
      margin-bottom: 15px;
      padding: 10px;
      background: #ffebee;
      border-radius: 5px;
      display: none;
    }
    .success {
      color: #388e3c;
      font-size: 14px;
      margin-bottom: 15px;
      padding: 10px;
      background: #e8f5e9;
      border-radius: 5px;
      display: none;
    }
    .loading {
      display: none;
      text-align: center;
      color: #667eea;
    }
    .loader {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      animation: spin 1s linear infinite;
      margin: 0 auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .dashboard {
      display: none;
    }
    .dashboard-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    .dashboard-header h2 {
      margin-bottom: 5px;
    }
    .user-info {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    .user-info p {
      margin: 5px 0;
      color: #333;
    }
    .logout-btn {
      background: #d32f2f;
      margin-top: 15px;
    }
    .logout-btn:hover {
      box-shadow: 0 5px 15px rgba(211, 47, 47, 0.4);
    }
  </style>
</head>
<body>
  <div id="app">
    <!-- Login Form -->
    <div id="loginForm" class="login-container">
      <div class="logo">
        <h1>🔐 LNP CMS</h1>
        <p>Liberia National Police<br>Case Management System</p>
      </div>
      
      <div id="errorMsg" class="error"></div>
      <div id="successMsg" class="success"></div>
      
      <form id="authForm">
        <div class="form-group">
          <label for="username">Username</label>
          <input 
            type="text" 
            id="username" 
            name="username" 
            placeholder="Enter your username"
            value="deca"
            required
          >
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <input 
            type="password" 
            id="password" 
            name="password" 
            placeholder="Enter your password"
            value="SecureAdminPass123!"
            required
          >
        </div>
        
        <div id="loading" class="loading">
          <div class="loader"></div>
          <p>Logging in...</p>
        </div>
        
        <button type="submit" id="loginBtn">Login to Admin Panel</button>
      </form>
    </div>

    <!-- Dashboard -->
    <div id="dashboard" class="login-container dashboard">
      <div class="dashboard-header">
        <h2>✅ Login Successful!</h2>
        <p>Welcome to your admin panel</p>
      </div>

      <div class="user-info">
        <p><strong>Username:</strong> <span id="dashUsername"></span></p>
        <p><strong>Role:</strong> <span id="dashRole"></span></p>
        <p><strong>User ID:</strong> <span id="dashUserId"></span></p>
      </div>

      <div class="user-info">
        <p><strong>JWT Token (First 50 chars):</strong></p>
        <p style="word-break: break-all; font-family: monospace; font-size: 12px;" id="tokenPreview"></p>
      </div>

      <div class="user-info">
        <p><strong>Session Status:</strong> ✅ Active</p>
        <p><strong>Authentication:</strong> ✅ Verified</p>
        <p><strong>Admin Access:</strong> ✅ Granted</p>
      </div>

      <button class="logout-btn" id="logoutBtn">Logout</button>
    </div>
  </div>

  <script>
    const API_URL = 'http://localhost:3001';
    const authForm = document.getElementById('authForm');
    const loginForm = document.getElementById('loginForm');
    const dashboard = document.getElementById('dashboard');
    const errorMsg = document.getElementById('errorMsg');
    const successMsg = document.getElementById('successMsg');
    const loading = document.getElementById('loading');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    // Handle login
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      
      errorMsg.style.display = 'none';
      successMsg.style.display = 'none';
      loginBtn.style.display = 'none';
      loading.style.display = 'block';

      try {
        const response = await fetch(\`\${API_URL}/api/auth/login\`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
          throw new Error('Invalid credentials');
        }

        const data = await response.json();

        if (data.success && data.token) {
          // Store token
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));

          // Show dashboard
          successMsg.textContent = '✅ Login successful! Redirecting...';
          successMsg.style.display = 'block';

          setTimeout(() => {
            loginForm.style.display = 'none';
            dashboard.style.display = 'block';
            
            // Display user info
            document.getElementById('dashUsername').textContent = data.user.username;
            document.getElementById('dashRole').textContent = data.user.role.toUpperCase();
            document.getElementById('dashUserId').textContent = data.user.id;
            document.getElementById('tokenPreview').textContent = data.token.substring(0, 50) + '...';
          }, 1000);
        } else {
          throw new Error('Login failed');
        }
      } catch (error) {
        errorMsg.textContent = '❌ Login failed: ' + error.message;
        errorMsg.style.display = 'block';
        loginBtn.style.display = 'block';
        loading.style.display = 'none';
      }
    });

    // Handle logout
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      loginForm.style.display = 'block';
      dashboard.style.display = 'none';
      document.getElementById('username').value = 'deca';
      document.getElementById('password').value = 'SecureAdminPass123!';
      errorMsg.style.display = 'none';
      loginBtn.style.display = 'block';
      loading.style.display = 'none';
    });

    // Auto-login on page load if token exists
    window.addEventListener('load', () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (token && user) {
        loginForm.style.display = 'none';
        dashboard.style.display = 'block';
        
        const userData = JSON.parse(user);
        document.getElementById('dashUsername').textContent = userData.username;
        document.getElementById('dashRole').textContent = userData.role.toUpperCase();
        document.getElementById('dashUserId').textContent = userData.id;
        document.getElementById('tokenPreview').textContent = token.substring(0, 50) + '...';
      }
    });
  </script>
</body>
</html>
  `);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Frontend running' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(\`✅ Frontend server running on http://localhost:\${PORT}\`);
});
