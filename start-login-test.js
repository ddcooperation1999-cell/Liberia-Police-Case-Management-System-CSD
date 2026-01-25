#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('\n═══════════════════════════════════════════');
console.log('  STARTING CLEAN ADMIN LOGIN SYSTEM');
console.log('═══════════════════════════════════════════\n');

// Start backend
console.log('Starting backend server...\n');
const backend = spawn('node', [path.join(__dirname, 'backend', 'index.js')], {
  stdio: 'inherit',
  cwd: __dirname
});

// Wait for backend to start, then test
setTimeout(() => {
  console.log('\n\nTesting login functionality...\n');
  const test = spawn('node', [path.join(__dirname, 'test-login-clean.js')], {
    stdio: 'inherit',
    cwd: __dirname
  });

  test.on('close', (code) => {
    process.exit(code);
  });
}, 3000);

backend.on('error', (err) => {
  console.error('Failed to start backend:', err);
  process.exit(1);
});
