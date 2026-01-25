#!/usr/bin/env node
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3001;
const buildDir = path.join(__dirname, '..', 'frontend', 'build');

// Mock auth database
const mockUsers = {
  'dortusnimely': 'dortusnimely',
  'admin': 'admin123'
};

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  console.log(`[${new Date().toISOString()}] ${req.method} ${pathname}`);

  // Health check
  if (pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', server: 'Mock API' }));
    return;
  }

  // Login endpoint
  if (pathname === '/api/auth/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { username, password } = JSON.parse(body);
        
        console.log(`[AUTH] Login attempt: ${username}`);

        // Mock authentication
        if (mockUsers[username] === password) {
          console.log(`[AUTH] Login success: ${username}`);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            token: 'mock-jwt-token-' + Date.now(),
            user: {
              id: 1,
              username: username,
              role: username === 'dortusnimely' ? 'admin' : 'officer'
            }
          }));
        } else {
          console.log(`[AUTH] Invalid credentials: ${username}`);
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid credentials' }));
        }
      } catch (err) {
        console.error('[ERROR]', err);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Bad request' }));
      }
    });
    return;
  }

  // Get user
  if (pathname === '/api/auth/me') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      user: {
        id: 1,
        username: 'dortusnimely',
        role: 'admin'
      }
    }));
    return;
  }

  // Get counties
  if (pathname === '/api/counties') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      counties: [
        { id: 1, name: 'Montserrado' },
        { id: 2, name: 'Grand Cape Mount' }
      ]
    }));
    return;
  }

  // Get cases
  if (pathname === '/api/cases') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      cases: [
        { id: 1, case_number: 'CASE001', case_type: 'Theft', status: 'Open', priority: 'High' },
        { id: 2, case_number: 'CASE002', case_type: 'Assault', status: 'Closed', priority: 'Medium' }
      ]
    }));
    return;
  }

  // Default 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`[API] Mock Backend Server Started`);
  console.log(`[API] Listening on http://localhost:${PORT}`);
  console.log(`[API] Mock users available:`);
  console.log(`      - dortusnimely / dortusnimely (admin)`);
  console.log(`      - admin / admin123`);
  console.log(`${'='.repeat(60)}\n`);
});

process.on('SIGINT', () => {
  console.log('\n[API] Shutting down...');
  server.close(() => {
    console.log('[API] Stopped');
    process.exit(0);
  });
});
