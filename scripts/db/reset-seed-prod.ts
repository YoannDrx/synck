/**
 * Reset + seed production database (ignores .env.local)
 * Uses only .env → production branch
 */

import { config } from "dotenv";
import { resolve } from "path";
import { execSync } from "child_process";

console.log("\n⚠️  Resetting PRODUCTION database...");
console.log("📄 Using: .env (ignoring .env.local)\n");

// Load ONLY .env (ignore .env.local)
const result = config({ path: resolve(process.cwd(), ".env") });

if (result.error) {
  console.error("❌ Error loading .env:", result.error.message);
  process.exit(1);
}

// Verify required variables
if (!process.env.DATABASE_URL || !process.env.DIRECT_URL) {
  console.error("❌ Missing DATABASE_URL or DIRECT_URL in .env");
  process.exit(1);
}

console.log(`✅ Environment loaded: production`);
console.log(`📊 DATABASE_URL: ${process.env.DATABASE_URL?.substring(0, 50)}...`);
console.log(`📊 DIRECT_URL: ${process.env.DIRECT_URL?.substring(0, 50)}...\n`);

// Run reset + seed
try {
  console.log("🔄 Resetting database...\n");

  execSync("prisma migrate reset --force --skip-seed", {
    stdio: "inherit",
    env: {
      ...process.env,
      PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION: "ok",
    },
  });

  console.log("\n🌱 Seeding database...\n");

  execSync("node scripts/run-ts.cjs prisma/seed.ts", {
    stdio: "inherit",
    env: process.env,
  });

  console.log("\n✅ Production reset + seed completed! 🎉\n");
} catch (error) {
  console.error("\n❌ Production reset + seed failed\n");
  process.exit(1);
}
