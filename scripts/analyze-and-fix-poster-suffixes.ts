import sharp from "sharp";
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface ImageInfo {
  path: string;
  width: number;
  height: number;
  size: number;
  aspectRatio: number;
  isPortrait: boolean;
  isPosterLike: boolean; // Ratio d'aspect proche de 2:3 ou 1:1.5
}

interface ConflictPair {
  conflictGroup: string;
  image1: ImageInfo;
  image2: ImageInfo;
  posterImage: ImageInfo | null;
  needsSwap: boolean;
}

// Analyser une image avec Sharp
async function analyzeImage(imagePath: string): Promise<ImageInfo | null> {
  try {
    const stats = fs.statSync(imagePath);
    const metadata = await sharp(imagePath).metadata();

    const width = metadata.width || 0;
    const height = metadata.height || 0;
    const aspectRatio = width / height;
    const isPortrait = height > width;

    // Les affiches de films ont généralement un ratio 2:3 (0.667) ou proche
    // Tolérance : entre 0.6 et 0.75
    const isPosterLike =
      isPortrait && aspectRatio >= 0.6 && aspectRatio <= 0.75;

    return {
      path: imagePath,
      width,
      height,
      size: stats.size,
      aspectRatio,
      isPortrait,
      isPosterLike,
    };
  } catch (error) {
    console.error(`Error analyzing ${imagePath}: ${error}`);
    return null;
  }
}

// Déterminer quelle image est le poster
function identifyPoster(img1: ImageInfo, img2: ImageInfo): ImageInfo | null {
  // Stratégie 1 : Si une seule est poster-like
  if (img1.isPosterLike && !img2.isPosterLike) return img1;
  if (img2.isPosterLike && !img1.isPosterLike) return img2;

  // Stratégie 2 : Si les deux sont poster-like, prendre la plus haute résolution
  if (img1.isPosterLike && img2.isPosterLike) {
    return img1.width * img1.height > img2.width * img2.height ? img1 : img2;
  }

  // Stratégie 3 : Si aucune n'est poster-like, prendre celle avec le meilleur ratio portrait
  if (img1.isPortrait && img2.isPortrait) {
    // Plus le ratio est proche de 0.667 (2:3), mieux c'est
    const diff1 = Math.abs(img1.aspectRatio - 0.667);
    const diff2 = Math.abs(img2.aspectRatio - 0.667);
    return diff1 < diff2 ? img1 : img2;
  }

  // Stratégie 4 : Si une seule est portrait
  if (img1.isPortrait && !img2.isPortrait) return img1;
  if (img2.isPortrait && !img1.isPortrait) return img2;

  // Impossible de déterminer automatiquement
  return null;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  console.log("🔍 Analyze and Fix Poster Suffixes\n");
  console.log("=".repeat(60));
  console.log(`Mode: ${dryRun ? "DRY RUN" : "EXECUTE"}`);
  console.log("=".repeat(60));
  console.log();

  // Charger le rapport des conflits
  const conflictsPath = path.join(
    process.cwd(),
    "scripts",
    "conflicts-report.json",
  );
  const conflictsData = JSON.parse(fs.readFileSync(conflictsPath, "utf-8"));

  const pairs: ConflictPair[] = [];
  let autoDetected = 0;
  let manualNeeded = 0;
  let swapsNeeded = 0;

  console.log(
    `📊 Found ${Object.keys(conflictsData.conflicts).length} conflict groups\n`,
  );

  // Analyser chaque paire
  for (const [groupName, files] of Object.entries(
    conflictsData.conflicts as Record<string, any[]>,
  )) {
    if (files.length !== 2) continue;

    const file1Path = path.join(process.cwd(), "public", files[0].targetPath);
    const file2Path = path.join(process.cwd(), "public", files[1].targetPath);

    // Vérifier que les deux fichiers existent
    if (!fs.existsSync(file1Path) || !fs.existsSync(file2Path)) {
      console.log(`⚠️  ${groupName}: Files not found, skipping\n`);
      continue;
    }

    console.log(`🔍 Analyzing ${groupName}...`);
    console.log(`   Image 1: ${path.basename(file1Path)}`);
    console.log(`   Image 2: ${path.basename(file2Path)}`);

    const img1 = await analyzeImage(file1Path);
    const img2 = await analyzeImage(file2Path);

    if (!img1 || !img2) {
      console.log(`   ❌ Could not analyze images\n`);
      continue;
    }

    console.log(
      `   Image 1: ${img1.width}x${img1.height}, ratio: ${img1.aspectRatio.toFixed(2)}, ${img1.isPortrait ? "portrait" : "landscape"}, ${img1.isPosterLike ? "POSTER-LIKE" : "not poster"}`,
    );
    console.log(
      `   Image 2: ${img2.width}x${img2.height}, ratio: ${img2.aspectRatio.toFixed(2)}, ${img2.isPortrait ? "portrait" : "landscape"}, ${img2.isPosterLike ? "POSTER-LIKE" : "not poster"}`,
    );

    const posterImage = identifyPoster(img1, img2);

    if (posterImage) {
      const isPoster1 = posterImage.path === img1.path;
      console.log(
        `   ✅ Poster detected: Image ${isPoster1 ? "1" : "2"} (${path.basename(posterImage.path)})`,
      );
      autoDetected++;

      // Le fichier -1 devrait être le poster
      // Si le poster est Image 2, on doit inverser
      const needsSwap = !isPoster1;

      if (needsSwap) {
        console.log(`   🔄 NEEDS SWAP: Poster is Image 2, should be Image 1`);
        swapsNeeded++;
      } else {
        console.log(`   ✅ OK: Poster is already Image 1`);
      }

      pairs.push({
        conflictGroup: groupName,
        image1: img1,
        image2: img2,
        posterImage,
        needsSwap,
      });
    } else {
      console.log(`   ⚠️  Could not auto-detect poster, needs manual review`);
      manualNeeded++;

      pairs.push({
        conflictGroup: groupName,
        image1: img1,
        image2: img2,
        posterImage: null,
        needsSwap: false,
      });
    }

    console.log();
  }

  // Résumé
  console.log("\n" + "=".repeat(60));
  console.log("📊 ANALYSIS SUMMARY\n");
  console.log(`Total pairs:              ${pairs.length}`);
  console.log(`Auto-detected:            ${autoDetected}`);
  console.log(`Needs swap:               ${swapsNeeded}`);
  console.log(`Manual review needed:     ${manualNeeded}`);
  console.log("=".repeat(60));

  if (swapsNeeded > 0) {
    console.log("\n🔄 SWAPS TO PERFORM:\n");

    for (const pair of pairs) {
      if (pair.needsSwap) {
        const file1 = pair.image1.path;
        const file2 = pair.image2.path;
        const temp = file1.replace(/-1\.jpg$/, "-temp.jpg");

        console.log(`${pair.conflictGroup}:`);
        console.log(`  1. ${path.basename(file1)} → ${path.basename(temp)}`);
        console.log(`  2. ${path.basename(file2)} → ${path.basename(file1)}`);
        console.log(`  3. ${path.basename(temp)} → ${path.basename(file2)}`);

        if (!dryRun) {
          try {
            // Swap en 3 étapes
            fs.renameSync(file1, temp);
            fs.renameSync(file2, file1);
            fs.renameSync(temp, file2);

            console.log(`  ✅ Swapped successfully\n`);
          } catch (error) {
            console.log(`  ❌ Error swapping: ${error}\n`);
          }
        } else {
          console.log(`  [DRY RUN] Would swap\n`);
        }
      }
    }
  }

  if (manualNeeded > 0) {
    console.log("\n⚠️  MANUAL REVIEW NEEDED:\n");

    for (const pair of pairs) {
      if (!pair.posterImage) {
        console.log(`${pair.conflictGroup}:`);
        console.log(`  Image 1: ${path.basename(pair.image1.path)}`);
        console.log(
          `    ${pair.image1.width}x${pair.image1.height}, ratio: ${pair.image1.aspectRatio.toFixed(2)}`,
        );
        console.log(`  Image 2: ${path.basename(pair.image2.path)}`);
        console.log(
          `    ${pair.image2.width}x${pair.image2.height}, ratio: ${pair.image2.aspectRatio.toFixed(2)}`,
        );
        console.log();
      }
    }
  }

  if (dryRun && swapsNeeded > 0) {
    console.log("\n💡 To execute for real, run:");
    console.log(
      "  pnpm tsx scripts/analyze-and-fix-poster-suffixes.ts --execute",
    );
  } else if (!dryRun && swapsNeeded > 0) {
    console.log("\n✅ Swaps completed!");
  }

  await prisma.$disconnect();
}

main();
