-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "alt" TEXT,
    "blurDataUrl" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "aspectRatio" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "color" TEXT,
    "icon" TEXT,
    "coverImageId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryTranslation" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "CategoryTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Composer" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "imageId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Composer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComposerTranslation" (
    "id" TEXT NOT NULL,
    "composerId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bio" TEXT,

    CONSTRAINT "ComposerTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Label" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "imageId" TEXT,
    "website" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Label_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabelTranslation" (
    "id" TEXT NOT NULL,
    "labelId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "LabelTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Work" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "labelId" TEXT,
    "coverImageId" TEXT,
    "year" INTEGER,
    "duration" INTEGER,
    "status" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Work_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkTranslation" (
    "id" TEXT NOT NULL,
    "workId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "role" TEXT,

    CONSTRAINT "WorkTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contribution" (
    "id" TEXT NOT NULL,
    "workId" TEXT NOT NULL,
    "composerId" TEXT NOT NULL,
    "role" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Contribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "coverImageId" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPostTranslation" (
    "id" TEXT NOT NULL,
    "blogPostId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,

    CONSTRAINT "BlogPostTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPostTag" (
    "id" TEXT NOT NULL,
    "blogPostId" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "locale" TEXT NOT NULL,

    CONSTRAINT "BlogPostTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expertise" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "coverImageId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expertise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpertiseTranslation" (
    "id" TEXT NOT NULL,
    "expertiseId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "content" TEXT NOT NULL,

    CONSTRAINT "ExpertiseTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_WorkImages" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_WorkImages_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_BlogPostImages" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BlogPostImages_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ExpertiseImages" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ExpertiseImages_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Asset_path_key" ON "Asset"("path");

-- CreateIndex
CREATE INDEX "Asset_path_idx" ON "Asset"("path");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_slug_idx" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_isActive_order_idx" ON "Category"("isActive", "order");

-- CreateIndex
CREATE INDEX "CategoryTranslation_locale_idx" ON "CategoryTranslation"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryTranslation_categoryId_locale_key" ON "CategoryTranslation"("categoryId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "Composer_slug_key" ON "Composer"("slug");

-- CreateIndex
CREATE INDEX "Composer_slug_idx" ON "Composer"("slug");

-- CreateIndex
CREATE INDEX "Composer_isActive_order_idx" ON "Composer"("isActive", "order");

-- CreateIndex
CREATE INDEX "ComposerTranslation_locale_idx" ON "ComposerTranslation"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "ComposerTranslation_composerId_locale_key" ON "ComposerTranslation"("composerId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "Label_slug_key" ON "Label"("slug");

-- CreateIndex
CREATE INDEX "Label_slug_idx" ON "Label"("slug");

-- CreateIndex
CREATE INDEX "Label_isActive_order_idx" ON "Label"("isActive", "order");

-- CreateIndex
CREATE INDEX "LabelTranslation_locale_idx" ON "LabelTranslation"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "LabelTranslation_labelId_locale_key" ON "LabelTranslation"("labelId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "Work_slug_key" ON "Work"("slug");

-- CreateIndex
CREATE INDEX "Work_slug_idx" ON "Work"("slug");

-- CreateIndex
CREATE INDEX "Work_categoryId_isActive_order_idx" ON "Work"("categoryId", "isActive", "order");

-- CreateIndex
CREATE INDEX "Work_isFeatured_isActive_idx" ON "Work"("isFeatured", "isActive");

-- CreateIndex
CREATE INDEX "WorkTranslation_locale_idx" ON "WorkTranslation"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "WorkTranslation_workId_locale_key" ON "WorkTranslation"("workId", "locale");

-- CreateIndex
CREATE INDEX "Contribution_workId_idx" ON "Contribution"("workId");

-- CreateIndex
CREATE INDEX "Contribution_composerId_idx" ON "Contribution"("composerId");

-- CreateIndex
CREATE UNIQUE INDEX "Contribution_workId_composerId_key" ON "Contribution"("workId", "composerId");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");

-- CreateIndex
CREATE INDEX "BlogPost_slug_idx" ON "BlogPost"("slug");

-- CreateIndex
CREATE INDEX "BlogPost_isPublished_publishedAt_idx" ON "BlogPost"("isPublished", "publishedAt");

-- CreateIndex
CREATE INDEX "BlogPostTranslation_locale_idx" ON "BlogPostTranslation"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPostTranslation_blogPostId_locale_key" ON "BlogPostTranslation"("blogPostId", "locale");

-- CreateIndex
CREATE INDEX "BlogPostTag_tag_locale_idx" ON "BlogPostTag"("tag", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPostTag_blogPostId_tag_locale_key" ON "BlogPostTag"("blogPostId", "tag", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "Expertise_slug_key" ON "Expertise"("slug");

-- CreateIndex
CREATE INDEX "Expertise_slug_idx" ON "Expertise"("slug");

-- CreateIndex
CREATE INDEX "Expertise_isActive_order_idx" ON "Expertise"("isActive", "order");

-- CreateIndex
CREATE INDEX "ExpertiseTranslation_locale_idx" ON "ExpertiseTranslation"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "ExpertiseTranslation_expertiseId_locale_key" ON "ExpertiseTranslation"("expertiseId", "locale");

-- CreateIndex
CREATE INDEX "_WorkImages_B_index" ON "_WorkImages"("B");

-- CreateIndex
CREATE INDEX "_BlogPostImages_B_index" ON "_BlogPostImages"("B");

-- CreateIndex
CREATE INDEX "_ExpertiseImages_B_index" ON "_ExpertiseImages"("B");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_coverImageId_fkey" FOREIGN KEY ("coverImageId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryTranslation" ADD CONSTRAINT "CategoryTranslation_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Composer" ADD CONSTRAINT "Composer_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComposerTranslation" ADD CONSTRAINT "ComposerTranslation_composerId_fkey" FOREIGN KEY ("composerId") REFERENCES "Composer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Label" ADD CONSTRAINT "Label_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabelTranslation" ADD CONSTRAINT "LabelTranslation_labelId_fkey" FOREIGN KEY ("labelId") REFERENCES "Label"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Work" ADD CONSTRAINT "Work_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Work" ADD CONSTRAINT "Work_labelId_fkey" FOREIGN KEY ("labelId") REFERENCES "Label"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Work" ADD CONSTRAINT "Work_coverImageId_fkey" FOREIGN KEY ("coverImageId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkTranslation" ADD CONSTRAINT "WorkTranslation_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_composerId_fkey" FOREIGN KEY ("composerId") REFERENCES "Composer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_coverImageId_fkey" FOREIGN KEY ("coverImageId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPostTranslation" ADD CONSTRAINT "BlogPostTranslation_blogPostId_fkey" FOREIGN KEY ("blogPostId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPostTag" ADD CONSTRAINT "BlogPostTag_blogPostId_fkey" FOREIGN KEY ("blogPostId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expertise" ADD CONSTRAINT "Expertise_coverImageId_fkey" FOREIGN KEY ("coverImageId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpertiseTranslation" ADD CONSTRAINT "ExpertiseTranslation_expertiseId_fkey" FOREIGN KEY ("expertiseId") REFERENCES "Expertise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_WorkImages" ADD CONSTRAINT "_WorkImages_A_fkey" FOREIGN KEY ("A") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_WorkImages" ADD CONSTRAINT "_WorkImages_B_fkey" FOREIGN KEY ("B") REFERENCES "Work"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BlogPostImages" ADD CONSTRAINT "_BlogPostImages_A_fkey" FOREIGN KEY ("A") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BlogPostImages" ADD CONSTRAINT "_BlogPostImages_B_fkey" FOREIGN KEY ("B") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExpertiseImages" ADD CONSTRAINT "_ExpertiseImages_A_fkey" FOREIGN KEY ("A") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExpertiseImages" ADD CONSTRAINT "_ExpertiseImages_B_fkey" FOREIGN KEY ("B") REFERENCES "Expertise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
