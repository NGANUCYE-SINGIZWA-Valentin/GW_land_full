// src/controllers/favorites.controller.js
// Buyers can shortlist listings to revisit later (addendum section B).

const pool = require('../config/db');

// ----------------------------------------------------------------------
// GET /api/favorites   (auth required)
// Returns the current user's favorited listings, newest first.
// ----------------------------------------------------------------------
async function listFavorites(req, res) {
  try {
    const result = await pool.query(
      `SELECT l.id, l.title, l.slug, l.price_rwf, l.price_usd, l.size_value, l.size_unit,
              l.is_featured, l.is_premium, l.view_count, l.created_at,
              d.name AS district, s.name AS sector,
              (SELECT image_url FROM listing_images WHERE listing_id = l.id ORDER BY display_order LIMIT 1) AS cover_image,
              f.created_at AS favorited_at
       FROM favorites f
       JOIN listings l ON f.listing_id = l.id
       JOIN districts d ON l.district_id = d.id
       JOIN sectors s ON l.sector_id = s.id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );
    res.json({ favorites: result.rows });
  } catch (err) {
    console.error('listFavorites error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

// ----------------------------------------------------------------------
// POST /api/favorites   (auth required)   body: { listing_id }
// ----------------------------------------------------------------------
async function addFavorite(req, res) {
  try {
    const { listing_id } = req.body;
    if (!listing_id) return res.status(400).json({ error: 'listing_id is required' });

    const listing = await pool.query("SELECT id FROM listings WHERE id = $1 AND status = 'approved'", [listing_id]);
    if (listing.rows.length === 0) return res.status(404).json({ error: 'Listing not found' });

    await pool.query(
      `INSERT INTO favorites (user_id, listing_id) VALUES ($1, $2)
       ON CONFLICT (user_id, listing_id) DO NOTHING`,
      [req.user.id, listing_id]
    );
    res.status(201).json({ message: 'Added to favorites' });
  } catch (err) {
    console.error('addFavorite error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

// ----------------------------------------------------------------------
// DELETE /api/favorites/:listingId   (auth required)
// ----------------------------------------------------------------------
async function removeFavorite(req, res) {
  try {
    await pool.query(
      'DELETE FROM favorites WHERE user_id = $1 AND listing_id = $2',
      [req.user.id, req.params.listingId]
    );
    res.json({ message: 'Removed from favorites' });
  } catch (err) {
    console.error('removeFavorite error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

module.exports = { listFavorites, addFavorite, removeFavorite };
