import sharp from "sharp";
import * as fs from "fs";
import * as path from "path";

interface PNGReport {
  pngWithTransparency: Array<{ currentPath: string }>;
  pngToConvert: Array<{ currentPath: string; targetPath: string }>;
}

async function convertPngToJpg(inputPath: string, outputPath: string) {
  await sharp(inputPath)
    .flatten({ background: { r: 255, g: 255, b: 255 } }) // Fond blanc
    .jpeg({ quality: 85 }) // Qualité 85%
    .toFile(outputPath);
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  const reportPath = path.join(
    process.cwd(),
    "scripts",
    "png-transparency-report.json",
  );
  const report: PNGReport = JSON.parse(fs.readFileSync(reportPath, "utf-8"));

  console.log("🎨 PNG to JPG Conversion\n");
  console.log("=".repeat(60));
  console.log(
    `PNG with transparency (kept):  ${report.pngWithTransparency.length}`,
  );
  console.log(`PNG to convert to JPG:         ${report.pngToConvert.length}`);
  console.log("=".repeat(60));

  if (dryRun) {
    console.log("\n🔍 DRY RUN MODE - No files will be modified\n");
  }

  if (report.pngToConvert.length === 0) {
    console.log("\n✅ No PNG files to convert!");
    return;
  }

  console.log("\n🔄 Converting PNG to JPG...\n");

  for (const file of report.pngToConvert) {
    const inputPath = path.join(process.cwd(), "public", file.currentPath);
    const outputPath = path
      .join(process.cwd(), "public", file.currentPath)
      .replace(/\.png$/i, ".jpg");

    console.log(`Converting: ${file.currentPath}`);
    console.log(
      `       → ${outputPath.replace(process.cwd() + "/public", "")}`,
    );

    if (!dryRun) {
      try {
        await convertPngToJpg(inputPath, outputPath);

        // Supprimer l'original PNG après conversion réussie
        fs.unlinkSync(inputPath);

        console.log("  ✅ Converted and original deleted\n");
      } catch (error) {
        console.error(`  ❌ Error converting ${file.currentPath}:`, error);
      }
    } else {
      console.log("  [DRY RUN] Would convert and delete original\n");
    }
  }

  console.log("\n✅ Conversion complete!");
  console.log(`\n📊 Summary:`);
  console.log(
    `  Converted:  ${dryRun ? "0 (dry run)" : report.pngToConvert.length}`,
  );
  console.log(
    `  Preserved:  ${report.pngWithTransparency.length} (transparency)`,
  );
}

main();
