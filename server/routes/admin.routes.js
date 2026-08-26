// src/routes/admin.routes.js
// Every route here requires authentication AND an admin/sub_admin role,
// applied once at the top with router.use() so we don't repeat it on
// every single line below.

const express = require('express');
const router = express.Router();

const adminController = require('../controllers/admin.controller');
const paymentsController = require('../controllers/payments.controller');
const authenticate = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

router.use(authenticate, authorize('admin', 'sub_admin'));

// --- Listings moderation ---
router.get('/listings', adminController.getAllListings);
router.patch('/listings/:id/approve', adminController.approveListing);
router.patch('/listings/:id/reject', adminController.rejectListing);
router.delete('/listings/:id', adminController.deleteAnyListing);
router.patch('/listings/:id/feature', authorize('admin'), adminController.setFeatured);
router.patch('/listings/:id/premium', authorize('admin'), adminController.setPremium);
router.patch('/listings/:id/upi-verify', adminController.setUpiVerified);

// --- User management ---
router.get('/users', adminController.getAllUsers);
router.post('/users', authorize('admin'), adminController.createUser);
router.put('/users/:id', authorize('admin'), adminController.updateUser);
router.patch('/users/:id/status', adminController.setUserStatus);
router.patch('/users/:id/verify', authorize('admin'), adminController.setUserVerified);
router.delete('/users/:id', authorize('admin'), adminController.deleteUser);
router.post('/users/:id/impersonate', authorize('admin'), adminController.impersonateUser);
router.get('/top-sellers', adminController.getTopSellers);
router.get('/users/:id/activity', adminController.getUserActivity);

// --- Notifications ---
router.get('/notifications', adminController.getNotifications);
router.patch('/notifications/:id/read', adminController.markNotificationRead);

// --- Analytics ---
router.get('/analytics', adminController.getAnalytics);

// --- Messages (monitoring only, never marks read / never replies) ---
router.get('/messages', adminController.getAllConversations);
router.get('/messages/thread', adminController.getConversationThread);

// --- Payments / pricing (admin ONLY confirms money; sub_admin can view) ---
router.get('/payments', paymentsController.getAllPayments);
router.get('/revenue-summary', paymentsController.getRevenueSummary);
router.patch('/payments/:id/confirm', authorize('admin'), paymentsController.confirmPayment);
router.patch('/payments/:id/reject', authorize('admin'), paymentsController.rejectPayment);
router.put('/pricing/:planKey', authorize('admin'), paymentsController.updatePricingPlan);

module.exports = router;
