import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Vérification des URLs YouTube dans la base de données...\n");

  const worksWithYoutube = await prisma.work.findMany({
    where: {
      externalUrl: {
        contains: "youtube",
      },
    },
    select: {
      slug: true,
      externalUrl: true,
      translations: {
        where: { locale: "fr" },
        select: { title: true },
      },
    },
    take: 10,
  });

  console.log(
    `✅ Trouvé ${worksWithYoutube.length} œuvres avec URL YouTube:\n`,
  );

  worksWithYoutube.forEach((work) => {
    console.log(`- ${work.translations[0]?.title || work.slug}`);
    console.log(`  URL: ${work.externalUrl}`);
    console.log(`  Slug: ${work.slug}\n`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
