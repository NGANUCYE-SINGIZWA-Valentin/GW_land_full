// src/utils/activityLog.js
//
// Records a per-user activity/audit trail. Used to answer "what has this
// user actually done" in the admin user drawer, and doubles as a general
// system audit trail for moderation actions.

const pool = require('../config/db');

async function logActivity(userId, action, detail = null) {
  try {
    await pool.query(
      'INSERT INTO activity_log (user_id, action, detail) VALUES ($1, $2, $3)',
      [userId, action, detail]
    );
  } catch (err) {
    // Never let a logging failure break the real request.
    console.error('logActivity error:', err.message);
  }
}

module.exports = { logActivity };
