import { defineConfig } from "@prisma/config";
import { config as loadEnv } from "dotenv";
import { resolve } from "path";

// Charge .env puis .env.local, sans écraser des variables déjà définies.
// Permet d'utiliser des URLs injectées (CI, local test) sans être écrasées.
loadEnv({ path: resolve(process.cwd(), ".env"), override: false });
if (!process.env.DATABASE_URL || !process.env.DIRECT_URL) {
  loadEnv({ path: resolve(process.cwd(), ".env.local"), override: true });
}

export default defineConfig({
  schema: "./prisma/schema.prisma",
  migrations: {
    seed: "node scripts/run-ts.cjs prisma/seed.ts",
  },
});
