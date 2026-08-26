const express = require('express');
const router = express.Router();

const paymentsController = require('../controllers/payments.controller');
const authenticate = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

// Public — sellers need to see prices before they've necessarily logged in fresh
router.get('/pricing', paymentsController.getPricingPlans);

// Any authenticated user (in practice: sellers)
router.post('/', authenticate, paymentsController.createPayment);
router.get('/mine', authenticate, paymentsController.getMyPayments);

// MTN Mobile Money webhook — public endpoint (called by the payment gateway)
// Validate with MOMO_WEBHOOK_SECRET env var in production
// Test locally: POST /api/payments/momo-webhook { transactionId, status: "SUCCESSFUL", externalId }
router.post('/momo-webhook', paymentsController.momoWebhook);

module.exports = router;
