-- AlterTable: Rename and restructure Account table for Better Auth compatibility

-- Step 1: Add new columns with temporary default values
ALTER TABLE "Account" ADD COLUMN "accountId" TEXT;
ALTER TABLE "Account" ADD COLUMN "providerId" TEXT;

-- Step 2: Copy data from old columns to new columns
UPDATE "Account" SET "accountId" = COALESCE("providerAccountId", "userId");
UPDATE "Account" SET "providerId" = "provider";

-- Step 3: Make new columns required (NOT NULL)
ALTER TABLE "Account" ALTER COLUMN "accountId" SET NOT NULL;
ALTER TABLE "Account" ALTER COLUMN "providerId" SET NOT NULL;

-- Step 4: Drop old unique constraint
ALTER TABLE "Account" DROP CONSTRAINT IF EXISTS "Account_provider_providerAccountId_key";

-- Step 5: Drop old columns
ALTER TABLE "Account" DROP COLUMN IF EXISTS "type";
ALTER TABLE "Account" DROP COLUMN IF EXISTS "provider";
ALTER TABLE "Account" DROP COLUMN IF EXISTS "providerAccountId";
ALTER TABLE "Account" DROP COLUMN IF EXISTS "tokenType";
ALTER TABLE "Account" DROP COLUMN IF EXISTS "scope";
ALTER TABLE "Account" DROP COLUMN IF EXISTS "sessionState";

-- Step 6: Create new unique constraint
CREATE UNIQUE INDEX "Account_providerId_accountId_key" ON "Account"("providerId", "accountId");
