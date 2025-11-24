-- Idempotent to avoid failure if column already exists (e.g., manual hotfix)
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "providerUserId" TEXT;
