const axios = require('axios');

const testLogin = async () => {
  try {
    console.log('🔍 Testing login endpoint...\n');
    
    const response = await axios.post('http://localhost:3001/api/auth/login', {
      username: 'dortusnimely',
      password: 'dortusnimely'
    });
    
    console.log('✅ Login successful!');
    console.log('Token:', response.data.token);
    console.log('User:', response.data.user);
  } catch (error) {
    console.log('❌ Login failed');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
    } else if (error.code === 'ECONNREFUSED') {
      console.log('ERROR: Backend server not running on port 3001');
    } else {
      console.log('Error:', error.message);
    }
  }
};

testLogin();
