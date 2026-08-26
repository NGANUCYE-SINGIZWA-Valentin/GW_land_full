// src/middleware/auth.middleware.js
// Protects routes by requiring a valid JWT in the Authorization header.
// Usage on a route:  router.get('/something', authenticate, controllerFn)
//
// On success, attaches the logged-in user to req.user so later code
// (controllers, role checks) can use it.

const { verifyToken } = require('../utils/jwt');
const pool = require('../config/db');

async function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided. Include "Authorization: Bearer <token>"' });
  }

  const token = header.split(' ')[1];

  try {
    const decoded = verifyToken(token);

    const result = await pool.query(
      `SELECT id, role, full_name, email, phone, whatsapp_number, photo_url, is_verified, status
       FROM users WHERE id = $1`,
      [decoded.id]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'This account no longer exists' });
    }
    if (user.status === 'blocked') {
      return res.status(403).json({ error: 'Your account has been blocked. Contact support.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = authenticate;
