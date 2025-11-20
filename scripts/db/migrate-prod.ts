/**
 * Apply migrations to PRODUCTION database (Neon main branch)
 *
 * This script is a BACKUP/MANUAL option to apply migrations to production.
 * Normally, migrations are applied automatically by Vercel during deployment.
 *
 * Use this script when:
 * - You want to apply migrations BEFORE deploying to Vercel
 * - You need to test migrations on production database first
 * - Vercel automatic migration failed and you need manual intervention
 *
 * Environment:
 * - Uses .env file (ignores .env.local)
 * - Connects to Neon main branch via DIRECT_URL
 *
 * Usage: pnpm db:migrate:prod
 */

import { config } from "dotenv";
import { resolve } from "path";
import { execSync } from "child_process";

console.log("\n" + "━".repeat(60));
console.log("🚀 APPLYING MIGRATIONS TO PRODUCTION");
console.log("━".repeat(60));
console.log("\n⚠️  Environment: PRODUCTION (Neon main branch)");
console.log("📄 Config file: .env (ignoring .env.local)\n");

// Load ONLY .env (ignore .env.local)
const result = config({ path: resolve(process.cwd(), ".env") });

if (result.error) {
  console.error("❌ Error loading .env:", result.error.message);
  console.error("\n💡 Make sure .env exists with DIRECT_URL");
  console.error("   Example: DIRECT_URL=postgresql://...");
  process.exit(1);
}

// Verify required variables
if (!process.env.DIRECT_URL) {
  console.error("❌ Missing DIRECT_URL in .env");
  console.error("\n💡 Add to .env:");
  console.error("   DIRECT_URL=postgresql://...");
  console.error("\n   Get it from: https://console.neon.tech/");
  process.exit(1);
}

console.log("✅ Environment loaded");
console.log(`📊 DIRECT_URL: ${process.env.DIRECT_URL?.substring(0, 50)}...\n`);

// Confirm action (safety check)
console.log("⚠️  This will apply migrations to PRODUCTION database!");
console.log("   Press Ctrl+C to cancel, or wait 3 seconds...\n");

// Wait 3 seconds
await new Promise((resolve) => setTimeout(resolve, 3000));

// Apply migrations
try {
  console.log("🔄 Running: prisma migrate deploy\n");

  execSync("prisma migrate deploy", {
    stdio: "inherit",
    env: process.env,
  });

  console.log("\n" + "━".repeat(60));
  console.log("✅ MIGRATIONS APPLIED TO PRODUCTION! 🎉");
  console.log("━".repeat(60));
  console.log("\n💡 Next steps:");
  console.log("   1. Verify database schema in Neon console");
  console.log("   2. Deploy to Vercel (or it will auto-deploy)");
  console.log("   3. Vercel will skip migration (already applied)\n");
} catch (error) {
  console.error("\n" + "━".repeat(60));
  console.error("❌ MIGRATION FAILED");
  console.error("━".repeat(60));
  console.error("\n💡 Troubleshooting:");
  console.error("   1. Check error message above");
  console.error("   2. Verify DIRECT_URL is correct");
  console.error("   3. Check Neon console for database status");
  console.error("   4. DO NOT deploy to Vercel until fixed\n");
  process.exit(1);
}
