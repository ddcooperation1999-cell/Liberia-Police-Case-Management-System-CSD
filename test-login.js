#!/usr/bin/env node
const http = require('http');

const loginData = JSON.stringify({
  username: 'dortusnimely',
  password: 'dortusnimely'
});

const req = http.request({
  hostname: 'localhost',
  port: 3001,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(loginData)
  },
  timeout: 5000
}, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    try {
      const result = JSON.parse(data);
      if (result.token) {
        console.log('✓ Login successful!');
        console.log('✓ Token received:', result.token.substring(0, 50) + '...');
        console.log('✓ User:', result.user.username, '(', result.user.role, ')');
      } else {
        console.log('✗ No token in response:', result);
      }
    } catch (e) {
      console.log('✗ Error parsing response:', e.message);
      console.log('Response:', data);
    }
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.log('✗ Request error:', e.message);
  process.exit(1);
});

req.write(loginData);
req.end();
