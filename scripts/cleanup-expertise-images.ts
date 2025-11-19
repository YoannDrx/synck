import { PrismaClient } from "@prisma/client";
import { rmSync } from "fs";
import { existsSync } from "fs";

const prisma = new PrismaClient();

// Mapping des anciens chemins vers les nouveaux
const pathMappings = {
  "/images/droit-auteur/": "/images/projets/expertises/droits-auteur/",
  "/images/droit-voisin/": "/images/projets/expertises/droits-voisins/",
  "/images/gestion-admin/":
    "/images/projets/expertises/gestion-administrative-et-editoriale/",
  "/images/gestion-distrib/":
    "/images/projets/expertises/gestion-distribution/",
  "/images/sous-edition/": "/images/projets/expertises/sous-edition/",
  "/images/subvention/": "/images/projets/expertises/dossier-subvention/",
};

// Répertoires à supprimer après nettoyage
const foldersToDelete = [
  "public/images/droit-auteur",
  "public/images/droit-voisin",
  "public/images/gestion-admin",
  "public/images/gestion-distrib",
  "public/images/sous-edition",
  "public/images/subvention",
];

async function cleanupExpertiseImages() {
  console.log("🧹 Nettoyage des images d'expertises dupliquées...\n");

  // 1. Mettre à jour les chemins en base de données
  console.log("📊 Mise à jour des chemins en base de données...\n");

  let updated = 0;
  let notFound = 0;

  for (const [oldPath, newPath] of Object.entries(pathMappings)) {
    const assetsWithOldPath = await prisma.asset.findMany({
      where: {
        path: {
          startsWith: oldPath,
        },
      },
    });

    console.log(
      `\n🔍 Trouvé ${assetsWithOldPath.length} assets avec le préfixe "${oldPath}"`,
    );

    for (const asset of assetsWithOldPath) {
      const oldFullPath = asset.path;
      const newFullPath = oldFullPath.replace(oldPath, newPath);

      // Vérifier si un asset avec le nouveau chemin existe déjà
      const existing = await prisma.asset.findUnique({
        where: { path: newFullPath },
      });

      try {
        if (existing) {
          // Supprimer le doublon
          await prisma.asset.delete({
            where: { id: asset.id },
          });
          console.log(`  🗑️  Doublon supprimé: ${oldFullPath}`);
          updated++;
        } else {
          // Mettre à jour le chemin
          await prisma.asset.update({
            where: { id: asset.id },
            data: { path: newFullPath },
          });
          console.log(`  ✅ ${oldFullPath} → ${newFullPath}`);
          updated++;
        }
      } catch (error) {
        console.error(`  ❌ Erreur pour ${oldFullPath}:`, error);
        notFound++;
      }
    }
  }

  console.log(`\n📈 Résumé DB:`);
  console.log(`  ✅ Assets mis à jour: ${updated}`);
  console.log(`  ❌ Erreurs: ${notFound}`);

  // 2. Supprimer les anciens répertoires
  console.log("\n🗑️  Suppression des anciens répertoires...\n");

  let deleted = 0;
  let errors = 0;

  for (const folder of foldersToDelete) {
    if (existsSync(folder)) {
      try {
        rmSync(folder, { recursive: true, force: true });
        console.log(`  ✅ Supprimé: ${folder}`);
        deleted++;
      } catch (error) {
        console.error(
          `  ❌ Erreur lors de la suppression de ${folder}:`,
          error,
        );
        errors++;
      }
    } else {
      console.log(`  ⚠️  Déjà supprimé: ${folder}`);
    }
  }

  console.log(`\n📈 Résumé fichiers:`);
  console.log(`  ✅ Répertoires supprimés: ${deleted}`);
  console.log(`  ❌ Erreurs: ${errors}`);

  console.log("\n✨ Nettoyage terminé !");
  console.log(
    "\n⚠️  N'oublie pas de vérifier que les fichiers .md ont été mis à jour avec les bons chemins.",
  );
}

cleanupExpertiseImages()
  .catch((error) => {
    console.error("❌ Erreur fatale:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
