const bcrypt = require('bcrypt');
const db = require('./db');

async function resetAdminPassword() {
  try {
    // Password we want to set
    const newPassword = 'admin123';
    
    // Generate hash
    const hash = await bcrypt.hash(newPassword, 12);
    console.log('Generated hash:', hash);
    
    // Update admin user
    const result = await db.run(
      'UPDATE users SET password_hash = ? WHERE username = ?',
      [hash, 'deca']
    );
    
    console.log('✅ Admin password reset successfully!');
    console.log('Username: deca');
    console.log('Password: admin123');
    console.log('Update result:', result);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting password:', error);
    process.exit(1);
  }
}

resetAdminPassword();
