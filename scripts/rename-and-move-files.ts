import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

interface FileInfo {
  currentPath: string;
  targetPath: string;
  needsRename: boolean;
  needsMove: boolean;
  conflictGroup: string | null;
  conflictNumber: number | null;
}

interface NormalizationPlan {
  filesToProcess: FileInfo[];
  conflicts: { [key: string]: FileInfo[] };
}

interface ConflictsReport {
  conflicts: { [key: string]: FileInfo[] };
}

function getMD5(filePath: string): string {
  const content = fs.readFileSync(filePath);
  return crypto.createHash("md5").update(content).digest("hex");
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const execute = process.argv.includes("--execute");

  if (!dryRun && !execute) {
    console.error("❌ Please specify --dry-run or --execute");
    console.log("\nUsage:");
    console.log("  pnpm tsx scripts/rename-and-move-files.ts --dry-run");
    console.log("  pnpm tsx scripts/rename-and-move-files.ts --execute");
    process.exit(1);
  }

  // Charger les plans
  const planPath = path.join(
    process.cwd(),
    "scripts",
    "normalization-plan.json",
  );
  const plan: NormalizationPlan = JSON.parse(
    fs.readFileSync(planPath, "utf-8"),
  );

  const conflictsPath = path.join(
    process.cwd(),
    "scripts",
    "conflicts-report.json",
  );
  const conflictsReport: ConflictsReport = JSON.parse(
    fs.readFileSync(conflictsPath, "utf-8"),
  );

  console.log("🔄 File Renaming and Moving\n");
  console.log("=".repeat(60));
  console.log(`Total files to process:    ${plan.filesToProcess.length}`);
  console.log(`Mode:                      ${dryRun ? "DRY RUN" : "EXECUTE"}`);
  console.log("=".repeat(60));
  console.log();

  if (dryRun) {
    console.log("🔍 DRY RUN MODE - No files will be modified\n");
  } else {
    console.log("⚠️  EXECUTE MODE - Files WILL be modified\n");
  }

  let renamedCount = 0;
  let movedCount = 0;
  let deletedCount = 0;
  let conflictsProcessedCount = 0;
  const errors: string[] = [];

  // Étape 1 : Identifier et supprimer les duplicatas identiques
  console.log("📋 Step 1: Processing conflicts and duplicates\n");

  const identicalDuplicates: string[] = [];

  for (const [groupName, files] of Object.entries(conflictsReport.conflicts)) {
    if (files.length !== 2) continue;

    const file1 = files[0];
    const file2 = files[1];

    const file1FullPath = path.join(process.cwd(), "public", file1.currentPath);
    const file2FullPath = path.join(process.cwd(), "public", file2.currentPath);

    if (!fs.existsSync(file1FullPath) || !fs.existsSync(file2FullPath)) {
      console.log(`⚠️  ${groupName}: One or both files missing, skipping`);
      continue;
    }

    const hash1 = getMD5(file1FullPath);
    const hash2 = getMD5(file2FullPath);

    if (hash1 === hash2) {
      // Duplicata identique : supprimer la version à la racine de /documentaires/
      const rootFile = file1.currentPath.includes("/documentaires/13prods/")
        ? file2
        : file1;
      const keepFile = file1.currentPath.includes("/documentaires/13prods/")
        ? file1
        : file2;

      console.log(`✅ ${groupName}: Identical duplicate detected`);
      console.log(`   DELETE: ${rootFile.currentPath}`);
      console.log(`   KEEP:   ${keepFile.currentPath}`);

      identicalDuplicates.push(rootFile.currentPath);

      if (execute) {
        const fileToDelete = path.join(
          process.cwd(),
          "public",
          rootFile.currentPath,
        );
        try {
          fs.unlinkSync(fileToDelete);
          deletedCount++;
          console.log("   ✅ Deleted\n");
        } catch (error) {
          errors.push(`Failed to delete ${rootFile.currentPath}: ${error}`);
          console.log(`   ❌ Error: ${error}\n`);
        }
      } else {
        console.log("   [DRY RUN] Would delete\n");
      }
    } else {
      // Fichiers différents : on garde les deux avec numérotation (déjà dans le plan)
      console.log(
        `⚠️  ${groupName}: Different files, keeping both with numbering`,
      );
      console.log(`   [1] ${file1.currentPath} → ${file1.targetPath}`);
      console.log(`   [2] ${file2.currentPath} → ${file2.targetPath}\n`);
      conflictsProcessedCount += 2;
    }
  }

  console.log(
    `📊 Duplicates summary: ${identicalDuplicates.length} identical duplicates ${execute ? "deleted" : "to delete"}\n`,
  );

  // Étape 2 : Renommer et déplacer tous les fichiers
  console.log("📋 Step 2: Renaming and moving files\n");

  for (const file of plan.filesToProcess) {
    // Skip files qui ont été supprimés (duplicatas identiques)
    if (identicalDuplicates.includes(file.currentPath)) {
      continue;
    }

    const currentFullPath = path.join(
      process.cwd(),
      "public",
      file.currentPath,
    );
    const targetFullPath = path.join(process.cwd(), "public", file.targetPath);

    // Skip si aucun changement nécessaire
    if (!file.needsRename && !file.needsMove) {
      continue;
    }

    // Skip si le fichier est déjà au bon emplacement avec le bon nom
    if (currentFullPath === targetFullPath) {
      continue;
    }

    // Vérifier que le fichier source existe
    if (!fs.existsSync(currentFullPath)) {
      console.log(`⚠️  File not found, skipping: ${file.currentPath}`);
      continue;
    }

    // Vérifier que le fichier cible n'existe pas déjà
    // Exception : si c'est juste une différence de casse (case-insensitive FS sur macOS)
    if (
      fs.existsSync(targetFullPath) &&
      currentFullPath.toLowerCase() !== targetFullPath.toLowerCase()
    ) {
      errors.push(`Target already exists: ${file.targetPath}`);
      console.log(`❌ Target already exists: ${file.targetPath}`);
      continue;
    }

    // Créer le dossier cible si nécessaire
    const targetDir = path.dirname(targetFullPath);
    if (!fs.existsSync(targetDir)) {
      if (execute) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
    }

    // Afficher l'opération
    if (file.needsRename && file.needsMove) {
      console.log(`🔄 RENAME + MOVE: ${file.currentPath}`);
      console.log(`              → ${file.targetPath}`);
    } else if (file.needsRename) {
      console.log(`📝 RENAME: ${file.currentPath}`);
      console.log(`       → ${file.targetPath}`);
    } else if (file.needsMove) {
      console.log(`📂 MOVE: ${file.currentPath}`);
      console.log(`     → ${file.targetPath}`);
    }

    // Exécuter l'opération
    if (execute) {
      try {
        fs.renameSync(currentFullPath, targetFullPath);

        if (file.needsRename) renamedCount++;
        if (file.needsMove) movedCount++;

        console.log("  ✅ Done\n");
      } catch (error) {
        errors.push(`Failed to rename/move ${file.currentPath}: ${error}`);
        console.log(`  ❌ Error: ${error}\n`);
      }
    } else {
      console.log("  [DRY RUN] Would rename/move\n");
    }
  }

  // Résumé final
  console.log("\n" + "=".repeat(60));
  console.log("📊 FINAL SUMMARY\n");
  console.log(`Mode:                ${dryRun ? "DRY RUN" : "EXECUTE"}`);
  console.log(
    `Files renamed:       ${execute ? renamedCount : "N/A (dry run)"}`,
  );
  console.log(`Files moved:         ${execute ? movedCount : "N/A (dry run)"}`);
  console.log(
    `Duplicates deleted:  ${execute ? deletedCount : identicalDuplicates.length + " (dry run)"}`,
  );
  console.log(
    `Conflicts processed: ${execute ? conflictsProcessedCount : "N/A (dry run)"}`,
  );
  console.log(`Errors:              ${errors.length}`);
  console.log("=".repeat(60));

  if (errors.length > 0) {
    console.log("\n❌ ERRORS:\n");
    errors.forEach((error) => console.log(`  - ${error}`));
  }

  if (execute) {
    console.log("\n✅ File renaming and moving completed!");
    console.log("\n💡 Next steps:");
    console.log("  1. Verify files with: find public/images/projets -type f");
    console.log("  2. Run update-db-asset-paths.ts to update database");
  } else {
    console.log("\n✅ Dry run completed!");
    console.log("\n💡 To execute for real, run:");
    console.log("  pnpm tsx scripts/rename-and-move-files.ts --execute");
  }
}

main();
