const bcrypt = require('bcrypt');
const db = require('./db');

async function resetAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('dortusnimely', 10);
    await db.run('UPDATE users SET username = ?, password_hash = ? WHERE id = 1', ['dortusnimely', hashedPassword]);
    console.log('Admin credentials reset successfully.');
    console.log('Username: dortusnimely');
    console.log('Password: dortusnimely');
    process.exit(0);
  } catch (err) {
    console.error('Error resetting admin:', err);
    process.exit(1);
  }
}

resetAdmin();