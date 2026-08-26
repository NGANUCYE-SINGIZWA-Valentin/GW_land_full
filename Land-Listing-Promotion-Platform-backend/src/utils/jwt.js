// src/utils/jwt.js
// Small wrapper around jsonwebtoken so the rest of the app doesn't
// need to know the details of how tokens are signed/verified.

const jwt = require('jsonwebtoken');

function signToken(user) {
  // We only ever put the id and role in the token — never the password hash
  // or anything sensitive. Anyone can decode a JWT's contents (it's just
  // base64), they just can't forge a valid signature without the secret.
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { signToken, verifyToken };
