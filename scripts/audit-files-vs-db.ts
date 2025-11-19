import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import { glob } from "glob";

const prisma = new PrismaClient();

interface AuditResult {
  localFiles: Set<string>;
  dbAssets: Set<string>;
  onlyInLocal: string[];
  onlyInDb: string[];
  inBoth: string[];
  invalidNames: string[]; // Fichiers qui ne commencent pas par minuscule
}

async function main() {
  console.log("🔍 Audit: Local Files vs Neon Database\n");
  console.log("=".repeat(60));

  const result: AuditResult = {
    localFiles: new Set(),
    dbAssets: new Set(),
    onlyInLocal: [],
    onlyInDb: [],
    inBoth: [],
    invalidNames: [],
  };

  // 1. Scanner tous les fichiers locaux
  console.log("📁 Step 1: Scanning local files...\n");

  const localFiles = await glob(
    "/Users/yoannandrieux/Projets/synck/public/images/projets/**/*.{jpg,jpeg,png}",
    { nodir: true },
  );

  console.log(`Found ${localFiles.length} local files\n`);

  for (const file of localFiles) {
    // Convertir en path relatif depuis /public
    const relativePath = file.replace(
      "/Users/yoannandrieux/Projets/synck/public",
      "",
    );
    result.localFiles.add(relativePath);

    // Vérifier si le nom de fichier commence par une minuscule
    const filename = path.basename(file);
    const firstChar = filename.charAt(0);
    if (firstChar !== firstChar.toLowerCase() && /[A-Z]/.test(firstChar)) {
      result.invalidNames.push(relativePath);
    }
  }

  // 2. Récupérer tous les assets de la DB
  console.log("💾 Step 2: Fetching database assets...\n");

  const dbAssets = await prisma.asset.findMany({
    select: {
      id: true,
      path: true,
    },
  });

  console.log(`Found ${dbAssets.length} assets in database\n`);

  for (const asset of dbAssets) {
    result.dbAssets.add(asset.path);
  }

  // 3. Comparer
  console.log("🔄 Step 3: Comparing...\n");

  // Fichiers seulement en local (pas en DB)
  for (const file of result.localFiles) {
    if (!result.dbAssets.has(file)) {
      result.onlyInLocal.push(file);
    } else {
      result.inBoth.push(file);
    }
  }

  // Assets seulement en DB (fichier n'existe pas)
  for (const asset of result.dbAssets) {
    if (!result.localFiles.has(asset)) {
      result.onlyInDb.push(asset);
    }
  }

  // 4. Afficher le rapport
  console.log("=".repeat(60));
  console.log("📊 AUDIT REPORT\n");
  console.log(`Local files:              ${result.localFiles.size}`);
  console.log(`Database assets:          ${result.dbAssets.size}`);
  console.log(`In sync (both):           ${result.inBoth.length}`);
  console.log(`Only in local:            ${result.onlyInLocal.length}`);
  console.log(`Only in DB (missing):     ${result.onlyInDb.length}`);
  console.log(`Invalid names (uppercase):${result.invalidNames.length}`);
  console.log("=".repeat(60));

  if (result.invalidNames.length > 0) {
    console.log("\n⚠️  FILES WITH UPPERCASE NAMES:\n");
    result.invalidNames.slice(0, 20).forEach((file) => {
      console.log(`  ${file}`);
    });
    if (result.invalidNames.length > 20) {
      console.log(`  ... and ${result.invalidNames.length - 20} more`);
    }
  }

  if (result.onlyInLocal.length > 0) {
    console.log("\n📁 FILES ONLY IN LOCAL (not in DB):\n");
    result.onlyInLocal.slice(0, 30).forEach((file) => {
      console.log(`  ${file}`);
    });
    if (result.onlyInLocal.length > 30) {
      console.log(`  ... and ${result.onlyInLocal.length - 30} more`);
    }
  }

  if (result.onlyInDb.length > 0) {
    console.log("\n💾 ASSETS ONLY IN DB (file missing):\n");
    result.onlyInDb.slice(0, 30).forEach((asset) => {
      console.log(`  ${asset}`);
    });
    if (result.onlyInDb.length > 30) {
      console.log(`  ... and ${result.onlyInDb.length - 30} more`);
    }
  }

  // Sauvegarder le rapport détaillé
  const reportPath = path.join(process.cwd(), "scripts", "audit-report.json");
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        summary: {
          localFiles: result.localFiles.size,
          dbAssets: result.dbAssets.size,
          inBoth: result.inBoth.length,
          onlyInLocal: result.onlyInLocal.length,
          onlyInDb: result.onlyInDb.length,
          invalidNames: result.invalidNames.length,
        },
        onlyInLocal: result.onlyInLocal,
        onlyInDb: result.onlyInDb,
        invalidNames: result.invalidNames,
      },
      null,
      2,
    ),
  );

  console.log(`\n✅ Full report saved to: scripts/audit-report.json`);

  await prisma.$disconnect();
}

main();
