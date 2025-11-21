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

async function main() {
  console.log("\n" + "━".repeat(60));
  console.log("🚀 APPLYING MIGRATIONS TO PRODUCTION");
  console.log("━".repeat(60));
  console.log("\n⚠️  Environment: PRODUCTION (Neon main branch)");
  console.log("📄 Config file: .env (ignoring .env.local)\n");

  // Load .env explicitly (Prisma loads .env.local by default which we want to avoid)
  const result = config({ path: resolve(process.cwd(), ".env") });

  if (result.error) {
    console.error("❌ Error loading .env:", result.error.message);
    console.error("\n💡 Make sure .env exists with DIRECT_URL");
    console.error("   Example: DIRECT_URL=postgresql://...");
    process.exit(1);
  }

  // Read values from .env file directly (before they get overridden)
  const envPath = resolve(process.cwd(), ".env");
  const envContent = require("fs").readFileSync(envPath, "utf-8");
  const envVars: Record<string, string> = {};

  envContent.split("\n").forEach((line: string) => {
    const match = line.match(/^([^#=]+)=["']?([^"'\n]+)["']?$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, "");
      envVars[key] = value;
    }
  });

  if (!envVars.DIRECT_URL) {
    console.error("❌ Missing DIRECT_URL in .env");
    console.error("\n💡 Add to .env:");
    console.error("   DIRECT_URL=postgresql://...");
    console.error("\n   Get it from: https://console.neon.tech/");
    process.exit(1);
  }

  console.log("✅ Environment loaded from .env");
  console.log(`📊 DIRECT_URL: ${envVars.DIRECT_URL.substring(0, 50)}...`);
  console.log(
    `📊 Host: ${envVars.DIRECT_URL.match(/@([^/]+)/)?.[1] || "unknown"}\n`,
  );

  // Confirm action (safety check)
  console.log("⚠️  This will apply migrations to PRODUCTION database!");
  console.log("   Press Ctrl+C to cancel, or wait 3 seconds...\n");

  // Wait 3 seconds
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Apply migrations
  try {
    console.log("🔄 Running: prisma migrate deploy\n");

    // Force Prisma to use values from .env (ignore .env.local)
    // Override DATABASE_URL and DIRECT_URL with values from .env
    execSync("prisma migrate deploy", {
      stdio: "inherit",
      env: {
        ...process.env,
        // Override with values from .env (not .env.local)
        DATABASE_URL: envVars.DATABASE_URL,
        DIRECT_URL: envVars.DIRECT_URL,
      },
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
}

main().catch((error) => {
  console.error("❌ Unexpected error:", error);
  process.exit(1);
});
