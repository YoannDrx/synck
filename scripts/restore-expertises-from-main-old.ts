import { PrismaClient } from "@prisma/client";

// Source database (main-old)
const sourceDbUrl = process.env.SOURCE_DATABASE_URL;
if (!sourceDbUrl) {
  console.error("❌ SOURCE_DATABASE_URL environment variable is required");
  console.log(
    "\nUsage: SOURCE_DATABASE_URL='postgresql://...' npx tsx scripts/restore-expertises-from-main-old.ts",
  );
  process.exit(1);
}

const sourcePrisma = new PrismaClient({
  datasources: { db: { url: sourceDbUrl } },
});

// Target database (current)
const targetPrisma = new PrismaClient();

async function main() {
  console.log("🔄 Restoration des expertises depuis main-old...\n");

  try {
    // Fetch all expertises from source
    const expertises = await sourcePrisma.expertise.findMany({
      include: {
        translations: true,
        images: true,
        coverImage: true,
      },
    });

    console.log(`✅ Trouvé ${expertises.length} expertises sur main-old\n`);

    if (expertises.length === 0) {
      console.log("⚠️  Aucune expertise trouvée sur main-old");
      return;
    }

    // Copy each expertise
    for (const expertise of expertises) {
      console.log(`📝 Copie de: ${expertise.slug}`);

      // First, create/update cover image if exists
      let coverImageId: string | undefined;
      if (expertise.coverImage) {
        const coverImage = await targetPrisma.asset.upsert({
          where: { path: expertise.coverImage.path },
          update: {},
          create: {
            path: expertise.coverImage.path,
            alt: expertise.coverImage.alt,
            blurDataUrl: expertise.coverImage.blurDataUrl,
            width: expertise.coverImage.width,
            height: expertise.coverImage.height,
            aspectRatio: expertise.coverImage.aspectRatio,
          },
        });
        coverImageId = coverImage.id;
      }

      // Create/update expertise
      const newExpertise = await targetPrisma.expertise.upsert({
        where: { slug: expertise.slug },
        update: {
          order: expertise.order,
          isActive: expertise.isActive,
          coverImageId,
        },
        create: {
          slug: expertise.slug,
          order: expertise.order,
          isActive: expertise.isActive,
          coverImageId,
        },
      });

      // Create translations
      for (const translation of expertise.translations) {
        await targetPrisma.expertiseTranslation.upsert({
          where: {
            expertiseId_locale: {
              expertiseId: newExpertise.id,
              locale: translation.locale,
            },
          },
          update: {
            title: translation.title,
            subtitle: translation.subtitle,
            description: translation.description,
            content: translation.content,
          },
          create: {
            expertiseId: newExpertise.id,
            locale: translation.locale,
            title: translation.title,
            subtitle: translation.subtitle,
            description: translation.description,
            content: translation.content,
          },
        });
      }

      // Create gallery images
      for (const image of expertise.images) {
        // First create/update the asset
        const asset = await targetPrisma.asset.upsert({
          where: { path: image.path },
          update: {},
          create: {
            path: image.path,
            alt: image.alt,
            blurDataUrl: image.blurDataUrl,
            width: image.width,
            height: image.height,
            aspectRatio: image.aspectRatio,
          },
        });

        // Then connect it to the expertise (if not already connected)
        const existing = await targetPrisma.expertise.findFirst({
          where: {
            id: newExpertise.id,
            images: {
              some: { id: asset.id },
            },
          },
        });

        if (!existing) {
          await targetPrisma.expertise.update({
            where: { id: newExpertise.id },
            data: {
              images: {
                connect: { id: asset.id },
              },
            },
          });
        }
      }

      console.log(
        `   ✅ ${expertise.translations[0]?.title || expertise.slug} (${expertise.translations.length} traductions, ${expertise.images.length} images)`,
      );
    }

    console.log(`\n🎉 ${expertises.length} expertises restaurées avec succès!`);
  } catch (error) {
    console.error("❌ Erreur:", error);
    throw error;
  } finally {
    await sourcePrisma.$disconnect();
    await targetPrisma.$disconnect();
  }
}

main();
