-- AlterTable
ALTER TABLE "Composer" ADD COLUMN     "externalUrl" TEXT;

-- AlterTable
ALTER TABLE "Work" ADD COLUMN     "genre" TEXT,
ADD COLUMN     "isrcCode" TEXT,
ADD COLUMN     "releaseDate" TEXT,
ADD COLUMN     "spotifyUrl" TEXT;
