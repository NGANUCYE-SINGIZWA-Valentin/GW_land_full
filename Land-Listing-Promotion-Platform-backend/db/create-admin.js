// db/create-admin.js
//
// There is no public sign-up path to becoming an Admin or Sub-Admin —
// that's intentional, it stops anyone from registering as an admin through
// the API. Run this script once from your terminal to create the first
// admin account:
//
//   node db/create-admin.js "Your Name" admin@example.com SomeStrongPassword123
//
// To create a Sub-Admin instead, add "sub_admin" as a 4th argument:
//   node db/create-admin.js "Mod Name" mod@example.com SomeStrongPassword123 sub_admin

require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../src/config/db');

async function main() {
  const [, , fullName, email, password, roleArg] = process.argv;
  const role = roleArg === 'sub_admin' ? 'sub_admin' : 'admin';

  if (!fullName || !email || !password) {
    console.log('Usage: node db/create-admin.js "Full Name" email@example.com password [sub_admin]');
    process.exit(1);
  }
  if (password.length < 8) {
    console.log('Password must be at least 8 characters.');
    process.exit(1);
  }

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      console.log('❌ A user with that email already exists.');
      process.exit(1);
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (role, full_name, email, password_hash, status, is_verified)
       VALUES ($1, $2, $3, $4, 'approved', true)
       RETURNING id, full_name, email, role`,
      [role, fullName, email.toLowerCase(), password_hash]
    );

    console.log('✅ Account created:', result.rows[0]);
  } catch (err) {
    console.error('❌ Failed to create account:', err.message);
  } finally {
    await pool.end();
  }
}

main();
