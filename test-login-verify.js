const http = require('http');

// Test login with existing admin user
const loginPayload = JSON.stringify({
  username: 'deca',
  password: 'SecureAdminPass123!'
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(loginPayload)
  }
};

console.log('Testing login endpoint...');
console.log('POST http://localhost:3001/api/auth/login');
console.log('Payload:', { username: 'deca', password: '***' });
console.log('---');

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:');
    try {
      const parsed = JSON.parse(data);
      if (parsed.token) {
        console.log('✓ Login successful!');
        console.log('  Token (first 50 chars):', parsed.token.substring(0, 50) + '...');
        console.log('  User:', parsed.user);
      } else {
        console.log(parsed);
      }
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Connection error:', error.message);
  console.log('\nMake sure backend is running on port 3001');
  console.log('Run: cd backend && npm start');
});

req.write(loginPayload);
req.end();
