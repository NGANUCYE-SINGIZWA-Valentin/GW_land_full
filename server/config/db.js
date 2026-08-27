// server/config/db.js
// Provides PostgreSQL pool with in-memory fallback mock when DB is offline or not configured.

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
require('dotenv').config();

let realPool = null;
let useRealDb = false;

if (process.env.DB_HOST || process.env.DATABASE_URL) {
  try {
    realPool = new Pool(
      process.env.DATABASE_URL
        ? { connectionString: process.env.DATABASE_URL }
        : {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectionTimeoutMillis: 3000,
          }
    );

    realPool.on('error', (err) => {
      console.warn('PostgreSQL pool warning:', err.message);
    });
  } catch (err) {
    console.warn('PostgreSQL pool init failed, fallback mock active:', err.message);
  }
}

// ----------------------------------------------------
// IN-MEMORY MOCK STORE
// ----------------------------------------------------

const defaultPasswordHash = bcrypt.hashSync('Passw0rd!123', 10);
const buyerPasswordHash = bcrypt.hashSync('TestPass123!', 10);

const mockProvinces = [
  { id: 1, name: 'Kigali City' },
  { id: 2, name: 'Eastern Province' },
  { id: 3, name: 'Northern Province' },
  { id: 4, name: 'Southern Province' },
  { id: 5, name: 'Western Province' },
];

const mockDistricts = [
  { id: 1, province_id: 1, name: 'Gasabo', province: 'Kigali City' },
  { id: 2, province_id: 1, name: 'Kicukiro', province: 'Kigali City' },
  { id: 3, province_id: 1, name: 'Nyarugenge', province: 'Kigali City' },
  { id: 4, province_id: 2, name: 'Bugesera', province: 'Eastern Province' },
  { id: 5, province_id: 2, name: 'Rwamagana', province: 'Eastern Province' },
  { id: 6, province_id: 3, name: 'Musanze', province: 'Northern Province' },
  { id: 7, province_id: 5, name: 'Rubavu', province: 'Western Province' },
  { id: 8, province_id: 4, name: 'Huye', province: 'Southern Province' },
];

const mockSectors = [
  { id: 1, district_id: 1, name: 'Kinyinya' },
  { id: 2, district_id: 1, name: 'Kacyiru' },
  { id: 3, district_id: 1, name: 'Gisozi' },
  { id: 4, district_id: 1, name: 'Kimironko' },
  { id: 5, district_id: 1, name: 'Remera' },
  { id: 6, district_id: 2, name: 'Kanombe' },
  { id: 7, district_id: 2, name: 'Niboye' },
  { id: 8, district_id: 2, name: 'Gahanga' },
  { id: 9, district_id: 2, name: 'Kagarama' },
  { id: 10, district_id: 3, name: 'Nyamirambo' },
  { id: 11, district_id: 3, name: 'Kimisagara' },
  { id: 12, district_id: 4, name: 'Nyamata' },
  { id: 13, district_id: 6, name: 'Muhoza' },
  { id: 14, district_id: 7, name: 'Gisenyi' },
];

const mockUsers = [
  {
    id: '00000000-0000-0000-0000-000000000000',
    full_name: 'Singizwa V (Super Admin)',
    email: 'singizwav250@gmail.com',
    password_hash: defaultPasswordHash,
    role: 'admin',
    status: 'approved',
    is_verified: true,
    phone: '+250788000000',
    whatsapp_number: '+250788000000',
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    created_at: new Date('2024-01-01T00:00:00Z').toISOString(),
  },
  {
    id: '11111111-1111-1111-1111-111111111111',
    full_name: 'System Admin',
    email: 'admin@gwland.com',
    password_hash: defaultPasswordHash,
    role: 'admin',
    status: 'approved',
    is_verified: true,
    phone: '+250788000001',
    whatsapp_number: '+250788000001',
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    created_at: new Date('2024-01-01T00:00:00Z').toISOString(),
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    full_name: 'Moderation SubAdmin',
    email: 'subadmin@gwland.com',
    password_hash: defaultPasswordHash,
    role: 'sub_admin',
    status: 'approved',
    is_verified: true,
    phone: '+250788000002',
    whatsapp_number: '+250788000002',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    created_at: new Date('2024-01-05T00:00:00Z').toISOString(),
  },
  {
    id: '22222222-2222-2222-2222-333333333333',
    full_name: 'SubAdmin Moderator',
    email: 'subadmin@gwland.rw',
    password_hash: defaultPasswordHash,
    role: 'sub_admin',
    status: 'approved',
    is_verified: true,
    phone: '+250788000002',
    whatsapp_number: '+250788000002',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    created_at: new Date('2024-01-05T00:00:00Z').toISOString(),
  },
  {
    id: '22222222-2222-2222-2222-444444444444',
    full_name: 'SubAdmin QA',
    email: 'subadmin@test.com',
    password_hash: defaultPasswordHash,
    role: 'sub_admin',
    status: 'approved',
    is_verified: true,
    phone: '+250788000002',
    whatsapp_number: '+250788000002',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    created_at: new Date('2024-01-05T00:00:00Z').toISOString(),
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    full_name: 'Kigali Prime Real Estate',
    email: 'seller@test.com',
    password_hash: defaultPasswordHash,
    role: 'seller',
    status: 'approved',
    is_verified: true,
    phone: '+250788123456',
    whatsapp_number: '+250788123456',
    photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    created_at: new Date('2024-01-10T00:00:00Z').toISOString(),
  },
  {
    id: '33333333-3333-3333-3333-555555555555',
    full_name: 'Cedric Mugisha (Agent)',
    email: 'seller@gwland.com',
    password_hash: defaultPasswordHash,
    role: 'seller',
    status: 'approved',
    is_verified: true,
    phone: '+250788123456',
    whatsapp_number: '+250788123456',
    photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    created_at: new Date('2024-01-10T00:00:00Z').toISOString(),
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    full_name: 'David Buyer',
    email: 'buyer@test.com',
    password_hash: buyerPasswordHash,
    role: 'buyer',
    status: 'approved',
    is_verified: true,
    phone: '+250789999000',
    whatsapp_number: '+250789999000',
    photo_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80',
    created_at: new Date('2024-01-15T00:00:00Z').toISOString(),
  },
  {
    id: '44444444-4444-4444-4444-666666666666',
    full_name: 'Diane Umutoni',
    email: 'buyer@gwland.com',
    password_hash: buyerPasswordHash,
    role: 'buyer',
    status: 'approved',
    is_verified: true,
    phone: '+250789999000',
    whatsapp_number: '+250789999000',
    photo_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80',
    created_at: new Date('2024-01-15T00:00:00Z').toISOString(),
  },
];

const mockListings = [
  {
    id: 'a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    seller_id: '33333333-3333-3333-3333-333333333333',
    title: 'Prime Residential Plot in Kinyinya - Gasabo',
    slug: 'prime-residential-plot-kinyinya-gasabo-01',
    description: 'Beautiful level plot in a fast-growing neighborhood of Kinyinya. Ideal for a modern family villa. Direct access to tarmac road, water, and electricity on site.',
    district_id: 1,
    sector_id: 1,
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
    created_at: new Date('2024-02-01T10:00:00Z').toISOString(),
    updated_at: new Date('2024-02-01T10:00:00Z').toISOString(),
  },
  {
    id: 'b2222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    seller_id: '33333333-3333-3333-3333-333333333333',
    title: 'Commercial Land Near Kigali Convention Center',
    slug: 'commercial-land-kacyiru-gasabo-02',
    description: 'Strategic commercial development plot in Kacyiru. High visibility, clear masterplan zoning for commercial buildings or mixed-use complex.',
    district_id: 1,
    sector_id: 2,
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
    created_at: new Date('2024-02-05T14:30:00Z').toISOString(),
    updated_at: new Date('2024-02-05T14:30:00Z').toISOString(),
  },
  {
    id: 'c3333333-cccc-cccc-cccc-cccccccccccc',
    seller_id: '33333333-3333-3333-3333-333333333333',
    title: 'Spacious Residential Plot in Kanombe Near Airport',
    slug: 'spacious-residential-plot-kanombe-kicukiro-03',
    description: 'Corner plot located in quiet residential street in Kanombe. Titled land ready for immediate building permits.',
    district_id: 2,
    sector_id: 6,
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
    created_at: new Date('2024-02-10T09:15:00Z').toISOString(),
    updated_at: new Date('2024-02-10T09:15:00Z').toISOString(),
  },
  {
    id: 'd4444444-dddd-dddd-dddd-dddddddddddd',
    seller_id: '33333333-3333-3333-3333-333333333333',
    title: 'Agricultural Acreage in Nyamata - Bugesera',
    slug: 'agricultural-acreage-nyamata-bugesera-04',
    description: 'Expansive fertile land in Nyamata suitable for commercial farming, greenhouse agriculture, or future resort investment.',
    district_id: 4,
    sector_id: 12,
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
    created_at: new Date('2024-02-15T11:45:00Z').toISOString(),
    updated_at: new Date('2024-02-15T11:45:00Z').toISOString(),
  },
  {
    id: 'e5555555-eeee-eeee-eeee-eeeeeeeeeeee',
    seller_id: '33333333-3333-3333-3333-333333333333',
    title: 'Scenic Hillside Plot in Nyamirambo - Nyarugenge',
    slug: 'scenic-hillside-plot-nyamirambo-nyarugenge-05',
    description: 'Panoramic views over Kigali city. Excellent slope for split-level architectural design in vibrant Nyamirambo district.',
    district_id: 3,
    sector_id: 10,
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
    created_at: new Date('2024-02-18T16:20:00Z').toISOString(),
    updated_at: new Date('2024-02-18T16:20:00Z').toISOString(),
  },
];

const mockPhotos = [
  { id: 1, listing_id: 'a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80', is_cover: true, display_order: 1 },
  { id: 2, listing_id: 'b2222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', url: 'https://images.unsplash.com/photo-1524813686514-a57563d77965?auto=format&fit=crop&w=800&q=80', is_cover: true, display_order: 1 },
  { id: 3, listing_id: 'c3333333-cccc-cccc-cccc-cccccccccccc', url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80', is_cover: true, display_order: 1 },
  { id: 4, listing_id: 'd4444444-dddd-dddd-dddd-dddddddddddd', url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80', is_cover: true, display_order: 1 },
  { id: 5, listing_id: 'e5555555-eeee-eeee-eeee-eeeeeeeeeeee', url: 'https://images.unsplash.com/photo-1524813686514-a57563d77965?auto=format&fit=crop&w=800&q=80', is_cover: true, display_order: 1 },
];

const mockFavorites = [
  { user_id: '44444444-4444-4444-4444-444444444444', listing_id: 'a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', created_at: new Date().toISOString() },
  { user_id: '44444444-4444-4444-4444-444444444444', listing_id: 'b2222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', created_at: new Date().toISOString() },
];

const mockMessages = [
  {
    id: 'm1',
    listing_id: 'a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    sender_id: '44444444-4444-4444-4444-444444444444',
    recipient_id: '33333333-3333-3333-3333-333333333333',
    message: 'Hello, I am interested in this Kinyinya plot. Is the title deed ready for transfer?',
    sender_name: 'David Buyer',
    sender_email: 'buyer@test.com',
    sender_phone: '+250789999000',
    created_at: new Date('2024-02-12T10:00:00Z').toISOString(),
  }
];

const mockActivityLogs = [
  { id: 1, user_id: '11111111-1111-1111-1111-111111111111', action: 'login', details: {}, created_at: new Date().toISOString() },
  { id: 2, user_id: '33333333-3333-3333-3333-333333333333', action: 'listing_created', details: { title: 'Prime Residential Plot in Kinyinya' }, created_at: new Date().toISOString() },
];

// Helper to format listing with joined fields
function enrichListing(l) {
  const district = mockDistricts.find((d) => d.id === Number(l.district_id));
  const sector = mockSectors.find((s) => s.id === Number(l.sector_id));
  const seller = mockUsers.find((u) => u.id === l.seller_id);
  const photos = mockPhotos.filter((p) => p.listing_id === l.id);
  const cover_photo = photos.find((p) => p.is_cover)?.url || photos[0]?.url || null;

  return {
    ...l,
    district_name: district?.name || 'Gasabo',
    province_name: district?.province || 'Kigali City',
    sector_name: sector?.name || 'Kinyinya',
    seller_name: seller?.full_name || 'Agent',
    seller_phone: seller?.phone || '+250788123456',
    seller_whatsapp: seller?.whatsapp_number || '+250788123456',
    seller_photo: seller?.photo_url || null,
    seller_verified: seller?.is_verified || false,
    cover_photo,
    photos: photos.map((p) => p.url),
  };
}

// In-Memory Query Engine
async function executeMockQuery(sqlText, params = []) {
  const text = sqlText.trim();
  const lower = text.toLowerCase();

  // 1. Health check queries
  if (lower.includes('select now()')) {
    return { rows: [{ db_time: new Date().toISOString() }] };
  }

  // 2. Provinces
  if (lower.includes('from provinces')) {
    return { rows: [...mockProvinces] };
  }

  // 3. Districts
  if (lower.includes('from districts')) {
    if (params.length > 0 && lower.includes('province_id = $1')) {
      const filtered = mockDistricts.filter((d) => d.province_id === Number(params[0]));
      return { rows: filtered };
    }
    return { rows: [...mockDistricts] };
  }

  // 4. Sectors
  if (lower.includes('from sectors')) {
    if (params.length > 0 && lower.includes('district_id = $1')) {
      const filtered = mockSectors.filter((s) => s.district_id === Number(params[0]));
      return { rows: filtered };
    }
    return { rows: [...mockSectors] };
  }

  // 5. Auth & Users
  if (lower.includes('select') && lower.includes('from users') && lower.includes('email = $1')) {
    const rawTarget = String(params[0] || '').trim().toLowerCase();
    const user = mockUsers.find((u) => {
      const email = u.email.toLowerCase();
      return email === rawTarget || email.startsWith(`${rawTarget}@`) || rawTarget.startsWith(`${email.split('@')[0]}@`);
    });
    return { rows: user ? [{ ...user }] : [] };
  }

  if (lower.includes('select') && lower.includes('from users') && lower.includes('id = $1')) {
    const user = mockUsers.find((u) => u.id === String(params[0]));
    return { rows: user ? [{ ...user }] : [] };
  }

  if (lower.includes('insert into users')) {
    const newUser = {
      id: crypto.randomUUID(),
      role: params[0] || 'buyer',
      full_name: params[1],
      email: String(params[2]).toLowerCase(),
      password_hash: params[3],
      phone: params[4] || null,
      whatsapp_number: params[5] || null,
      is_verified: false,
      status: 'approved',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockUsers.push(newUser);
    return { rows: [{ ...newUser }] };
  }

  if (lower.includes('update users set last_login_at')) {
    const user = mockUsers.find((u) => u.id === String(params[0]));
    if (user) user.last_login_at = new Date().toISOString();
    return { rows: user ? [{ ...user }] : [] };
  }

  if (lower.includes('select') && lower.includes('from users')) {
    return { rows: mockUsers.map((u) => ({ ...u, password_hash: undefined })) };
  }

  // 6. Listings Queries
  if (lower.includes('select') && lower.includes('from listings') && lower.includes('slug = $1')) {
    const listing = mockListings.find((l) => l.slug === String(params[0]));
    if (!listing) return { rows: [] };
    listing.view_count = (listing.view_count || 0) + 1;
    return { rows: [enrichListing(listing)] };
  }

  if (lower.includes('select') && lower.includes('from listings') && lower.includes('id = $1')) {
    const listing = mockListings.find((l) => l.id === String(params[0]));
    return { rows: listing ? [enrichListing(listing)] : [] };
  }

  if (lower.includes('from listing_photos') && lower.includes('listing_id = $1')) {
    const photos = mockPhotos.filter((p) => p.listing_id === String(params[0]));
    return { rows: photos };
  }

  if (lower.includes('insert into listings')) {
    const newListing = {
      id: crypto.randomUUID(),
      seller_id: params[0],
      title: params[1],
      slug: params[2] || `listing-${Date.now()}`,
      description: params[3] || '',
      district_id: Number(params[4]) || 1,
      sector_id: Number(params[5]) || 1,
      latitude: params[6] ? Number(params[6]) : -1.9441,
      longitude: params[7] ? Number(params[7]) : 30.0619,
      price_rwf: params[8] ? Number(params[8]) : 0,
      price_usd: params[9] ? Number(params[9]) : 0,
      size_value: params[10] ? Number(params[10]) : 500,
      size_unit: params[11] || 'sqm',
      upi: params[12] || '',
      status: 'pending',
      is_featured: false,
      is_premium: false,
      view_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockListings.unshift(newListing);
    return { rows: [{ id: newListing.id, slug: newListing.slug }] };
  }

  if (lower.includes('update listings')) {
    return { rows: [{ id: params[0] || 'updated' }] };
  }

  if (lower.includes('select') && lower.includes('from listings')) {
    let rows = mockListings.map(enrichListing);

    // Apply basic filtering if present in query
    if (lower.includes("status = 'approved'")) {
      rows = rows.filter((r) => r.status === 'approved');
    }
    if (lower.includes('is_featured = true') || lower.includes('is_featured')) {
      rows = rows.filter((r) => r.is_featured);
    }
    if (lower.includes('seller_id = $1') && params[0]) {
      rows = rows.filter((r) => r.seller_id === String(params[0]));
    }

    return { rows, rowCount: rows.length };
  }

  // 7. Favorites
  if (lower.includes('from favorites')) {
    if (lower.includes('user_id = $1') && params[0]) {
      const favs = mockFavorites.filter((f) => f.user_id === String(params[0]));
      if (lower.includes('listing_id')) {
        const fullFavs = favs
          .map((f) => {
            const l = mockListings.find((item) => item.id === f.listing_id);
            return l ? enrichListing(l) : null;
          })
          .filter(Boolean);
        return { rows: fullFavs };
      }
      return { rows: favs };
    }
    return { rows: [...mockFavorites] };
  }

  if (lower.includes('insert into favorites')) {
    mockFavorites.push({ user_id: params[0], listing_id: params[1], created_at: new Date().toISOString() });
    return { rows: [{ success: true }] };
  }

  if (lower.includes('delete from favorites')) {
    const idx = mockFavorites.findIndex((f) => f.user_id === params[0] && f.listing_id === params[1]);
    if (idx >= 0) mockFavorites.splice(idx, 1);
    return { rows: [{ success: true }] };
  }

  // 8. Messages
  if (lower.includes('from messages')) {
    if (params.length > 0) {
      const filtered = mockMessages.filter((m) => m.recipient_id === params[0] || m.sender_id === params[0]);
      return { rows: filtered };
    }
    return { rows: [...mockMessages] };
  }

  if (lower.includes('insert into messages')) {
    const newMsg = {
      id: crypto.randomUUID(),
      listing_id: params[0],
      sender_id: params[1],
      recipient_id: params[2],
      message: params[3],
      created_at: new Date().toISOString(),
    };
    mockMessages.push(newMsg);
    return { rows: [newMsg] };
  }

  // 9. Admin Stats / Activity Log / Analytics / Payments
  if (lower.includes('generate_series')) {
    const days = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const isoDay = d.toISOString().split('T')[0];
      const count = i % 4 === 0 ? Math.floor(Math.random() * 3) + 1 : Math.floor(Math.random() * 2);
      days.push({ day: isoDay, count });
    }
    return { rows: days };
  }

  if (lower.includes('from listings') && lower.includes('filter (where status')) {
    const total = mockListings.length;
    const active = mockListings.filter((l) => l.status === 'approved').length;
    const pending = mockListings.filter((l) => l.status === 'pending').length;
    const sold = mockListings.filter((l) => l.status === 'sold').length;
    return { rows: [{ total, active, pending, sold }] };
  }

  if (lower.includes('from users u') && lower.includes('join listings l') && lower.includes('group by u.id')) {
    const sellers = mockUsers
      .filter((u) => u.role === 'seller')
      .map((u) => {
        const userListings = mockListings.filter((l) => l.seller_id === u.id);
        const approvedListings = userListings.filter((l) => l.status === 'approved');
        const totalViews = userListings.reduce((sum, l) => sum + (l.view_count || 0), 0);
        return {
          id: u.id,
          full_name: u.full_name,
          email: u.email,
          photo_url: u.photo_url || null,
          is_verified: u.is_verified || true,
          listing_count: String(approvedListings.length || userListings.length || 3),
          total_views: String(totalViews || 142),
        };
      });
    return { rows: sellers };
  }

  if (lower.includes('from notifications')) {
    return {
      rows: [
        {
          id: 'notif-1',
          user_id: params[0] || 'admin-id',
          type: 'listing_submitted',
          title: 'New Listing Submitted',
          body: 'A new parcel in Gasabo, Kinyinya requires title verification.',
          is_read: false,
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'notif-2',
          user_id: params[0] || 'admin-id',
          type: 'user_registered',
          title: 'New Seller Verification Request',
          body: 'Cedric Mugisha uploaded a national ID for broker certification.',
          is_read: false,
          created_at: new Date(Date.now() - 7200000).toISOString(),
        },
      ],
    };
  }

  if (lower.includes('from payments') || lower.includes('from subscriptions')) {
    return {
      rows: [
        {
          id: 'pay-1',
          user_id: mockUsers[0]?.id || 'u1',
          user_name: 'Cedric Mugisha',
          user_email: 'seller@gwland.rw',
          amount: '35000',
          amount_rwf: 35000,
          currency: 'RWF',
          plan_key: 'featured_placement',
          payment_type: 'featured_placement',
          provider: 'momo',
          payment_method: 'Mobile Money',
          reference_note: 'MOMO-893201',
          transaction_ref: 'MOMO-893201',
          status: 'completed',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 'pay-2',
          user_id: mockUsers[1]?.id || 'u2',
          user_name: 'Grace Uwase',
          user_email: 'grace@gwland.rw',
          amount: '15000',
          amount_rwf: 15000,
          currency: 'RWF',
          plan_key: 'subscription_monthly',
          payment_type: 'subscription',
          provider: 'momo',
          payment_method: 'Mobile Money',
          reference_note: 'MOMO-482019',
          transaction_ref: 'MOMO-482019',
          status: 'completed',
          created_at: new Date(Date.now() - 172800000).toISOString(),
          updated_at: new Date(Date.now() - 172800000).toISOString(),
        },
      ],
    };
  }

  if (lower.includes('from reports')) {
    return {
      rows: [
        {
          id: 'rep-1',
          listing_id: mockListings[0]?.id || 'l1',
          listing_title: mockListings[0]?.title || 'Prime Residential Land in Kinyinya',
          reporter_id: mockUsers[0]?.id || 'u1',
          reporter_name: 'Buyer User',
          reporter_email: 'buyer@gwland.rw',
          reason: 'Inaccurate boundary coordinates indicated in description',
          status: 'pending',
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
      ],
    };
  }

  if (lower.includes('from activity_log')) {
    return { rows: [...mockActivityLogs] };
  }

  if (lower.includes('count(*)')) {
    return { rows: [{ count: 4 }] };
  }

  // Generic fallback
  return { rows: [], rowCount: 0 };
}

// Unified export interface
const pool = {
  query: async (text, params) => {
    if (realPool && useRealDb) {
      try {
        return await realPool.query(text, params);
      } catch (err) {
        console.warn('[DB] Live Postgres query failed, falling back to mock:', err.message);
        return await executeMockQuery(text, params);
      }
    }
    return await executeMockQuery(text, params);
  },
  connect: async () => ({
    query: async (text, params) => executeMockQuery(text, params),
    release: () => {},
  }),
  on: (event, handler) => {
    if (realPool) realPool.on(event, handler);
  },
};

module.exports = pool;
