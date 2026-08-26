// src/routes/listings.routes.js

const express = require('express');
const router = express.Router();

const listingsController = require('../controllers/listings.controller');
const authenticate = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const { uploadListingFiles } = require('../middleware/upload.middleware');

// --- Public routes (no token needed) ---
router.get('/', listingsController.getPublicListings);
router.get('/mine', authenticate, authorize('seller'), listingsController.getMyListings); // must come before /:slug
router.get('/:slug', listingsController.getListingBySlug);

// --- Seller routes (auth required) ---
router.post('/', authenticate, authorize('seller'), uploadListingFiles, listingsController.createListing);
router.put('/:id', authenticate, authorize('seller'), listingsController.updateListing);
router.delete('/:id', authenticate, authorize('seller'), listingsController.deleteListing);
router.patch('/:id/sold', authenticate, authorize('seller'), listingsController.markSold);

module.exports = router;
