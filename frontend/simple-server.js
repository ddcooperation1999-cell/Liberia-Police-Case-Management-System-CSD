const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send(`
<html>
<head>
<title>Admin Login</title>
<style>
body { font-family: Arial; background: linear-gradient(135deg, #667eea, #764ba2); min-height: 100vh; margin: 0; padding: 20px; display: flex; justify-content: center; align-items: center; }
.box { background: white; padding: 40px; border-radius: 10px; width: 400px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
h1 { color: #333; text-align: center; margin: 0 0 30px 0; }
.form-group { margin-bottom: 20px; }
label { display: block; margin-bottom: 5px; color: #333; font-weight: bold; }
input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px; }
button { width: 100%; padding: 10px; background: #667eea; color: white; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; margin-top: 20px; }
button:hover { background: #764ba2; }
.msg { margin-bottom: 20px; padding: 10px; border-radius: 5px; display: none; }
.error { background: #ffebee; color: #c62828; border: 1px solid #c62828; }
.success { background: #e8f5e9; color: #2e7d32; border: 1px solid #2e7d32; }
#dashboard { display: none; }
.user-box { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0; }
</style>
</head>
<body>

<div class="box">
  <div id="login">
    <h1>LNP Admin Login</h1>
    <div id="msg" class="msg"></div>
    
    <form id="form">
      <div class="form-group">
        <label>Username</label>
        <input type="text" id="user" value="dortusnimely">
      </div>
      <div class="form-group">
        <label>Password</label>
        <input type="password" id="pass" value="dortusnimely">
      </div>
      <button type="submit">Login</button>
    </form>
  </div>

  <div id="dashboard" style="width: 100%; max-width: 1200px;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
      <h1>🔒 Admin Dashboard</h1>
      <button onclick="logout()" style="background: #d32f2f; padding: 10px 20px; cursor: pointer;">Logout</button>
    </div>
    
    <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
      <h2>User Information</h2>
      <div class="user-box">
        <strong>Username:</strong> <span id="u">-</span>
      </div>
      <div class="user-box">
        <strong>Role:</strong> <span id="r">-</span>
      </div>
      <div class="user-box">
        <strong>User ID:</strong> <span id="id">-</span>
      </div>
    </div>

    <div style="background: white; padding: 20px; border-radius: 10px;">
      <h2>Dashboard Statistics</h2>
      <div id="stats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center;">
          <div style="font-size: 24px; font-weight: bold; color: #667eea;">-</div>
          <div>Total Cases</div>
        </div>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center;">
          <div style="font-size: 24px; font-weight: bold; color: #667eea;">-</div>
          <div>Active Users</div>
        </div>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center;">
          <div style="font-size: 24px; font-weight: bold; color: #667eea;">-</div>
          <div>Pending Cases</div>
        </div>
      </div>
    </div>
  </div>
</div>

<script>
const api = 'http://localhost:3001';

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
      
      document.getElementById('u').textContent = d.user.username;
      document.getElementById('r').textContent = d.user.role;
      document.getElementById('id').textContent = d.user.id;
    } else {
      throw new Error('Login failed');
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
  document.getElementById('login').style.display = 'block';
  document.getElementById('dashboard').style.display = 'none';
}

window.onload = () => {
  if (localStorage.getItem('token')) {
    const user = JSON.parse(localStorage.getItem('user'));
    document.getElementById('login').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('u').textContent = user.username;
    document.getElementById('r').textContent = user.role;
    document.getElementById('id').textContent = user.id;
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
