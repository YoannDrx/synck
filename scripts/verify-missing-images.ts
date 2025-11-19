import { prisma } from "../lib/prisma.js";
import fs from "fs";

console.log("🔍 Vérification des images manquantes\n");

// Liste des works mentionnés comme ayant des images manquantes
const worksToCheck = [
  "les-oublies-de-latome",
  "mes-parents-ces-heros-ordinaires",
  "martine-aubry-la-dame-de-lille",
  "cahier-dun-retour-en-langue-natale",
  "la-clinique-de-lamour",
  "lofi-hip-hop",
  "souvenirs-en-cuisine",
  "de-gerard-a-monsieur-collomb",
  "leveil-du-desir",
  "ny-parigo",
  "videoclub",
  "une-derniere-fois",
];

async function main() {
  console.log(`📋 Vérification de ${worksToCheck.length} works...\n`);

  let foundCount = 0;
  let missingCount = 0;
  let imageOkCount = 0;
  let imageNotFoundCount = 0;

  for (const slug of worksToCheck) {
    const work = await prisma.work.findUnique({
      where: { slug },
      select: {
        slug: true,
        coverImage: {
          select: {
            path: true,
          },
        },
        translations: {
          where: { locale: "fr" },
          select: { title: true },
        },
      },
    });

    if (!work) {
      console.log(`❌ "${slug}" - Work non trouvé en DB`);
      missingCount++;
      continue;
    }

    foundCount++;
    const title = work.translations[0]?.title || slug;

    if (!work.coverImage) {
      console.log(`⚠️  "${title}" (${slug}) - Pas de coverImage associée`);
      imageNotFoundCount++;
      continue;
    }

    const imagePath = work.coverImage.path;
    const fileExists = fs.existsSync(imagePath);

    if (fileExists) {
      console.log(`✅ "${title}" - Image OK: ${imagePath}`);
      imageOkCount++;
    } else {
      console.log(`❌ "${title}" - Fichier introuvable: ${imagePath}`);
      imageNotFoundCount++;
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("📊 Résumé:");
  console.log("=".repeat(60));
  console.log(`✅ Works trouvés en DB: ${foundCount}/${worksToCheck.length}`);
  console.log(`❌ Works manquants en DB: ${missingCount}`);
  console.log(`✅ Images OK (fichier existe): ${imageOkCount}`);
  console.log(`❌ Images manquantes: ${imageNotFoundCount}\n`);

  if (imageNotFoundCount === 0 && foundCount === worksToCheck.length) {
    console.log("🎉 Toutes les images sont maintenant disponibles !");
  } else if (imageNotFoundCount > 0) {
    console.log(
      `⚠️  ${imageNotFoundCount} images restent à corriger (fichiers physiques manquants)`,
    );
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
