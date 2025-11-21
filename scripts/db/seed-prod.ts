/**
 * Seed production database (ignores .env.local)
 * Uses only .env → production branch
 */

import { config } from "dotenv";
import { resolve } from "path";
import { existsSync } from "fs";
import { execSync } from "child_process";

console.log("\n🚀 Seeding PRODUCTION database...");
console.log("📄 Using: environment variables / .env if present (ignoring .env.local)\n");

// Load ONLY .env (ignore .env.local) but do not fail if missing (CI injecte les secrets)
const envPath = resolve(process.cwd(), ".env");
if (existsSync(envPath)) {
  const result = config({ path: envPath });
  if (result.error) {
    console.error("❌ Error loading .env:", result.error.message);
    process.exit(1);
  }
} else {
  console.log("ℹ️  .env non trouvé, utilisation des variables d'environnement existantes.\n");
}

// Verify required variables
if (!process.env.DATABASE_URL || !process.env.DIRECT_URL) {
  console.error("❌ Missing DATABASE_URL or DIRECT_URL in .env");
  process.exit(1);
}

console.log(`✅ Environment loaded: production`);
console.log(`📊 DATABASE_URL: ${process.env.DATABASE_URL?.substring(0, 50)}...`);
console.log(`📊 DIRECT_URL: ${process.env.DIRECT_URL?.substring(0, 50)}...\n`);

// Run seed
try {
  console.log("🌱 Starting seed...\n");
  execSync("node scripts/run-ts.cjs prisma/seed.ts", {
    stdio: "inherit",
    env: process.env,
  });
  console.log("\n✅ Production seed completed! 🎉\n");
} catch (error) {
  console.error("\n❌ Production seed failed\n");
  process.exit(1);
}
