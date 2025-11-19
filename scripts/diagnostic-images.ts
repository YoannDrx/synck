import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import { glob } from "glob";

const prisma = new PrismaClient();

interface DiagnosticResult {
  timestamp: string;
  summary: {
    totalAssets: number;
    totalRealFiles: number;
    obsoletePaths: number;
    missingFiles: number;
    caseIssues: number;
    extensionIssues: number;
    orphanAssets: number;
    untrackedFiles: number;
  };
  problems: {
    obsoletePaths: Array<{ id: string; path: string; suggested: string }>;
    missingFiles: Array<{
      id: string;
      path: string;
      possibleMatches: string[];
    }>;
    caseIssues: Array<{
      id: string;
      dbPath: string;
      realPath: string;
      issue: string;
    }>;
    extensionIssues: Array<{
      id: string;
      dbPath: string;
      realPath: string;
      issue: string;
    }>;
    orphanAssets: Array<{ id: string; path: string; reason: string }>;
    untrackedFiles: string[];
  };
  realFiles: {
    total: number;
    byExtension: Record<string, number>;
    byCategory: Record<string, number>;
  };
}

async function generateRealFilesIndex(): Promise<{
  filesMap: Map<string, string>;
  allFiles: string[];
}> {
  console.log("📂 Scanning real files...");

  const files = await glob(
    "public/images/projets/**/*.{jpg,jpeg,png,JPG,JPEG,PNG,gif,GIF,webp,WEBP}",
    {
      nocase: false, // Case-sensitive
      absolute: false,
    },
  );

  const filesMap = new Map<string, string>();

  for (const file of files) {
    const relativePath = "/" + file.replace("public/", "");
    const basename = path.basename(relativePath);

    // Index par chemin complet
    filesMap.set(relativePath, relativePath);
    filesMap.set(relativePath.toLowerCase(), relativePath);

    // Index par nom de fichier
    filesMap.set(basename, relativePath);
    filesMap.set(basename.toLowerCase(), relativePath);
  }

  console.log(`✅ Found ${files.length} real files`);

  return {
    filesMap,
    allFiles: files.map((f) => "/" + f.replace("public/", "")),
  };
}

function findPossibleMatches(
  dbPath: string,
  filesMap: Map<string, string>,
): string[] {
  const matches: string[] = [];
  const basename = path.basename(dbPath);
  const dirname = path.dirname(dbPath);

  // 1. Exact match (case-insensitive)
  const exactMatch = filesMap.get(dbPath.toLowerCase());
  if (exactMatch && exactMatch !== dbPath) {
    matches.push(exactMatch);
  }

  // 2. Same basename, different case
  const basenameMatch = filesMap.get(basename.toLowerCase());
  if (basenameMatch) {
    matches.push(basenameMatch);
  }

  // 3. Different extension (.jpeg ↔ .jpg, .JPG)
  const nameWithoutExt = path.parse(basename).name;
  const extensions = [".jpg", ".JPG", ".jpeg", ".JPEG", ".png", ".PNG"];

  for (const ext of extensions) {
    const variant = path.join(dirname, nameWithoutExt + ext);
    const variantMatch = filesMap.get(variant);
    if (variantMatch) {
      matches.push(variantMatch);
    }
  }

  // Remove duplicates
  return [...new Set(matches)];
}

async function diagnose(): Promise<DiagnosticResult> {
  console.log("🔍 Starting diagnostic...\n");

  const { filesMap, allFiles } = await generateRealFilesIndex();

  // Fetch all assets from DB
  console.log("📊 Fetching assets from database...");
  const assets = await prisma.asset.findMany({
    include: {
      workCover: { select: { id: true } },
      workImages: { select: { id: true } },
      composerImages: { select: { id: true } },
      categoryImages: { select: { id: true } },
      labelImages: { select: { id: true } },
      expertiseImages: { select: { id: true } },
      expertiseCover: { select: { id: true } },
    },
  });

  console.log(`✅ Found ${assets.length} assets in database\n`);

  const result: DiagnosticResult = {
    timestamp: new Date().toISOString(),
    summary: {
      totalAssets: assets.length,
      totalRealFiles: allFiles.length,
      obsoletePaths: 0,
      missingFiles: 0,
      caseIssues: 0,
      extensionIssues: 0,
      orphanAssets: 0,
      untrackedFiles: 0,
    },
    problems: {
      obsoletePaths: [],
      missingFiles: [],
      caseIssues: [],
      extensionIssues: [],
      orphanAssets: [],
      untrackedFiles: [],
    },
    realFiles: {
      total: allFiles.length,
      byExtension: {},
      byCategory: {},
    },
  };

  // Track which files are referenced in DB
  const trackedFiles = new Set<string>();

  // Analyze each asset
  for (const asset of assets) {
    // Check for obsolete /images/portfolio/ prefix
    if (asset.path.includes("/images/portfolio/")) {
      result.summary.obsoletePaths++;
      result.problems.obsoletePaths.push({
        id: asset.id,
        path: asset.path,
        suggested: asset.path.replace("/images/portfolio/", "/images/projets/"),
      });
    }

    // Check if file exists
    const fullPath = path.join(process.cwd(), "public", asset.path);
    const fileExists = fs.existsSync(fullPath);

    if (!fileExists) {
      result.summary.missingFiles++;

      const possibleMatches = findPossibleMatches(asset.path, filesMap);

      result.problems.missingFiles.push({
        id: asset.id,
        path: asset.path,
        possibleMatches,
      });

      // Check for case issues
      const caseMatch = filesMap.get(asset.path.toLowerCase());
      if (caseMatch && caseMatch !== asset.path) {
        result.summary.caseIssues++;
        result.problems.caseIssues.push({
          id: asset.id,
          dbPath: asset.path,
          realPath: caseMatch,
          issue: "Case mismatch",
        });
      }

      // Check for extension issues
      const withJpg = asset.path.replace(/\.jpeg$/i, ".jpg");
      const withJPG = asset.path.replace(/\.jpg$/i, ".JPG");
      if (filesMap.has(withJpg) && withJpg !== asset.path) {
        result.summary.extensionIssues++;
        result.problems.extensionIssues.push({
          id: asset.id,
          dbPath: asset.path,
          realPath: withJpg,
          issue: ".jpeg → .jpg",
        });
      } else if (filesMap.has(withJPG) && withJPG !== asset.path) {
        result.summary.extensionIssues++;
        result.problems.extensionIssues.push({
          id: asset.id,
          dbPath: asset.path,
          realPath: withJPG,
          issue: ".jpg → .JPG",
        });
      }
    } else {
      trackedFiles.add(asset.path);
    }

    // Check for orphan assets (no relations)
    const hasRelations =
      asset.workCover.length > 0 ||
      asset.workImages.length > 0 ||
      asset.composerImages.length > 0 ||
      asset.categoryImages.length > 0 ||
      asset.labelImages.length > 0 ||
      asset.expertiseImages.length > 0 ||
      asset.expertiseCover.length > 0;

    if (!hasRelations && !fileExists) {
      result.summary.orphanAssets++;
      result.problems.orphanAssets.push({
        id: asset.id,
        path: asset.path,
        reason: "No relations and file missing",
      });
    }
  }

  // Find untracked files
  for (const file of allFiles) {
    if (!trackedFiles.has(file)) {
      result.problems.untrackedFiles.push(file);
      result.summary.untrackedFiles++;
    }
  }

  // Stats by extension
  for (const file of allFiles) {
    const ext = path.extname(file);
    result.realFiles.byExtension[ext] =
      (result.realFiles.byExtension[ext] || 0) + 1;
  }

  // Stats by category
  for (const file of allFiles) {
    const parts = file.split("/");
    if (parts.length >= 4) {
      const category = parts[3]; // /images/projets/[CATEGORY]/
      result.realFiles.byCategory[category] =
        (result.realFiles.byCategory[category] || 0) + 1;
    }
  }

  return result;
}

async function main() {
  try {
    const result = await diagnose();

    // Save to file
    const outputPath = path.join(
      process.cwd(),
      "scripts",
      "diagnostic-report.json",
    );
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));

    console.log("\n📊 DIAGNOSTIC REPORT\n");
    console.log("=".repeat(60));

    console.log("\n📈 SUMMARY:");
    console.log(`  Total assets in DB:     ${result.summary.totalAssets}`);
    console.log(`  Total real files:       ${result.summary.totalRealFiles}`);
    console.log(`  Untracked files:        ${result.summary.untrackedFiles}`);
    console.log("\n🚨 PROBLEMS:");
    console.log(
      `  Obsolete paths:         ${result.summary.obsoletePaths} (/images/portfolio/)`,
    );
    console.log(
      `  Missing files:          ${result.summary.missingFiles} (404)`,
    );
    console.log(
      `  Case issues:            ${result.summary.caseIssues} (pgo vs PGO)`,
    );
    console.log(
      `  Extension issues:       ${result.summary.extensionIssues} (.jpg vs .JPG)`,
    );
    console.log(
      `  Orphan assets:          ${result.summary.orphanAssets} (no relations + missing)`,
    );

    console.log("\n📁 FILES BY CATEGORY:");
    Object.entries(result.realFiles.byCategory)
      .sort(([, a], [, b]) => b - a)
      .forEach(([category, count]) => {
        console.log(`  ${category.padEnd(20)} ${count}`);
      });

    console.log("\n📎 FILES BY EXTENSION:");
    Object.entries(result.realFiles.byExtension)
      .sort(([, a], [, b]) => b - a)
      .forEach(([ext, count]) => {
        console.log(`  ${ext.padEnd(10)} ${count}`);
      });

    if (result.problems.obsoletePaths.length > 0) {
      console.log("\n🔴 OBSOLETE PATHS (sample):");
      result.problems.obsoletePaths.slice(0, 5).forEach((p) => {
        console.log(`  ${p.path}`);
        console.log(`  → ${p.suggested}\n`);
      });
    }

    if (result.problems.missingFiles.length > 0) {
      console.log("\n⚠️  MISSING FILES (sample):");
      result.problems.missingFiles.slice(0, 5).forEach((m) => {
        console.log(`  ${m.path}`);
        if (m.possibleMatches.length > 0) {
          console.log(`    Possible matches:`);
          m.possibleMatches.forEach((match) => {
            console.log(`    - ${match}`);
          });
        }
        console.log();
      });
    }

    console.log("\n=".repeat(60));
    console.log(`\n📄 Full report saved to: ${outputPath}\n`);
  } catch (error) {
    console.error("❌ Error during diagnostic:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
