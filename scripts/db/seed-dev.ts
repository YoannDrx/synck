/**
 * Seed development database (uses .env.local)
 */

import { config } from "dotenv";
import { resolve } from "path";
import { execSync } from "child_process";

console.log("\n🌱 Seeding DEVELOPMENT database...");
console.log("📄 Using: .env.local (local development)\n");

// Load .env.local first (dev environment)
const result = config({ path: resolve(process.cwd(), ".env.local") });

if (result.error) {
  console.error("❌ Error loading .env.local:", result.error.message);
  console.log("⚠️  Falling back to .env");
  config({ path: resolve(process.cwd(), ".env") });
}

// Verify required variables
if (!process.env.DATABASE_URL || !process.env.DIRECT_URL) {
  console.error("❌ Missing DATABASE_URL or DIRECT_URL");
  process.exit(1);
}

console.log(`✅ Environment loaded: development`);
console.log(
  `📊 DATABASE_URL: ${process.env.DATABASE_URL?.substring(0, 50)}...`,
);
console.log(`📊 DIRECT_URL: ${process.env.DIRECT_URL?.substring(0, 50)}...\n`);

// Run seed
try {
  console.log("🌱 Seeding database...\n");

  execSync("node scripts/run-ts.cjs prisma/seed.ts", {
    stdio: "inherit",
    env: process.env,
  });

  console.log("\n✅ Development seed completed! 🎉\n");
} catch (error) {
  console.error("\n❌ Development seed failed\n");
  process.exit(1);
}
