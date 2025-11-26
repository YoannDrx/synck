/**
 * Reset PRODUCTION database (no seed)
 * Uses .env only (ignores .env.local)
 * DANGER: This will delete all production data!
 */

import { log, loadEnv, validateEnv, runPrismaReset, runScript } from "./utils";

runScript("reset-only-prod", () => {
  log.header("Reset PRODUCTION Database (no seed)");
  log.warning("DANGER: This will DELETE ALL PRODUCTION DATA!");
  log.separator();

  // Step 1: Load environment
  log.step(1, 2, "Loading environment...");
  loadEnv("production");
  validateEnv();
  log.db(process.env.DATABASE_URL!);
  log.separator();

  // Step 2: Reset database
  log.step(2, 2, "Resetting database...");
  runPrismaReset();
  log.success("Production database reset!");
  log.info("Run 'pnpm db:seed:prod' to seed the database");
});
