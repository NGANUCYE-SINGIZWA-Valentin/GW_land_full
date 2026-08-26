// src/routes/auth.routes.js

const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const authenticate = require('../middleware/auth.middleware');

// Public routes — no token needed
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// "Continue with Google/Facebook" — full-page redirects, not JSON APIs
router.get('/google', authController.googleAuth);
router.get('/google/callback', authController.googleCallback);
router.get('/facebook', authController.facebookAuth);
router.get('/facebook/callback', authController.facebookCallback);

// Protected routes — require a valid JWT
router.get('/me', authenticate, authController.getMe);
router.put('/me', authenticate, authController.updateMe);

module.exports = router;
