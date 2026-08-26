// src/controllers/payments.controller.js
//
// Payment method selection + admin-configurable pricing (PRD section 10).
// No live payment gateway is wired up here — MTN MoMo's actual charge API
// needs real merchant credentials the project doesn't have yet. Every
// payment a seller creates lands as 'pending' with a payment method and a
// reference note; an admin manually confirms it once the money has actually
// arrived (the standard interim pattern before a gateway is automated).

const pool = require('../config/db');
const { logActivity } = require('../utils/activityLog');
const { sendEmail } = require('../utils/email');

const PROVIDERS = ['momo', 'card', 'bank_transfer'];
const PLAN_KEYS = ['listing_fee', 'featured_placement', 'subscription_monthly'];

// ----------------------------------------------------------------------
// GET /api/payments/pricing   (public — sellers need to see prices before paying)
// ----------------------------------------------------------------------
async function getPricingPlans(req, res) {
  try {
    const result = await pool.query(
      'SELECT * FROM pricing_plans WHERE is_active = true ORDER BY plan_key'
    );
    res.json({ plans: result.rows });
  } catch (err) {
    console.error('getPricingPlans error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

// ----------------------------------------------------------------------
// PUT /api/admin/pricing/:planKey   (auth: admin ONLY)
// body: { amount_rwf, amount_usd, label, description }
// ----------------------------------------------------------------------
async function updatePricingPlan(req, res) {
  try {
    const { amount_rwf, amount_usd, label, description } = req.body;
    if (amount_rwf === undefined) {
      return res.status(400).json({ error: 'amount_rwf is required' });
    }
    const result = await pool.query(
      `UPDATE pricing_plans SET
         amount_rwf = $1, amount_usd = $2,
         label = COALESCE($3, label), description = COALESCE($4, description),
         updated_at = now()
       WHERE plan_key = $5 RETURNING *`,
      [amount_rwf, amount_usd ?? null, label, description, req.params.planKey]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Pricing plan not found' });
    logActivity(req.user.id, 'pricing_updated', `${req.params.planKey} -> RWF ${amount_rwf}`);
    res.json({ plan: result.rows[0] });
  } catch (err) {
    console.error('updatePricingPlan error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

// ----------------------------------------------------------------------
// POST /api/payments   (auth: seller)
// body: { plan_key, provider, currency, listing_id (optional), reference_note }
// Creates a pending payment for the seller to pay via their chosen method.
// This never charges anything — it records intent + how much is owed.
// ----------------------------------------------------------------------
async function createPayment(req, res) {
  try {
    const { plan_key, provider, currency, listing_id, reference_note } = req.body;

    if (!PLAN_KEYS.includes(plan_key)) {
      return res.status(400).json({ error: `plan_key must be one of: ${PLAN_KEYS.join(', ')}` });
    }
    if (!PROVIDERS.includes(provider)) {
      return res.status(400).json({ error: `provider must be one of: ${PROVIDERS.join(', ')}` });
    }
    const useCurrency = currency === 'USD' ? 'USD' : 'RWF';

    const plan = await pool.query('SELECT * FROM pricing_plans WHERE plan_key = $1 AND is_active = true', [plan_key]);
    if (plan.rows.length === 0) return res.status(404).json({ error: 'That pricing plan is not available' });
    const p = plan.rows[0];
    const amount = useCurrency === 'USD' ? p.amount_usd : p.amount_rwf;
    if (amount === null) return res.status(400).json({ error: `This plan has no ${useCurrency} price set` });

    const payment_type = plan_key === 'subscription_monthly' ? 'subscription'
      : plan_key === 'featured_placement' ? 'featured_placement' : 'listing_fee';

    const result = await pool.query(
      `INSERT INTO payments (user_id, listing_id, amount, currency, payment_type, provider, reference_note, plan_key)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [req.user.id, listing_id || null, amount, useCurrency, payment_type, provider, reference_note || null, plan_key]
    );

    logActivity(req.user.id, 'payment_created', `${plan_key} via ${provider}, ${useCurrency} ${amount}`);
    res.status(201).json({
      payment: result.rows[0],
      message: 'Payment recorded as pending. An admin will confirm it once received.',
    });
  } catch (err) {
    console.error('createPayment error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

// ----------------------------------------------------------------------
// GET /api/payments/mine   (auth: any logged-in user)
// ----------------------------------------------------------------------
async function getMyPayments(req, res) {
  try {
    const result = await pool.query(
      `SELECT p.*, l.title AS listing_title
       FROM payments p
       LEFT JOIN listings l ON p.listing_id = l.id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC`,
      [req.user.id]
    );
    res.json({ payments: result.rows });
  } catch (err) {
    console.error('getMyPayments error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

// ----------------------------------------------------------------------
// GET /api/admin/payments   (auth: admin, sub_admin can view but not confirm — see route)
// ----------------------------------------------------------------------
async function getAllPayments(req, res) {
  try {
    const result = await pool.query(
      `SELECT p.*, u.full_name AS user_name, u.email AS user_email, l.title AS listing_title
       FROM payments p
       JOIN users u ON p.user_id = u.id
       LEFT JOIN listings l ON p.listing_id = l.id
       ORDER BY p.created_at DESC`
    );
    res.json({ payments: result.rows });
  } catch (err) {
    console.error('getAllPayments error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

// ----------------------------------------------------------------------
// PATCH /api/admin/payments/:id/confirm   (auth: admin ONLY)
// Marks a pending payment as completed. If it was for a featured placement,
// actually flips the listing's is_featured flag. If a subscription, creates
// or extends a subscriptions row.
// ----------------------------------------------------------------------
async function confirmPayment(req, res) {
  try {
    const existing = await pool.query('SELECT * FROM payments WHERE id = $1', [req.params.id]);
    const payment = existing.rows[0];
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    if (payment.status !== 'pending') {
      return res.status(400).json({ error: `This payment is already ${payment.status}` });
    }

    const result = await pool.query(
      `UPDATE payments SET status = 'completed', confirmed_by = $1, updated_at = now() WHERE id = $2 RETURNING *`,
      [req.user.id, req.params.id]
    );

    if (payment.payment_type === 'featured_placement' && payment.listing_id) {
      await pool.query(`UPDATE listings SET is_featured = true WHERE id = $1`, [payment.listing_id]);
    }

    if (payment.payment_type === 'subscription') {
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      await pool.query(
        `INSERT INTO subscriptions (user_id, plan_name, price, currency, billing_cycle, start_date, end_date, status)
         VALUES ($1, 'Agent Monthly Plan', $2, $3, 'monthly', $4, $5, 'active')`,
        [payment.user_id, payment.amount, payment.currency, startDate, endDate]
      );
    }

    logActivity(req.user.id, 'payment_confirmed', `${payment.plan_key} for ${payment.amount} ${payment.currency}`);
    logActivity(payment.user_id, 'payment_confirmed');
    res.json({ payment: result.rows[0], message: 'Payment confirmed.' });
  } catch (err) {
    console.error('confirmPayment error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

// ----------------------------------------------------------------------
// PATCH /api/admin/payments/:id/reject   (auth: admin ONLY)
// ----------------------------------------------------------------------
async function rejectPayment(req, res) {
  try {
    const result = await pool.query(
      `UPDATE payments SET status = 'failed', confirmed_by = $1, updated_at = now()
       WHERE id = $2 AND status = 'pending' RETURNING *`,
      [req.user.id, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Pending payment not found' });
    logActivity(req.user.id, 'payment_rejected');
    res.json({ payment: result.rows[0], message: 'Payment marked as failed.' });
  } catch (err) {
    console.error('rejectPayment error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

// ----------------------------------------------------------------------
// GET /api/admin/revenue-summary   (auth: admin, sub_admin)
// ----------------------------------------------------------------------
async function getRevenueSummary(req, res) {
  try {
    const [totals, byType, byDay] = await Promise.all([
      pool.query(
        `SELECT
           COALESCE(SUM(amount) FILTER (WHERE status = 'completed' AND currency = 'RWF'), 0) AS total_rwf,
           COALESCE(SUM(amount) FILTER (WHERE status = 'completed' AND currency = 'USD'), 0) AS total_usd,
           COUNT(*) FILTER (WHERE status = 'pending') AS pending_count,
           COUNT(*) FILTER (WHERE status = 'completed') AS completed_count
         FROM payments`
      ),
      pool.query(
        `SELECT payment_type, COUNT(*) AS count, COALESCE(SUM(amount) FILTER (WHERE currency = 'RWF'), 0) AS total_rwf
         FROM payments WHERE status = 'completed' GROUP BY payment_type`
      ),
      pool.query(
        `SELECT d::date AS day, COALESCE(SUM(p.amount) FILTER (WHERE p.currency = 'RWF'), 0) AS total_rwf
         FROM generate_series(CURRENT_DATE - INTERVAL '29 days', CURRENT_DATE, INTERVAL '1 day') d
         LEFT JOIN payments p ON p.created_at::date = d::date AND p.status = 'completed'
         GROUP BY d ORDER BY d`
      ),
    ]);

    res.json({
      ...totals.rows[0],
      by_type: byType.rows,
      revenue_by_day: byDay.rows,
    });
  } catch (err) {
    console.error('getRevenueSummary error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

// ----------------------------------------------------------------------
// POST /api/payments/momo-webhook
// Simulates an MTN Mobile Money payment gateway callback.
// In production, MTN hits this URL when a payment is confirmed/failed.
// The body should contain: { transactionId, status, externalId }
// externalId should match the payment ID from our database.
//
// To test locally:
//   curl -X POST http://localhost:4000/api/payments/momo-webhook \
//     -H "Content-Type: application/json" \
//     -d '{"transactionId":"MTN123","status":"SUCCESSFUL","externalId":"<payment-id>"}'
// ----------------------------------------------------------------------
async function momoWebhook(req, res) {
  try {
    const { transactionId, status, externalId } = req.body;

    if (!transactionId || !status || !externalId) {
      return res.status(400).json({ error: 'transactionId, status, and externalId are required' });
    }

    // Validate webhook secret if configured (add MOMO_WEBHOOK_SECRET to .env for production)
    const webhookSecret = process.env.MOMO_WEBHOOK_SECRET;
    if (webhookSecret) {
      const providedSecret = req.headers['x-momo-signature'] || req.headers['authorization'];
      if (providedSecret !== `Bearer ${webhookSecret}` && providedSecret !== webhookSecret) {
        return res.status(401).json({ error: 'Invalid webhook signature' });
      }
    }

    const existing = await pool.query('SELECT * FROM payments WHERE id = $1', [externalId]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found for externalId' });
    }
    const payment = existing.rows[0];

    if (payment.status !== 'pending') {
      return res.json({ message: `Payment already ${payment.status}. No action taken.` });
    }

    const isMoMoSuccess = ['SUCCESSFUL', 'SUCCESS', 'completed'].includes(String(status).toUpperCase()) ||
                          status === 'SUCCESSFUL';

    if (!isMoMoSuccess) {
      // Payment failed — mark as failed in our system
      await pool.query(
        `UPDATE payments SET status = 'failed', updated_at = now() WHERE id = $1`,
        [externalId]
      );

      // Notify seller the payment was unsuccessful
      const userResult = await pool.query('SELECT full_name, email FROM users WHERE id = $1', [payment.user_id]);
      if (userResult.rows.length > 0) {
        sendEmail({
          to: userResult.rows[0].email,
          subject: 'Payment unsuccessful — GW Homes',
          text: `Hi ${userResult.rows[0].full_name},\n\nUnfortunately, your Mobile Money payment (Transaction ID: ${transactionId}) could not be processed.\n\nPlan: ${payment.plan_key}\nAmount: ${payment.currency} ${Number(payment.amount).toLocaleString()}\n\nPlease try again from your GW Homes dashboard.\n\n— The GW Homes Team`,
        }).catch(() => {});
      }

      logActivity(payment.user_id, 'payment_momo_failed', `TxID: ${transactionId}`);
      return res.json({ message: 'Payment marked as failed.', transactionId, status });
    }

    // ── Payment Successful ──
    const result = await pool.query(
      `UPDATE payments SET status = 'completed', reference_note = COALESCE(reference_note, $1), updated_at = now()
       WHERE id = $2 RETURNING *`,
      [`MoMo TxID: ${transactionId}`, externalId]
    );

    // Apply side-effects same as manual admin confirmation
    if (payment.payment_type === 'featured_placement' && payment.listing_id) {
      await pool.query(`UPDATE listings SET is_featured = true WHERE id = $1`, [payment.listing_id]);
    }

    if (payment.payment_type === 'subscription') {
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      await pool.query(
        `INSERT INTO subscriptions (user_id, plan_name, price, currency, billing_cycle, start_date, end_date, status)
         VALUES ($1, 'Agent Monthly Plan', $2, $3, 'monthly', $4, $5, 'active')
         ON CONFLICT DO NOTHING`,
        [payment.user_id, payment.amount, payment.currency, startDate, endDate]
      );
    }

    // Send success email to seller
    const userResult = await pool.query('SELECT full_name, email FROM users WHERE id = $1', [payment.user_id]);
    if (userResult.rows.length > 0) {
      sendEmail({
        to: userResult.rows[0].email,
        subject: 'Payment confirmed ✓ — GW Homes',
        text: `Hi ${userResult.rows[0].full_name},\n\nGreat news! Your Mobile Money payment has been confirmed automatically.\n\nPlan: ${payment.plan_key}\nTransaction ID: ${transactionId}\nAmount: ${payment.currency} ${Number(payment.amount).toLocaleString()}\n\nYour service is now active. Visit your GW Homes dashboard to see the changes.\n\n— The GW Homes Team`,
      }).catch(() => {});
    }

    logActivity(payment.user_id, 'payment_momo_confirmed', `TxID: ${transactionId}, plan: ${payment.plan_key}`);
    console.log(`[MoMo Webhook] Payment ${externalId} confirmed. TxID: ${transactionId}`);

    res.json({ message: 'Payment confirmed.', payment: result.rows[0], transactionId });
  } catch (err) {
    console.error('momoWebhook error:', err.message);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

module.exports = {
  getPricingPlans,
  updatePricingPlan,
  createPayment,
  getMyPayments,
  getAllPayments,
  confirmPayment,
  rejectPayment,
  getRevenueSummary,
  momoWebhook,
};
