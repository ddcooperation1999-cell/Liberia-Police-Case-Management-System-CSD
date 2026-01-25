#!/usr/bin/env node
console.log('Starting LNPMS Backend Server...');
console.log('Current directory:', process.cwd());
console.log('Node version:', process.version);

try {
  const app = require('./backend/index.js');
  console.log('Backend server loaded successfully');
} catch (error) {
  console.error('ERROR loading backend:', error.message);
  console.error('Full error:', error);
  process.exit(1);
}
