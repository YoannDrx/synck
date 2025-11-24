-- AlterEnum
ALTER TYPE "ExportType" ADD VALUE 'EXPERTISES';

-- CreateTable
CREATE TABLE "cv" (
    "id" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "photoAssetId" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "location" TEXT,
    "linkedInUrl" TEXT,
    "headlineFr" TEXT,
    "headlineEn" TEXT,
    "bioFr" TEXT,
    "bioEn" TEXT,
    "layout" TEXT NOT NULL DEFAULT 'creative',
    "accentColor" TEXT NOT NULL DEFAULT '#D5FF0A',
    "showPhoto" BOOLEAN NOT NULL DEFAULT true,
    "theme" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cv_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cv_section" (
    "id" TEXT NOT NULL,
    "cvId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "icon" TEXT,
    "color" TEXT,
    "placement" TEXT NOT NULL DEFAULT 'main',
    "layoutType" TEXT NOT NULL DEFAULT 'list',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "cv_section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cv_section_translation" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "cv_section_translation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cv_item" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "cv_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cv_item_translation" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "location" TEXT,
    "description" TEXT,

    CONSTRAINT "cv_item_translation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cv_skill" (
    "id" TEXT NOT NULL,
    "cvId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 3,
    "showAsBar" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "cv_skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cv_skill_translation" (
    "id" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "cv_skill_translation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cv_social_link" (
    "id" TEXT NOT NULL,
    "cvId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "label" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "cv_social_link_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cv_section_cvId_idx" ON "cv_section"("cvId");

-- CreateIndex
CREATE INDEX "cv_section_order_idx" ON "cv_section"("order");

-- CreateIndex
CREATE INDEX "cv_section_translation_locale_idx" ON "cv_section_translation"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "cv_section_translation_sectionId_locale_key" ON "cv_section_translation"("sectionId", "locale");

-- CreateIndex
CREATE INDEX "cv_item_sectionId_idx" ON "cv_item"("sectionId");

-- CreateIndex
CREATE INDEX "cv_item_order_idx" ON "cv_item"("order");

-- CreateIndex
CREATE INDEX "cv_item_translation_locale_idx" ON "cv_item_translation"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "cv_item_translation_itemId_locale_key" ON "cv_item_translation"("itemId", "locale");

-- CreateIndex
CREATE INDEX "cv_skill_cvId_idx" ON "cv_skill"("cvId");

-- CreateIndex
CREATE INDEX "cv_skill_category_idx" ON "cv_skill"("category");

-- CreateIndex
CREATE INDEX "cv_skill_translation_locale_idx" ON "cv_skill_translation"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "cv_skill_translation_skillId_locale_key" ON "cv_skill_translation"("skillId", "locale");

-- CreateIndex
CREATE INDEX "cv_social_link_cvId_idx" ON "cv_social_link"("cvId");

-- AddForeignKey
ALTER TABLE "cv" ADD CONSTRAINT "cv_photoAssetId_fkey" FOREIGN KEY ("photoAssetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cv_section" ADD CONSTRAINT "cv_section_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "cv"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cv_section_translation" ADD CONSTRAINT "cv_section_translation_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "cv_section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cv_item" ADD CONSTRAINT "cv_item_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "cv_section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cv_item_translation" ADD CONSTRAINT "cv_item_translation_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "cv_item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cv_skill" ADD CONSTRAINT "cv_skill_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "cv"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cv_skill_translation" ADD CONSTRAINT "cv_skill_translation_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "cv_skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cv_social_link" ADD CONSTRAINT "cv_social_link_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "cv"("id") ON DELETE CASCADE ON UPDATE CASCADE;
