// src/controllers/misc.controller.js
// Groups the smaller endpoints that don't deserve their own controller file:
// - contact form (PRD 7 #51)
// - report listing (PRD 9 #59)
// - profile photo upload (PRD 5.1 #29)
// - change password while logged in
// - sitemap (PRD 4.4 #25)

const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const { sendEmail } = require('../utils/email');
const { logActivity } = require('../utils/activityLog');
const path = require('path');

// ----------------------------------------------------------------------
// POST /api/contact
// With a listing_id: buyer enquiry about a specific listing → email goes to the seller.
// Without one: general "Contact Us" message → email goes to the site inbox.
// No account needed — open to any visitor (PRD 7 #51).
// body: { listing_id (optional), sender_name, sender_email, sender_phone, message_body }
// ----------------------------------------------------------------------
async function contactForm(req, res) {
  try {
    const { listing_id, sender_name, sender_email, sender_phone, message_body } = req.body;

    if (!sender_name || !sender_email || !message_body) {
      return res.status(400).json({
        error: 'sender_name, sender_email, and message_body are required',
      });
    }

    if (listing_id) {
      const listingResult = await pool.query(
        `SELECT l.title, l.slug, u.full_name AS seller_name, u.email AS seller_email
         FROM listings l JOIN users u ON l.seller_id = u.id
         WHERE l.id = $1 AND l.status = 'approved'`,
        [listing_id]
      );
      const listing = listingResult.rows[0];
      if (!listing) {
        return res.status(404).json({ error: 'Listing not found' });
      }

      await sendEmail({
        to: listing.seller_email,
        subject: `New enquiry about your listing: ${listing.title}`,
        text: `Hi ${listing.seller_name},\n\nYou have a new enquiry about your listing "${listing.title}".\n\nFrom: ${sender_name}\nEmail: ${sender_email}${sender_phone ? `\nPhone: ${sender_phone}` : ''}\n\nMessage:\n${message_body}\n\n---\nGW Land & Construction`,
      });

      await sendEmail({
        to: sender_email,
        subject: `We've sent your message to the seller`,
        text: `Hi ${sender_name},\n\nYour message about "${listing.title}" has been delivered to the seller. They'll be in touch if interested.\n\nYour message:\n${message_body}\n\n---\nGW Land & Construction`,
      });

      return res.json({ message: 'Your message has been sent to the seller.' });
    }

    const siteInbox = process.env.SITE_CONTACT_EMAIL;
    if (siteInbox) {
      await sendEmail({
        to: siteInbox,
        subject: `New contact form message from ${sender_name}`,
        text: `From: ${sender_name}\nEmail: ${sender_email}${sender_phone ? `\nPhone: ${sender_phone}` : ''}\n\nMessage:\n${message_body}\n\n---\nGW Land & Construction contact form`,
      });
    }

    await sendEmail({
      to: sender_email,
      subject: `We've received your message`,
      text: `Hi ${sender_name},\n\nThanks for reaching out — our team has received your message and will get back to you soon.\n\nYour message:\n${message_body}\n\n---\nGW Land & Construction`,
    });

    res.json({ message: 'Your message has been sent to our team.' });
  } catch (err) {
    console.error('contactForm error:', err.message);
    res.status(500).json({ error: 'Something went wrong while sending your message' });
  }
}

// ----------------------------------------------------------------------
// POST /api/listings/:id/report
// Any visitor (no account needed) can report an inappropriate listing (PRD 9 #59).
// body: { reason, reporter_email (optional) }
// ----------------------------------------------------------------------
const REPORT_REASON_CATEGORIES = ['fraudulent', 'incorrect_info', 'already_sold', 'inappropriate', 'duplicate', 'other'];

async function reportListing(req, res) {
  try {
    const { reason_category, reason, reporter_email } = req.body;

    if (!reason_category || !REPORT_REASON_CATEGORIES.includes(reason_category)) {
      return res.status(400).json({ error: `reason_category must be one of: ${REPORT_REASON_CATEGORIES.join(', ')}` });
    }

    const listing = await pool.query(
      "SELECT id FROM listings WHERE id = $1 AND status = 'approved'",
      [req.params.id]
    );
    if (listing.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // reporter_id is null if user is not logged in
    const reporter_id = req.user ? req.user.id : null;

    await pool.query(
      `INSERT INTO reports (listing_id, reporter_id, reporter_email, reason_category, reason)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.params.id, reporter_id, reporter_email || null, reason_category, reason?.trim() || null]
    );

    res.status(201).json({ message: 'Thank you — your report has been received.' });
  } catch (err) {
    console.error('reportListing error:', err.message);
    res.status(500).json({ error: 'Something went wrong while submitting your report' });
  }
}

// ----------------------------------------------------------------------
// POST /api/auth/me/photo  (auth required)
// Uploads a profile photo and updates the user's photo_url.
// Uses the profilePhotoUpload multer instance (set up in upload.middleware.js).
// ----------------------------------------------------------------------
async function uploadProfilePhoto(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No photo file provided' });
    }

    const url = `${req.protocol}://${req.get('host')}/uploads/avatars/${req.file.filename}`;

    const result = await pool.query(
      'UPDATE users SET photo_url = $1 WHERE id = $2 RETURNING id, full_name, photo_url',
      [url, req.user.id]
    );

    res.json({ user: result.rows[0], photo_url: url });
  } catch (err) {
    console.error('uploadProfilePhoto error:', err.message);
    res.status(500).json({ error: 'Something went wrong while uploading the photo' });
  }
}

// ----------------------------------------------------------------------
// PUT /api/auth/me/password  (auth required)
// Lets a logged-in user change their own password (different from "forgot
// password" — here the user knows their current password).
// body: { current_password, new_password }
// ----------------------------------------------------------------------
async function changePassword(req, res) {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'current_password and new_password are required' });
    }
    if (new_password.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    const match = await bcrypt.compare(current_password, result.rows[0].password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const new_hash = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [new_hash, req.user.id]);

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('changePassword error:', err.message);
    res.status(500).json({ error: 'Something went wrong while changing your password' });
  }
}

// ----------------------------------------------------------------------
// GET /sitemap.xml  (public)
// Returns an XML sitemap of all approved listings.
// Google uses this to discover and index listing pages (PRD 4.4 #25).
// ----------------------------------------------------------------------
async function getSitemap(req, res) {
  try {
    const result = await pool.query(
      `SELECT slug, updated_at FROM listings WHERE status = 'approved' ORDER BY updated_at DESC`
    );

    const baseUrl = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`;

    const urls = result.rows
      .map(
        (row) =>
          `  <url>\n    <loc>${baseUrl}/listings/${row.slug}</loc>\n    <lastmod>${new Date(row.updated_at).toISOString().split('T')[0]}</lastmod>\n    <changefreq>weekly</changefreq>\n  </url>`
      )
      .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    console.error('getSitemap error:', err.message);
    res.status(500).json({ error: 'Something went wrong generating the sitemap' });
  }
}

// ----------------------------------------------------------------------
// GET /api/admin/reports  (auth: admin, sub_admin)
// Lists all flagged listings so admins can review them.
// ----------------------------------------------------------------------
async function getReports(req, res) {
  try {
    const result = await pool.query(
      `SELECT r.*, l.title AS listing_title, l.slug AS listing_slug
       FROM reports r
       LEFT JOIN listings l ON r.listing_id = l.id
       ORDER BY r.created_at DESC`
    );
    res.json({ reports: result.rows });
  } catch (err) {
    console.error('getReports error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

// PATCH /api/admin/reports/:id  (auth: admin, sub_admin)
// body: { status: 'reviewed' | 'dismissed' }
async function updateReportStatus(req, res) {
  try {
    const { status } = req.body;
    if (!['reviewed', 'dismissed'].includes(status)) {
      return res.status(400).json({ error: "status must be 'reviewed' or 'dismissed'" });
    }
    const result = await pool.query(
      'UPDATE reports SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Report not found' });
    if (req.user) logActivity(req.user.id, 'report_' + status);
    res.json({ report: result.rows[0] });
  } catch (err) {
    console.error('updateReportStatus error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

// DELETE /api/admin/reports/:id  (auth: admin, sub_admin)
async function deleteReport(req, res) {
  try {
    const result = await pool.query('DELETE FROM reports WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Report not found' });
    res.json({ message: 'Report deleted' });
  } catch (err) {
    console.error('deleteReport error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

// ----------------------------------------------------------------------
// POST /api/newsletter  (public)
// body: { email }
// ----------------------------------------------------------------------
async function subscribeNewsletter(req, res) {
  try {
    const { email } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }
    await pool.query(
      `INSERT INTO newsletter_subscribers (email) VALUES ($1)
       ON CONFLICT (email) DO NOTHING`,
      [email.toLowerCase()]
    );
    res.json({ message: "You're subscribed! Thanks for joining our newsletter." });
  } catch (err) {
    console.error('subscribeNewsletter error:', err.message);
    res.status(500).json({ error: 'Something went wrong while subscribing' });
  }
}

module.exports = {
  contactForm,
  reportListing,
  uploadProfilePhoto,
  changePassword,
  getSitemap,
  getReports,
  updateReportStatus,
  deleteReport,
  subscribeNewsletter,
};
