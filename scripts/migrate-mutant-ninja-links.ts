import { Client } from "pg";
import { createId } from "@paralleldrive/cuid2";

const PROJECT_ID = "old-brook-39127538";
const MAIN_BRANCH = "br-silent-math-agucrpx0";
const DEV_BRANCH = "br-bitter-hall-agarmlx6";

async function getConnectionString(branchId: string): Promise<string> {
  const { exec } = await import("child_process");
  const { promisify } = await import("util");
  const execAsync = promisify(exec);

  const { stdout } = await execAsync(
    `neon connection-string ${branchId} --project-id ${PROJECT_ID}`,
  );
  return stdout.trim();
}

async function main() {
  console.log("🔄 Migrating Mutant Ninja Links from MAIN to DEV\n");
  console.log("=".repeat(80));

  // Connect to MAIN to get Mutant Ninja links
  console.log("\n📊 Step 1: Fetching Mutant Ninja links from MAIN...");
  const mainConnectionString = await getConnectionString(MAIN_BRANCH);
  const mainClient = new Client({ connectionString: mainConnectionString });
  await mainClient.connect();

  let mutantNinjaId: string;
  let links: Array<{
    platform: string;
    url: string;
    label: string | null;
    order: number;
  }> = [];

  try {
    // Get Mutant Ninja composer
    const composerResult = await mainClient.query(
      `SELECT * FROM "Composer" WHERE slug = 'mutant-ninja-records'`,
    );

    if (composerResult.rows.length === 0) {
      console.log("❌ Mutant Ninja Records not found in MAIN");
      await mainClient.end();
      return;
    }

    mutantNinjaId = composerResult.rows[0].id;
    console.log(`✅ Found Mutant Ninja Records (ID: ${mutantNinjaId})`);

    // Get all links
    const linksResult = await mainClient.query(
      `SELECT platform, url, label, "order" FROM "ComposerLink" WHERE "composerId" = $1 ORDER BY "order" ASC`,
      [mutantNinjaId],
    );

    links = linksResult.rows;
    console.log(`✅ Found ${links.length} links:`);
    links.forEach((link) => {
      console.log(
        `   - ${link.platform}: ${link.url} ${link.label ? `(${link.label})` : ""}`,
      );
    });
  } finally {
    await mainClient.end();
  }

  if (links.length === 0) {
    console.log("\n⚠️  No links to migrate");
    return;
  }

  // Connect to DEV to insert links
  console.log("\n📊 Step 2: Inserting links into DEV...");
  const devConnectionString = await getConnectionString(DEV_BRANCH);
  const devClient = new Client({ connectionString: devConnectionString });
  await devClient.connect();

  try {
    // Get Mutant Ninja composer in DEV
    const composerResult = await devClient.query(
      `SELECT * FROM "Composer" WHERE slug = 'mutant-ninja-records'`,
    );

    if (composerResult.rows.length === 0) {
      console.log("❌ Mutant Ninja Records not found in DEV");
      await devClient.end();
      return;
    }

    const devMutantNinjaId = composerResult.rows[0].id;
    console.log(
      `✅ Found Mutant Ninja Records in DEV (ID: ${devMutantNinjaId})`,
    );

    // Check if links already exist
    const existingLinksResult = await devClient.query(
      `SELECT COUNT(*) FROM "ComposerLink" WHERE "composerId" = $1`,
      [devMutantNinjaId],
    );
    const existingCount = parseInt(existingLinksResult.rows[0].count, 10);

    if (existingCount > 0) {
      console.log(
        `\n⚠️  Mutant Ninja already has ${existingCount} links in DEV`,
      );
      console.log("   Deleting existing links first...");
      await devClient.query(
        `DELETE FROM "ComposerLink" WHERE "composerId" = $1`,
        [devMutantNinjaId],
      );
      console.log("   ✅ Deleted existing links");
    }

    // Insert new links
    console.log("\n📝 Inserting new links...");
    let inserted = 0;

    for (const link of links) {
      try {
        const linkId = createId();
        await devClient.query(
          `INSERT INTO "ComposerLink" (id, "composerId", platform, url, label, "order", "createdAt")
           VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
          [
            linkId,
            devMutantNinjaId,
            link.platform,
            link.url,
            link.label,
            link.order,
          ],
        );
        console.log(
          `   ✅ Inserted: ${link.platform} - ${link.url} ${link.label ? `(${link.label})` : ""}`,
        );
        inserted++;
      } catch (error: any) {
        console.log(`   ❌ Error inserting ${link.platform}: ${error.message}`);
      }
    }

    console.log(`\n✅ Successfully inserted ${inserted}/${links.length} links`);

    // Update externalUrl field as well
    console.log("\n📝 Updating externalUrl field...");
    const youtubeLink = links.find((l) => l.platform === "youtube");
    if (youtubeLink) {
      await devClient.query(
        `UPDATE "Composer" SET "externalUrl" = $1 WHERE id = $2`,
        [youtubeLink.url, devMutantNinjaId],
      );
      console.log(`   ✅ Updated externalUrl to: ${youtubeLink.url}`);
    }
  } finally {
    await devClient.end();
  }

  console.log("\n" + "=".repeat(80));
  console.log("🎉 Migration complete!");
  console.log("\n💡 Next steps:");
  console.log("   1. Update .env to point to DEV branch");
  console.log("   2. Verify DEV has everything (401 assets + 7 links)");
  console.log("   3. Delete old branches (main, backups)");
}

main();
