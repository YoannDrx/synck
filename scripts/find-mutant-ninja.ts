import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Searching for Mutant Ninja...\n");

  // Search by name in translations
  const composersByName = await prisma.composer.findMany({
    where: {
      translations: {
        some: {
          OR: [
            { name: { contains: "Ninja", mode: "insensitive" } },
            { name: { contains: "Mutant", mode: "insensitive" } },
          ],
        },
      },
    },
    include: {
      translations: true,
      links: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (composersByName.length === 0) {
    console.log("⚠️  No composer found with 'Ninja' or 'Mutant' in name\n");

    // List all composers to help identify
    console.log("📋 All composers in database:\n");
    const allComposers = await prisma.composer.findMany({
      select: {
        slug: true,
        translations: {
          where: { locale: "fr" },
          select: { name: true },
        },
      },
      orderBy: { order: "asc" },
    });

    allComposers.forEach((c) => {
      const name = c.translations[0]?.name || c.slug;
      console.log(`  - ${name} (${c.slug})`);
    });
  } else {
    console.log(`✅ Found ${composersByName.length} composer(s):\n`);

    for (const composer of composersByName) {
      const nameFr = composer.translations.find((t) => t.locale === "fr")?.name;
      const nameEn = composer.translations.find((t) => t.locale === "en")?.name;

      console.log(`📌 ${nameFr} / ${nameEn} (slug: ${composer.slug})`);
      console.log(`   ID: ${composer.id}`);
      console.log(`   External URL: ${composer.externalUrl || "NULL"}`);
      console.log(`   Links count: ${composer.links.length}`);

      if (composer.links.length > 0) {
        composer.links.forEach((link) => {
          console.log(
            `      - ${link.platform}: ${link.url} ${link.label ? `(${link.label})` : ""}`,
          );
        });
      }
      console.log();
    }
  }

  await prisma.$disconnect();
}

main();
