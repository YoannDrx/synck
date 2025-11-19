import { Client } from "pg";
import * as fs from "fs";
import * as path from "path";

const PROJECT_ID = "old-brook-39127538";
const MAIN_BRANCH = "br-silent-math-agucrpx0";
const DEV_BRANCH = "br-bitter-hall-agarmlx6";

interface ComparisonResult {
  assets: {
    onlyInMain: string[];
    onlyInDev: string[];
    inBoth: string[];
  };
  works: {
    onlyInMain: string[];
    onlyInDev: string[];
    inBoth: string[];
  };
  composers: {
    onlyInMain: string[];
    onlyInDev: string[];
    inBoth: string[];
  };
  categories: {
    onlyInMain: string[];
    onlyInDev: string[];
    inBoth: string[];
  };
}

async function getConnectionString(branchId: string): Promise<string> {
  const { exec } = await import("child_process");
  const { promisify } = await import("util");
  const execAsync = promisify(exec);

  const { stdout } = await execAsync(
    `neon connection-string ${branchId} --project-id ${PROJECT_ID}`,
  );
  return stdout.trim();
}

async function getBranchData(branchName: string, branchId: string) {
  console.log(`\n📊 Fetching data from ${branchName}...`);

  const connectionString = await getConnectionString(branchId);
  const client = new Client({ connectionString });
  await client.connect();

  try {
    // Get all assets
    const assetsResult = await client.query(
      'SELECT id, path FROM "Asset" ORDER BY path',
    );
    const assets = new Map(
      assetsResult.rows.map((row: any) => [row.path, row.id]),
    );

    // Get all works
    const worksResult = await client.query(
      'SELECT id, slug FROM "Work" ORDER BY slug',
    );
    const works = new Map(
      worksResult.rows.map((row: any) => [row.slug, row.id]),
    );

    // Get all composers
    const composersResult = await client.query(
      'SELECT id, slug FROM "Composer" ORDER BY slug',
    );
    const composers = new Map(
      composersResult.rows.map((row: any) => [row.slug, row.id]),
    );

    // Get all categories
    const categoriesResult = await client.query(
      'SELECT id, slug FROM "Category" ORDER BY slug',
    );
    const categories = new Map(
      categoriesResult.rows.map((row: any) => [row.slug, row.id]),
    );

    console.log(`   Assets: ${assets.size}`);
    console.log(`   Works: ${works.size}`);
    console.log(`   Composers: ${composers.size}`);
    console.log(`   Categories: ${categories.size}`);

    return { assets, works, composers, categories };
  } finally {
    await client.end();
  }
}

async function main() {
  console.log("🔍 Comparing MAIN vs DEV branches\n");
  console.log("=".repeat(80));

  // Fetch data from both branches
  const mainData = await getBranchData("main", MAIN_BRANCH);
  const devData = await getBranchData("dev", DEV_BRANCH);

  console.log("\n" + "=".repeat(80));
  console.log("📋 COMPARISON RESULTS\n");

  const result: ComparisonResult = {
    assets: { onlyInMain: [], onlyInDev: [], inBoth: [] },
    works: { onlyInMain: [], onlyInDev: [], inBoth: [] },
    composers: { onlyInMain: [], onlyInDev: [], inBoth: [] },
    categories: { onlyInMain: [], onlyInDev: [], inBoth: [] },
  };

  // Compare assets
  for (const [path, id] of mainData.assets) {
    if (devData.assets.has(path)) {
      result.assets.inBoth.push(path);
    } else {
      result.assets.onlyInMain.push(path);
    }
  }
  for (const [path, id] of devData.assets) {
    if (!mainData.assets.has(path)) {
      result.assets.onlyInDev.push(path);
    }
  }

  // Compare works
  for (const [slug, id] of mainData.works) {
    if (devData.works.has(slug)) {
      result.works.inBoth.push(slug);
    } else {
      result.works.onlyInMain.push(slug);
    }
  }
  for (const [slug, id] of devData.works) {
    if (!mainData.works.has(slug)) {
      result.works.onlyInDev.push(slug);
    }
  }

  // Compare composers
  for (const [slug, id] of mainData.composers) {
    if (devData.composers.has(slug)) {
      result.composers.inBoth.push(slug);
    } else {
      result.composers.onlyInMain.push(slug);
    }
  }
  for (const [slug, id] of devData.composers) {
    if (!mainData.composers.has(slug)) {
      result.composers.onlyInDev.push(slug);
    }
  }

  // Compare categories
  for (const [slug, id] of mainData.categories) {
    if (devData.categories.has(slug)) {
      result.categories.inBoth.push(slug);
    } else {
      result.categories.onlyInMain.push(slug);
    }
  }
  for (const [slug, id] of devData.categories) {
    if (!mainData.categories.has(slug)) {
      result.categories.onlyInDev.push(slug);
    }
  }

  // Print summary
  console.log("📦 ASSETS:");
  console.log(`   In both:        ${result.assets.inBoth.length}`);
  console.log(`   Only in main:   ${result.assets.onlyInMain.length}`);
  console.log(`   Only in dev:    ${result.assets.onlyInDev.length}`);

  console.log("\n🎨 WORKS:");
  console.log(`   In both:        ${result.works.inBoth.length}`);
  console.log(`   Only in main:   ${result.works.onlyInMain.length}`);
  console.log(`   Only in dev:    ${result.works.onlyInDev.length}`);

  console.log("\n🎵 COMPOSERS:");
  console.log(`   In both:        ${result.composers.inBoth.length}`);
  console.log(`   Only in main:   ${result.composers.onlyInMain.length}`);
  console.log(`   Only in dev:    ${result.composers.onlyInDev.length}`);

  console.log("\n🏷️  CATEGORIES:");
  console.log(`   In both:        ${result.categories.inBoth.length}`);
  console.log(`   Only in main:   ${result.categories.onlyInMain.length}`);
  console.log(`   Only in dev:    ${result.categories.onlyInDev.length}`);

  // Show details of what's missing
  if (result.assets.onlyInDev.length > 0) {
    console.log("\n\n📁 ASSETS ONLY IN DEV (need to migrate):");
    console.log("=".repeat(80));
    result.assets.onlyInDev.slice(0, 20).forEach((path) => {
      console.log(`   ${path}`);
    });
    if (result.assets.onlyInDev.length > 20) {
      console.log(`   ... and ${result.assets.onlyInDev.length - 20} more`);
    }
  }

  if (result.works.onlyInDev.length > 0) {
    console.log("\n\n🎨 WORKS ONLY IN DEV (need to migrate):");
    console.log("=".repeat(80));
    result.works.onlyInDev.forEach((slug) => {
      console.log(`   ${slug}`);
    });
  }

  if (result.categories.onlyInDev.length > 0) {
    console.log("\n\n🏷️  CATEGORIES ONLY IN DEV (need to migrate):");
    console.log("=".repeat(80));
    result.categories.onlyInDev.forEach((slug) => {
      console.log(`   ${slug}`);
    });
  }

  // Save detailed report
  const reportPath = path.join(
    process.cwd(),
    "scripts",
    "main-vs-dev-comparison.json",
  );
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        summary: {
          assets: {
            inBoth: result.assets.inBoth.length,
            onlyInMain: result.assets.onlyInMain.length,
            onlyInDev: result.assets.onlyInDev.length,
          },
          works: {
            inBoth: result.works.inBoth.length,
            onlyInMain: result.works.onlyInMain.length,
            onlyInDev: result.works.onlyInDev.length,
          },
          composers: {
            inBoth: result.composers.inBoth.length,
            onlyInMain: result.composers.onlyInMain.length,
            onlyInDev: result.composers.onlyInDev.length,
          },
          categories: {
            inBoth: result.categories.inBoth.length,
            onlyInMain: result.categories.onlyInMain.length,
            onlyInDev: result.categories.onlyInDev.length,
          },
        },
        details: result,
      },
      null,
      2,
    ),
  );

  console.log("\n" + "=".repeat(80));
  console.log(`✅ Full report saved to: ${reportPath}`);
  console.log(
    "\n💡 Next step: Create migration script to copy data from dev to main",
  );
}

main();
