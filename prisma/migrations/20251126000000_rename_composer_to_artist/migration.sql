-- Rename Composer to Artist
-- This migration renames all Composer-related tables, columns, indexes, and foreign keys to Artist

-- ============================================
-- STEP 1: Drop Foreign Keys (must be done before renaming)
-- ============================================

ALTER TABLE "ComposerTranslation" DROP CONSTRAINT "ComposerTranslation_composerId_fkey";
ALTER TABLE "ComposerLink" DROP CONSTRAINT "ComposerLink_composerId_fkey";
ALTER TABLE "Contribution" DROP CONSTRAINT "Contribution_composerId_fkey";
ALTER TABLE "Composer" DROP CONSTRAINT "Composer_imageId_fkey";

-- ============================================
-- STEP 2: Drop Indexes (must be done before renaming tables)
-- ============================================

-- Composer indexes
DROP INDEX "Composer_slug_key";
DROP INDEX "Composer_slug_idx";
DROP INDEX "Composer_isActive_order_idx";

-- ComposerTranslation indexes
DROP INDEX "ComposerTranslation_locale_idx";
DROP INDEX "ComposerTranslation_composerId_locale_key";

-- ComposerLink indexes
DROP INDEX "ComposerLink_composerId_idx";
DROP INDEX "ComposerLink_platform_idx";
DROP INDEX "ComposerLink_composerId_url_key";

-- Contribution indexes (composerId related)
DROP INDEX "Contribution_composerId_idx";
-- Drop the unique index on Contribution BEFORE renaming the column
DROP INDEX "Contribution_workId_composerId_key";

-- ============================================
-- STEP 3: Rename Tables
-- ============================================

ALTER TABLE "Composer" RENAME TO "Artist";
ALTER TABLE "ComposerTranslation" RENAME TO "ArtistTranslation";
ALTER TABLE "ComposerLink" RENAME TO "ArtistLink";

-- ============================================
-- STEP 4: Rename Columns
-- ============================================

ALTER TABLE "ArtistTranslation" RENAME COLUMN "composerId" TO "artistId";
ALTER TABLE "ArtistLink" RENAME COLUMN "composerId" TO "artistId";
ALTER TABLE "Contribution" RENAME COLUMN "composerId" TO "artistId";

-- ============================================
-- STEP 5: Recreate Indexes with new names
-- ============================================

-- Artist indexes
CREATE UNIQUE INDEX "Artist_slug_key" ON "Artist"("slug");
CREATE INDEX "Artist_slug_idx" ON "Artist"("slug");
CREATE INDEX "Artist_isActive_order_idx" ON "Artist"("isActive", "order");

-- ArtistTranslation indexes
CREATE INDEX "ArtistTranslation_locale_idx" ON "ArtistTranslation"("locale");
CREATE UNIQUE INDEX "ArtistTranslation_artistId_locale_key" ON "ArtistTranslation"("artistId", "locale");

-- ArtistLink indexes
CREATE INDEX "ArtistLink_artistId_idx" ON "ArtistLink"("artistId");
CREATE INDEX "ArtistLink_platform_idx" ON "ArtistLink"("platform");
CREATE UNIQUE INDEX "ArtistLink_artistId_url_key" ON "ArtistLink"("artistId", "url");

-- Contribution indexes (artistId)
CREATE INDEX "Contribution_artistId_idx" ON "Contribution"("artistId");
-- Recreate the unique index with new column name
CREATE UNIQUE INDEX "Contribution_workId_artistId_key" ON "Contribution"("workId", "artistId");

-- ============================================
-- STEP 6: Recreate Foreign Keys with new names
-- ============================================

ALTER TABLE "Artist" ADD CONSTRAINT "Artist_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ArtistTranslation" ADD CONSTRAINT "ArtistTranslation_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ArtistLink" ADD CONSTRAINT "ArtistLink_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================
-- STEP 7: Update ExportType enum value
-- ============================================

-- Rename COMPOSERS to ARTISTS in ExportType enum
ALTER TYPE "ExportType" RENAME VALUE 'COMPOSERS' TO 'ARTISTS';
