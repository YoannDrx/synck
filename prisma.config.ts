import { defineConfig } from "@prisma/config";
import { config as loadEnv } from "dotenv";
import { resolve } from "path";

// Skip .env.local loading if E2E_TEST=true (for E2E tests with local DB)
if (process.env.E2E_TEST !== "true") {
  // Charge .env.local d'abord (priorité Next.js)
  loadEnv({ path: resolve(process.cwd(), ".env.local"), override: true });
}
// Charge .env ensuite, sans écraser
loadEnv({ path: resolve(process.cwd(), ".env"), override: false });

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
