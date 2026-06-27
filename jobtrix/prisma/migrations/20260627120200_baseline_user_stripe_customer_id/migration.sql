-- Baseline-Migration: gleicht Migrations-History an Produktion an (zuvor via `db push` eingespielt).
-- Idempotent, siehe 20260627120100_baseline_subscription_fields.

-- AlterTable: Stripe-Customer-ID auf User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "stripeCustomerId" TEXT;

-- CreateIndex: Unique auf stripeCustomerId
CREATE UNIQUE INDEX IF NOT EXISTS "User_stripeCustomerId_key" ON "User"("stripeCustomerId");
