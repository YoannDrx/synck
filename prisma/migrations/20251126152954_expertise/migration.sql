-- AlterTable
ALTER TABLE "Artist" RENAME CONSTRAINT "Composer_pkey" TO "Artist_pkey";

-- AlterTable
ALTER TABLE "ArtistLink" RENAME CONSTRAINT "ComposerLink_pkey" TO "ArtistLink_pkey";

-- AlterTable
ALTER TABLE "ArtistTranslation" RENAME CONSTRAINT "ComposerTranslation_pkey" TO "ArtistTranslation_pkey";
