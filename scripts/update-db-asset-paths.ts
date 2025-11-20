import { PrismaClient } from "@prisma/client";
import * as path from "path";
import * as fs from "fs";

const prisma = new PrismaClient();

interface PathMapping {
  oldPath: string;
  newPath: string;
  exists: boolean;
}

interface NormalizationPlan {
  filesToProcess: Array<{
    currentPath: string;
    targetPath: string;
  }>;
}

function normalizeName(filename: string): string {
  const parsed = path.parse(filename);
  let name = parsed.name;
  let ext = parsed.ext.toLowerCase();

  // Normaliser le nom
  name = name.toLowerCase();
  name = name.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Supprimer les accents
  name = name.replace(/[\s_]+/g, "-"); // Espaces et underscores → tirets
  name = name.replace(/[^a-z0-9-]/g, ""); // Supprimer caractères spéciaux
  name = name.replace(/-+/g, "-"); // Fusionner tirets multiples
  name = name.replace(/^-+|-+$/g, ""); // Trim tirets

  // Normaliser l'extension
  if (ext === ".jpeg") ext = ".jpg";
  if (ext === ".png") ext = ".png"; // Garder .png pour ceux avec transparence
  if (!ext) ext = ".jpg";

  return name + ext;
}

function normalizePathSegment(segment: string): string {
  // Ne pas toucher aux segments de dossier comme "13prods", "little-big-story", etc.
  const specialFolders = [
    "13prods",
    "little-big-story",
    "via-decouvertes-films",
    "pop-films",
    "albums",
    "clips",
    "vinyles",
    "photosynchro",
    "photosCompo",
    "evenements",
    "documentaires",
    "projets",
    "images",
  ];

  if (specialFolders.includes(segment.toLowerCase())) {
    return segment.toLowerCase();
  }

  return segment;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  console.log("🔄 Update Database Asset Paths\n");
  console.log("=".repeat(60));
  console.log(`Mode: ${dryRun ? "DRY RUN" : "EXECUTE"}`);
  console.log("=".repeat(60));
  console.log();

  if (dryRun) {
    console.log("🔍 DRY RUN MODE - No database will be modified\n");
  } else {
    console.log("⚠️  EXECUTE MODE - Database WILL be modified\n");
  }

  // Charger le plan de normalisation
  const planPath = path.join(
    process.cwd(),
    "scripts",
    "normalization-plan.json",
  );
  const plan: NormalizationPlan = JSON.parse(
    fs.readFileSync(planPath, "utf-8"),
  );

  // Créer un mapping: ancien path → nouveau path
  const fileMapping = new Map<string, string>();
  for (const file of plan.filesToProcess) {
    // Remplacer /images/portfolio/ par /images/projets/ dans les deux chemins
    const current = file.currentPath.replace(
      "/images/portfolio/",
      "/images/projets/",
    );
    const target = file.targetPath.replace(
      "/images/portfolio/",
      "/images/projets/",
    );
    fileMapping.set(current, target);
  }

  console.log(
    `📁 Loaded ${fileMapping.size} file mappings from normalization plan\n`,
  );

  // Récupérer tous les assets
  const assets = await prisma.asset.findMany({
    select: {
      id: true,
      path: true,
    },
  });

  console.log(`📊 Found ${assets.length} assets in database\n`);

  const mappings: PathMapping[] = [];
  let updatedCount = 0;
  let unchangedCount = 0;
  let missingCount = 0;

  for (const asset of assets) {
    const originalPath = asset.path; // Path depuis la DB

    // IMPORTANT: Remplacer /images/portfolio/ par /images/projets/
    const tempPath = originalPath.replace(
      "/images/portfolio/",
      "/images/projets/",
    );

    // Chercher le nouveau path dans le mapping
    let newPath = fileMapping.get(tempPath);

    // Si pas trouvé dans le mapping, appliquer la normalisation basique
    if (!newPath) {
      const segments = tempPath.split("/");
      const filename = segments[segments.length - 1];
      const normalizedFilename = normalizeName(filename);
      const directory = segments.slice(0, -1).join("/");
      newPath = `${directory}/${normalizedFilename}`;
    }

    // Vérifier si le fichier existe sur le disque
    const fullPath = path.join(process.cwd(), "public", newPath);
    const exists = fs.existsSync(fullPath);

    mappings.push({
      oldPath: originalPath,
      newPath,
      exists,
    });

    if (originalPath !== newPath) {
      if (exists) {
        console.log(`✅ ${originalPath}`);
        console.log(`   → ${newPath}`);

        if (!dryRun) {
          try {
            await prisma.asset.update({
              where: { id: asset.id },
              data: { path: newPath },
            });
            console.log("   ✅ Updated in database\n");
            updatedCount++;
          } catch (error) {
            console.log(`   ❌ Error updating: ${error}\n`);
          }
        } else {
          console.log("   [DRY RUN] Would update\n");
          updatedCount++;
        }
      } else {
        console.log(`⚠️  ${originalPath}`);
        console.log(`   → ${newPath}`);
        console.log(`   ❌ File not found on disk: ${fullPath}\n`);
        missingCount++;
      }
    } else {
      unchangedCount++;
    }
  }

  // Résumé final
  console.log("\n" + "=".repeat(60));
  console.log("📊 FINAL SUMMARY\n");
  console.log(`Mode:                ${dryRun ? "DRY RUN" : "EXECUTE"}`);
  console.log(`Total assets:        ${assets.length}`);
  console.log(
    `Updated:             ${dryRun ? updatedCount + " (dry run)" : updatedCount}`,
  );
  console.log(`Unchanged:           ${unchangedCount}`);
  console.log(`Missing on disk:     ${missingCount}`);
  console.log("=".repeat(60));

  if (missingCount > 0) {
    console.log(
      "\n⚠️  WARNING: Some assets reference files that don't exist on disk.",
    );
    console.log("   These assets were NOT updated.");
  }

  if (dryRun && updatedCount > 0) {
    console.log("\n💡 To execute for real, run:");
    console.log("  pnpm tsx scripts/update-db-asset-paths.ts --execute");
  } else if (!dryRun && updatedCount > 0) {
    console.log("\n✅ Database asset paths updated successfully!");
  } else {
    console.log("\n✅ No assets need updating!");
  }

  await prisma.$disconnect();
}

main();
