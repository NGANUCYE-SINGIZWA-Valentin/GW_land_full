// src/controllers/locations.controller.js
// Provides the dropdown data the React frontend needs to build
// the district and sector selectors on listing forms and search filters.
// All public — no token needed.

const pool = require('../config/db');

// GET /api/locations/provinces
// Returns all provinces (used to group districts)
async function getProvinces(req, res) {
  try {
    const result = await pool.query('SELECT id, name FROM provinces ORDER BY name');
    res.json({ provinces: result.rows });
  } catch (err) {
    console.error('getProvinces error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

// GET /api/locations/districts
// Returns all districts, optionally filtered by province_id
// e.g. /api/locations/districts?province_id=1
async function getDistricts(req, res) {
  try {
    const { province_id } = req.query;
    let result;
    if (province_id) {
      result = await pool.query(
        `SELECT d.id, d.name, p.name AS province
         FROM districts d JOIN provinces p ON d.province_id = p.id
         WHERE d.province_id = $1 ORDER BY d.name`,
        [province_id]
      );
    } else {
      result = await pool.query(
        `SELECT d.id, d.name, p.name AS province
         FROM districts d JOIN provinces p ON d.province_id = p.id
         ORDER BY p.name, d.name`
      );
    }
    res.json({ districts: result.rows });
  } catch (err) {
    console.error('getDistricts error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

// GET /api/locations/sectors/:district_id
// Returns all sectors for a given district (used to populate the sector
// dropdown after the user picks a district)
async function getSectorsByDistrict(req, res) {
  try {
    const result = await pool.query(
      `SELECT s.id, s.name FROM sectors s
       WHERE s.district_id = $1 ORDER BY s.name`,
      [req.params.district_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No sectors found for that district' });
    }
    res.json({ sectors: result.rows });
  } catch (err) {
    console.error('getSectorsByDistrict error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

module.exports = { getProvinces, getDistricts, getSectorsByDistrict };
