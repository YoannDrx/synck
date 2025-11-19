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
  console.log("🔍 Comparing Work data between MAIN and MAIN-OLD\n");
  console.log("=".repeat(80));

  // Connect to MAIN (new)
  console.log("\n📊 Fetching sample work from MAIN (new)...");
  const mainConnectionString = await getConnectionString(MAIN_BRANCH);
  const mainClient = new Client({ connectionString: mainConnectionString });
  await mainClient.connect();

  let mainSample: any = null;
  try {
    const result = await mainClient.query(`
      SELECT
        w.slug,
        w.year,
        w."spotifyUrl",
        w."releaseDate",
        w.genre,
        w."isrcCode",
        wt.description,
        wt.title
      FROM "Work" w
      LEFT JOIN "WorkTranslation" wt ON w.id = wt."workId" AND wt.locale = 'fr'
      WHERE w.slug LIKE '%album%' OR w.slug LIKE '%musique%'
      LIMIT 5
    `);
    mainSample = result.rows;
    console.log(`✅ Found ${mainSample.length} works`);
    mainSample.forEach((w: any) => {
      console.log(`\n  📀 ${w.title} (${w.slug})`);
      console.log(`     Year: ${w.year || "NULL"}`);
      console.log(`     Spotify: ${w.spotifyUrl || "NULL"}`);
      console.log(`     Release: ${w.releaseDate || "NULL"}`);
      console.log(`     Genre: ${w.genre || "NULL"}`);
      console.log(`     ISRC: ${w.isrcCode || "NULL"}`);
      console.log(
        `     Description: ${w.description ? w.description.substring(0, 50) + "..." : "NULL"}`,
      );
    });
  } finally {
    await mainClient.end();
  }

  // Connect to MAIN-OLD
  console.log("\n\n📊 Fetching same works from MAIN-OLD...");
  const mainOldConnectionString = await getConnectionString(MAIN_OLD_BRANCH);
  const mainOldClient = new Client({
    connectionString: mainOldConnectionString,
  });
  await mainOldClient.connect();

  let mainOldSample: any = null;
  try {
    const slugs = mainSample.map((w: any) => w.slug);
    const result = await mainOldClient.query(
      `
      SELECT
        w.slug,
        w.year,
        w."spotifyUrl",
        w."releaseDate",
        w.genre,
        w."isrcCode",
        wt.description,
        wt.title
      FROM "Work" w
      LEFT JOIN "WorkTranslation" wt ON w.id = wt."workId" AND wt.locale = 'fr'
      WHERE w.slug = ANY($1)
    `,
      [slugs],
    );
    mainOldSample = result.rows;
    console.log(`✅ Found ${mainOldSample.length} works`);
    mainOldSample.forEach((w: any) => {
      console.log(`\n  📀 ${w.title} (${w.slug})`);
      console.log(`     Year: ${w.year || "NULL"}`);
      console.log(`     Spotify: ${w.spotifyUrl || "NULL"}`);
      console.log(`     Release: ${w.releaseDate || "NULL"}`);
      console.log(`     Genre: ${w.genre || "NULL"}`);
      console.log(`     ISRC: ${w.isrcCode || "NULL"}`);
      console.log(
        `     Description: ${w.description ? w.description.substring(0, 50) + "..." : "NULL"}`,
      );
    });
  } finally {
    await mainOldClient.end();
  }

  // Summary
  console.log("\n" + "=".repeat(80));
  console.log("📊 SUMMARY\n");

  let missingDataCount = 0;
  mainSample.forEach((mainWork: any) => {
    const oldWork = mainOldSample.find((w: any) => w.slug === mainWork.slug);
    if (oldWork) {
      const missing = [];
      if (!mainWork.spotifyUrl && oldWork.spotifyUrl) missing.push("Spotify");
      if (!mainWork.releaseDate && oldWork.releaseDate) missing.push("Release");
      if (!mainWork.genre && oldWork.genre) missing.push("Genre");
      if (!mainWork.description && oldWork.description)
        missing.push("Description");

      if (missing.length > 0) {
        missingDataCount++;
        console.log(`❌ ${mainWork.slug}: Missing ${missing.join(", ")}`);
      }
    }
  });

  if (missingDataCount === 0) {
    console.log("✅ No missing data detected in sample");
  } else {
    console.log(
      `\n⚠️  ${missingDataCount} works have missing data that exists in MAIN-OLD`,
    );
    console.log("\n💡 Need to migrate data from MAIN-OLD to MAIN");
  }
}

main();
