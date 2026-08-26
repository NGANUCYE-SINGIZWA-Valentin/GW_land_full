-- Migration 004: real payment method selection + admin-configurable pricing.
-- Actual gateway charging (MTN MoMo API, card processor) is explicitly out of
-- scope — every payment created here lands as 'pending' and is confirmed
-- manually by an admin once the seller has actually paid (matches how most
-- Rwandan platforms operate before they wire up a live MoMo API).

ALTER TABLE payments ADD COLUMN IF NOT EXISTS reference_note TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS confirmed_by UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS plan_key VARCHAR(50);

CREATE TABLE IF NOT EXISTS pricing_plans (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_key      VARCHAR(50) NOT NULL UNIQUE,   -- 'listing_fee' | 'featured_placement' | 'subscription_monthly'
    label         VARCHAR(150) NOT NULL,
    description   TEXT,
    amount_rwf    NUMERIC(14,2) NOT NULL,
    amount_usd    NUMERIC(14,2),
    billing_cycle VARCHAR(20),                   -- 'one_time' | 'monthly', null for one-time
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
