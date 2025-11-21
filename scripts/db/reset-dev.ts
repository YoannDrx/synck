/**
 * Reset development database (uses .env.local)
 * NO SEED - reset only
 */

import { config } from "dotenv";
import { resolve } from "path";
import { execSync } from "child_process";

console.log("\n🔄 Resetting DEVELOPMENT database...");
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

// Run reset WITHOUT seed
try {
  console.log("🔄 Resetting database (no seed)...\n");

  execSync("prisma migrate reset --force --skip-seed", {
    stdio: "inherit",
    env: {
      ...process.env,
      PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION: "ok",
    },
  });

  console.log("\n✅ Development reset completed! 🎉");
  console.log("💡 Run 'pnpm db:seed' to seed the database\n");
} catch (error) {
  console.error("\n❌ Development reset failed\n");
  process.exit(1);
}
