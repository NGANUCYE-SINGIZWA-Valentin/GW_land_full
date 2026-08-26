# GW Land & Construction — Backend (Step 1 + 2 + 3)

Backend for Getway Connection Ltd's land listing platform.
Stack: Node.js + Express + PostgreSQL.

- **Step 1** ✅ project setup + full database schema + Rwanda location data
- **Step 2** ✅ authentication: register, login, JWT, roles, profile, password reset
- **Step 3** ✅ listings: create, image upload, admin approval, public browsing, mark sold
- Step 4 (next): search/filters polish, in-platform messaging, report listing

This completes the **entire Phase 1 MVP core loop** from the project requirements
doc: a seller can post land, an admin can approve it, and a buyer can find and
contact the seller — all backend logic for that is now built and tested.

---

## What's in this folder

```
gw-land-backend/
├── db/
│   ├── schema.sql          ← Table structure (12 tables incl. provinces/districts/sectors)
│   ├── seed_locations.sql  ← Full Rwanda location data (5 provinces, 30 districts, 383 sectors)
│   └── create-admin.js     ← One-time script to create the first Admin/Sub-Admin account
├── src/
│   ├── config/
│   │   └── db.js                       ← PostgreSQL connection pool
│   ├── controllers/
│   │   ├── auth.controller.js          ← Register, login, profile, password reset
│   │   ├── listings.controller.js      ← Create/browse/edit/delete listings (public + seller)
│   │   └── admin.controller.js         ← Approve/reject/delete/feature, user mgmt, notifications
│   ├── middleware/
│   │   ├── auth.middleware.js          ← Verifies JWT, attaches req.user
│   │   ├── role.middleware.js          ← Restricts routes to specific roles
│   │   └── upload.middleware.js        ← Handles image/document uploads (multer)
│   ├── routes/
│   │   ├── auth.routes.js              ← /api/auth/*
│   │   ├── listings.routes.js          ← /api/listings/*
│   │   └── admin.routes.js             ← /api/admin/*
│   ├── utils/
│   │   ├── jwt.js                      ← Sign/verify JWT tokens
│   │   ├── email.js                    ← Sends emails (or logs them in dev mode)
│   │   ├── slug.js                     ← Generates SEO-friendly listing URLs
│   │   └── notifications.js            ← Notifies admins of new users/listings
│   ├── app.js              ← Express app + routes + static file serving
│   └── server.js           ← Starts the server
├── uploads/
│   ├── listings/           ← Uploaded listing photos land here
│   └── documents/          ← Uploaded ownership-proof documents land here
├── .env.example            ← Template for your secrets — copy to .env
├── .gitignore
└── package.json
```

---

## Step-by-step setup on your machine

### 1. Create the database

Open a terminal and run:

```bash
psql -U postgres -c "CREATE DATABASE gw_land_db;"
```

It'll ask for your postgres password. If you haven't set one, check your PostgreSQL
install notes — by default on Windows you set this during installation.

### 2. Load the schema, then the location data

From inside this `gw-land-backend` folder, run these **in order**:

```bash
psql -U postgres -d gw_land_db -f db/schema.sql
psql -U postgres -d gw_land_db -f db/seed_locations.sql
```

`schema.sql` creates the tables (including `provinces`, `districts`, `sectors`).
`seed_locations.sql` loads the **full national list**: 5 provinces, 30 districts,
383 sectors — transcribed directly from Rwanda's official administrative list.

You should see `INSERT 0 5`, `INSERT 0 30`, and `INSERT 0 383` at the end.

> Note: Rwanda is officially described as having 416 sectors, but the source
> list only named 383 of them. I loaded exactly what was listed — nothing
> invented to round the number up. If you get the complete official list later,
> just add the missing sectors with more `INSERT INTO sectors (district_id, name)
> VALUES ((SELECT id FROM districts WHERE name = '...'), '...');` lines.

If you get an error like `relation already exists`, you ran `schema.sql` twice —
drop the database (`dropdb gw_land_db` then `createdb gw_land_db`) and start over.

### 3. Configure your environment

```bash
cp .env.example .env
```

Then open `.env` and fill in:
- `DB_PASSWORD` → your real PostgreSQL password
- `JWT_SECRET` → any long random string (this signs login tokens later — for now
  just put something like `gwland_super_secret_change_me_2026`)

**Never commit `.env` to Git** — it's already in `.gitignore`.

### 4. Install dependencies

```bash
npm install
```

> Note: I used `bcryptjs` instead of `bcrypt`, and `multer` v2 instead of v1.
> `bcryptjs` is pure JavaScript — it avoids native-compilation errors that
> `bcrypt` sometimes causes on Windows. `multer` v1 has known security
> vulnerabilities that v2 fixes.

### 5. Start the server

```bash
npm run dev
```

You should see:
```
✅ GW Land backend running on http://localhost:5000
```

### 6. Test it

Open these in your browser, or use `curl`:

- `http://localhost:5000/api/health` → confirms the server itself is running
- `http://localhost:5000/api/health/db` → confirms the server can talk to PostgreSQL

If `/api/health/db` returns an error, double-check:
- Is PostgreSQL actually running? (`pg_isready` or check Services on Windows)
- Does `.env` have the right password and database name?

---

## What the schema covers

Every table maps directly to a section of the project requirements doc:

| Table | PRD section |
|---|---|
| `users` | Section 3 — Admin, Sub-Admin, Seller/Agent, Buyer roles |
| `password_reset_tokens` | 5.1 — password reset |
| `provinces`, `districts`, `sectors` | 4.2 — location search/filter (full national data, not just Kigali) |
| `listings` | 4.3, 5.2, 6.3 — the core listing object |
| `listing_images` | Multiple photo uploads per listing |
| `listing_documents` | 5.2 / 8 — optional ownership proof |
| `messages` | Section 7 — buyer/seller in-platform chat |
| `reports` | 9 — "report listing" feature |
| `payments` | 10 — MTN MoMo (Phase 1), cards (Phase 2 later) |
| `subscriptions` | 10.1 — agent multi-listing plans |
| `notifications` | 7 — admin alerts for new users/listings |

Roles, statuses, and currencies are all PostgreSQL `ENUM` types — this stops bad
data (like a typo'd role) from ever getting into the database in the first place.

The Kigali districts/sectors carry the most listings early on, but the full
national list is already loaded — sellers anywhere in Rwanda can list land from
day one.

---

---

## Step 3 — Listings

### How the approval workflow works

```
Seller creates listing → status = 'pending' (hidden from public)
                              ↓
                    Admin approves → status = 'approved' (live, public)
                    Admin rejects → status = 'rejected' (seller sees reason)
                              ↓ (if seller edits an approved listing)
                    status reverts to 'pending' (re-review required)
                              ↓ (when sold)
                    Seller marks → status = 'sold'
```

Every listing submission fires an in-app notification to all Admins/Sub-Admins.

### Listing endpoints (public)

| Method | Route | What it does |
|---|---|---|
| GET | `/api/listings` | Browse approved listings (paginated) |
| GET | `/api/listings/:slug` | Get full listing detail + increments view count |

Both are public — no token required. Example filters on the list:

```
/api/listings?district_id=1&min_price=5000000&max_price=20000000
/api/listings?featured=true
/api/listings?page=2&limit=10
```

### Listing endpoints (seller — token required)

| Method | Route | What it does |
|---|---|---|
| POST | `/api/listings` | Create a listing (multipart/form-data) |
| GET | `/api/listings/mine` | View your own listings (all statuses) |
| PUT | `/api/listings/:id` | Edit your own listing |
| DELETE | `/api/listings/:id` | Delete your own listing |
| PATCH | `/api/listings/:id/sold` | Mark your own listing as sold |

**Creating a listing uses `multipart/form-data`** (not JSON), because it carries files.
Required fields: `title`, `description`, `district_id`, `sector_id`, `size_value`, `size_unit`, and at least one of `price_rwf` or `price_usd`.
Optional fields: `latitude`, `longitude`, `price_rwf`, `price_usd`, `images` (up to 10, max 5MB each), `documents` (up to 3 ownership-proof files, PDF/image).

Example with curl:
```bash
curl -X POST http://localhost:5000/api/listings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=500sqm plot in Kacyiru" \
  -F "description=Flat, ready to build, near main road" \
  -F "district_id=1" \
  -F "sector_id=8" \
  -F "price_rwf=15000000" \
  -F "size_value=500" \
  -F "size_unit=sqm" \
  -F "images=@/path/to/photo1.jpg" \
  -F "images=@/path/to/photo2.jpg"
```

To get the right `district_id` and `sector_id` values, query the database:
```sql
SELECT d.id AS district_id, s.id AS sector_id, d.name, s.name
FROM districts d JOIN sectors s ON s.district_id = d.id
WHERE d.name = 'Gasabo';
```

### Admin endpoints (admin/sub-admin token required)

| Method | Route | Who | What it does |
|---|---|---|---|
| GET | `/api/admin/listings` | admin, sub_admin | All listings (filter by `?status=pending`) |
| PATCH | `/api/admin/listings/:id/approve` | admin, sub_admin | Approve a listing |
| PATCH | `/api/admin/listings/:id/reject` | admin, sub_admin | Reject (body: `{"reason":"..."}`) |
| DELETE | `/api/admin/listings/:id` | admin, sub_admin | Remove any listing that breaks rules |
| PATCH | `/api/admin/listings/:id/feature` | **admin only** | Feature/unfeature on homepage |
| GET | `/api/admin/users` | admin, sub_admin | All registered users |
| PATCH | `/api/admin/users/:id/status` | admin, sub_admin | Approve or block a user account |
| PATCH | `/api/admin/users/:id/verify` | **admin only** | Assign verified badge to a seller |
| GET | `/api/admin/notifications` | admin, sub_admin | Your in-app notification feed |
| PATCH | `/api/admin/notifications/:id/read` | admin, sub_admin | Mark a notification as read |
| GET | `/api/admin/analytics` | admin, sub_admin | Users total, listing stats, top viewed |

Note on roles: Sub-Admins can approve/reject/delete listings and manage users, but
**only Admins** can feature listings on the homepage or assign verified badges —
matching the PRD's role split exactly.

### How to find district_id and sector_id values for Rwanda

Run this query against your database any time you need to look up an ID:
```sql
SELECT d.id AS district_id, d.name AS district,
       s.id AS sector_id, s.name AS sector
FROM districts d
JOIN sectors s ON s.district_id = d.id
ORDER BY d.name, s.name;
```

### About file uploads

Uploaded images and documents are saved to the `uploads/` folder on disk and
served at `http://localhost:5000/uploads/listings/<filename>`. The frontend can
just put those URLs in `<img>` tags.

**Before deploying to production**: local disk storage doesn't survive
redeployments on most hosting platforms. Swap the storage strategy in
`src/middleware/upload.middleware.js` to use cloud storage (AWS S3, Cloudinary,
etc.) — that's the only file that needs to change, everything else stays the same.

---

## Step 2 — Authentication

### How roles work

- **Anyone** can register as a `buyer` or `seller` through `/api/auth/register`.
- **Nobody** can register as `admin` or `sub_admin` through the API — if you try,
  it silently becomes a `buyer` account instead. This is intentional.
- To create the **first Admin account**, run this once from the project folder:

  ```bash
  node db/create-admin.js "Your Name" admin@example.com SomeStrongPassword123
  ```

  Add `sub_admin` as a 4th argument to create a Sub-Admin instead.

### Auth endpoints

| Method | Route | Auth? | What it does |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create a buyer/seller account, returns token |
| POST | `/api/auth/login` | No | Log in, returns token |
| POST | `/api/auth/forgot-password` | No | Sends a reset code to the email |
| POST | `/api/auth/reset-password` | No | Resets password using that code |
| GET | `/api/auth/me` | Yes | Returns your own profile |
| PUT | `/api/auth/me` | Yes | Updates your name/phone/WhatsApp number |

"Auth required" means:
```
Authorization: Bearer <the token from login or register>
```

### About password reset emails

Until SMTP details are in `.env`, reset codes print to the terminal instead of
sending real emails. Fill in `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` when you have
a mail provider (Gmail, SendGrid, etc.) — no code changes needed.

---

## Next step (Step 4)

Once you've confirmed everything above works on your machine, tell me and we'll
build **Step 4**: in-platform messaging (buyer contacts seller), the report
listing feature, and the locations API endpoint (so the frontend can populate
district/sector dropdowns from the backend instead of hardcoding them).
