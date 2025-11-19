import sharp from "sharp";
import * as fs from "fs";
import * as path from "path";
import { glob } from "glob";

interface ImageInfo {
  path: string;
  filename: string;
  baseName: string;
  width: number;
  height: number;
  size: number;
  aspectRatio: number;
  isPortrait: boolean;
  isPosterLike: boolean;
}

interface ImageGroup {
  baseName: string;
  images: ImageInfo[];
  posterCandidate: ImageInfo | null;
  needsRenaming: boolean;
}

// Extraire le nom de base (sans suffixes numériques)
function extractBaseName(filename: string): string {
  const parsed = path.parse(filename);
  let name = parsed.name;

  // Supprimer les suffixes comme -1, -2, 2, 3, 4, etc.
  name = name.replace(/-\d+$/, ""); // -1, -2, etc.
  name = name.replace(/\d+$/, ""); // 2, 3, 4, etc.

  return name;
}

// Analyser une image
async function analyzeImage(imagePath: string): Promise<ImageInfo | null> {
  try {
    const stats = fs.statSync(imagePath);
    const metadata = await sharp(imagePath).metadata();

    const width = metadata.width || 0;
    const height = metadata.height || 0;
    const aspectRatio = width / height;
    const isPortrait = height > width;

    // Affiches : ratio 2:3 (0.667) ou proche
    const isPosterLike =
      isPortrait && aspectRatio >= 0.6 && aspectRatio <= 0.75;

    const filename = path.basename(imagePath);
    const baseName = extractBaseName(filename);

    return {
      path: imagePath,
      filename,
      baseName,
      width,
      height,
      size: stats.size,
      aspectRatio,
      isPortrait,
      isPosterLike,
    };
  } catch (error) {
    return null;
  }
}

// Déterminer quelle image est le poster
function identifyPoster(images: ImageInfo[]): ImageInfo | null {
  if (images.length === 0) return null;
  if (images.length === 1) return images[0];

  // Stratégie 1 : Prioriser les images poster-like
  const posterLikes = images.filter((img) => img.isPosterLike);
  if (posterLikes.length === 1) return posterLikes[0];
  if (posterLikes.length > 1) {
    // Prendre la plus haute résolution
    return posterLikes.reduce((best, current) =>
      current.width * current.height > best.width * best.height
        ? current
        : best,
    );
  }

  // Stratégie 2 : Prioriser les images portrait
  const portraits = images.filter((img) => img.isPortrait);
  if (portraits.length === 1) return portraits[0];
  if (portraits.length > 1) {
    // Prendre celle avec le meilleur ratio proche de 2:3
    return portraits.reduce((best, current) => {
      const diff1 = Math.abs(best.aspectRatio - 0.667);
      const diff2 = Math.abs(current.aspectRatio - 0.667);
      return diff2 < diff1 ? current : best;
    });
  }

  // Par défaut : prendre la première
  return images[0];
}

async function main() {
  console.log("🔍 Identify Poster Image Groups\n");
  console.log("=".repeat(60));

  // Trouver tous les JPG
  const allFiles = await glob(
    "/Users/yoannandrieux/Projets/synck/public/images/projets/**/*.jpg",
    { nodir: true },
  );

  console.log(`Found ${allFiles.length} JPG files\n`);

  // Analyser toutes les images
  console.log("📊 Analyzing all images...\n");
  const analyzedImages: ImageInfo[] = [];

  for (const file of allFiles) {
    const info = await analyzeImage(file);
    if (info) {
      analyzedImages.push(info);
    }
  }

  console.log(`✅ Analyzed ${analyzedImages.length} images\n`);

  // Grouper par nom de base
  const groups = new Map<string, ImageInfo[]>();

  for (const img of analyzedImages) {
    const existing = groups.get(img.baseName) || [];
    existing.push(img);
    groups.set(img.baseName, existing);
  }

  console.log(`📦 Found ${groups.size} unique base names\n`);

  // Filtrer pour ne garder que les groupes avec plusieurs images
  const multipleGroups = Array.from(groups.entries())
    .filter(([_, images]) => images.length > 1)
    .map(([baseName, images]): ImageGroup => {
      const posterCandidate = identifyPoster(images);
      return {
        baseName,
        images,
        posterCandidate,
        needsRenaming: false,
      };
    });

  console.log(
    `🔍 Found ${multipleGroups.length} groups with multiple images\n`,
  );
  console.log("=".repeat(60));
  console.log();

  // Afficher les groupes
  for (const group of multipleGroups) {
    console.log(
      `\n📁 Group: ${group.baseName} (${group.images.length} images)`,
    );

    for (let i = 0; i < group.images.length; i++) {
      const img = group.images[i];
      const isPoster = group.posterCandidate?.path === img.path;

      console.log(`   ${i + 1}. ${img.filename} ${isPoster ? "← POSTER" : ""}`);
      console.log(
        `      ${img.width}x${img.height}, ratio: ${img.aspectRatio.toFixed(2)}, ${img.isPortrait ? "portrait" : "landscape"}${img.isPosterLike ? ", POSTER-LIKE" : ""}`,
      );
    }
  }

  // Résumé
  console.log("\n" + "=".repeat(60));
  console.log("📊 SUMMARY\n");
  console.log(`Total images:           ${analyzedImages.length}`);
  console.log(`Unique base names:      ${groups.size}`);
  console.log(`Groups with multiples:  ${multipleGroups.length}`);

  // Compter combien ont un poster détecté
  const withPoster = multipleGroups.filter((g) => g.posterCandidate !== null);
  console.log(`Auto-detected posters:  ${withPoster.length}`);
  console.log("=".repeat(60));

  // Sauvegarder le rapport
  const reportPath = path.join(
    process.cwd(),
    "scripts",
    "poster-groups-report.json",
  );

  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        totalImages: analyzedImages.length,
        uniqueBaseNames: groups.size,
        multipleGroups: multipleGroups.map((g) => ({
          baseName: g.baseName,
          images: g.images.map((img) => ({
            filename: img.filename,
            path: img.path,
            dimensions: `${img.width}x${img.height}`,
            aspectRatio: img.aspectRatio,
            isPortrait: img.isPortrait,
            isPosterLike: img.isPosterLike,
            isPoster: g.posterCandidate?.path === img.path,
          })),
        })),
      },
      null,
      2,
    ),
  );

  console.log(`\n✅ Report saved to: scripts/poster-groups-report.json`);
}

main();
