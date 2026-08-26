-- Migration 002: land-specific listing fields, favorites, structured report reasons.
-- Safe to re-run: every statement is guarded.

DO $$ BEGIN
    CREATE TYPE tenure_type AS ENUM ('freehold', 'leasehold', 'customary');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE land_use_type AS ENUM ('residential', 'commercial', 'agricultural', 'mixed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE report_reason AS ENUM ('fraudulent', 'incorrect_info', 'already_sold', 'inappropriate', 'duplicate', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE listings ADD COLUMN IF NOT EXISTS upi VARCHAR(50);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS upi_verified BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS tenure_type tenure_type;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS land_use land_use_type;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS has_road_access BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS has_water BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS has_electricity BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE reports ADD COLUMN IF NOT EXISTS reason_category report_reason NOT NULL DEFAULT 'other';
ALTER TABLE reports ALTER COLUMN reason DROP NOT NULL;

CREATE TABLE IF NOT EXISTS favorites (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, listing_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
