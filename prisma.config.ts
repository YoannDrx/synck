import { defineConfig } from "@prisma/config";
import { config as loadEnv } from "dotenv";
import { resolve } from "path";

// Charge .env.local d'abord (priorité Next.js)
loadEnv({ path: resolve(process.cwd(), ".env.local"), override: true });
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
    seed: "node scripts/run-ts.cjs prisma/seed.ts",
  },
});
