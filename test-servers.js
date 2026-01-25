#!/usr/bin/env node
const http = require('http');

// Test frontend
const feReq = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/',
  method: 'GET',
  timeout: 5000
}, (res) => {
  console.log('✓ Frontend Status:', res.statusCode);
  res.on('data', () => {});
  res.on('end', () => {
    // Test backend
    const beReq = http.request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/auth/login',
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      timeout: 5000
    }, (res) => {
      console.log('✓ Backend Status:', res.statusCode);
      res.on('data', () => {});
      res.on('end', () => {
        console.log('✓ Both servers responding!');
        console.log('✓ Frontend: http://localhost:3000');
        console.log('✓ Backend: http://localhost:3001');
        process.exit(0);
      });
    });
    beReq.on('error', (e) => {
      console.log('✗ Backend error:', e.message);
      process.exit(1);
    });
    beReq.write('{"username":"dortusnimely","password":"dortusnimely"}');
    beReq.end();
  });
});

feReq.on('error', (e) => {
  console.log('✗ Frontend error:', e.message);
  process.exit(1);
});

feReq.end();
