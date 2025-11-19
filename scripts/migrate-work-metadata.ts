import { Client } from "pg";

const PROJECT_ID = "old-brook-39127538";
const MAIN_BRANCH = "br-bitter-hall-agarmlx6"; // New main (was dev)
const MAIN_OLD_BRANCH = "br-silent-math-agucrpx0"; // Old main

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
  const dryRun = process.argv.includes("--dry-run");

  console.log("🔄 Migrating Work Metadata from MAIN-OLD to MAIN\n");
  console.log("=".repeat(80));
  console.log(`Mode: ${dryRun ? "DRY RUN" : "EXECUTE"}`);
  console.log("=".repeat(80));

  let updated = 0;
  let skipped = 0;
  const errors: string[] = [];

  // Connect to both branches
  const mainConnectionString = await getConnectionString(MAIN_BRANCH);
  const mainOldConnectionString = await getConnectionString(MAIN_OLD_BRANCH);

  const mainClient = new Client({ connectionString: mainConnectionString });
  const mainOldClient = new Client({
    connectionString: mainOldConnectionString,
  });

  await mainClient.connect();
  await mainOldClient.connect();

  try {
    // Get all works from MAIN
    console.log("\n📊 Step 1: Fetching all works from MAIN...");
    const mainWorksResult = await mainClient.query(`
      SELECT id, slug FROM "Work" ORDER BY slug
    `);
    console.log(`✅ Found ${mainWorksResult.rows.length} works in MAIN\n`);

    // For each work, get metadata from MAIN-OLD and update MAIN
    console.log("📝 Step 2: Migrating metadata...\n");

    for (const mainWork of mainWorksResult.rows) {
      try {
        // Get metadata from MAIN-OLD
        const oldWorkResult = await mainOldClient.query(
          `
          SELECT
            w.id,
            w.slug,
            w."spotifyUrl",
            w."releaseDate",
            w.genre,
            w."isrcCode"
          FROM "Work" w
          WHERE w.slug = $1
        `,
          [mainWork.slug],
        );

        if (oldWorkResult.rows.length === 0) {
          console.log(`⏭️  ${mainWork.slug}: Not found in MAIN-OLD, skipping`);
          skipped++;
          continue;
        }

        const oldWork = oldWorkResult.rows[0];

        // Check if there's anything to update
        const hasMetadata =
          oldWork.spotifyUrl ||
          oldWork.releaseDate ||
          oldWork.genre ||
          oldWork.isrcCode;

        if (!hasMetadata) {
          console.log(`⏭️  ${mainWork.slug}: No metadata to migrate`);
          skipped++;
          continue;
        }

        // Update MAIN with metadata from MAIN-OLD
        console.log(`📝 ${mainWork.slug}:`);
        if (oldWork.spotifyUrl)
          console.log(`   + Spotify: ${oldWork.spotifyUrl}`);
        if (oldWork.releaseDate)
          console.log(`   + Release: ${oldWork.releaseDate}`);
        if (oldWork.genre) console.log(`   + Genre: ${oldWork.genre}`);
        if (oldWork.isrcCode) console.log(`   + ISRC: ${oldWork.isrcCode}`);

        if (!dryRun) {
          await mainClient.query(
            `
            UPDATE "Work"
            SET
              "spotifyUrl" = COALESCE($2, "spotifyUrl"),
              "releaseDate" = COALESCE($3, "releaseDate"),
              genre = COALESCE($4, genre),
              "isrcCode" = COALESCE($5, "isrcCode"),
              "updatedAt" = NOW()
            WHERE id = $1
          `,
            [
              mainWork.id,
              oldWork.spotifyUrl,
              oldWork.releaseDate,
              oldWork.genre,
              oldWork.isrcCode,
            ],
          );
          console.log(`   ✅ Updated\n`);
        } else {
          console.log(`   [DRY RUN] Would update\n`);
        }

        updated++;

        // Also migrate descriptions from WorkTranslation
        const oldTranslationsResult = await mainOldClient.query(
          `
          SELECT locale, title, description, role
          FROM "WorkTranslation"
          WHERE "workId" = $1
        `,
          [oldWork.id],
        );

        if (oldTranslationsResult.rows.length > 0) {
          for (const oldTranslation of oldTranslationsResult.rows) {
            if (oldTranslation.description) {
              console.log(
                `   📝 Updating ${oldTranslation.locale} description (${oldTranslation.description.length} chars)`,
              );

              if (!dryRun) {
                // Update existing translation
                await mainClient.query(
                  `
                  UPDATE "WorkTranslation"
                  SET
                    description = COALESCE($3, description),
                    role = COALESCE($4, role)
                  WHERE "workId" = $1 AND locale = $2
                `,
                  [
                    mainWork.id,
                    oldTranslation.locale,
                    oldTranslation.description,
                    oldTranslation.role,
                  ],
                );
                console.log(`      ✅ Updated translation\n`);
              } else {
                console.log(`      [DRY RUN] Would update translation\n`);
              }
            }
          }
        }
      } catch (error: any) {
        const errorMsg = `Failed to migrate ${mainWork.slug}: ${error.message}`;
        errors.push(errorMsg);
        console.log(`   ❌ ${errorMsg}\n`);
      }
    }
  } finally {
    await mainClient.end();
    await mainOldClient.end();
  }

  // Summary
  console.log("=".repeat(80));
  console.log("📊 FINAL SUMMARY\n");
  console.log(`Mode:           ${dryRun ? "DRY RUN" : "EXECUTE"}`);
  console.log(`Works updated:  ${dryRun ? updated + " (dry run)" : updated}`);
  console.log(`Works skipped:  ${skipped}`);
  console.log(`Errors:         ${errors.length}`);
  console.log("=".repeat(80));

  if (errors.length > 0) {
    console.log("\n❌ ERRORS:\n");
    errors.forEach((error) => console.log(`  - ${error}`));
  }

  if (dryRun) {
    console.log("\n💡 To execute for real, run:");
    console.log("  pnpm tsx scripts/migrate-work-metadata.ts --execute");
  } else {
    console.log("\n✅ Migration complete!");
  }
}

main();
