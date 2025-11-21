import { defineConfig } from "@prisma/config";
import { config as loadEnv } from "dotenv";
import { resolve } from "path";

// Charge .env puis .env.local (override pour le dev), comme avant
loadEnv({ path: resolve(process.cwd(), ".env") });
loadEnv({ path: resolve(process.cwd(), ".env.local"), override: true });

export default defineConfig({
  schema: "./prisma/schema.prisma",
  migrations: {
    seed: "node scripts/run-ts.cjs prisma/seed.ts",
  },
});
