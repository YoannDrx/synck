/**
 * Reset DEVELOPMENT database (no seed)
 * Uses .env.local (Neon dev branch)
 */

import { log, loadEnv, validateEnv, runPrismaReset, runScript } from "./utils";

runScript("reset-dev", () => {
  log.header("Reset DEVELOPMENT Database (no seed)");

  // Step 1: Load environment
  log.step(1, 2, "Loading environment...");
  loadEnv("development");
  validateEnv();
  log.db(process.env.DATABASE_URL!);
  log.separator();

  // Step 2: Reset database
  log.step(2, 2, "Resetting database...");
  runPrismaReset();
  log.success("Development database reset!");
  log.info("Run 'pnpm db:seed' to seed the database");
});
