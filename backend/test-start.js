console.log('Starting test...');

try {
  console.log('Loading modules...');
  const express = require('express');
  console.log('Express loaded');
  
  const db = require('./db');
  console.log('Database loaded');
  
  const path = require('path');
  console.log('Path loaded');
  
  const fs = require('fs');
  console.log('FS loaded');
  
  console.log('All modules loaded successfully!');
  process.exit(0);
} catch (err) {
  console.error('ERROR:', err.message);
  console.error(err.stack);
  process.exit(1);
}
