const http = require('http');

console.log('🔍 Testing LNPMS Auth Fix...\n');

async function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: JSON.parse(body)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: body
          });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

(async () => {
  try {
    // Step 1: Login
    console.log('1️⃣ Testing LOGIN...');
    const loginRes = await makeRequest('POST', '/api/auth/login', {
      username: 'dortusnimely',
      password: 'dortusnimely'
    });
    
    console.log('Status:', loginRes.status);
    console.log('Response:', loginRes.data);
    
    if (!loginRes.data.token) {
      console.error('❌ Login failed - no token');
      process.exit(1);
    }
    
    const token = loginRes.data.token;
    console.log('✅ Login successful! Token:', token.substring(0, 30) + '...\n');

    // Wait 1 second
    await new Promise(r => setTimeout(r, 1000));

    // Step 2: Test Cases endpoint with token
    console.log('2️⃣ Testing CASES endpoint WITH token...');
    const casesRes = await makeRequest('GET', '/api/cases', null);
    casesRes.headers['authorization'] = 'Bearer ' + token;
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/cases',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    };

    const casesReq = await new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve({
              status: res.statusCode,
              data: JSON.parse(body)
            });
          } catch (e) {
            resolve({
              status: res.statusCode,
              data: body
            });
          }
        });
      });
      req.on('error', reject);
      req.end();
    });

    console.log('Status:', casesReq.status);
    console.log('Response:', casesReq.data);
    
    if (casesReq.status === 200) {
      console.log('✅ CASES endpoint works!\n');
    } else {
      console.log('❌ CASES endpoint failed!\n');
    }

    // Step 3: Test Users endpoint
    console.log('3️⃣ Testing USERS endpoint...');
    const usersRes = await new Promise((resolve, reject) => {
      const req = http.request({
        hostname: 'localhost',
        port: 3001,
        path: '/api/users',
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + token
        }
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve({
              status: res.statusCode,
              data: JSON.parse(body)
            });
          } catch (e) {
            resolve({
              status: res.statusCode,
              data: body
            });
          }
        });
      });
      req.on('error', reject);
      req.end();
    });

    console.log('Status:', usersRes.status);
    console.log('Response:', usersRes.data);
    
    if (usersRes.status === 200) {
      console.log('✅ USERS endpoint works!\n');
    } else {
      console.log('❌ USERS endpoint failed!\n');
    }

    // Step 4: Test Analytics
    console.log('4️⃣ Testing ANALYTICS endpoint...');
    const analyticsRes = await new Promise((resolve, reject) => {
      const req = http.request({
        hostname: 'localhost',
        port: 3001,
        path: '/api/analytics',
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + token
        }
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve({
              status: res.statusCode,
              data: JSON.parse(body)
            });
          } catch (e) {
            resolve({
              status: res.statusCode,
              data: body
            });
          }
        });
      });
      req.on('error', reject);
      req.end();
    });

    console.log('Status:', analyticsRes.status);
    console.log('Response:', analyticsRes.data);
    
    console.log('\n📊 SUMMARY:');
    const allGood = 
      loginRes.status === 200 &&
      casesReq.status === 200 &&
      usersRes.status === 200 &&
      analyticsRes.status === 200;
    
    if (allGood) {
      console.log('✅✅✅ ALL TESTS PASSED! Auth flow is FIXED! ✅✅✅');
    } else {
      console.log('⚠️ Some tests failed - check responses above');
    }

  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
