/**
 * Migration Script: ligne-de-mire → little-big-story
 *
 * Ce script migre tous les documentaires du label "ligne-de-mire" vers "little-big-story"
 * et corrige les chemins d'assets associés.
 *
 * Actions:
 * 1. Mettre à jour Work.labelId pour les 5 documentaires
 * 2. Mettre à jour Asset.path pour remplacer /ligne-de-mire/ par /little-big-story/
 * 3. Corriger les 3 noms de fichiers incohérents
 * 4. Supprimer le label ligne-de-mire (optionnel)
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Slugs des 5 documentaires à migrer
const DOCUMENTARY_SLUGS = [
  "inde-les-paysans",
  "portrait-dun-pere",
  "soeurs-de-la-terre",
  "un-pasteur",
  "vikings-la-saga-des-femmes",
];

// Mapping des corrections de noms de fichiers
const FILENAME_CORRECTIONS = {
  "/images/projets/documentaires/little-big-story/soeurs.jpg":
    "/images/projets/documentaires/little-big-story/soeurs-de-la-terre.jpg",
  "/images/projets/documentaires/little-big-story/unpasteur.jpg":
    "/images/projets/documentaires/little-big-story/un-pasteur.jpg",
  "/images/projets/documentaires/little-big-story/vikings-la-saga-des-femmes.jpg":
    "/images/projets/documentaires/little-big-story/vikings.jpg",
};

async function main() {
  console.log("🚀 Migration: ligne-de-mire → little-big-story\n");

  // 1. Récupérer les IDs des labels
  console.log("📋 Récupération des labels...");
  const ligneDeMireLabel = await prisma.label.findUnique({
    where: { slug: "ligne-de-mire" },
  });
  const littleBigStoryLabel = await prisma.label.findUnique({
    where: { slug: "little-big-story" },
  });

  if (!littleBigStoryLabel) {
    throw new Error("❌ Label 'little-big-story' introuvable en base");
  }

  console.log(`✅ Label 'little-big-story' trouvé (ID: ${littleBigStoryLabel.id})`);

  if (ligneDeMireLabel) {
    console.log(`✅ Label 'ligne-de-mire' trouvé (ID: ${ligneDeMireLabel.id})\n`);
  } else {
    console.log("⚠️  Label 'ligne-de-mire' introuvable (déjà supprimé ?)\n");
  }

  // 2. Mettre à jour les Works
  console.log("📝 Mise à jour des Works...");
  const worksToUpdate = await prisma.work.findMany({
    where: {
      slug: { in: DOCUMENTARY_SLUGS },
    },
    select: {
      id: true,
      slug: true,
      labelId: true,
    },
  });

  console.log(`   Trouvé ${worksToUpdate.length} work(s) à migrer:`);
  worksToUpdate.forEach((work) => {
    console.log(`   - ${work.slug} (current labelId: ${work.labelId})`);
  });

  const updateWorkResult = await prisma.work.updateMany({
    where: {
      slug: { in: DOCUMENTARY_SLUGS },
    },
    data: {
      labelId: littleBigStoryLabel.id,
    },
  });

  console.log(`✅ ${updateWorkResult.count} work(s) mis à jour\n`);

  // 3. Mettre à jour les Assets - Remplacer /ligne-de-mire/ par /little-big-story/
  console.log("🖼️  Mise à jour des Assets (chemins)...");
  const assetsToUpdate = await prisma.asset.findMany({
    where: {
      path: { contains: "/ligne-de-mire/" },
    },
    select: {
      id: true,
      path: true,
    },
  });

  console.log(`   Trouvé ${assetsToUpdate.length} asset(s) à migrer:`);

  for (const asset of assetsToUpdate) {
    const newPath = asset.path.replace("/ligne-de-mire/", "/little-big-story/");
    console.log(`   - ${asset.path}`);
    console.log(`     → ${newPath}`);

    await prisma.asset.update({
      where: { id: asset.id },
      data: { path: newPath },
    });
  }

  console.log(`✅ ${assetsToUpdate.length} asset(s) path mis à jour\n`);

  // 4. Corriger les noms de fichiers incohérents
  console.log("📝 Correction des noms de fichiers...");
  let correctionCount = 0;

  for (const [oldPath, newPath] of Object.entries(FILENAME_CORRECTIONS)) {
    const asset = await prisma.asset.findUnique({
      where: { path: oldPath },
    });

    if (asset) {
      console.log(`   - ${oldPath}`);
      console.log(`     → ${newPath}`);

      await prisma.asset.update({
        where: { id: asset.id },
        data: { path: newPath },
      });
      correctionCount++;
    } else {
      console.log(`   ⚠️  Asset non trouvé: ${oldPath}`);
    }
  }

  console.log(`✅ ${correctionCount} nom(s) de fichier corrigé(s)\n`);

  // 5. Vérifier s'il reste des works utilisant ligne-de-mire
  if (ligneDeMireLabel) {
    const remainingWorks = await prisma.work.count({
      where: { labelId: ligneDeMireLabel.id },
    });

    console.log("🔍 Vérification des works restants...");
    console.log(`   ${remainingWorks} work(s) utilise(nt) encore 'ligne-de-mire'`);

    if (remainingWorks === 0) {
      console.log("\n⚠️  Plus aucun work n'utilise 'ligne-de-mire'");
      console.log("   Voulez-vous supprimer ce label ? (commentez le code ci-dessous)");
      console.log("   Note: Décommentez la section suivante si vous voulez supprimer le label\n");

      /*
      console.log("🗑️  Suppression du label 'ligne-de-mire'...");
      await prisma.label.delete({
        where: { id: ligneDeMireLabel.id },
      });
      console.log("✅ Label 'ligne-de-mire' supprimé\n");
      */
    } else {
      console.log("   ⚠️  Ne peut pas supprimer le label (encore utilisé)\n");
    }
  }

  // 6. Résumé final
  console.log("✨ Migration terminée avec succès !");
  console.log("\nRésumé:");
  console.log(`   - Works migrés: ${updateWorkResult.count}`);
  console.log(`   - Assets path mis à jour: ${assetsToUpdate.length}`);
  console.log(`   - Noms de fichiers corrigés: ${correctionCount}`);
  console.log("\n💡 Prochaines étapes:");
  console.log("   1. Vérifier les changements en base avec Prisma Studio");
  console.log("   2. Reseed la base si nécessaire: pnpm db:seed");
  console.log("   3. Tester l'affichage des documentaires sur le site");
}

main()
  .catch((error) => {
    console.error("❌ Erreur pendant la migration:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
