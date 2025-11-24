import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Fixing DB tables...");

  try {
    // CV Table updates
    const cvCols = [
        'ADD COLUMN IF NOT EXISTS "phone" TEXT',
        'ADD COLUMN IF NOT EXISTS "email" TEXT',
        'ADD COLUMN IF NOT EXISTS "website" TEXT',
        'ADD COLUMN IF NOT EXISTS "location" TEXT',
        'ADD COLUMN IF NOT EXISTS "linkedInUrl" TEXT',
        'ADD COLUMN IF NOT EXISTS "headlineFr" TEXT',
        'ADD COLUMN IF NOT EXISTS "headlineEn" TEXT',
        'ADD COLUMN IF NOT EXISTS "bioFr" TEXT',
        'ADD COLUMN IF NOT EXISTS "bioEn" TEXT',
        'ADD COLUMN IF NOT EXISTS "layout" TEXT DEFAULT \'creative\'',
        'ADD COLUMN IF NOT EXISTS "accentColor" TEXT DEFAULT \'#D5FF0A\'',
        'ADD COLUMN IF NOT EXISTS "showPhoto" BOOLEAN DEFAULT true',
        'ADD COLUMN IF NOT EXISTS "photoAssetId" TEXT'
    ];
    for (const col of cvCols) {
        await prisma.$executeRawUnsafe(`ALTER TABLE "cv" ${col};`);
    }
    
    // CV Section updates
    const sectionCols = [
        'ADD COLUMN IF NOT EXISTS "placement" TEXT DEFAULT \'main\'',
        'ADD COLUMN IF NOT EXISTS "layoutType" TEXT DEFAULT \'list\'',
        'ADD COLUMN IF NOT EXISTS "color" TEXT',
        'ADD COLUMN IF NOT EXISTS "icon" TEXT'
    ];
    for (const col of sectionCols) {
        await prisma.$executeRawUnsafe(`ALTER TABLE "cv_section" ${col};`);
    }

    // Social Links (create if missing)
    await prisma.$executeRawUnsafe(
      "\n      CREATE TABLE IF NOT EXISTS \"cv_social_link\" (\n        \"id\" TEXT NOT NULL,\n        \"cvId\" TEXT NOT NULL,\n        \"platform\" TEXT NOT NULL,\n        \"url\" TEXT NOT NULL,\n        \"label\" TEXT,\n        \"order\" INTEGER NOT NULL DEFAULT 0,\n        CONSTRAINT \"cv_social_link_pkey\" PRIMARY KEY (\"id\")\n      );\n    ");
    await prisma.$executeRawUnsafe("CREATE INDEX IF NOT EXISTS \"cv_social_link_cvId_idx\" ON \"cv_social_link\"(\"cvId\");");
    try {
        await prisma.$executeRawUnsafe(
          "ALTER TABLE \"cv_social_link\" ADD CONSTRAINT \"cv_social_link_cvId_fkey\" FOREIGN KEY (\"cvId\") REFERENCES \"cv\"(\"id\") ON DELETE CASCADE ON UPDATE CASCADE;"
        );
    } catch (e) {}

    // Skills (create if missing)
    await prisma.$executeRawUnsafe(
      "\n      CREATE TABLE IF NOT EXISTS \"cv_skill\" (\n        \"id\" TEXT NOT NULL,\n        \"cvId\" TEXT NOT NULL,\n        \"category\" TEXT NOT NULL,\n        \"level\" INTEGER NOT NULL DEFAULT 3,\n        \"showAsBar\" BOOLEAN NOT NULL DEFAULT true,\n        \"order\" INTEGER NOT NULL DEFAULT 0,\n        \"isActive\" BOOLEAN NOT NULL DEFAULT true,\n        CONSTRAINT \"cv_skill_pkey\" PRIMARY KEY (\"id\")\n      );\n    ");
    await prisma.$executeRawUnsafe("CREATE INDEX IF NOT EXISTS \"cv_skill_cvId_idx\" ON \"cv_skill\"(\"cvId\");");
    await prisma.$executeRawUnsafe("CREATE INDEX IF NOT EXISTS \"cv_skill_category_idx\" ON \"cv_skill\"(\"category\");");
    try {
        await prisma.$executeRawUnsafe(
          "ALTER TABLE \"cv_skill\" ADD CONSTRAINT \"cv_skill_cvId_fkey\" FOREIGN KEY (\"cvId\") REFERENCES \"cv\"(\"id\") ON DELETE CASCADE ON UPDATE CASCADE;"
        );
    } catch (e) {}

    // Skill Translations (create if missing)
    await prisma.$executeRawUnsafe(
      "\n      CREATE TABLE IF NOT EXISTS \"cv_skill_translation\" (\n        \"id\" TEXT NOT NULL,\n        \"skillId\" TEXT NOT NULL,\n        \"locale\" TEXT NOT NULL,\n        \"name\" TEXT NOT NULL,\n        CONSTRAINT \"cv_skill_translation_pkey\" PRIMARY KEY (\"id\")\n      );\n    ");
    await prisma.$executeRawUnsafe("CREATE UNIQUE INDEX IF NOT EXISTS \"cv_skill_translation_skillId_locale_key\" ON \"cv_skill_translation\"(\"skillId\", \"locale\");");
    await prisma.$executeRawUnsafe("CREATE INDEX IF NOT EXISTS \"cv_skill_translation_locale_idx\" ON \"cv_skill_translation\"(\"locale\");");
    try {
        await prisma.$executeRawUnsafe(
          "ALTER TABLE \"cv_skill_translation\" ADD CONSTRAINT \"cv_skill_translation_skillId_fkey\" FOREIGN KEY (\"skillId\") REFERENCES \"cv_skill\"(\"id\") ON DELETE CASCADE ON UPDATE CASCADE;"
        );
    } catch (e) {}

    console.log("DB Schema fixed successfully.");

  } catch (e) {
    console.error("Error fixing DB:", e);
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });