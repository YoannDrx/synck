/**
 * Apply migrations to PRODUCTION database
 * Uses .env only (ignores .env.local)
 *
 * This is a BACKUP/MANUAL option. Normally, migrations are applied
 * automatically by Vercel during deployment.
 *
 * Use this when:
 * - You want to apply migrations BEFORE deploying to Vercel
 * - You need to test migrations on production database first
 * - Vercel automatic migration failed and you need manual intervention
 */

import { log, loadEnvFileDirectly, runPrismaMigrate, runScript } from "./utils";

runScript("migrate-prod", async () => {
  log.header("Apply Migrations to PRODUCTION");
  log.warning("This will apply migrations to PRODUCTION database!");
  log.separator();

  // Step 1: Load environment directly from .env file
  log.step(1, 3, "Loading environment from .env...");
  const envVars = loadEnvFileDirectly(".env");

  if (!envVars.DATABASE_URL || !envVars.DIRECT_URL) {
    throw new Error("Missing DATABASE_URL or DIRECT_URL in .env");
  }

  log.env(".env (production)");
  log.db(envVars.DATABASE_URL);
  log.separator();

  // Step 2: Safety pause
  log.step(2, 3, "Safety check...");
  log.info("Press Ctrl+C to cancel, or wait 3 seconds...");
  await new Promise((resolve) => setTimeout(resolve, 3000));
  log.separator();

  // Step 3: Apply migrations
  log.step(3, 3, "Applying migrations...");
  runPrismaMigrate({
    DATABASE_URL: envVars.DATABASE_URL,
    DIRECT_URL: envVars.DIRECT_URL,
  });

  log.success("Migrations applied to PRODUCTION!");
  log.separator();
  log.info("Next steps:");
  log.info("  1. Verify database schema in Neon console");
  log.info("  2. Deploy to Vercel (or it will auto-deploy)");
  log.info("  3. Vercel will skip migration (already applied)");
});
