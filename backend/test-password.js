const bcrypt = require('bcrypt');

async function testPassword() {
  try {
    const hash = '$2b$10$T10EiQOLM2v8gVkaOr2dm.LsEyDgYPtxrCaeSfcWNH4m4KwQS6vDm';
    const password = 'dortusnimely';
    const isValid = await bcrypt.compare(password, hash);
    console.log('Password validation result:', isValid);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit();
  }
}

testPassword();
