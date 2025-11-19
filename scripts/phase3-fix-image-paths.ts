import { prisma } from "../lib/prisma.js";

console.log("🔧 Phase 3 : Correction des chemins images en DB\n");

async function main() {
  // 1. Analyser les assets avec chemins incorrects
  console.log("📊 Analyse des chemins actuels...");

  const assetsWithBadPaths = await prisma.asset.findMany({
    where: {
      path: {
        startsWith: "/images/",
      },
    },
    select: {
      id: true,
      path: true,
    },
  });

  console.log(
    `   ⚠️  ${assetsWithBadPaths.length} assets trouvés avec chemins incorrects (commençant par "/images/")\n`,
  );

  if (assetsWithBadPaths.length === 0) {
    console.log("✅ Tous les chemins sont déjà corrects !");
    return;
  }

  // Afficher quelques exemples
  console.log("   Exemples:");
  assetsWithBadPaths.slice(0, 5).forEach((asset) => {
    console.log(`   - ${asset.path}`);
  });

  if (assetsWithBadPaths.length > 5) {
    console.log(`   ... et ${assetsWithBadPaths.length - 5} autres\n`);
  }

  // 2. Exécuter la correction SQL
  console.log("🔄 Correction des chemins...");

  const result = await prisma.$executeRaw`
    UPDATE "Asset"
    SET path = CONCAT('public', path)
    WHERE path LIKE '/images/%'
  `;

  console.log(`   ✅ ${result} chemins corrigés\n`);

  // 3. Vérification post-correction
  console.log("✓ Vérification post-correction...");

  const remainingBadPaths = await prisma.asset.count({
    where: {
      path: {
        startsWith: "/images/",
      },
    },
  });

  if (remainingBadPaths === 0) {
    console.log("   ✅ Tous les chemins sont maintenant corrects !\n");
  } else {
    console.log(
      `   ⚠️  Attention : ${remainingBadPaths} chemins incorrects restants\n`,
    );
  }

  // 4. Statistiques finales
  console.log("📊 Statistiques des chemins images:");

  const pathStats = await prisma.$queryRaw<
    Array<{ prefix: string; count: bigint }>
  >`
    SELECT
      CASE
        WHEN path LIKE 'public/images/%' THEN 'public/images/'
        WHEN path LIKE '/images/%' THEN '/images/'
        WHEN path LIKE 'images/%' THEN 'images/'
        ELSE 'autre'
      END as prefix,
      COUNT(*) as count
    FROM "Asset"
    GROUP BY prefix
    ORDER BY count DESC
  `;

  pathStats.forEach((stat) => {
    console.log(`   • ${stat.prefix}: ${stat.count} fichiers`);
  });

  console.log("\n" + "=".repeat(60));
  console.log("✨ Phase 3 terminée !");
  console.log("=".repeat(60));
  console.log(`\n✅ ${result} chemins d'images corrigés avec succès`);
  console.log("✅ Base de données prête pour le seed\n");
}

main()
  .catch((error) => {
    console.error("❌ Erreur:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
