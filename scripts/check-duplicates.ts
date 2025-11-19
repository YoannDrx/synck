import * as fs from "fs";
import * as crypto from "crypto";
import * as path from "path";

interface ConflictsReport {
  conflicts: { [key: string]: Array<{ currentPath: string }> };
}

function getMD5(filePath: string): string {
  const content = fs.readFileSync(filePath);
  return crypto.createHash("md5").update(content).digest("hex");
}

async function main() {
  const conflictsPath = path.join(
    process.cwd(),
    "scripts",
    "conflicts-report.json",
  );
  const conflicts: ConflictsReport = JSON.parse(
    fs.readFileSync(conflictsPath, "utf-8"),
  );

  console.log("🔍 Checking if conflicting files are duplicates...\n");

  let identicalCount = 0;
  let differentCount = 0;

  for (const [groupName, files] of Object.entries(conflicts.conflicts)) {
    if (files.length !== 2) continue;

    const file1Path = path.join(process.cwd(), "public", files[0].currentPath);
    const file2Path = path.join(process.cwd(), "public", files[1].currentPath);

    if (!fs.existsSync(file1Path) || !fs.existsSync(file2Path)) {
      console.log(`⚠️  ${groupName}: One or both files missing`);
      continue;
    }

    const hash1 = getMD5(file1Path);
    const hash2 = getMD5(file2Path);

    if (hash1 === hash2) {
      identicalCount++;
      console.log(`✅ ${groupName}: IDENTICAL (can keep one, delete other)`);
    } else {
      differentCount++;
      console.log(`⚠️  ${groupName}: DIFFERENT (keep both with numbering)`);
      console.log(`   ${files[0].currentPath}`);
      console.log(`   ${files[1].currentPath}`);
    }
  }

  console.log(`\n📊 SUMMARY:`);
  console.log(
    `  Identical duplicates: ${identicalCount} (can delete one copy)`,
  );
  console.log(
    `  Different files:      ${differentCount} (keep both with numbering)`,
  );
}

main();
