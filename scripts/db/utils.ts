/**
 * Database scripts utilities
 * Shared functions for all DB scripts (seed, reset, migrate)
 */

import { config } from "dotenv";
import { resolve } from "path";
import { execSync } from "child_process";
import { existsSync, readFileSync } from "fs";

// ============================================
// Types
// ============================================

export type Environment = "development" | "production";

// ============================================
// Logging utilities
// ============================================

export const log = {
  header: (title: string) => {
    console.log("\n" + "━".repeat(50));
    console.log(`  ${title}`);
    console.log("━".repeat(50) + "\n");
  },

  step: (current: number, total: number, message: string) => {
    console.log(`[${current}/${total}] ${message}`);
  },

  info: (message: string) => console.log(`ℹ️  ${message}`),
  success: (message: string) => console.log(`✅ ${message}`),
  warning: (message: string) => console.log(`⚠️  ${message}`),
  error: (message: string) => console.error(`❌ ${message}`),

  env: (envFile: string) => console.log(`📁 Config: ${envFile}`),

  db: (url: string) => {
    // Mask credentials in URL for safe logging
    const masked = url.replace(/\/\/[^:]+:[^@]+@/, "//***:***@");
    // Extract host for clarity
    const host = url.match(/@([^/]+)/)?.[1] || "unknown";
    console.log(`🗄️  Database: ${masked.substring(0, 60)}...`);
    console.log(`🌐 Host: ${host}`);
  },

  separator: () => console.log(""),

  time: (startTime: number) => {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`⏱️  Completed in ${elapsed}s`);
  },
};

// ============================================
// Environment loading
// ============================================

/**
 * Load environment variables based on environment type
 * - development: loads .env.local first, falls back to .env
 * - production: loads only .env (ignores .env.local)
 */
export function loadEnv(env: Environment): void {
  const cwd = process.cwd();

  if (env === "development") {
    // Dev: load .env.local first (Next.js convention)
    const localPath = resolve(cwd, ".env.local");
    if (existsSync(localPath)) {
      config({ path: localPath });
      log.env(".env.local (development)");
    } else {
      config({ path: resolve(cwd, ".env") });
      log.warning(".env.local not found, using .env");
    }
  } else {
    // Production: load only .env (ignore .env.local for safety)
    const envPath = resolve(cwd, ".env");
    if (existsSync(envPath)) {
      config({ path: envPath });
      log.env(".env (production)");
    } else {
      // CI may inject secrets directly without .env file
      log.info(".env not found, using environment variables");
    }
  }
}

/**
 * Load and parse .env file directly (for migrate-prod)
 * Returns key-value pairs from the file, ignoring process.env overrides
 */
export function loadEnvFileDirectly(envFile: string): Record<string, string> {
  const envPath = resolve(process.cwd(), envFile);

  if (!existsSync(envPath)) {
    throw new Error(`${envFile} not found`);
  }

  const content = readFileSync(envPath, "utf-8");
  const vars: Record<string, string> = {};

  content.split("\n").forEach((line) => {
    // Match: KEY="value" or KEY='value' or KEY=value (ignore comments)
    const match = line.match(/^([^#=]+)=["']?([^"'\n]+)["']?$/);
    if (match) {
      vars[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, "");
    }
  });

  return vars;
}

/**
 * Validate required environment variables are present
 */
export function validateEnv(): void {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
  }
  if (!process.env.DIRECT_URL) {
    throw new Error("DIRECT_URL is not defined");
  }
}

// ============================================
// Prisma commands
// ============================================

/**
 * Run Prisma migrate reset (drops all data, applies all migrations)
 * Always skips automatic seed (we run our own seed script)
 */
export function runPrismaReset(): void {
  execSync("pnpm exec prisma migrate reset --force --skip-seed", {
    stdio: "inherit",
    env: {
      ...process.env,
      // Required for non-interactive reset
      PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION: "ok",
    },
  });
}

/**
 * Run Prisma seed script
 */
export function runPrismaSeed(): void {
  execSync("tsx prisma/seed.ts", {
    stdio: "inherit",
    env: process.env,
  });
}

/**
 * Run Prisma migrate deploy (applies pending migrations)
 * Optionally override env vars (for production migrations)
 */
export function runPrismaMigrate(envOverrides?: Record<string, string>): void {
  execSync("pnpm exec prisma migrate deploy", {
    stdio: "inherit",
    env: {
      ...process.env,
      ...envOverrides,
    },
  });
}

// ============================================
// Script runner
// ============================================

/**
 * Standard script wrapper with error handling and timing
 */
export async function runScript(
  name: string,
  fn: () => void | Promise<void>,
): Promise<void> {
  const startTime = Date.now();

  try {
    await fn();
    log.separator();
    log.time(startTime);
  } catch (error) {
    log.separator();
    if (error instanceof Error) {
      log.error(error.message);
    } else {
      log.error(String(error));
    }
    process.exit(1);
  }
}
