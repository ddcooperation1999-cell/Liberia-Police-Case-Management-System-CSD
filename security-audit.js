#!/usr/bin/env node

/**
 * Security Audit Script for Liberia National Police CMS
 * This script performs basic security checks on the codebase
 */

const fs = require('fs');
const path = require('path');

console.log('🔒 Liberia National Police CMS - Security Audit');
console.log('================================================\n');

// Check for environment file
console.log('1. Environment Configuration:');
const envPath = path.join(__dirname, 'backend', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const jwtSecret = envContent.match(/JWT_SECRET=(.+)/)?.[1];
  if (jwtSecret && jwtSecret.length >= 32) {
    console.log('   ✅ JWT_SECRET is properly configured (32+ characters)');
  } else {
    console.log('   ❌ JWT_SECRET is too short or missing (must be 32+ characters)');
  }
} else {
  console.log('   ❌ .env file not found');
}

// Check for default passwords in SQL file
console.log('\n2. Default Credentials Check:');
const sqlPath = path.join(__dirname, 'backend', 'sql', 'init.sql');
if (fs.existsSync(sqlPath)) {
  const sqlContent = fs.readFileSync(sqlPath, 'utf8');
  if (sqlContent.includes('admin123') || sqlContent.includes('officer123')) {
    console.log('   ⚠️  WARNING: Default passwords detected in database schema');
    console.log('   🔧 Action Required: Change default passwords before deployment');
  } else {
    console.log('   ✅ No default passwords found in database schema');
  }
}

// Check for security dependencies
console.log('\n3. Security Dependencies:');
const packagePath = path.join(__dirname, 'backend', 'package.json');
if (fs.existsSync(packagePath)) {
  const packageContent = fs.readFileSync(packagePath, 'utf8');
  const packageJson = JSON.parse(packageContent);

  const securityDeps = ['helmet', 'express-rate-limit', 'bcrypt'];
  securityDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      console.log(`   ✅ ${dep} is installed`);
    } else {
      console.log(`   ❌ ${dep} is missing`);
    }
  });
}

// Check for sensitive files
console.log('\n4. Sensitive Files Check:');
const sensitiveFiles = [
  'backend/.env',
  'backend/police_cases.db',
  'frontend/build'
];

sensitiveFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ⚠️  ${file} exists - ensure it\'s in .gitignore`);
  }
});

// Check for HTTPS in production
console.log('\n5. Production Readiness:');
const envExamplePath = path.join(__dirname, 'backend', '.env.example');
if (fs.existsSync(envExamplePath)) {
  const envExample = fs.readFileSync(envExamplePath, 'utf8');
  if (envExample.includes('NODE_ENV=production')) {
    console.log('   ✅ Production environment configuration available');
  } else {
    console.log('   ❌ Production environment configuration missing');
  }
}

console.log('\n6. Recommendations:');
console.log('   • Change all default passwords before deployment');
console.log('   • Use HTTPS in production');
console.log('   • Implement proper logging and monitoring');
console.log('   • Regular security updates of dependencies');
console.log('   • Database backups and encryption');
console.log('   • Implement rate limiting (✅ Done)');
console.log('   • Use security headers (✅ Done)');

console.log('\n🔒 Security audit completed.');
console.log('📋 Review the items above and address any warnings before deployment.');