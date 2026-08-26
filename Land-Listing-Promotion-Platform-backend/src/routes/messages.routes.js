// src/routes/messages.routes.js
// All messaging routes require authentication.

const express = require('express');
const router = express.Router();
const messagesController = require('../controllers/messages.controller');
const authenticate = require('../middleware/auth.middleware');

router.use(authenticate);

router.post('/', messagesController.sendMessage);
router.get('/inbox', messagesController.getInbox);
router.get('/unread-count', messagesController.getUnreadCount);
router.get('/thread/:other_user_id', messagesController.getThread);

module.exports = router;
