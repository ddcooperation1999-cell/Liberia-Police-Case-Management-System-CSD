const db = require('./db');
const bcrypt = require('bcrypt');

async function resetAdminPassword() {
  try {
    // Generate a secure password for the 'deca' admin user
    const newPassword = 'SecureAdminPass123!'; // Change this to your desired password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update the password for the 'deca' user
    await db.run(
      'UPDATE users SET password_hash = ? WHERE username = ?',
      [passwordHash, 'deca']
    );

    console.log('✓ Admin password reset successfully!');
    console.log(`  Username: deca`);
    console.log(`  New password: ${newPassword}`);
    console.log('');
    console.log('⚠️  IMPORTANT: Change this password on first login!');
    process.exit();
  } catch (err) {
    console.error('❌ Error resetting password:', err);
    process.exit(1);
  }
}

resetAdminPassword();
