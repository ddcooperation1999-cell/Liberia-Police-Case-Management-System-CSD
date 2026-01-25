const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';
let authToken = '';

async function testAllFeatures() {
  try {
    console.log('🔐 Testing Admin Login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      username: 'deca',
      password: 'admin123'
    });
    
    authToken = loginResponse.data.token;
    console.log('✅ Login successful!\n');
    
    const headers = {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    };

    // Test each feature endpoint with correct HTTP methods
    const features = [
      { name: 'Dashboard', endpoint: '/analytics', method: 'GET' },
      { name: 'User Management', endpoint: '/users', method: 'GET' },
      { name: 'Case Management', endpoint: '/cases', method: 'GET' },
      { name: 'Notifications', endpoint: '/notifications', method: 'GET' },
      { name: 'Report Generation', endpoint: '/document-templates', method: 'GET' },
      { name: 'Evidence Management', endpoint: '/evidence', method: 'GET' },
      { name: 'Analytics Dashboard', endpoint: '/analytics/cases/stats', method: 'GET' },
      { name: 'Police Clearance Check', endpoint: '/criminal-records', method: 'GET' },
      { name: 'Case Assignment', endpoint: '/case-assignments', method: 'GET' },
      { name: 'Case Notes', endpoint: '/case-notes', method: 'GET' },
      { name: 'Document Management', endpoint: '/documents', method: 'GET' },
      { name: 'Advanced Search', endpoint: '/search', method: 'POST', data: { query: 'test' } },
      { name: 'Audit Logs', endpoint: '/audit-logs', method: 'GET' },
      { name: 'Multi-Language Support', endpoint: '/multi-language/translations', method: 'GET' },
      { name: 'Offline Mode', endpoint: '/offline-sync/pending', method: 'GET' },
      { name: 'Geolocation Tagging', endpoint: '/geolocation/locations', method: 'GET' },
      { name: 'Case Closure Workflow', endpoint: '/case-closure', method: 'GET' }
    ];

    console.log('📋 Testing All 17 Features:\n');
    
    let working = 0;
    for (const feature of features) {
      try {
        const config = { headers, timeout: 5000 };
        let response;
        
        if (feature.method === 'POST') {
          response = await axios.post(`${API_BASE}${feature.endpoint}`, feature.data || {}, config);
        } else {
          response = await axios.get(`${API_BASE}${feature.endpoint}`, config);
        }
        
        console.log(`✅ ${feature.name.padEnd(30)} - ${response.status} OK`);
        working++;
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          console.log(`⚠️  ${feature.name.padEnd(30)} - Auth error: ${err.response.status}`);
        } else if (err.response?.status === 404) {
          console.log(`⚠️  ${feature.name.padEnd(30)} - Not found: ${err.response.status}`);
        } else if (err.response?.status === 500) {
          console.log(`❌ ${feature.name.padEnd(30)} - Server error: 500`);
        } else if (err.response?.status === 400) {
          console.log(`⚠️  ${feature.name.padEnd(30)} - Bad request: 400`);
        } else {
          console.log(`❌ ${feature.name.padEnd(30)} - Error: ${err.message}`);
        }
      }
    }
    
    console.log(`\n${'='.repeat(50)}`);
    console.log(`🎉 RESULT: ${working}/17 features are fully functional!`);
    console.log(`${'='.repeat(50)}\n`);
    console.log(`✅ Admin Login Credentials:`);
    console.log(`   Username: deca`);
    console.log(`   Password: admin123`);
    console.log(`   Role: Admin`);
    console.log(`   Access: http://localhost:3000\n`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  process.exit(0);
}

testAllFeatures();
