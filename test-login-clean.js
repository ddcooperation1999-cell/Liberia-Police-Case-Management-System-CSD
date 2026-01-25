#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function runTests() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('   ADMIN LOGIN TEST - MALICIOUS CODE REMOVAL');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // Test 1: Health check
    console.log('1️⃣  Testing server health...');
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('   ✓ Server is running\n');

    // Test 2: Login
    console.log('2️⃣  Testing admin login...');
    const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'dortusnimely',
      password: 'dortusnimely'
    });

    if (loginRes.data.token) {
      console.log('   ✓ LOGIN SUCCESSFUL!\n');
      console.log('   Token:', loginRes.data.token.substring(0, 20) + '...');
      console.log('   User:', loginRes.data.user.username);
      console.log('   Role:', loginRes.data.user.role);
      console.log('   ID:', loginRes.data.user.id);
      console.log('\n═══════════════════════════════════════════════════════');
      console.log('✓ ALL TESTS PASSED - YOU CAN NOW LOGIN TO THE ADMIN PANEL!');
      console.log('═══════════════════════════════════════════════════════\n');
      console.log('Admin credentials:');
      console.log('  Username: dortusnimely');
      console.log('  Password: dortusnimely\n');
      process.exit(0);
    } else {
      throw new Error('No token in response');
    }
  } catch (error) {
    console.error('\n✗ TEST FAILED\n');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
    console.error('\nMake sure the backend is running on port 3001');
    process.exit(1);
  }
}

// Wait a moment for server to start, then test
setTimeout(runTests, 2000);
