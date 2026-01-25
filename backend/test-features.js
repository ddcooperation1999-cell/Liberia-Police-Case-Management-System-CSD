const http = require('http');

const API_BASE = 'http://localhost:3001/api';
let authToken = '';

// Helper to make HTTP requests
function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: data ? JSON.parse(data) : null });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function testAllFeatures() {
  try {
    console.log('🔐 Testing Admin Login...\n');
    const loginRes = await makeRequest('POST', '/auth/login', {
      username: 'deca',
      password: 'admin123'
    });
    
    if (!loginRes.data?.token) {
      console.error('❌ Login failed:', loginRes.data?.error);
      process.exit(1);
    }
    
    authToken = loginRes.data.token;
    console.log('✅ Login successful!\n');
    
    // Test each of the 17 features
    const features = [
      { name: '1. Dashboard (Analytics)', method: 'GET', path: '/analytics/stats' },
      { name: '2. User Management', method: 'GET', path: '/users' },
      { name: '3. Case Management', method: 'GET', path: '/cases' },
      { name: '4. Notifications', method: 'GET', path: '/notifications' },
      { name: '5. Report Generation', method: 'GET', path: '/document-templates' },
      { name: '6. Evidence Management', method: 'GET', path: '/evidence' },
      { name: '7. Analytics Dashboard', method: 'GET', path: '/analytics/cases' },
      { name: '8. Police Clearance', method: 'GET', path: '/criminal-records' },
      { name: '9. Case Assignment', method: 'GET', path: '/case-assignments' },
      { name: '10. Case Notes', method: 'GET', path: '/case-notes' },
      { name: '11. Document Management', method: 'GET', path: '/documents' },
      { name: '12. Advanced Search', method: 'POST', path: '/search', body: { query: 'test' } },
      { name: '13. Audit Logs', method: 'GET', path: '/audit-logs' },
      { name: '14. Multi-Language Support', method: 'GET', path: '/multi-language/translations' },
      { name: '15. Offline Mode', method: 'GET', path: '/offline-sync/pending' },
      { name: '16. Geolocation Tagging', method: 'GET', path: '/geolocation/locations' },
      { name: '17. Case Closure Workflow', method: 'GET', path: '/case-closure' }
    ];

    console.log('📋 Testing All 17 Features:\n');
    
    let working = 0;
    const results = [];
    
    for (const feature of features) {
      try {
        const response = await makeRequest(feature.method, feature.path, feature.body);
        const status = response.status;
        
        if (status === 200 || status === 201) {
          console.log(`✅ ${feature.name.padEnd(40)} - Status: ${status}`);
          working++;
          results.push({ feature: feature.name, status: 'WORKING' });
        } else if (status === 401 || status === 403) {
          console.log(`⚠️  ${feature.name.padEnd(40)} - Auth Error: ${status}`);
          results.push({ feature: feature.name, status: `Auth ${status}` });
        } else if (status === 404) {
          console.log(`❌ ${feature.name.padEnd(40)} - Endpoint Not Found: ${status}`);
          results.push({ feature: feature.name, status: '404 Not Found' });
        } else {
          console.log(`⚠️  ${feature.name.padEnd(40)} - Status: ${status}`);
          results.push({ feature: feature.name, status: `Status ${status}` });
        }
      } catch (err) {
        console.log(`❌ ${feature.name.padEnd(40)} - ${err.message}`);
        results.push({ feature: feature.name, status: 'ERROR: ' + err.message });
      }
    }
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ WORKING: ${working}/17 features`);
    console.log(`${'='.repeat(60)}`);
    
    if (working < 17) {
      console.log('\n⚠️  Broken features:');
      results.filter(r => r.status !== 'WORKING').forEach(r => {
        console.log(`  - ${r.feature}: ${r.status}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
  
  process.exit(0);
}

testAllFeatures();
