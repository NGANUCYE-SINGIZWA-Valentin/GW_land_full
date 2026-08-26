// db/seed_rich_data.js
// Seeding rich, realistic data for GW Land platform dashboards

require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../src/config/db');

async function seed() {
  console.log('🌱 Starting database seeding for GW Land dashboards...');

  try {
    const defaultPasswordHash = await bcrypt.hash('Passw0rd!123', 10);
    const buyerPasswordHash = await bcrypt.hash('TestPass123!', 10);

    // 1. Ensure/Upsert Test Users
    console.log('👤 Seeding users...');
    
    // Admin
    const adminRes = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role, status, is_verified)
       VALUES ('System Admin', 'admin@gwland.com', $1, 'admin', 'approved', true)
       ON CONFLICT (email) DO UPDATE SET password_hash = $1, role = 'admin', status = 'approved', is_verified = true
       RETURNING id;`,
      [defaultPasswordHash]
    );
    const adminId = adminRes.rows[0].id;

    // Sub-Admin
    const subAdminRes = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role, status, is_verified)
       VALUES ('Moderation SubAdmin', 'subadmin@gwland.com', $1, 'sub_admin', 'approved', false)
       ON CONFLICT (email) DO UPDATE SET password_hash = $1, role = 'sub_admin', status = 'approved'
       RETURNING id;`,
      [defaultPasswordHash]
    );
    const subAdminId = subAdminRes.rows[0].id;

    // Seller 1
    const sellerRes = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role, status, is_verified, phone, whatsapp_number)
       VALUES ('Kigali Prime Real Estate', 'seller@test.com', $1, 'seller', 'approved', true, '+250788123456', '+250788123456')
       ON CONFLICT (email) DO UPDATE SET password_hash = $1, role = 'seller', status = 'approved', is_verified = true
       RETURNING id;`,
      [defaultPasswordHash]
    );
    const sellerId = sellerRes.rows[0].id;

    // Seller 2
    const seller2Res = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role, status, is_verified, phone, whatsapp_number)
       VALUES ('Rwanda Land Agents Ltd', 'agent2@gwland.rw', $1, 'seller', 'approved', true, '+250788654321', '+250788654321')
       ON CONFLICT (email) DO UPDATE SET password_hash = $1, role = 'seller', status = 'approved', is_verified = true
       RETURNING id;`,
      [defaultPasswordHash]
    );
    const seller2Id = seller2Res.rows[0].id;

    // Buyer
    const buyerRes = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role, status, is_verified, phone)
       VALUES ('David Buyer', 'buyer@test.com', $1, 'buyer', 'approved', true, '+250789999000')
       ON CONFLICT (email) DO UPDATE SET password_hash = $1, role = 'buyer', status = 'approved'
       RETURNING id;`,
      [buyerPasswordHash]
    );
    const buyerId = buyerRes.rows[0].id;

    // Buyer 2
    const buyer2Res = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role, status, is_verified, phone)
       VALUES ('Alice Mukamana', 'alice.buyer@example.com', $1, 'buyer', 'approved', false, '+250788777666')
       ON CONFLICT (email) DO UPDATE SET password_hash = $1, role = 'buyer', status = 'approved'
       RETURNING id;`,
      [defaultPasswordHash]
    );
    const buyer2Id = buyer2Res.rows[0].id;

    // 2. Fetch District & Sector IDs for realistic location mapping
    console.log('📍 Fetching location metadata...');
    const gasabo = (await pool.query("SELECT id FROM districts WHERE name ILIKE '%Gasabo%'")).rows[0]?.id || 1;
    const kicukiro = (await pool.query("SELECT id FROM districts WHERE name ILIKE '%Kicukiro%'")).rows[0]?.id || 2;
    const nyarugenge = (await pool.query("SELECT id FROM districts WHERE name ILIKE '%Nyarugenge%'")).rows[0]?.id || 3;
    const bugesera = (await pool.query("SELECT id FROM districts WHERE name ILIKE '%Bugesera%'")).rows[0]?.id || 4;
    const musanze = (await pool.query("SELECT id FROM districts WHERE name ILIKE '%Musanze%'")).rows[0]?.id || 11;
    const rubavu = (await pool.query("SELECT id FROM districts WHERE name ILIKE '%Rubavu%'")).rows[0]?.id || 20;

    const kinyinyaSec = (await pool.query("SELECT id FROM sectors WHERE district_id = $1 LIMIT 1", [gasabo])).rows[0]?.id || 6;
    const kacyiruSec = (await pool.query("SELECT id FROM sectors WHERE district_id = $1 LIMIT 1", [gasabo])).rows[0]?.id || 8;
    const kanombeSec = (await pool.query("SELECT id FROM sectors WHERE district_id = $1 LIMIT 1", [kicukiro])).rows[0]?.id || 15;
    const niboyeSec = (await pool.query("SELECT id FROM sectors WHERE district_id = $1 LIMIT 1", [kicukiro])).rows[0]?.id || 16;
    const nyamiramboSec = (await pool.query("SELECT id FROM sectors WHERE district_id = $1 LIMIT 1", [nyarugenge])).rows[0]?.id || 25;
    const nyamataSec = (await pool.query("SELECT id FROM sectors WHERE district_id = $1 LIMIT 1", [bugesera])).rows[0]?.id || 35;

    // 3. Seed Realistic Land Listings
    console.log('🏞️ Seeding land listings...');

    const listingsData = [
      {
        seller_id: sellerId,
        title: 'Prime Residential Plot in Kinyinya - Gasabo',
        slug: 'prime-residential-plot-kinyinya-gasabo-01',
        description: 'Beautiful level plot in a fast-growing neighborhood of Kinyinya. Ideal for a modern family villa. Direct access to tarmac road, water, and electricity on site.',
        district_id: gasabo,
        sector_id: kinyinyaSec,
        latitude: -1.9167,
        longitude: 30.0833,
        price_rwf: 45000000,
        price_usd: 35000,
        size_value: 600,
        size_unit: 'sqm',
        upi: '1/02/03/04/1001',
        upi_verified: true,
        tenure_type: 'freehold',
        land_use: 'residential',
        has_road_access: true,
        has_water: true,
        has_electricity: true,
        status: 'approved',
        is_featured: true,
        is_premium: true,
        view_count: 342,
        images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80']
      },
      {
        seller_id: sellerId,
        title: 'Commercial Land Near Kigali Convention Center',
        slug: 'commercial-land-kacyiru-gasabo-02',
        description: 'Strategic commercial development plot in Kacyiru. High visibility, clear masterplan zoning for commercial buildings or mixed-use complex.',
        district_id: gasabo,
        sector_id: kacyiruSec,
        latitude: -1.9500,
        longitude: 30.0900,
        price_rwf: 120000000,
        price_usd: 95000,
        size_value: 1200,
        size_unit: 'sqm',
        upi: '1/02/08/01/2005',
        upi_verified: true,
        tenure_type: 'leasehold',
        land_use: 'commercial',
        has_road_access: true,
        has_water: true,
        has_electricity: true,
        status: 'approved',
        is_featured: true,
        is_premium: false,
        view_count: 518,
        images: ['https://images.unsplash.com/photo-1524813686514-a57563d77965?auto=format&fit=crop&w=800&q=80']
      },
      {
        seller_id: sellerId,
        title: 'Spacious Residential Plot in Kanombe Near Airport',
        slug: 'spacious-residential-plot-kanombe-kicukiro-03',
        description: 'Corner plot located in quiet residential street in Kanombe. Titled land ready for immediate building permits.',
        district_id: kicukiro,
        sector_id: kanombeSec,
        latitude: -1.9670,
        longitude: 30.1330,
        price_rwf: 28000000,
        price_usd: 22000,
        size_value: 450,
        size_unit: 'sqm',
        upi: '2/05/12/03/3010',
        upi_verified: false,
        tenure_type: 'freehold',
        land_use: 'residential',
        has_road_access: true,
        has_water: true,
        has_electricity: true,
        status: 'approved',
        is_featured: false,
        is_premium: false,
        view_count: 189,
        images: ['https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80']
      },
      {
        seller_id: seller2Id,
        title: 'Agricultural Acreage in Nyamata - Bugesera',
        slug: 'agricultural-acreage-nyamata-bugesera-04',
        description: 'Expansive fertile land in Nyamata suitable for commercial farming, greenhouse agriculture, or future resort investment.',
        district_id: bugesera,
        sector_id: nyamataSec,
        latitude: -2.1500,
        longitude: 30.0833,
        price_rwf: 35000000,
        price_usd: 27500,
        size_value: 2.5,
        size_unit: 'hectare',
        upi: '4/01/05/09/4040',
        upi_verified: true,
        tenure_type: 'customary',
        land_use: 'agricultural',
        has_road_access: true,
        has_water: true,
        has_electricity: false,
        status: 'approved',
        is_featured: true,
        is_premium: true,
        view_count: 412,
        images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80']
      },
      {
        seller_id: seller2Id,
        title: 'Scenic Hillside Plot in Nyamirambo - Nyarugenge',
        slug: 'scenic-hillside-plot-nyamirambo-nyarugenge-05',
        description: 'Panoramin views over Kigali city. Excellent slope for split-level architectural design in vibrant Nyamirambo district.',
        district_id: nyarugenge,
        sector_id: nyamiramboSec,
        latitude: -1.9833,
        longitude: 30.0500,
        price_rwf: 32000000,
        price_usd: 25000,
        size_value: 500,
        size_unit: 'sqm',
        upi: '3/03/01/08/5050',
        upi_verified: false,
        tenure_type: 'freehold',
        land_use: 'residential',
        has_road_access: true,
        has_water: true,
        has_electricity: true,
        status: 'pending',
        is_featured: false,
        is_premium: false,
        view_count: 64,
        images: ['https://images.unsplash.com/photo-1524813686514-a57563d77965?auto=format&fit=crop&w=800&q=80']
      },
      {
        seller_id: sellerId,
        title: 'Luxury Villa Plot in Niboye - Kicukiro',
        slug: 'luxury-villa-plot-niboye-kicukiro-06',
        description: 'Gated-style street setting in Niboye, fully serviced with high-speed fiber internet potential, modern drainage, and clean titles.',
        district_id: kicukiro,
        sector_id: niboyeSec,
        latitude: -1.9720,
        longitude: 30.1050,
        price_rwf: 65000000,
        price_usd: 51000,
        size_value: 800,
        size_unit: 'sqm',
        upi: '2/02/04/07/6060',
        upi_verified: true,
        tenure_type: 'freehold',
        land_use: 'residential',
        has_road_access: true,
        has_water: true,
        has_electricity: true,
        status: 'sold',
        is_featured: false,
        is_premium: false,
        view_count: 620,
        images: ['https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80']
      }
    ];

    const insertedListingIds = [];

    for (const item of listingsData) {
      const res = await pool.query(
        `INSERT INTO listings (
          seller_id, title, slug, description, district_id, sector_id,
          latitude, longitude, price_rwf, price_usd, size_value, size_unit,
          upi, upi_verified, tenure_type, land_use, has_road_access, has_water, has_electricity,
          status, is_featured, is_premium, view_count
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
        ) ON CONFLICT (slug) DO UPDATE SET
          price_rwf = EXCLUDED.price_rwf, status = EXCLUDED.status, view_count = EXCLUDED.view_count, is_featured = EXCLUDED.is_featured
        RETURNING id;`,
        [
          item.seller_id, item.title, item.slug, item.description, item.district_id, item.sector_id,
          item.latitude, item.longitude, item.price_rwf, item.price_usd, item.size_value, item.size_unit,
          item.upi, item.upi_verified, item.tenure_type, item.land_use, item.has_road_access, item.has_water, item.has_electricity,
          item.status, item.is_featured, item.is_premium, item.view_count
        ]
      );
      const listingId = res.rows[0].id;
      insertedListingIds.push(listingId);

      // Insert Cover Image
      await pool.query(
        `INSERT INTO listing_images (listing_id, image_url, display_order)
         VALUES ($1, $2, 0) ON CONFLICT DO NOTHING;`,
        [listingId, item.images[0]]
      );
    }

    // 4. Seed Messages & Conversations
    console.log('💬 Seeding messaging conversations...');
    const firstListingId = insertedListingIds[0];
    const secondListingId = insertedListingIds[1];

    if (firstListingId && buyerId && sellerId) {
      await pool.query(
        `INSERT INTO messages (listing_id, sender_id, receiver_id, body, is_read, created_at)
         VALUES 
         ($1, $2, $3, 'Hello! Is this plot in Kinyinya still available for inspection this Saturday?', true, now() - INTERVAL '2 days'),
         ($1, $3, $2, 'Hello David! Yes, it is fully available. We can schedule a visit at 10 AM.', true, now() - INTERVAL '1 day'),
         ($1, $2, $3, 'Great! Please confirm the meeting point near the main tarmac road.', false, now() - INTERVAL '3 hours')
         ON CONFLICT DO NOTHING;`,
        [firstListingId, buyerId, sellerId]
      );
    }

    if (secondListingId && buyer2Id && sellerId) {
      await pool.query(
        `INSERT INTO messages (listing_id, sender_id, receiver_id, body, is_read, created_at)
         VALUES 
         ($1, $2, $3, 'Interested in the commercial plot in Kacyiru. Are the land zoning documents verified?', false, now() - INTERVAL '5 hours')
         ON CONFLICT DO NOTHING;`,
        [secondListingId, buyer2Id, sellerId]
      );
    }

    // 5. Seed Payments & Revenue History
    console.log('💳 Seeding payment history for revenue charts...');
    const paymentRecords = [
      { user_id: sellerId, listing_id: firstListingId, amount: 15000, currency: 'RWF', type: 'featured_placement', provider: 'momo', plan: 'featured_placement', status: 'completed', daysAgo: 25 },
      { user_id: sellerId, listing_id: firstListingId, amount: 5000, currency: 'RWF', type: 'listing_fee', provider: 'momo', plan: 'listing_fee', status: 'completed', daysAgo: 20 },
      { user_id: seller2Id, listing_id: insertedListingIds[3], amount: 25000, currency: 'RWF', type: 'subscription', provider: 'momo', plan: 'subscription_monthly', status: 'completed', daysAgo: 15 },
      { user_id: sellerId, listing_id: secondListingId, amount: 15000, currency: 'RWF', type: 'featured_placement', provider: 'card', plan: 'featured_placement', status: 'completed', daysAgo: 8 },
      { user_id: seller2Id, listing_id: insertedListingIds[4], amount: 5000, currency: 'RWF', type: 'listing_fee', provider: 'momo', plan: 'listing_fee', status: 'pending', daysAgo: 2 },
      { user_id: sellerId, listing_id: insertedListingIds[5], amount: 15000, currency: 'RWF', type: 'featured_placement', provider: 'momo', plan: 'featured_placement', status: 'completed', daysAgo: 1 }
    ];

    for (const p of paymentRecords) {
      await pool.query(
        `INSERT INTO payments (user_id, listing_id, amount, currency, payment_type, provider, confirmed_by, plan_key, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now() - ($10 || ' days')::INTERVAL)`,
        [p.user_id, p.listing_id || null, p.amount, p.currency, p.type, p.provider, adminId, p.plan, p.status, p.daysAgo]
      );
    }

    // 6. Seed Reports & Admin Notifications
    console.log('🚩 Seeding reports & notifications...');
    if (insertedListingIds[2]) {
      await pool.query(
        `INSERT INTO reports (listing_id, reporter_id, reporter_email, reason_category, reason, status)
         VALUES ($1, $2, 'visitor@test.com', 'incorrect_info', 'The land size listed differs slightly from masterplan map.', 'pending')
         ON CONFLICT DO NOTHING;`,
        [insertedListingIds[2], buyerId]
      );
    }

    await pool.query(
      `INSERT INTO notifications (user_id, type, message, is_read, created_at)
       VALUES 
       ($1, 'new_listing', 'New listing submitted for review: Scenic Hillside Plot in Nyamirambo', false, now() - INTERVAL '4 hours'),
       ($1, 'new_user', 'New seller registered: Rwanda Land Agents Ltd', true, now() - INTERVAL '1 day'),
       ($1, 'new_report', 'Listing reported for review: Spacious Residential Plot in Kanombe', false, now() - INTERVAL '2 days')
       ON CONFLICT DO NOTHING;`,
      [adminId]
    );

    // 7. Seed Activity Logs
    console.log('📜 Seeding activity log trail...');
    await pool.query(
      `INSERT INTO activity_log (user_id, action, detail, created_at)
       VALUES 
       ($1, 'listing_approved', 'Approved Kinyinya Residential Plot', now() - INTERVAL '25 days'),
       ($2, 'listing_created', 'Submitted Kanombe plot for approval', now() - INTERVAL '20 days'),
       ($1, 'payment_confirmed', 'Confirmed Featured Placement payment RWF 15,000', now() - INTERVAL '8 days'),
       ($3, 'listing_created', 'Submitted Nyamirambo plot for approval', now() - INTERVAL '1 day')
       ON CONFLICT DO NOTHING;`,
      [adminId, sellerId, seller2Id]
    );

    console.log('✅ Seeding completed successfully!');
  } catch (err) {
    console.error('❌ Seeding error:', err.message);
  } finally {
    await pool.end();
  }
}

seed();
