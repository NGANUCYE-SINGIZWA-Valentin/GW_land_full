// src/routes/misc.routes.js

const express = require('express');
const router = express.Router();
const miscController = require('../controllers/misc.controller');
const authenticate = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const { profilePhotoUpload } = require('../middleware/upload.middleware');

// Contact form — no account needed (PRD 7 #51)
router.post('/contact', miscController.contactForm);

// Report listing — no account needed, but if logged in reporter_id is captured
router.post('/listings/:id/report', (req, res, next) => {
  // Attach user if token present, but don't require it
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    const authenticate = require('../middleware/auth.middleware');
    return authenticate(req, res, () => miscController.reportListing(req, res));
  }
  return miscController.reportListing(req, res);
});

// Profile photo upload — auth required
router.post('/auth/me/photo', authenticate, profilePhotoUpload, miscController.uploadProfilePhoto);

// Change password — auth required
router.put('/auth/me/password', authenticate, miscController.changePassword);

// Sitemap — public (PRD 4.4 #25)
router.get('/sitemap.xml', miscController.getSitemap);

// Newsletter signup — public
router.post('/newsletter', miscController.subscribeNewsletter);

// Admin: view and manage reports
router.get('/admin/reports', authenticate, authorize('admin', 'sub_admin'), miscController.getReports);
router.patch('/admin/reports/:id', authenticate, authorize('admin', 'sub_admin'), miscController.updateReportStatus);
router.delete('/admin/reports/:id', authenticate, authorize('admin', 'sub_admin'), miscController.deleteReport);

module.exports = router;
