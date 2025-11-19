/* eslint-disable no-console */
import fs from "fs";
import path from "path";
import { glob } from "glob";

/**
 * Script to create a mapping of JSON image paths to actual file paths
 * Handles:
 * - Case differences (LaurentDury.jpeg vs laurentdury.jpg)
 * - Extension differences (.jpeg, .jpg, .png, .webp)
 * - Missing files
 */

async function main() {
  console.log("🔍 Finding all image files...\n");

  // Get all images in public/images/projets
  const allImages = await glob(
    "public/images/projets/**/*.{jpg,jpeg,png,webp,gif}",
    {
      nocase: true,
    },
  );

  console.log(`Found ${allImages.length} image files\n`);

  // Create a normalized filename index for fast lookup
  const imageIndex = new Map<string, string>();

  allImages.forEach((imagePath: string) => {
    // Normalize for indexing: lowercase, no extension, no path
    const filename = path
      .basename(imagePath, path.extname(imagePath))
      .toLowerCase();
    const relativePath = imagePath.replace("public", "");

    // Also index by partial path (last 2 directories + filename)
    const parts = relativePath.split("/");
    const partialKey = parts.slice(-3).join("/").toLowerCase();

    imageIndex.set(filename, relativePath);
    imageIndex.set(partialKey, relativePath);
    imageIndex.set(relativePath.toLowerCase(), relativePath);
  });

  // Load JSON metadata
  const metadataPath = path.join(
    process.cwd(),
    "content/projets/fr/metadata.json",
  );
  const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));

  console.log("📊 Analyzing image paths...\n");

  const missingImages: string[] = [];
  const pathMapping = new Map<string, string>();

  // Check all image paths in metadata
  metadata.forEach((item: any, index: number) => {
    // Check cover image (src)
    if (item.src) {
      const found = findMatchingFile(item.src, imageIndex);
      if (found) {
        pathMapping.set(item.src, found);
      } else {
        missingImages.push(`[${index}] ${item.title}: ${item.src}`);
      }
    }

    // Check composer images
    if (item.compositeurs && Array.isArray(item.compositeurs)) {
      item.compositeurs.forEach((comp: any) => {
        if (comp.compoImg) {
          const found = findMatchingFile(comp.compoImg, imageIndex);
          if (found) {
            pathMapping.set(comp.compoImg, found);
          } else {
            missingImages.push(
              `[${index}] Composer ${comp.name}: ${comp.compoImg}`,
            );
          }
        }
      });
    }
  });

  console.log(`✅ Found matches for ${pathMapping.size} image paths`);
  console.log(`❌ Missing ${missingImages.length} images\n`);

  if (missingImages.length > 0) {
    console.log("Missing images:");
    missingImages.slice(0, 20).forEach((msg) => console.log(`  - ${msg}`));
    if (missingImages.length > 20) {
      console.log(`  ... and ${missingImages.length - 20} more`);
    }
    console.log();
  }

  // Generate TypeScript code for the mapping function
  console.log("📝 Generating path mapping function...\n");

  const mappingEntries = Array.from(pathMapping.entries())
    .map(([from, to]) => `  '${from}': '${to}',`)
    .join("\n");

  const code = `// Auto-generated image path mappings
// Run: tsx scripts/fix-image-paths.ts to regenerate

export const IMAGE_PATH_MAPPINGS: Record<string, string> = {
${mappingEntries}
}

export function normalizeImagePath(imagePath: string | undefined | null): string | null {
  if (!imagePath) return null

  // Check if we have an exact mapping
  if (IMAGE_PATH_MAPPINGS[imagePath]) {
    return IMAGE_PATH_MAPPINGS[imagePath]
  }

  // Fallback: try basic normalization
  let normalized = imagePath
    .replace('/images/portfolio/', '/images/projets/')
    .toLowerCase()

  // Check again with normalized path
  if (IMAGE_PATH_MAPPINGS[normalized]) {
    return IMAGE_PATH_MAPPINGS[normalized]
  }

  return normalized
}
`;

  // Write the mapping file
  const outputPath = path.join(process.cwd(), "lib/image-path-mappings.ts");
  fs.writeFileSync(outputPath, code, "utf-8");

  console.log(`✅ Generated mapping file: ${outputPath}`);
  console.log(
    `\n🎉 Done! Use the normalizeImagePath() function from lib/image-path-mappings.ts in your seed.`,
  );
}

function findMatchingFile(
  jsonPath: string,
  imageIndex: Map<string, string>,
): string | null {
  // Try exact match (case-insensitive)
  const exactMatch = imageIndex.get(jsonPath.toLowerCase());
  if (exactMatch) return exactMatch;

  // Try filename only (no path, no extension)
  const filename = path
    .basename(jsonPath, path.extname(jsonPath))
    .toLowerCase();
  const filenameMatch = imageIndex.get(filename);
  if (filenameMatch) return filenameMatch;

  // Try partial path (last 2-3 directories)
  const parts = jsonPath.split("/");
  const partial2 = parts.slice(-2).join("/").toLowerCase();
  const partial3 = parts.slice(-3).join("/").toLowerCase();

  const partial2Match = imageIndex.get(
    partial2.replace(path.extname(partial2), ""),
  );
  if (partial2Match) return partial2Match;

  const partial3Match = imageIndex.get(
    partial3.replace(path.extname(partial3), ""),
  );
  if (partial3Match) return partial3Match;

  return null;
}

main().catch(console.error);
