import sharp from "sharp";
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import { glob } from "glob";

const prisma = new PrismaClient();

interface FixResult {
  pngConverted: number;
  assetsFixed: number;
  suffixesFixed: number;
  errors: string[];
}

// Convertir un PNG en JPG avec fond blanc
async function convertPngToJpg(
  inputPath: string,
  outputPath: string,
): Promise<void> {
  await sharp(inputPath)
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .jpeg({ quality: 85 })
    .toFile(outputPath);
}

// Normaliser un nom de fichier (supprimer accents)
function normalizeName(filename: string): string {
  const parsed = path.parse(filename);
  let name = parsed.name;
  const ext = parsed.ext.toLowerCase();

  // Normaliser le nom
  name = name.toLowerCase();
  name = name.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Supprimer accents
  name = name.replace(/[\s_]+/g, "-");
  name = name.replace(/[^a-z0-9-]/g, "");
  name = name.replace(/-+/g, "-");
  name = name.replace(/^-+|-+$/g, "");

  return name + ext;
}

// Trouver un fichier par son nom dans tous les sous-dossiers
async function findFileByName(
  baseDir: string,
  filename: string,
): Promise<string | null> {
  // Essayer d'abord le nom exact
  const pattern = `${baseDir}/**/${filename}`;
  const files = await glob(pattern, { nodir: true });

  if (files.length > 0) {
    return files[0];
  }

  // Essayer avec le nom normalisé (sans accents)
  const normalizedFilename = normalizeName(filename);
  if (normalizedFilename !== filename) {
    const patternNormalized = `${baseDir}/**/${normalizedFilename}`;
    const filesNormalized = await glob(patternNormalized, { nodir: true });

    if (filesNormalized.length > 0) {
      return filesNormalized[0];
    }
  }

  // Essayer avec des wildcards pour les suffixes (-1, -2, etc.)
  // D'abord avec le nom original
  const nameWithoutExt = path.parse(filename).name;
  const ext = path.parse(filename).ext;
  const patternWithSuffix = `${baseDir}/**/${nameWithoutExt}*${ext}`;
  const filesWithSuffix = await glob(patternWithSuffix, { nodir: true });

  if (filesWithSuffix.length > 0) {
    return filesWithSuffix[0];
  }

  // Ensuite avec le nom normalisé + wildcard
  const normalizedNameWithoutExt = path.parse(normalizedFilename).name;
  const normalizedExt = path.parse(normalizedFilename).ext;
  const patternNormalizedWithSuffix = `${baseDir}/**/${normalizedNameWithoutExt}*${normalizedExt}`;
  const filesNormalizedWithSuffix = await glob(patternNormalizedWithSuffix, {
    nodir: true,
  });

  if (filesNormalizedWithSuffix.length > 0) {
    return filesNormalizedWithSuffix[0];
  }

  // Dernière tentative : chercher juste le nom sans extension
  const patternNoExt = `${baseDir}/**/${nameWithoutExt}.*`;
  const filesNoExt = await glob(patternNoExt, { nodir: true });

  if (filesNoExt.length > 0) {
    return filesNoExt[0];
  }

  return null;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const result: FixResult = {
    pngConverted: 0,
    assetsFixed: 0,
    suffixesFixed: 0,
    errors: [],
  };

  console.log("🔧 Fix All Remaining Issues\n");
  console.log("=".repeat(60));
  console.log(`Mode: ${dryRun ? "DRY RUN" : "EXECUTE"}`);
  console.log("=".repeat(60));
  console.log();

  // ========================================
  // ÉTAPE 1 : Convertir TOUS les PNG en JPG
  // ========================================
  console.log("📋 Step 1: Convert ALL PNG to JPG\n");

  const pngFiles = await glob("public/images/projets/**/*.png", {
    nodir: true,
  });

  console.log(`Found ${pngFiles.length} PNG files to convert\n`);

  for (const pngPath of pngFiles) {
    const jpgPath = pngPath.replace(/\.png$/i, ".jpg");
    console.log(`Converting: ${pngPath}`);
    console.log(`       → ${jpgPath}`);

    if (!dryRun) {
      try {
        await convertPngToJpg(pngPath, jpgPath);
        fs.unlinkSync(pngPath); // Supprimer l'original
        result.pngConverted++;
        console.log("  ✅ Converted and deleted PNG\n");
      } catch (error) {
        const errorMsg = `Failed to convert ${pngPath}: ${error}`;
        result.errors.push(errorMsg);
        console.log(`  ❌ ${errorMsg}\n`);
      }
    } else {
      console.log("  [DRY RUN] Would convert and delete PNG\n");
      result.pngConverted++;
    }
  }

  // ========================================
  // ÉTAPE 2 : Fixer les assets manquants
  // ========================================
  console.log("\n📋 Step 2: Fix missing assets in database\n");

  const assets = await prisma.asset.findMany({
    select: {
      id: true,
      path: true,
    },
  });

  console.log(`Checking ${assets.length} assets...\n`);

  for (const asset of assets) {
    const fullPath = path.join(process.cwd(), "public", asset.path);
    const exists = fs.existsSync(fullPath);

    if (!exists) {
      // Fichier manquant, essayer de le trouver
      const filename = path.basename(asset.path);
      const baseDir = path.join(process.cwd(), "public", "images", "projets");

      console.log(`⚠️  Missing: ${asset.path}`);

      // Chercher le fichier
      const foundPath = await findFileByName(baseDir, filename);

      if (foundPath) {
        // Construire le nouveau path relatif
        const newPath = foundPath.replace(
          path.join(process.cwd(), "public"),
          "",
        );

        console.log(`   ✅ Found at: ${newPath}`);

        if (!dryRun) {
          try {
            await prisma.asset.update({
              where: { id: asset.id },
              data: { path: newPath },
            });
            result.assetsFixed++;
            console.log("   ✅ Updated in database\n");
          } catch (error) {
            const errorMsg = `Failed to update ${asset.path}: ${error}`;
            result.errors.push(errorMsg);
            console.log(`   ❌ ${errorMsg}\n`);
          }
        } else {
          console.log("   [DRY RUN] Would update in database\n");
          result.assetsFixed++;
        }
      } else {
        const errorMsg = `File not found anywhere: ${filename}`;
        result.errors.push(errorMsg);
        console.log(`   ❌ ${errorMsg}\n`);
      }
    }
  }

  // ========================================
  // RÉSUMÉ FINAL
  // ========================================
  console.log("\n" + "=".repeat(60));
  console.log("📊 FINAL SUMMARY\n");
  console.log(`Mode:                ${dryRun ? "DRY RUN" : "EXECUTE"}`);
  console.log(
    `PNG converted:       ${dryRun ? result.pngConverted + " (dry run)" : result.pngConverted}`,
  );
  console.log(
    `Assets fixed:        ${dryRun ? result.assetsFixed + " (dry run)" : result.assetsFixed}`,
  );
  console.log(`Errors:              ${result.errors.length}`);
  console.log("=".repeat(60));

  if (result.errors.length > 0) {
    console.log("\n❌ ERRORS:\n");
    result.errors.forEach((error) => console.log(`  - ${error}`));
  }

  if (dryRun) {
    console.log("\n💡 To execute for real, run:");
    console.log("  pnpm tsx scripts/fix-all-remaining-issues.ts --execute");
  } else {
    console.log("\n✅ All issues fixed!");
  }

  await prisma.$disconnect();
}

main();
