import { prisma } from "../lib/prisma.js";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🔍 Vérification des doublons et images manquantes...\n");

  // Liste des titres à vérifier
  const titlesToCheck = [
    "les oubliés de l'atome",
    "mes parents ces héros",
    "martine aubry",
    "cahier d'un retour",
    "la clinique de l'amour",
    "lofi hip hop",
    "souvenir en cuisine",
    "gérard à monsieur collomb",
    "l'éveil du désir",
    "ny parigo",
    "videoclub",
    "une dernière fois",
  ];

  for (const searchTitle of titlesToCheck) {
    console.log(`\n📌 Recherche: "${searchTitle}"`);
    console.log("─".repeat(60));

    const works = await prisma.work.findMany({
      where: {
        translations: {
          some: {
            title: { contains: searchTitle, mode: "insensitive" },
          },
        },
      },
      include: {
        coverImage: true,
        category: {
          include: {
            translations: {
              where: { locale: "fr" },
            },
          },
        },
        translations: {
          where: { locale: "fr" },
        },
      },
    });

    if (works.length === 0) {
      console.log("   ❌ Aucune œuvre trouvée");
      continue;
    }

    if (works.length > 1) {
      console.log(`   ⚠️  DOUBLONS TROUVÉS: ${works.length} œuvres`);
    }

    works.forEach((work, index) => {
      const titleFr = work.translations[0]?.title || "N/A";
      const categoryName = work.category?.translations[0]?.name || "N/A";

      console.log(`\n   Work #${index + 1}:`);
      console.log(`   - ID: ${work.id}`);
      console.log(`   - Titre: ${titleFr}`);
      console.log(`   - Slug: ${work.slug}`);
      console.log(`   - Catégorie: ${categoryName}`);
      console.log(`   - Active: ${work.isActive}`);

      if (work.coverImage) {
        console.log(`   - Image path: ${work.coverImage.path}`);
        const fullPath = path.join(process.cwd(), work.coverImage.path);
        const exists = fs.existsSync(fullPath);
        console.log(`   - Image existe: ${exists ? "✅" : "❌"}`);
        if (!exists) {
          console.log(`   - Chemin attendu: ${fullPath}`);
        }
      } else {
        console.log(`   - ❌ PAS D'IMAGE DE COUVERTURE`);
      }
    });
  }

  // Statistiques globales
  console.log("\n\n📊 Statistiques globales:");
  console.log("─".repeat(60));

  const allWorks = await prisma.work.findMany({
    select: {
      slug: true,
    },
  });

  // Chercher les doublons de slug
  const slugCounts = new Map<string, number>();
  allWorks.forEach((work) => {
    slugCounts.set(work.slug, (slugCounts.get(work.slug) || 0) + 1);
  });

  const duplicateSlugs = Array.from(slugCounts.entries()).filter(
    ([_, count]) => count > 1,
  );

  if (duplicateSlugs.length > 0) {
    console.log(`\n⚠️  ${duplicateSlugs.length} slugs en doublon:`);
    duplicateSlugs.forEach(([slug, count]) => {
      console.log(`   - "${slug}": ${count} occurrences`);
    });
  } else {
    console.log("\n✅ Aucun doublon de slug trouvé");
  }

  await prisma.$disconnect();
}

main().catch(console.error);
