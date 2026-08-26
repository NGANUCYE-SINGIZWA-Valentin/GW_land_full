// src/utils/jwt.js
// Small wrapper around jsonwebtoken so the rest of the app doesn't
// need to know the details of how tokens are signed/verified.

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'gw-land-default-secret-key-for-jwt-signing-2026';

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { signToken, verifyToken };
