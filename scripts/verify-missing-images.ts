import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Vérification des images manquantes...\n");

  // Check Lofi Hip Hop album
  const lofiAlbum = await prisma.work.findFirst({
    where: { slug: "lofi-hip-hop" },
    include: {
      coverImage: true,
      translations: { where: { locale: "fr" } },
    },
  });

  console.log("📀 Album: Lofi Hip-Hop");
  if (lofiAlbum?.coverImage) {
    console.log(`   ✅ Image: ${lofiAlbum.coverImage.path}`);
  } else {
    console.log(`   ❌ Pas d'image de couverture`);
  }

  // Check documentaries
  const documentaries = [
    "les-oublies-de-l-atome",
    "mes-parents-ces-heros",
    "matrine-aubry-la-dame-de-lille",
    "cahier-d-un-retour-en-langue-natale",
    "la-clinique-de-l-amour",
    "souvenirs-en-cuisine-2",
    "de-gerard-a-monsieur-collomb-itineraire-d-un-baron",
    "l-eveil-du-desir",
  ];

  console.log("\n📽️  Documentaires:");
  for (const slug of documentaries) {
    const doc = await prisma.work.findFirst({
      where: { slug },
      include: {
        coverImage: true,
        translations: { where: { locale: "fr" } },
      },
    });

    if (doc) {
      const title = doc.translations[0]?.title || slug;
      if (doc.coverImage) {
        console.log(`   ✅ ${title}: ${doc.coverImage.path}`);
      } else {
        console.log(`   ❌ ${title}: pas d'image`);
      }
    } else {
      console.log(`   ⚠️  ${slug}: non trouvé`);
    }
  }

  // Check Mutant Ninja Records composer
  console.log("\n🎵 Compositeur: Mutant Ninja Records");
  const mutantNinja = await prisma.composer.findFirst({
    where: { slug: "mutant-ninja-records" },
    include: {
      image: true,
    },
  });

  if (mutantNinja?.image) {
    console.log(`   ✅ Image: ${mutantNinja.image.path}`);
  } else {
    console.log(`   ❌ Pas d'image`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
