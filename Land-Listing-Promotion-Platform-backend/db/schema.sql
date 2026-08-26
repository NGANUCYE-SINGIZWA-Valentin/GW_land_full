-- ============================================================
-- GW LAND & CONSTRUCTION — DATABASE SCHEMA
-- PostgreSQL 18.4
-- ============================================================
-- Run this once against an empty database, e.g.:
--   psql -U postgres -d gw_land_db -f schema.sql
-- ============================================================

-- ------------------------------------------------------------
-- ENUM TYPES
-- (Using enums instead of plain text keeps invalid values out
--  of the database at the lowest possible level.)
-- ------------------------------------------------------------
CREATE TYPE user_role          AS ENUM ('admin', 'sub_admin', 'seller', 'buyer');
CREATE TYPE user_status        AS ENUM ('pending', 'approved', 'blocked');
CREATE TYPE listing_status     AS ENUM ('pending', 'approved', 'rejected', 'sold');
CREATE TYPE size_unit          AS ENUM ('sqm', 'hectare');
CREATE TYPE tenure_type        AS ENUM ('freehold', 'leasehold', 'customary');
CREATE TYPE land_use_type      AS ENUM ('residential', 'commercial', 'agricultural', 'mixed');
CREATE TYPE report_status      AS ENUM ('pending', 'reviewed', 'dismissed');
CREATE TYPE report_reason      AS ENUM ('fraudulent', 'incorrect_info', 'already_sold', 'inappropriate', 'duplicate', 'other');
CREATE TYPE payment_currency   AS ENUM ('RWF', 'USD');
CREATE TYPE payment_type       AS ENUM ('listing_fee', 'featured_placement', 'subscription');
CREATE TYPE payment_provider   AS ENUM ('momo', 'card', 'bank_transfer');
CREATE TYPE payment_status     AS ENUM ('pending', 'completed', 'failed');
CREATE TYPE subscription_status AS ENUM ('active', 'expired', 'cancelled');

-- ------------------------------------------------------------
-- LOCATIONS — Rwanda Provinces, Districts & Sectors
-- Used for the location filter (PRD 4.2) and for listing forms (PRD 5.2)
-- ------------------------------------------------------------
CREATE TABLE provinces (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE districts (
    id          SERIAL PRIMARY KEY,
    province_id INTEGER NOT NULL REFERENCES provinces(id) ON DELETE CASCADE,
    name        VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE sectors (
    id          SERIAL PRIMARY KEY,
    district_id INTEGER NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
    name        VARCHAR(100) NOT NULL,
    UNIQUE (district_id, name)
);

-- ------------------------------------------------------------
-- USERS — Admin, Sub-Admin, Seller/Agent, Buyer (PRD section 3)
-- ------------------------------------------------------------
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role            user_role NOT NULL DEFAULT 'buyer',
    full_name       VARCHAR(150) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    phone           VARCHAR(20),
    whatsapp_number VARCHAR(20),
    photo_url       TEXT,
    is_verified     BOOLEAN NOT NULL DEFAULT FALSE,   -- "verified badge" (PRD 6.2 / 9)
    status          user_status NOT NULL DEFAULT 'approved',
    google_id       VARCHAR(255) UNIQUE,               -- set when the account signed up/linked via "Continue with Google"
    facebook_id     VARCHAR(255) UNIQUE,                -- set when the account signed up/linked via "Continue with Facebook"
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_role   ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- Password reset (PRD 5.1 #28)
CREATE TABLE password_reset_tokens (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token      VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- LISTINGS (PRD sections 4.3, 5.2, 6.3)
-- ------------------------------------------------------------
CREATE TABLE listings (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title            VARCHAR(200) NOT NULL,
    slug             VARCHAR(220) NOT NULL UNIQUE,     -- clean SEO URL e.g. kigali-gasabo-500sqm
    description      TEXT NOT NULL,
    district_id      INTEGER NOT NULL REFERENCES districts(id),
    sector_id        INTEGER NOT NULL REFERENCES sectors(id),
    latitude         NUMERIC(10,6),
    longitude        NUMERIC(10,6),
    price_rwf        NUMERIC(14,2),
    price_usd        NUMERIC(14,2),
    size_value       NUMERIC(12,2) NOT NULL,
    size_unit        size_unit NOT NULL DEFAULT 'sqm',
    upi              VARCHAR(50),               -- Unique Parcel Identifier (Rwanda LAIS registry number), seller-entered
    upi_verified     BOOLEAN NOT NULL DEFAULT FALSE, -- set by admin after manually checking the UPI, not automated
    tenure_type      tenure_type,
    land_use         land_use_type,
    has_road_access  BOOLEAN NOT NULL DEFAULT FALSE,
    has_water        BOOLEAN NOT NULL DEFAULT FALSE,
    has_electricity  BOOLEAN NOT NULL DEFAULT FALSE,
    status           listing_status NOT NULL DEFAULT 'pending',
    rejection_reason TEXT,
    is_featured      BOOLEAN NOT NULL DEFAULT FALSE,
    is_premium       BOOLEAN NOT NULL DEFAULT FALSE,
    view_count       INTEGER NOT NULL DEFAULT 0,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_price_present CHECK (price_rwf IS NOT NULL OR price_usd IS NOT NULL)
);

CREATE INDEX idx_listings_status    ON listings(status);
CREATE INDEX idx_listings_district  ON listings(district_id);
CREATE INDEX idx_listings_sector    ON listings(sector_id);
CREATE INDEX idx_listings_seller    ON listings(seller_id);
CREATE INDEX idx_listings_featured  ON listings(is_featured);
CREATE INDEX idx_listings_price_rwf ON listings(price_rwf);

CREATE TABLE listing_images (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id    UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    image_url     TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_listing_images_listing ON listing_images(listing_id);

-- Optional land ownership proof (PRD 5.2 #6, 8 #56)
CREATE TABLE listing_documents (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id    UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    document_url  TEXT NOT NULL,
    document_label VARCHAR(150),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- IN-PLATFORM MESSAGING (PRD section 7, 5.3)
-- ------------------------------------------------------------
CREATE TABLE messages (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id  UUID REFERENCES listings(id) ON DELETE SET NULL,
    sender_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body        TEXT NOT NULL,
    is_read     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_receiver ON messages(receiver_id, is_read);
CREATE INDEX idx_messages_listing  ON messages(listing_id);

-- ------------------------------------------------------------
-- REPORT LISTING (PRD section 9 #59) — open to visitors, account optional
-- ------------------------------------------------------------
CREATE TABLE reports (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id      UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    reporter_id     UUID REFERENCES users(id) ON DELETE SET NULL,
    reporter_email  VARCHAR(150),
    reason_category report_reason NOT NULL DEFAULT 'other',
    reason          TEXT,                      -- optional free-text detail alongside the category
    status          report_status NOT NULL DEFAULT 'pending',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- FAVORITES — buyers can shortlist listings to revisit later
-- ------------------------------------------------------------
CREATE TABLE favorites (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, listing_id)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);

-- ------------------------------------------------------------
-- PAYMENTS — MTN MoMo (Phase 1), Cards (Phase 2) — PRD section 10
-- ------------------------------------------------------------
CREATE TABLE payments (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    listing_id              UUID REFERENCES listings(id) ON DELETE SET NULL,
    amount                  NUMERIC(14,2) NOT NULL,
    currency                payment_currency NOT NULL DEFAULT 'RWF',
    payment_type            payment_type NOT NULL,
    provider                payment_provider NOT NULL DEFAULT 'momo',
    provider_transaction_id VARCHAR(150),
    reference_note          TEXT,        -- MoMo/bank reference the payer entered, for manual reconciliation
    confirmed_by            UUID REFERENCES users(id) ON DELETE SET NULL, -- admin who marked it paid
    plan_key                VARCHAR(50), -- which pricing_plans row this was for, if any
    status                  payment_status NOT NULL DEFAULT 'pending',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_user   ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);

-- ------------------------------------------------------------
-- PRICING PLANS — admin-configurable amounts for the payment types above.
-- No live payment gateway is wired up; every payment lands as 'pending'
-- and is confirmed manually by an admin (PRD 10 Payments/Promotions).
-- ------------------------------------------------------------
CREATE TABLE pricing_plans (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_key      VARCHAR(50) NOT NULL UNIQUE,
    label         VARCHAR(150) NOT NULL,
    description   TEXT,
    amount_rwf    NUMERIC(14,2) NOT NULL,
    amount_usd    NUMERIC(14,2),
    billing_cycle VARCHAR(20),
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- AGENT SUBSCRIPTIONS (PRD 10.1 #64)
-- ------------------------------------------------------------
CREATE TABLE subscriptions (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_name     VARCHAR(100) NOT NULL,
    price         NUMERIC(14,2) NOT NULL,
    currency      payment_currency NOT NULL DEFAULT 'RWF',
    billing_cycle VARCHAR(20) NOT NULL DEFAULT 'monthly',
    start_date    DATE NOT NULL,
    end_date      DATE NOT NULL,
    status        subscription_status NOT NULL DEFAULT 'active',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);

-- ------------------------------------------------------------
-- ADMIN NOTIFICATIONS (PRD section 7 #52)
-- ------------------------------------------------------------
CREATE TABLE notifications (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- usually an admin
    type       VARCHAR(50) NOT NULL,        -- e.g. 'new_user', 'new_listing', 'new_report'
    message    TEXT NOT NULL,
    related_id UUID,                        -- id of the listing/user the notification is about
    is_read    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

-- ------------------------------------------------------------
-- ACTIVITY LOG — per-user activity timeline (admin "view user activity")
-- and a lightweight system/audit trail. user_id is nullable so a deleted
-- user's history doesn't force-delete the log entries.
-- ------------------------------------------------------------
CREATE TABLE activity_log (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID REFERENCES users(id) ON DELETE SET NULL,
    action     VARCHAR(50) NOT NULL,
    detail     TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_activity_log_user ON activity_log(user_id);
CREATE INDEX idx_activity_log_created ON activity_log(created_at);

-- ------------------------------------------------------------
-- NEWSLETTER SIGNUPS (homepage / footer subscribe form)
-- ------------------------------------------------------------
CREATE TABLE newsletter_subscribers (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email      VARCHAR(150) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- AUTO-UPDATE "updated_at" ON EVERY ROW CHANGE
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_listings_updated_at
    BEFORE UPDATE ON listings
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- LOCATION DATA (provinces/districts/sectors) is seeded separately —
-- see db/seed_locations.sql, which contains the full national list.
-- Run that file right after this one.
-- ------------------------------------------------------------
