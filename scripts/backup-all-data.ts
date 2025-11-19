import { prisma } from "../lib/prisma.js";
import fs from "fs";
import path from "path";

async function main() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupsDir = path.join(process.cwd(), "backups");

  console.log("🔄 Début de l'export complet de la base de données...\n");

  // 1. Export Works complet
  console.log("📦 Export des Works...");
  const works = await prisma.work.findMany({
    include: {
      coverImage: true,
      images: true,
      category: {
        include: {
          translations: true,
        },
      },
      label: true,
      contributions: {
        include: {
          composer: {
            include: {
              image: true,
              links: true,
            },
          },
        },
      },
      translations: true,
    },
  });
  console.log(`   ✅ ${works.length} works exportées`);

  fs.writeFileSync(
    path.join(backupsDir, "backup-works-full.json"),
    JSON.stringify(works, null, 2),
  );

  // 2. Export Compositeurs complet
  console.log("🎵 Export des Compositeurs...");
  const composers = await prisma.composer.findMany({
    include: {
      image: true,
      links: {
        orderBy: {
          order: "asc",
        },
      },
      contributions: {
        include: {
          work: {
            select: {
              id: true,
              slug: true,
              translations: {
                where: { locale: "fr" },
                select: { title: true },
              },
            },
          },
        },
      },
    },
  });
  console.log(`   ✅ ${composers.length} compositeurs exportés`);

  fs.writeFileSync(
    path.join(backupsDir, "backup-composers-full.json"),
    JSON.stringify(composers, null, 2),
  );

  // 3. Export Catégories
  console.log("📁 Export des Catégories...");
  const categories = await prisma.category.findMany({
    include: {
      translations: true,
      works: {
        select: {
          id: true,
          slug: true,
        },
      },
    },
  });
  console.log(`   ✅ ${categories.length} catégories exportées`);

  fs.writeFileSync(
    path.join(backupsDir, "backup-categories.json"),
    JSON.stringify(categories, null, 2),
  );

  // 4. Export Labels
  console.log("🏷️  Export des Labels...");
  const labels = await prisma.label.findMany({
    include: {
      works: {
        select: {
          id: true,
          slug: true,
        },
      },
    },
  });
  console.log(`   ✅ ${labels.length} labels exportés`);

  fs.writeFileSync(
    path.join(backupsDir, "backup-labels.json"),
    JSON.stringify(labels, null, 2),
  );

  // 5. Export Expertises
  console.log("🎓 Export des Expertises...");
  const expertises = await prisma.expertise.findMany({
    include: {
      coverImage: true,
      images: true,
      translations: true,
    },
  });
  console.log(`   ✅ ${expertises.length} expertises exportées`);

  fs.writeFileSync(
    path.join(backupsDir, "backup-expertises.json"),
    JSON.stringify(expertises, null, 2),
  );

  // 6. Export Assets
  console.log("🖼️  Export des Assets...");
  const assets = await prisma.asset.findMany();
  console.log(`   ✅ ${assets.length} assets exportés`);

  fs.writeFileSync(
    path.join(backupsDir, "backup-assets.json"),
    JSON.stringify(assets, null, 2),
  );

  // 7. Export complet combiné
  console.log("\n📦 Création du backup complet...");
  const completeBackup = {
    timestamp: new Date().toISOString(),
    metadata: {
      worksCount: works.length,
      composersCount: composers.length,
      categoriesCount: categories.length,
      labelsCount: labels.length,
      expertisesCount: expertises.length,
      assetsCount: assets.length,
    },
    data: {
      works,
      composers,
      categories,
      labels,
      expertises,
      assets,
    },
  };

  const completeFilename = `backup-complete-${timestamp}.json`;
  fs.writeFileSync(
    path.join(backupsDir, completeFilename),
    JSON.stringify(completeBackup, null, 2),
  );

  // Stats
  const stats = fs.statSync(path.join(backupsDir, completeFilename));
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

  console.log("\n✨ Backup complet terminé !");
  console.log("─".repeat(60));
  console.log(`📁 Dossier: backups/`);
  console.log(`📄 Fichier principal: ${completeFilename} (${sizeMB} MB)`);
  console.log("\n📊 Fichiers créés:");
  console.log(`   • backup-works-full.json`);
  console.log(`   • backup-composers-full.json`);
  console.log(`   • backup-categories.json`);
  console.log(`   • backup-labels.json`);
  console.log(`   • backup-expertises.json`);
  console.log(`   • backup-assets.json`);
  console.log(`   • ${completeFilename}`);
  console.log("\n✅ Toutes les données sont sauvegardées !");

  await prisma.$disconnect();
}

main().catch(console.error);
