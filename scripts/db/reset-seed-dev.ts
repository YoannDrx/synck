/**
 * Reset + seed DEVELOPMENT database
 * Uses .env.local (Neon dev branch)
 */

import {
  log,
  loadEnv,
  validateEnv,
  runPrismaReset,
  runPrismaSeed,
  runScript,
} from "./utils";

runScript("reset-seed-dev", () => {
  log.header("Reset + Seed DEVELOPMENT Database");

  // Step 1: Load environment
  log.step(1, 4, "Loading environment...");
  loadEnv("development");
  validateEnv();
  log.db(process.env.DATABASE_URL!);
  log.separator();

  // Step 2: Reset database
  log.step(2, 4, "Resetting database...");
  runPrismaReset();
  log.success("Database reset complete");
  log.separator();

  // Step 3: Seed database
  log.step(3, 4, "Seeding database...");
  runPrismaSeed();
  log.success("Database seeded");
  log.separator();

  // Step 4: Done
  log.step(4, 4, "Complete!");
  log.success("Development database ready!");
});
