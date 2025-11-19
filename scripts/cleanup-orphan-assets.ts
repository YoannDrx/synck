import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  console.log("🧹 Cleanup Orphan Assets\n");
  console.log("=".repeat(60));
  console.log(`Mode: ${dryRun ? "DRY RUN" : "EXECUTE"}`);
  console.log("=".repeat(60));
  console.log();

  // Charger le rapport d'audit
  const auditPath = path.join(process.cwd(), "scripts", "audit-report.json");
  const audit = JSON.parse(fs.readFileSync(auditPath, "utf-8"));

  const onlyInDb = audit.onlyInDb as string[];
  console.log(`Found ${onlyInDb.length} orphan assets in database\n`);

  let deleted = 0;

  for (const assetPath of onlyInDb) {
    console.log(`Delete: ${assetPath}`);

    if (!dryRun) {
      try {
        await prisma.asset.delete({
          where: { path: assetPath },
        });
        deleted++;
        console.log("  ✅ Deleted\n");
      } catch (error) {
        console.log(`  ❌ Error: ${error}\n`);
      }
    } else {
      console.log("  [DRY RUN] Would delete\n");
      deleted++;
    }
  }

  console.log("=".repeat(60));
  console.log(`Deleted: ${deleted} ${dryRun ? "(dry run)" : ""}`);
  console.log("=".repeat(60));

  if (dryRun) {
    console.log(
      "\n💡 To execute: pnpm tsx scripts/cleanup-orphan-assets.ts --execute",
    );
  } else {
    console.log("\n✅ Cleanup complete!");
  }

  await prisma.$disconnect();
}

main();
