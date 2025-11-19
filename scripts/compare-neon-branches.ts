import { Client } from "pg";

interface BranchInfo {
  name: string;
  id: string;
  assets: number;
  works: number;
  composers: number;
  categories: number;
  contributions: number;
}

const PROJECT_ID = "old-brook-39127538";

const branches = [
  { name: "main", id: "br-silent-math-agucrpx0" },
  { name: "dev", id: "br-bitter-hall-agarmlx6" },
  { name: "backup-before-final-migration", id: "br-mute-block-ag8agm08" },
  { name: "backup-pre-migration", id: "br-broad-mouse-ag6c6u34" },
];

async function getBranchStats(
  branchName: string,
  branchId: string,
): Promise<BranchInfo> {
  // Get connection string for this branch
  const { exec } = await import("child_process");
  const { promisify } = await import("util");
  const execAsync = promisify(exec);

  try {
    const { stdout } = await execAsync(
      `neon connection-string ${branchId} --project-id ${PROJECT_ID}`,
    );
    const connectionString = stdout.trim();

    // Connect to this branch
    const client = new Client({ connectionString });
    await client.connect();

    try {
      // Get counts
      const assetsResult = await client.query('SELECT COUNT(*) FROM "Asset"');
      const worksResult = await client.query('SELECT COUNT(*) FROM "Work"');
      const composersResult = await client.query(
        'SELECT COUNT(*) FROM "Composer"',
      );
      const categoriesResult = await client.query(
        'SELECT COUNT(*) FROM "Category"',
      );
      const contributionsResult = await client.query(
        'SELECT COUNT(*) FROM "Contribution"',
      );

      // Check for Mutant Ninja composer links
      const mutantNinjaResult = await client.query(
        `SELECT * FROM "Composer" WHERE slug = 'mutant-ninja-records'`,
      );

      if (mutantNinjaResult.rows.length > 0) {
        const mutantNinja = mutantNinjaResult.rows[0];
        console.log(
          `   🎵 Mutant Ninja Records found! ExternalUrl: ${mutantNinja.externalUrl || "NULL"}`,
        );

        // Check for ComposerLink entries
        const linksResult = await client.query(
          `SELECT * FROM "ComposerLink" WHERE "composerId" = $1 ORDER BY "order" ASC`,
          [mutantNinja.id],
        );
        console.log(`   🔗 ComposerLinks count: ${linksResult.rows.length}`);
        if (linksResult.rows.length > 0) {
          linksResult.rows.forEach((link: any) => {
            console.log(
              `      - ${link.platform}: ${link.url} ${link.label ? `(${link.label})` : ""}`,
            );
          });
        }
      } else {
        console.log(`   ⚠️  Mutant Ninja Records not found`);
      }

      return {
        name: branchName,
        id: branchId,
        assets: parseInt(assetsResult.rows[0].count, 10),
        works: parseInt(worksResult.rows[0].count, 10),
        composers: parseInt(composersResult.rows[0].count, 10),
        categories: parseInt(categoriesResult.rows[0].count, 10),
        contributions: parseInt(contributionsResult.rows[0].count, 10),
      };
    } finally {
      await client.end();
    }
  } catch (error) {
    console.error(`Error getting stats for ${branchName}:`, error);
    return {
      name: branchName,
      id: branchId,
      assets: 0,
      works: 0,
      composers: 0,
      categories: 0,
      contributions: 0,
    };
  }
}

async function main() {
  console.log("🔍 Comparing Neon Branches\n");
  console.log("=".repeat(80));

  const results: BranchInfo[] = [];

  for (const branch of branches) {
    console.log(`\n📊 Analyzing ${branch.name}...`);
    const stats = await getBranchStats(branch.name, branch.id);
    results.push(stats);
    console.log(`   Assets:        ${stats.assets}`);
    console.log(`   Works:         ${stats.works}`);
    console.log(`   Composers:     ${stats.composers}`);
    console.log(`   Categories:    ${stats.categories}`);
    console.log(`   Contributions: ${stats.contributions}`);
  }

  console.log("\n" + "=".repeat(80));
  console.log("📋 SUMMARY\n");

  // Print as table
  console.log(
    "Branch                          | Assets | Works | Composers | Categories | Contributions",
  );
  console.log(
    "--------------------------------|--------|-------|-----------|------------|---------------",
  );

  for (const result of results) {
    const name = result.name.padEnd(31);
    const assets = String(result.assets).padStart(6);
    const works = String(result.works).padStart(5);
    const composers = String(result.composers).padStart(9);
    const categories = String(result.categories).padStart(10);
    const contributions = String(result.contributions).padStart(13);

    console.log(
      `${name} | ${assets} | ${works} | ${composers} | ${categories} | ${contributions}`,
    );
  }

  // Check current DATABASE_URL
  console.log("\n" + "=".repeat(80));
  console.log("🔗 Current DATABASE_URL in .env:");
  console.log(process.env.DATABASE_URL);

  console.log("\n✅ Comparison complete!");
}

main();
