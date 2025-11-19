import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Vérification des expertises...\n");

  const expertises = await prisma.expertise.findMany({
    include: {
      translations: { where: { locale: "fr" } },
      coverImage: true,
      images: true,
    },
    orderBy: { order: "asc" },
  });

  console.log(`📚 Nombre d'expertises: ${expertises.length}\n`);

  for (const expertise of expertises) {
    const translation = expertise.translations[0];
    console.log(`✅ ${translation?.title || expertise.slug}`);
    console.log(`   Slug: ${expertise.slug}`);
    console.log(
      `   Cover image: ${expertise.coverImage?.path || "❌ manquante"}`,
    );
    console.log(`   Gallery images: ${expertise.images.length}`);
    console.log(
      `   Description: ${translation?.description?.substring(0, 80)}...`,
    );
    console.log("");
  }

  console.log(
    `\n🎉 ${expertises.length} expertises sont correctement enregistrées!`,
  );
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
