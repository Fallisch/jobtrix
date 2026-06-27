-- Baseline-Migration: gleicht Migrations-History an Produktion an (zuvor via `db push` eingespielt).
-- Idempotent (IF NOT EXISTS), damit `migrate deploy` auf bestehenden DBs No-Op ist
-- und auf einer frischen DB die Strukturen korrekt anlegt.

-- AlterEnum: neue AccessPackage-Werte
ALTER TYPE "AccessPackage" ADD VALUE IF NOT EXISTS 'monthly';
ALTER TYPE "AccessPackage" ADD VALUE IF NOT EXISTS 'yearly';

-- AlterTable: Subscription-Felder auf Access
ALTER TABLE "Access" ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" TEXT;
ALTER TABLE "Access" ADD COLUMN IF NOT EXISTS "subscriptionStatus" TEXT;
