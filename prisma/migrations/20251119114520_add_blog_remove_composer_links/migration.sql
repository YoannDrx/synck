/*
  Warnings:

  - You are about to drop the `BlogPost` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BlogPostTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BlogPostTranslation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_BlogPostImages` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BlogPost" DROP CONSTRAINT "BlogPost_coverImageId_fkey";

-- DropForeignKey
ALTER TABLE "BlogPostTag" DROP CONSTRAINT "BlogPostTag_blogPostId_fkey";

-- DropForeignKey
ALTER TABLE "BlogPostTranslation" DROP CONSTRAINT "BlogPostTranslation_blogPostId_fkey";

-- DropForeignKey
ALTER TABLE "_BlogPostImages" DROP CONSTRAINT "_BlogPostImages_A_fkey";

-- DropForeignKey
ALTER TABLE "_BlogPostImages" DROP CONSTRAINT "_BlogPostImages_B_fkey";

-- AlterTable
ALTER TABLE "Work" ADD COLUMN     "externalUrl" TEXT;

-- DropTable
DROP TABLE "BlogPost";

-- DropTable
DROP TABLE "BlogPostTag";

-- DropTable
DROP TABLE "BlogPostTranslation";

-- DropTable
DROP TABLE "_BlogPostImages";

-- CreateTable
CREATE TABLE "ComposerLink" (
    "id" TEXT NOT NULL,
    "composerId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "label" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComposerLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ComposerLink_composerId_idx" ON "ComposerLink"("composerId");

-- CreateIndex
CREATE INDEX "ComposerLink_platform_idx" ON "ComposerLink"("platform");

-- CreateIndex
CREATE UNIQUE INDEX "ComposerLink_composerId_url_key" ON "ComposerLink"("composerId", "url");

-- AddForeignKey
ALTER TABLE "ComposerLink" ADD CONSTRAINT "ComposerLink_composerId_fkey" FOREIGN KEY ("composerId") REFERENCES "Composer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
