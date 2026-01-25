const db = require('./db');

async function checkAdmin() {
  try {
    const result = await db.query('SELECT * FROM users WHERE role = ?', ['admin']);
    console.log('Admin users found:', result.rows);
  } catch (err) {
    console.error('Error checking admin:', err);
  } finally {
    process.exit();
  }
}

checkAdmin();
