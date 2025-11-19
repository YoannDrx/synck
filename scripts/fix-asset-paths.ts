import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixAssetPaths() {
  console.log("🔧 Correction des chemins d'assets invalides...\n");

  // Trouver tous les assets avec des chemins commençant par "public/"
  const invalidAssets = await prisma.asset.findMany({
    where: {
      path: {
        startsWith: "public/",
      },
    },
  });

  console.log(`📊 Assets à corriger: ${invalidAssets.length}\n`);

  let fixed = 0;
  let errors = 0;

  for (const asset of invalidAssets) {
    const oldPath = asset.path;
    const newPath = oldPath.replace(/^public/, "");

    try {
      // Vérifier si un asset avec le bon chemin existe déjà
      const existing = await prisma.asset.findUnique({
        where: { path: newPath },
      });

      if (existing) {
        // Si l'asset existe déjà avec le bon chemin, supprimer le doublon
        await prisma.asset.delete({
          where: { id: asset.id },
        });
        console.log(
          `🗑️  Supprimé doublon: ${oldPath} (existe déjà: ${newPath})`,
        );
        fixed++;
      } else {
        // Sinon, mettre à jour le chemin
        await prisma.asset.update({
          where: { id: asset.id },
          data: { path: newPath },
        });
        console.log(`✅ ${oldPath} → ${newPath}`);
        fixed++;
      }
    } catch (error) {
      console.error(`❌ Erreur pour ${oldPath}:`, error);
      errors++;
    }
  }

  console.log(`\n📈 Résumé:`);
  console.log(`  ✅ Corrigés: ${fixed}`);
  console.log(`  ❌ Erreurs: ${errors}`);
}

fixAssetPaths()
  .catch((error) => {
    console.error("❌ Erreur fatale:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
