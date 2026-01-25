const axios = require('axios');

async function testLogin() {
  try {
    console.log('Testing login...\n');
    
    const response = await axios.post('http://localhost:3001/api/auth/login', {
      username: 'dortusnimely',
      password: 'dortusnimely'
    });

    console.log('✓ LOGIN SUCCESSFUL!\n');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.token) {
      console.log('\n✓ Token generated successfully');
      console.log('You can now access the admin panel!');
    }
  } catch (error) {
    console.error('✗ LOGIN FAILED');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testLogin();
