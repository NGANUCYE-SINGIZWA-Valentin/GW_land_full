// src/controllers/admin.controller.js
// Admin / Sub-Admin only actions: PRD section 6.

const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const { logActivity } = require('../utils/activityLog');
const { signToken } = require('../utils/jwt');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALL_ROLES = ['admin', 'sub_admin', 'seller', 'buyer'];

// ----------------------------------------------------------------------
// GET /api/admin/listings   (auth: admin, sub_admin)
// Query params: status (pending/approved/rejected/sold), page, limit
// ----------------------------------------------------------------------
async function getAllListings(req, res) {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
    const offset = (page - 1) * limit;

    const conditions = [];
    const params = [];

    if (req.query.status) {
      params.push(req.query.status);
      conditions.push(`l.status = $${params.length}`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await pool.query(`SELECT COUNT(*) FROM listings l ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);

    params.push(limit, offset);
    const result = await pool.query(
      `SELECT l.*, d.name AS district, s.name AS sector, u.full_name AS seller_name, u.email AS seller_email,
              (SELECT image_url FROM listing_images WHERE listing_id = l.id ORDER BY display_order LIMIT 1) AS cover_image
       FROM listings l
       JOIN districts d ON l.district_id = d.id
       JOIN sectors s ON l.sector_id = s.id
       JOIN users u ON l.seller_id = u.id
       ${whereClause}
       ORDER BY l.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json({ listings: result.rows, page, limit, total, total_pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('getAllListings error:', err.message);
    res.status(500).json({ error: 'Something went wrong while fetching listings' });
  }
}

// ----------------------------------------------------------------------
// PATCH /api/admin/listings/:id/approve   (auth: admin, sub_admin)
// ----------------------------------------------------------------------
async function approveListing(req, res) {
  try {
    const result = await pool.query(
      `UPDATE listings SET status = 'approved', rejection_reason = NULL WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Listing not found' });
    logActivity(req.user.id, 'listing_approved', result.rows[0].title);
    res.json({ listing: result.rows[0], message: 'Listing approved and now live.' });
  } catch (err) {
    console.error('approveListing error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

// ----------------------------------------------------------------------
// PATCH /api/admin/listings/:id/reject   (auth: admin, sub_admin)
// body: { reason: string }
// ----------------------------------------------------------------------
async function rejectListing(req, res) {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ error: 'A rejection reason is required' });

    const result = await pool.query(
      `UPDATE listings SET status = 'rejected', rejection_reason = $1 WHERE id = $2 RETURNING *`,
      [reason, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Listing not found' });
    logActivity(req.user.id, 'listing_rejected', result.rows[0].title);
    res.json({ listing: result.rows[0], message: 'Listing rejected.' });
  } catch (err) {
    console.error('rejectListing error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

// ----------------------------------------------------------------------
// DELETE /api/admin/listings/:id   (auth: admin, sub_admin)
// Removes any listing that violates platform rules (PRD 6.3 #42)
// ----------------------------------------------------------------------
async function deleteAnyListing(req, res) {
  try {
    const result = await pool.query('DELETE FROM listings WHERE id = $1 RETURNING id, title', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Listing not found' });
    logActivity(req.user.id, 'listing_deleted_by_admin', result.rows[0].title);
    res.json({ message: 'Listing deleted' });
  } catch (err) {
    console.error('deleteAnyListing error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

// ----------------------------------------------------------------------
// PATCH /api/admin/listings/:id/feature   (auth: admin ONLY)
// body: { featured: true|false }
// Sub-admins moderate but don't control homepage promotion — that's an
// Admin-level decision per the PRD's role split.
// ----------------------------------------------------------------------
async function setFeatured(req, res) {
  try {
    const { featured } = req.body;
    const result = await pool.query(
      `UPDATE listings SET is_featured = $1 WHERE id = $2 AND status = 'approved' RETURNING *`,
      [!!featured, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found, or it is not approved yet' });
    }
    res.json({ listing: result.rows[0] });
  } catch (err) {
    console.error('setFeatured error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

// ----------------------------------------------------------------------
// PATCH /api/admin/listings/:id/upi-verify   (auth: admin, sub_admin)
// body: { verified: true|false }
// UPI (parcel ID) verification is manual — an admin/sub-admin checks the
// number against the registry themselves and flips this flag. There is no
// automated registry lookup.
// ----------------------------------------------------------------------
async function setUpiVerified(req, res) {
  try {
    const { verified } = req.body;
    const result = await pool.query(
      `UPDATE listings SET upi_verified = $1 WHERE id = $2 RETURNING *`,
      [!!verified, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    res.json({ listing: result.rows[0] });
  } catch (err) {
    console.error('setUpiVerified error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

// ----------------------------------------------------------------------
// GET /api/admin/messages   (auth: admin, sub_admin)
// Platform-wide view of every conversation — PRD 6 Communication: "Monitor
// all messages on platform". Same grouping logic as messages.getInbox, but
// without restricting to one user's own messages.
// ----------------------------------------------------------------------
async function getAllConversations(req, res) {
  try {
    const result = await pool.query(
      `SELECT DISTINCT ON (
           LEAST(m.sender_id::text, m.receiver_id::text),
           GREATEST(m.sender_id::text, m.receiver_id::text),
           COALESCE(m.listing_id::text, 'no-listing')
         )
         m.id, m.listing_id, m.body, m.is_read, m.created_at,
         m.sender_id, m.receiver_id,
         sender.full_name AS sender_name,
         receiver.full_name AS receiver_name,
         l.title AS listing_title, l.slug AS listing_slug,
         (SELECT COUNT(*) FROM messages c
          WHERE (c.sender_id = m.sender_id AND c.receiver_id = m.receiver_id)
             OR (c.sender_id = m.receiver_id AND c.receiver_id = m.sender_id)
         ) AS message_count
       FROM messages m
       JOIN users sender   ON m.sender_id   = sender.id
       JOIN users receiver ON m.receiver_id = receiver.id
       LEFT JOIN listings l ON m.listing_id = l.id
       ORDER BY
         LEAST(m.sender_id::text, m.receiver_id::text),
         GREATEST(m.sender_id::text, m.receiver_id::text),
         COALESCE(m.listing_id::text, 'no-listing'),
         m.created_at DESC`
    );
    res.json({ conversations: result.rows });
  } catch (err) {
    console.error('getAllConversations error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

// ----------------------------------------------------------------------
// GET /api/admin/messages/thread?user_a=&user_b=&listing_id=   (auth: admin, sub_admin)
// Read-only view of the full thread between any two users. Never marks
// messages as read — that's a receiver-only action, not an admin one.
// ----------------------------------------------------------------------
async function getConversationThread(req, res) {
  try {
    const { user_a, user_b, listing_id } = req.query;
    if (!user_a || !user_b) {
      return res.status(400).json({ error: 'user_a and user_b are required' });
    }

    const conditions = [
      `((m.sender_id = $1 AND m.receiver_id = $2) OR (m.sender_id = $2 AND m.receiver_id = $1))`
    ];
    const params = [user_a, user_b];
    if (listing_id) {
      params.push(listing_id);
      conditions.push(`m.listing_id = $${params.length}`);
    }

    const result = await pool.query(
      `SELECT m.*, u.full_name AS sender_name
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE ${conditions.join(' AND ')}
       ORDER BY m.created_at ASC`,
      params
    );
    res.json({ messages: result.rows });
  } catch (err) {
    console.error('getConversationThread error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

// ----------------------------------------------------------------------
// GET /api/admin/users   (auth: admin, sub_admin)  — PRD 6.2 #37
// ----------------------------------------------------------------------
async function getAllUsers(req, res) {
  try {
    const result = await pool.query(
      `SELECT id, role, full_name, email, phone, whatsapp_number, photo_url, is_verified, status, created_at, last_login_at
       FROM users ORDER BY created_at DESC`
    );
    res.json({ users: result.rows });
  } catch (err) {
    console.error('getAllUsers error:', err.message);
    res.status(500).json({ error: 'Something went wrong while fetching users' });
  }
}

// ----------------------------------------------------------------------
// GET /api/admin/users/:id/activity   (auth: admin, sub_admin)
// Recent activity timeline for one user — PRD "View user details and activity".
// ----------------------------------------------------------------------
async function getUserActivity(req, res) {
  try {
    const result = await pool.query(
      `SELECT id, action, detail, created_at FROM activity_log
       WHERE user_id = $1 ORDER BY created_at DESC LIMIT 30`,
      [req.params.id]
    );
    res.json({ activity: result.rows });
  } catch (err) {
    console.error('getUserActivity error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

// ----------------------------------------------------------------------
// POST /api/admin/users   (auth: admin ONLY)
// Admin can create an account of any role directly — this is the only way
// to create a sub_admin or admin account short of the CLI script, and lets
// an admin onboard a seller/buyer on someone's behalf too.
// body: { full_name, email, password, phone, role }
// ----------------------------------------------------------------------
async function createUser(req, res) {
  try {
    const { full_name, email, password, phone, role } = req.body;
    if (!full_name || !email || !password || !role) {
      return res.status(400).json({ error: 'full_name, email, password, and role are required' });
    }
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    if (!ALL_ROLES.includes(role)) {
      return res.status(400).json({ error: `role must be one of: ${ALL_ROLES.join(', ')}` });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (role, full_name, email, password_hash, phone, status)
       VALUES ($1, $2, $3, $4, $5, 'approved')
       RETURNING id, role, full_name, email, phone, is_verified, status, created_at`,
      [role, full_name, email.toLowerCase(), password_hash, phone || null]
    );

    logActivity(req.user.id, 'user_created', `${email} as ${role}`);
    res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'A user with that email already exists' });
    }
    console.error('createUser error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

// ----------------------------------------------------------------------
// PUT /api/admin/users/:id   (auth: admin ONLY)
// Full profile edit, including role reassignment. Cannot be used to change
// an existing admin's role away from admin — "cannot be blocked or
// restricted" per the PRD extends to not being silently demoted either.
// body: { full_name, email, phone, role }
// ----------------------------------------------------------------------
async function updateUser(req, res) {
  try {
    const target = await pool.query('SELECT role FROM users WHERE id = $1', [req.params.id]);
    if (target.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const { full_name, email, phone, role } = req.body;
    if (email && !EMAIL_REGEX.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }
    if (role && !ALL_ROLES.includes(role)) {
      return res.status(400).json({ error: `role must be one of: ${ALL_ROLES.join(', ')}` });
    }
    if (target.rows[0].role === 'admin' && role && role !== 'admin') {
      return res.status(400).json({ error: 'An admin account cannot be demoted to another role' });
    }

    const result = await pool.query(
      `UPDATE users SET
         full_name = COALESCE($1, full_name),
         email = COALESCE($2, email),
         phone = COALESCE($3, phone),
         role = COALESCE($4, role)
       WHERE id = $5
       RETURNING id, role, full_name, email, phone, whatsapp_number, photo_url, is_verified, status, created_at, last_login_at`,
      [full_name, email?.toLowerCase(), phone, role, req.params.id]
    );

    logActivity(req.user.id, 'user_updated', result.rows[0].email);
    res.json({ user: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'A user with that email already exists' });
    }
    console.error('updateUser error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

// ----------------------------------------------------------------------
// POST /api/admin/users/:id/impersonate   (auth: admin ONLY)
// Issues a real session token for the target user so the admin can see
// exactly what they see. Never usable against another admin account, and
// every use is written to the activity log for both parties.
// ----------------------------------------------------------------------
async function impersonateUser(req, res) {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'You are already logged in as yourself' });
    }
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
    const target = result.rows[0];
    if (!target) return res.status(404).json({ error: 'User not found' });
    if (target.role === 'admin') {
      return res.status(403).json({ error: 'Admin accounts cannot be impersonated' });
    }

    const token = signToken(target);
    delete target.password_hash;

    logActivity(req.user.id, 'impersonation_started', `as ${target.email}`);
    logActivity(target.id, 'impersonated_by_admin', req.user.email);

    res.json({ user: target, token });
  } catch (err) {
    console.error('impersonateUser error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

// ----------------------------------------------------------------------
// PATCH /api/admin/users/:id/status   (auth: admin, sub_admin) — PRD 6.2 #38
// body: { status: 'approved' | 'blocked' }
// ----------------------------------------------------------------------
async function setUserStatus(req, res) {
  try {
    const { status } = req.body;
    if (!['approved', 'blocked', 'pending'].includes(status)) {
      return res.status(400).json({ error: "status must be 'approved', 'blocked', or 'pending'" });
    }
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'You cannot change your own account status' });
    }
    const targetCheck = await pool.query('SELECT role FROM users WHERE id = $1', [req.params.id]);
    if (targetCheck.rows[0]?.role === 'admin') {
      return res.status(403).json({ error: 'Admin accounts cannot be blocked or restricted' });
    }

    const result = await pool.query(
      `UPDATE users SET status = $1 WHERE id = $2
       RETURNING id, role, full_name, email, status`,
      [status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    logActivity(req.user.id, 'user_status_changed', `${result.rows[0].email} -> ${status}`);
    logActivity(req.params.id, status === 'blocked' ? 'account_blocked' : 'account_approved');
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('setUserStatus error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

// ----------------------------------------------------------------------
// DELETE /api/admin/users/:id   (auth: admin ONLY)
// Removes a user account. Listings/messages/etc cascade via FK constraints.
// ----------------------------------------------------------------------
async function deleteUser(req, res) {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }
    const targetCheck = await pool.query('SELECT role FROM users WHERE id = $1', [req.params.id]);
    if (targetCheck.rows[0]?.role === 'admin') {
      return res.status(403).json({ error: 'Admin accounts cannot be deleted' });
    }
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id, email', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    logActivity(req.user.id, 'user_deleted', result.rows[0].email);
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('deleteUser error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

// ----------------------------------------------------------------------
// GET /api/admin/top-sellers   (auth: admin, sub_admin)
// Ranks sellers by number of approved listings, then total views.
// ----------------------------------------------------------------------
async function getTopSellers(req, res) {
  try {
    const result = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.photo_url, u.is_verified,
              COUNT(l.id) FILTER (WHERE l.status = 'approved') AS listing_count,
              COALESCE(SUM(l.view_count) FILTER (WHERE l.status = 'approved'), 0) AS total_views
       FROM users u
       JOIN listings l ON l.seller_id = u.id
       WHERE u.role = 'seller'
       GROUP BY u.id
       HAVING COUNT(l.id) FILTER (WHERE l.status = 'approved') > 0
       ORDER BY listing_count DESC, total_views DESC
       LIMIT 10`
    );
    res.json({ sellers: result.rows });
  } catch (err) {
    console.error('getTopSellers error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

// ----------------------------------------------------------------------
// PATCH /api/admin/users/:id/verify   (auth: admin ONLY) — PRD 6.2 #39
// body: { verified: true|false }
// ----------------------------------------------------------------------
async function setUserVerified(req, res) {
  try {
    const { verified } = req.body;
    const result = await pool.query(
      `UPDATE users SET is_verified = $1 WHERE id = $2 AND role IN ('seller','buyer')
       RETURNING id, full_name, email, is_verified`,
      [!!verified, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    logActivity(req.user.id, 'user_verify_changed', `${result.rows[0].email} -> ${verified ? 'verified' : 'unverified'}`);
    logActivity(req.params.id, verified ? 'account_verified' : 'account_unverified');
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('setUserVerified error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

// ----------------------------------------------------------------------
// GET /api/admin/notifications   (auth: admin, sub_admin)
// ----------------------------------------------------------------------
async function getNotifications(req, res) {
  try {
    const result = await pool.query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100`,
      [req.user.id]
    );
    res.json({ notifications: result.rows });
  } catch (err) {
    console.error('getNotifications error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

// ----------------------------------------------------------------------
// PATCH /api/admin/notifications/:id/read   (auth: admin, sub_admin)
// ----------------------------------------------------------------------
async function markNotificationRead(req, res) {
  try {
    const result = await pool.query(
      `UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING *`,
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Notification not found' });
    res.json({ notification: result.rows[0] });
  } catch (err) {
    console.error('markNotificationRead error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

// ----------------------------------------------------------------------
// GET /api/admin/analytics   (auth: admin, sub_admin) — PRD 6.4
// ----------------------------------------------------------------------
async function getAnalytics(req, res) {
  try {
    const [users, listings, mostViewed, listingsByDay, usersByDay, messageCount, reportCount, favoriteCount] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query(
        `SELECT
           COUNT(*) AS total,
           COUNT(*) FILTER (WHERE status = 'approved') AS active,
           COUNT(*) FILTER (WHERE status = 'pending') AS pending,
           COUNT(*) FILTER (WHERE status = 'sold') AS sold
         FROM listings`
      ),
      pool.query(
        `SELECT id, title, slug, view_count FROM listings
         WHERE status = 'approved' ORDER BY view_count DESC LIMIT 5`
      ),
      // Zero-filled daily counts for the last 30 days, not just days with data,
      // so the chart doesn't gap or misrepresent quiet days.
      pool.query(
        `SELECT d::date AS day, COUNT(l.id) AS count
         FROM generate_series(CURRENT_DATE - INTERVAL '29 days', CURRENT_DATE, INTERVAL '1 day') d
         LEFT JOIN listings l ON l.created_at::date = d::date
         GROUP BY d ORDER BY d`
      ),
      pool.query(
        `SELECT d::date AS day, COUNT(u.id) AS count
         FROM generate_series(CURRENT_DATE - INTERVAL '29 days', CURRENT_DATE, INTERVAL '1 day') d
         LEFT JOIN users u ON u.created_at::date = d::date
         GROUP BY d ORDER BY d`
      ),
      pool.query('SELECT COUNT(*) FROM messages'),
      pool.query('SELECT COUNT(*) FROM reports'),
      pool.query('SELECT COUNT(*) FROM favorites'),
    ]);

    res.json({
      total_users: parseInt(users.rows[0].count),
      listings: listings.rows[0],
      most_viewed_listings: mostViewed.rows,
      listings_by_day: listingsByDay.rows,
      users_by_day: usersByDay.rows,
      total_messages: parseInt(messageCount.rows[0].count),
      total_reports: parseInt(reportCount.rows[0].count),
      total_favorites: parseInt(favoriteCount.rows[0].count),
    });
  } catch (err) {
    console.error('getAnalytics error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

// ----------------------------------------------------------------------
// PATCH /api/admin/listings/:id/premium   (auth: admin ONLY)
// body: { premium: true|false }
// Marks a listing as a promoted/premium listing (PRD 6.3 #44)
// ----------------------------------------------------------------------
async function setPremium(req, res) {
  try {
    const { premium } = req.body;
    const result = await pool.query(
      `UPDATE listings SET is_premium = $1 WHERE id = $2 AND status = 'approved' RETURNING *`,
      [!!premium, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found, or it is not approved yet' });
    }
    res.json({ listing: result.rows[0] });
  } catch (err) {
    console.error('setPremium error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

module.exports = {
  getAllListings,
  approveListing,
  rejectListing,
  deleteAnyListing,
  setFeatured,
  setPremium,
  setUpiVerified,
  getAllUsers,
  setUserStatus,
  setUserVerified,
  deleteUser,
  getTopSellers,
  getNotifications,
  markNotificationRead,
  getAnalytics,
  getAllConversations,
  getConversationThread,
  getUserActivity,
  createUser,
  updateUser,
  impersonateUser,
};
