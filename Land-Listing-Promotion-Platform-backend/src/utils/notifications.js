// src/utils/notifications.js
//
// Sends an in-app notification (PRD section 7 #52: "Admin notification for
// new user registrations and listing submissions") to every Admin and
// Sub-Admin. These show up via GET /api/admin/notifications.

const pool = require('../config/db');

async function notifyAdmins({ type, message, related_id = null }) {
  try {
    const admins = await pool.query("SELECT id FROM users WHERE role IN ('admin', 'sub_admin')");
    for (const admin of admins.rows) {
      await pool.query(
        'INSERT INTO notifications (user_id, type, message, related_id) VALUES ($1, $2, $3, $4)',
        [admin.id, type, message, related_id]
      );
    }
  } catch (err) {
    // A failed notification should never break the actual request (e.g.
    // registration or listing creation) — just log it and move on.
    console.error('notifyAdmins error:', err.message);
  }
}

module.exports = { notifyAdmins };
