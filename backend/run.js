#!/usr/bin/env node

console.log('[WRAPPER] Starting backend server...');
console.log('[WRAPPER] Working directory:', process.cwd());
console.log('[WRAPPER] Node version:', process.version);

try {
  console.log('[WRAPPER] Loading simple-server...');
  require('./simple-server.js');
} catch (err) {
  console.error('[WRAPPER] FATAL ERROR:', err);
  process.exit(1);
}
