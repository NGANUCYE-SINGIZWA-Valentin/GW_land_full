// src/controllers/listings.controller.js

const pool = require('../config/db');
const { generateUniqueSlug } = require('../utils/slug');
const { notifyAdmins } = require('../utils/notifications');
const { logActivity } = require('../utils/activityLog');

const SIZE_UNITS = ['sqm', 'hectare'];

// Small helper: build the public file URL for an uploaded file on disk.
function fileUrl(req, subfolder, filename) {
  return `${req.protocol}://${req.get('host')}/uploads/${subfolder}/${filename}`;
}

// ----------------------------------------------------------------------
// POST /api/listings   (auth: seller)
// multipart/form-data — text fields + images[] + documents[] (optional)
// ----------------------------------------------------------------------
async function createListing(req, res) {
  try {
    const {
      title, description, district_id, sector_id,
      latitude, longitude, price_rwf, price_usd,
      size_value, size_unit,
      upi, tenure_type, land_use, has_road_access, has_water, has_electricity,
    } = req.body;

    // --- Validation ---
    if (!title || !description || !district_id || !sector_id || !size_value || !size_unit) {
      return res.status(400).json({
        error: 'title, description, district_id, sector_id, size_value, and size_unit are required',
      });
    }
    if (!SIZE_UNITS.includes(size_unit)) {
      return res.status(400).json({ error: `size_unit must be one of: ${SIZE_UNITS.join(', ')}` });
    }
    if (!price_rwf && !price_usd) {
      return res.status(400).json({ error: 'Provide at least one of price_rwf or price_usd' });
    }

    // Confirm the sector actually belongs to the given district —
    // stops mismatched location data from ever being saved.
    const sectorCheck = await pool.query(
      `SELECT s.name AS sector_name, d.name AS district_name
       FROM sectors s JOIN districts d ON s.district_id = d.id
       WHERE s.id = $1 AND d.id = $2`,
      [sector_id, district_id]
    );
    if (sectorCheck.rows.length === 0) {
      return res.status(400).json({ error: 'That sector does not belong to the given district' });
    }
    const { sector_name, district_name } = sectorCheck.rows[0];

    const slug = await generateUniqueSlug(pool, {
      district: district_name,
      sector: sector_name,
      size_value,
      size_unit,
    });

    const result = await pool.query(
      `INSERT INTO listings
         (seller_id, title, slug, description, district_id, sector_id, latitude, longitude,
          price_rwf, price_usd, size_value, size_unit,
          upi, tenure_type, land_use, has_road_access, has_water, has_electricity)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
       RETURNING *`,
      [
        req.user.id, title, slug, description, district_id, sector_id,
        latitude || null, longitude || null,
        price_rwf || null, price_usd || null,
        size_value, size_unit,
        upi || null, tenure_type || null, land_use || null,
        has_road_access === 'true' || has_road_access === true,
        has_water === 'true' || has_water === true,
        has_electricity === 'true' || has_electricity === true,
      ]
    );
    const listing = result.rows[0];

    // --- Save uploaded images/documents, if any ---
    const images = (req.files && req.files.images) || [];
    const documents = (req.files && req.files.documents) || [];

    for (let i = 0; i < images.length; i++) {
      const url = fileUrl(req, 'listings', images[i].filename);
      await pool.query(
        'INSERT INTO listing_images (listing_id, image_url, display_order) VALUES ($1, $2, $3)',
        [listing.id, url, i]
      );
    }
    for (const doc of documents) {
      const url = fileUrl(req, 'documents', doc.filename);
      await pool.query(
        'INSERT INTO listing_documents (listing_id, document_url, document_label) VALUES ($1, $2, $3)',
        [listing.id, url, doc.originalname]
      );
    }

    notifyAdmins({
      type: 'new_listing',
      message: `New listing submitted for review: "${listing.title}"`,
      related_id: listing.id,
    });
    logActivity(req.user.id, 'listing_created', listing.title);

    res.status(201).json({
      listing,
      images_uploaded: images.length,
      documents_uploaded: documents.length,
      message: 'Listing submitted and is pending admin approval.',
    });
  } catch (err) {
    console.error('createListing error:', err.message);
    res.status(500).json({ error: 'Something went wrong while creating the listing' });
  }
}

// ----------------------------------------------------------------------
// GET /api/listings   (public)
// Query params: page, limit, district_id, sector_id, min_price, max_price, featured
// Only ever returns status = 'approved' listings.
// ----------------------------------------------------------------------
async function getPublicListings(req, res) {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 50);
    const offset = (page - 1) * limit;

    const conditions = [`l.status = 'approved'`];
    const params = [];

    if (req.query.district_id) {
      params.push(req.query.district_id);
      conditions.push(`l.district_id = $${params.length}`);
    }
    if (req.query.sector_id) {
      params.push(req.query.sector_id);
      conditions.push(`l.sector_id = $${params.length}`);
    }
    if (req.query.min_price) {
      params.push(req.query.min_price);
      conditions.push(`l.price_rwf >= $${params.length}`);
    }
    if (req.query.max_price) {
      params.push(req.query.max_price);
      conditions.push(`l.price_rwf <= $${params.length}`);
    }
    if (req.query.min_size) {
      params.push(req.query.min_size);
      conditions.push(`l.size_value >= $${params.length}`);
    }
    if (req.query.max_size) {
      params.push(req.query.max_size);
      conditions.push(`l.size_value <= $${params.length}`);
    }
    if (req.query.size_unit) {
      params.push(req.query.size_unit);
      conditions.push(`l.size_unit = $${params.length}`);
    }
    if (req.query.featured === 'true') {
      conditions.push(`l.is_featured = true`);
    }
    // Keyword search — matches against title and description (PRD 4.2)
    if (req.query.q) {
      params.push(`%${req.query.q}%`);
      conditions.push(`(l.title ILIKE $${params.length} OR l.description ILIKE $${params.length})`);
    }

    const whereClause = conditions.join(' AND ');

    const countResult = await pool.query(`SELECT COUNT(*) FROM listings l WHERE ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);

    params.push(limit, offset);
    const result = await pool.query(
      `SELECT l.id, l.title, l.slug, l.price_rwf, l.price_usd, l.size_value, l.size_unit,
              l.is_featured, l.is_premium, l.view_count, l.created_at,
              d.name AS district, s.name AS sector,
              (SELECT image_url FROM listing_images WHERE listing_id = l.id ORDER BY display_order LIMIT 1) AS cover_image
       FROM listings l
       JOIN districts d ON l.district_id = d.id
       JOIN sectors s ON l.sector_id = s.id
       WHERE ${whereClause}
       ORDER BY l.is_featured DESC, l.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json({
      listings: result.rows,
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('getPublicListings error:', err.message);
    res.status(500).json({ error: 'Something went wrong while fetching listings' });
  }
}

// ----------------------------------------------------------------------
// GET /api/listings/:slug   (public)
// Increments view_count. Only returns the listing if it's approved.
// ----------------------------------------------------------------------
async function getListingBySlug(req, res) {
  try {
    const result = await pool.query(
      `UPDATE listings SET view_count = view_count + 1
       WHERE slug = $1 AND status = 'approved'
       RETURNING *`,
      [req.params.slug]
    );
    const listing = result.rows[0];
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const [images, location, seller] = await Promise.all([
      pool.query('SELECT image_url FROM listing_images WHERE listing_id = $1 ORDER BY display_order', [listing.id]),
      pool.query(
        `SELECT d.name AS district, s.name AS sector
         FROM districts d, sectors s
         WHERE d.id = $1 AND s.id = $2`,
        [listing.district_id, listing.sector_id]
      ),
      pool.query(
        'SELECT full_name, phone, whatsapp_number, is_verified FROM users WHERE id = $1',
        [listing.seller_id]
      ),
    ]);

    res.json({
      listing: {
        ...listing,
        district: location.rows[0]?.district,
        sector: location.rows[0]?.sector,
        images: images.rows.map((r) => r.image_url),
        seller: seller.rows[0],
      },
    });
  } catch (err) {
    console.error('getListingBySlug error:', err.message);
    res.status(500).json({ error: 'Something went wrong while fetching the listing' });
  }
}

// ----------------------------------------------------------------------
// GET /api/listings/mine   (auth: seller)
// Returns the logged-in seller's own listings, any status.
// ----------------------------------------------------------------------
async function getMyListings(req, res) {
  try {
    const result = await pool.query(
      `SELECT l.*, d.name AS district, s.name AS sector,
              (SELECT image_url FROM listing_images WHERE listing_id = l.id ORDER BY display_order LIMIT 1) AS cover_image
       FROM listings l
       JOIN districts d ON l.district_id = d.id
       JOIN sectors s ON l.sector_id = s.id
       WHERE l.seller_id = $1
       ORDER BY l.created_at DESC`,
      [req.user.id]
    );
    res.json({ listings: result.rows });
  } catch (err) {
    console.error('getMyListings error:', err.message);
    res.status(500).json({ error: 'Something went wrong while fetching your listings' });
  }
}

// ----------------------------------------------------------------------
// PUT /api/listings/:id   (auth: seller, must own the listing)
// Editing an APPROVED listing sends it back to 'pending' for re-review.
// ----------------------------------------------------------------------
async function updateListing(req, res) {
  try {
    const existing = await pool.query('SELECT * FROM listings WHERE id = $1', [req.params.id]);
    const listing = existing.rows[0];
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    if (listing.seller_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit your own listings' });
    }
    if (listing.status === 'sold') {
      return res.status(400).json({ error: 'A sold listing cannot be edited' });
    }

    const {
      title, description, price_rwf, price_usd, size_value, size_unit,
      upi, tenure_type, land_use, has_road_access, has_water, has_electricity,
    } = req.body;

    const nextStatus = listing.status === 'approved' ? 'pending' : listing.status;
    const toBool = (v, fallback) => (v === undefined ? fallback : v === 'true' || v === true);

    const result = await pool.query(
      `UPDATE listings SET
         title = COALESCE($1, title),
         description = COALESCE($2, description),
         price_rwf = COALESCE($3, price_rwf),
         price_usd = COALESCE($4, price_usd),
         size_value = COALESCE($5, size_value),
         size_unit = COALESCE($6, size_unit),
         upi = COALESCE($7, upi),
         tenure_type = COALESCE($8, tenure_type),
         land_use = COALESCE($9, land_use),
         has_road_access = $10,
         has_water = $11,
         has_electricity = $12,
         status = $13,
         rejection_reason = NULL
       WHERE id = $14
       RETURNING *`,
      [
        title, description, price_rwf, price_usd, size_value, size_unit,
        upi, tenure_type, land_use,
        toBool(has_road_access, listing.has_road_access),
        toBool(has_water, listing.has_water),
        toBool(has_electricity, listing.has_electricity),
        nextStatus, req.params.id,
      ]
    );

    res.json({
      listing: result.rows[0],
      message: nextStatus === 'pending' && listing.status === 'approved'
        ? 'Listing updated and sent back for admin re-approval.'
        : 'Listing updated.',
    });
  } catch (err) {
    console.error('updateListing error:', err.message);
    res.status(500).json({ error: 'Something went wrong while updating the listing' });
  }
}

// ----------------------------------------------------------------------
// DELETE /api/listings/:id   (auth: seller, must own the listing)
// ----------------------------------------------------------------------
async function deleteListing(req, res) {
  try {
    const existing = await pool.query('SELECT seller_id FROM listings WHERE id = $1', [req.params.id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Listing not found' });
    if (existing.rows[0].seller_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own listings' });
    }

    await pool.query('DELETE FROM listings WHERE id = $1', [req.params.id]);
    logActivity(req.user.id, 'listing_deleted');
    res.json({ message: 'Listing deleted' });
  } catch (err) {
    console.error('deleteListing error:', err.message);
    res.status(500).json({ error: 'Something went wrong while deleting the listing' });
  }
}

// ----------------------------------------------------------------------
// PATCH /api/listings/:id/sold   (auth: seller, must own the listing)
// ----------------------------------------------------------------------
async function markSold(req, res) {
  try {
    const existing = await pool.query('SELECT seller_id, status FROM listings WHERE id = $1', [req.params.id]);
    const listing = existing.rows[0];
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    if (listing.seller_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only update your own listings' });
    }
    if (listing.status !== 'approved') {
      return res.status(400).json({ error: 'Only an approved (live) listing can be marked as sold' });
    }

    const result = await pool.query(
      `UPDATE listings SET status = 'sold' WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    logActivity(req.user.id, 'listing_sold', result.rows[0].title);
    res.json({ listing: result.rows[0] });
  } catch (err) {
    console.error('markSold error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

module.exports = {
  createListing,
  getPublicListings,
  getListingBySlug,
  getMyListings,
  updateListing,
  deleteListing,
  markSold,
};
