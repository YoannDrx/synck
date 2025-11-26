/**
 * Seed DEVELOPMENT database (no reset)
 * Uses .env.local (Neon dev branch)
 */

import { log, loadEnv, validateEnv, runPrismaSeed, runScript } from "./utils";

runScript("seed-dev", () => {
  log.header("Seed DEVELOPMENT Database");

  // Step 1: Load environment
  log.step(1, 2, "Loading environment...");
  loadEnv("development");
  validateEnv();
  log.db(process.env.DATABASE_URL!);
  log.separator();

  // Step 2: Seed database
  log.step(2, 2, "Seeding database...");
  runPrismaSeed();
  log.success("Development database seeded!");
});
