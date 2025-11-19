import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import sharp from "sharp";

const prisma = new PrismaClient();

interface SyncResult {
  filesRenamed: number;
  assetsDeleted: number;
  assetsCreated: number;
  errors: string[];
}

// Générer blur data URL pour une image
async function generateBlurDataUrl(imagePath: string): Promise<string | null> {
  try {
    const buffer = await sharp(imagePath)
      .resize(10, 10, { fit: "inside" })
      .blur()
      .toBuffer();
    return `data:image/jpeg;base64,${buffer.toString("base64")}`;
  } catch (error) {
    console.error(`Error generating blur for ${imagePath}:`, error);
    return null;
  }
}

// Obtenir les dimensions d'une image
async function getImageDimensions(
  imagePath: string,
): Promise<{ width: number; height: number } | null> {
  try {
    const metadata = await sharp(imagePath).metadata();
    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
    };
  } catch (error) {
    console.error(`Error reading dimensions for ${imagePath}:`, error);
    return null;
  }
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  console.log("🔄 Sync Local Files with Neon Database\n");
  console.log("=".repeat(60));
  console.log(`Mode: ${dryRun ? "DRY RUN" : "EXECUTE"}`);
  console.log("=".repeat(60));
  console.log();

  const result: SyncResult = {
    filesRenamed: 0,
    assetsDeleted: 0,
    assetsCreated: 0,
    errors: [],
  };

  // Charger le rapport d'audit
  const auditPath = path.join(process.cwd(), "scripts", "audit-report.json");
  const audit = JSON.parse(fs.readFileSync(auditPath, "utf-8"));

  // ========================================
  // ÉTAPE 1 : Renommer les fichiers en majuscules
  // ========================================
  console.log("📝 Step 1: Rename uppercase files\n");

  const invalidNames = audit.invalidNames as string[];
  console.log(`Found ${invalidNames.length} files with uppercase names\n`);

  for (const relativePath of invalidNames) {
    const fullPath = path.join(process.cwd(), "public", relativePath);
    const filename = path.basename(relativePath);
    const dir = path.dirname(relativePath);
    const newFilename = filename.toLowerCase();
    const newRelativePath = path.join(dir, newFilename);
    const newFullPath = path.join(process.cwd(), "public", newRelativePath);

    console.log(`Rename: ${filename}`);
    console.log(`    → ${newFilename}`);

    if (!dryRun) {
      try {
        if (fs.existsSync(fullPath)) {
          fs.renameSync(fullPath, newFullPath);
          result.filesRenamed++;
          console.log("  ✅ Renamed\n");
        } else {
          console.log("  ⚠️  File not found\n");
        }
      } catch (error) {
        const errorMsg = `Failed to rename ${relativePath}: ${error}`;
        result.errors.push(errorMsg);
        console.log(`  ❌ ${errorMsg}\n`);
      }
    } else {
      console.log("  [DRY RUN] Would rename\n");
      result.filesRenamed++;
    }
  }

  // ========================================
  // ÉTAPE 2 : Supprimer les assets orphelins en DB
  // ========================================
  console.log("\n💾 Step 2: Delete orphan assets in database\n");

  const onlyInDb = audit.onlyInDb as string[];
  console.log(`Found ${onlyInDb.length} orphan assets in database\n`);

  for (const assetPath of onlyInDb) {
    console.log(`Delete asset: ${assetPath}`);

    if (!dryRun) {
      try {
        await prisma.asset.delete({
          where: { path: assetPath },
        });
        result.assetsDeleted++;
        console.log("  ✅ Deleted from database\n");
      } catch (error) {
        const errorMsg = `Failed to delete ${assetPath}: ${error}`;
        result.errors.push(errorMsg);
        console.log(`  ❌ ${errorMsg}\n`);
      }
    } else {
      console.log("  [DRY RUN] Would delete\n");
      result.assetsDeleted++;
    }
  }

  // ========================================
  // ÉTAPE 3 : Créer les assets manquants
  // ========================================
  console.log("\n📁 Step 3: Create missing assets in database\n");

  let onlyInLocal = audit.onlyInLocal as string[];

  // Ajouter les fichiers renommés à la liste
  for (const relativePath of invalidNames) {
    const filename = path.basename(relativePath);
    const dir = path.dirname(relativePath);
    const newFilename = filename.toLowerCase();
    const newRelativePath = path.join(dir, newFilename);
    onlyInLocal.push(newRelativePath);
  }

  console.log(`Found ${onlyInLocal.length} files not in database\n`);

  for (const relativePath of onlyInLocal) {
    const fullPath = path.join(process.cwd(), "public", relativePath);

    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  Skipping ${relativePath} (file not found)\n`);
      continue;
    }

    console.log(`Create asset: ${relativePath}`);

    if (!dryRun) {
      try {
        // Obtenir les dimensions et blur
        const dimensions = await getImageDimensions(fullPath);
        const blurDataUrl = await generateBlurDataUrl(fullPath);

        const aspectRatio =
          dimensions && dimensions.width && dimensions.height
            ? dimensions.width / dimensions.height
            : null;

        await prisma.asset.create({
          data: {
            path: relativePath,
            blurDataUrl: blurDataUrl || undefined,
            width: dimensions?.width || undefined,
            height: dimensions?.height || undefined,
            aspectRatio: aspectRatio || undefined,
          },
        });

        result.assetsCreated++;
        console.log("  ✅ Created in database\n");
      } catch (error) {
        const errorMsg = `Failed to create asset ${relativePath}: ${error}`;
        result.errors.push(errorMsg);
        console.log(`  ❌ ${errorMsg}\n`);
      }
    } else {
      console.log("  [DRY RUN] Would create\n");
      result.assetsCreated++;
    }
  }

  // ========================================
  // RÉSUMÉ FINAL
  // ========================================
  console.log("\n" + "=".repeat(60));
  console.log("📊 FINAL SUMMARY\n");
  console.log(`Mode:                ${dryRun ? "DRY RUN" : "EXECUTE"}`);
  console.log(
    `Files renamed:       ${dryRun ? result.filesRenamed + " (dry run)" : result.filesRenamed}`,
  );
  console.log(
    `Assets deleted:      ${dryRun ? result.assetsDeleted + " (dry run)" : result.assetsDeleted}`,
  );
  console.log(
    `Assets created:      ${dryRun ? result.assetsCreated + " (dry run)" : result.assetsCreated}`,
  );
  console.log(`Errors:              ${result.errors.length}`);
  console.log("=".repeat(60));

  if (result.errors.length > 0) {
    console.log("\n❌ ERRORS:\n");
    result.errors.forEach((error) => console.log(`  - ${error}`));
  }

  if (dryRun) {
    console.log("\n💡 To execute for real, run:");
    console.log("  pnpm tsx scripts/sync-files-and-db.ts --execute");
  } else {
    console.log("\n✅ Synchronization complete!");
    console.log("\nNext steps:");
    console.log(
      "  1. Run audit again to verify: pnpm tsx scripts/audit-files-vs-db.ts",
    );
    console.log("  2. Update seed file to match current state");
  }

  await prisma.$disconnect();
}

main();
