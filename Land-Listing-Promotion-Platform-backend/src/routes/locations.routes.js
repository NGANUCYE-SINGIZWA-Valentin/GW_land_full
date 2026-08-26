// src/routes/locations.routes.js
// All public — no token required. Used by the frontend to populate dropdowns.

const express = require('express');
const router = express.Router();
const locationsController = require('../controllers/locations.controller');

router.get('/provinces', locationsController.getProvinces);
router.get('/districts', locationsController.getDistricts);
router.get('/sectors/:district_id', locationsController.getSectorsByDistrict);

module.exports = router;
