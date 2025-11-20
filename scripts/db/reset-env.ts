#!/usr/bin/env tsx
/**
 * Reset + seed script with environment switcher
 * Usage: tsx scripts/db/reset-env.ts [dev|prod]
 */

import { config } from "dotenv";
import { resolve } from "path";
import { execSync } from "child_process";

const env = process.argv[2] || "dev";

if (!["dev", "prod"].includes(env)) {
  console.error('❌ Invalid environment. Use "dev" or "prod"');
  process.exit(1);
}

// Charger le fichier .env approprié
const envFile =
  env === "dev" ? ".env.development" : ".env.production";
const envPath = resolve(process.cwd(), envFile);

console.log(`\n🔧 Loading environment: ${env}`);
console.log(`📄 Using: ${envFile}\n`);

// Charger les variables d'environnement
const result = config({ path: envPath });

if (result.error) {
  console.error(`❌ Error loading ${envFile}:`, result.error.message);
  console.error(
    `\n💡 Make sure ${envFile} exists with DATABASE_URL and DIRECT_URL\n`,
  );
  process.exit(1);
}

// Vérifier que les variables requises sont présentes
if (!process.env.DATABASE_URL || !process.env.DIRECT_URL) {
  console.error(`❌ Missing required variables in ${envFile}`);
  console.error("   Required: DATABASE_URL, DIRECT_URL\n");
  process.exit(1);
}

console.log(`✅ Environment loaded: ${env}`);
console.log(`📊 DATABASE_URL: ${process.env.DATABASE_URL?.substring(0, 50)}...`);
console.log(`📊 DIRECT_URL: ${process.env.DIRECT_URL?.substring(0, 50)}...\n`);

// Exécuter reset + seed
try {
  console.log(`⚠️  Resetting ${env} database...\n`);

  // Reset avec Prisma
  execSync(
    "prisma migrate reset --force --skip-seed",
    {
      stdio: "inherit",
      env: {
        ...process.env,
        PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION: "ok",
      },
    },
  );

  console.log(`\n🌱 Seeding ${env} database...\n`);

  // Seed
  execSync("tsx prisma/seed.ts", {
    stdio: "inherit",
    env: process.env,
  });

  console.log(`\n✅ Reset + seed completed successfully on ${env} environment! 🎉\n`);
} catch (error) {
  console.error(`\n❌ Reset + seed failed on ${env} environment\n`);
  process.exit(1);
}
