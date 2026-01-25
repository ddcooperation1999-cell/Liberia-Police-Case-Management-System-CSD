#!/usr/bin/env node

const http = require('http');

async function testEndpoint(method, endpoint, data = null) {
  return new Promise((resolve) => {
    const urlObj = new URL(`http://localhost:3001${endpoint}`);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(urlObj, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, body });
      });
    });

    req.setTimeout(3000);
    req.on('error', (err) => {
      resolve({ status: 0, body: err.message });
    });

    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function test() {
  console.log('Testing API Endpoints...\n');
  
  // Test login first
  console.log('1. Testing Authentication...');
  const loginRes = await testEndpoint('POST', '/api/auth/login', {
    username: 'dortusnimely',
    password: 'dortusnimely'
  });
  
  if (loginRes.status !== 200) {
    console.log('❌ Login failed:', loginRes.status);
    console.log('Response:', loginRes.body.substring(0, 200));
    return;
  }
  
  let token = '';
  try {
    const parsed = JSON.parse(loginRes.body);
    token = parsed.token;
    console.log('✅ Login successful, token:', token.substring(0, 20) + '...\n');
  } catch (e) {
    console.log('❌ Could not parse login response\n');
    return;
  }

  // Test each endpoint
  const endpoints = [
    { name: 'Cases', method: 'GET', path: '/api/cases' },
    { name: 'Users', method: 'GET', path: '/api/users' },
    { name: 'Analytics', method: 'GET', path: '/api/analytics' },
    { name: 'Audit Logs', method: 'GET', path: '/api/audit-logs' },
    { name: 'Search', method: 'POST', path: '/api/search', data: { q: 'test' } },
    { name: 'Case Notes', method: 'POST', path: '/api/case-notes', data: { case_id: 1, note: 'test' } },
    { name: 'Evidence', method: 'POST', path: '/api/evidence', data: { case_id: 1, description: 'test' } },
    { name: 'Geolocation', method: 'POST', path: '/api/geolocation', data: { case_id: 1, latitude: 0, longitude: 0 } },
    { name: 'Case Closure', method: 'POST', path: '/api/case-closure', data: { case_id: 1, closure_reason: 'test' } },
    { name: 'Case Assignments', method: 'GET', path: '/api/case-assignments' },
    { name: 'Multi-Language', method: 'GET', path: '/api/multi-language' },
    { name: 'Flagged Individuals', method: 'GET', path: '/api/flagged-individuals' }
  ];

  for (const endpoint of endpoints) {
    const res = await testEndpoint(endpoint.method, endpoint.path, endpoint.data);
    const status = res.status === 200 ? '✅' : '❌';
    console.log(`${status} ${endpoint.name} (${endpoint.method}) - Status: ${res.status}`);
    if (res.status !== 200 && res.status !== 404) {
      console.log('   Error:', res.body.substring(0, 100));
    }
  }
}

test();
