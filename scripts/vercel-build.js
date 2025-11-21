#!/usr/bin/env node
/**
 * Vercel Build Pipeline
 *
 * This script is automatically executed by Vercel during deployments.
 * It ensures that database migrations are applied before building the application.
 *
 * Pipeline:
 * 1. Apply Prisma migrations to production database (Neon main branch)
 * 2. Generate Prisma Client with updated schema
 * 3. Build Next.js application
 *
 * Environment variables required:
 * - DATABASE_URL: Pooled connection URL (for runtime)
 * - DIRECT_URL: Direct connection URL (for migrations)
 *
 * Usage: This script is automatically called by Vercel when "vercel-build" script exists
 */

const { execSync } = require('child_process');

/**
 * Execute a command with proper error handling and logging
 */
function run(command, description) {
  console.log(`\n📦 ${description}...`);
  console.log(`   Command: ${command}`);

  try {
    execSync(command, {
      stdio: 'inherit',
      env: process.env
    });
    console.log(`✅ ${description} - Success`);
  } catch (error) {
    console.error(`❌ ${description} - Failed`);
    console.error(`   Exit code: ${error.status}`);
    process.exit(1);
  }
}

console.log('\n' + '━'.repeat(60));
console.log('🚀 VERCEL BUILD PIPELINE');
console.log('━'.repeat(60));

// Verify required env vars
if (!process.env.DATABASE_URL || !process.env.DIRECT_URL) {
  console.error('\n❌ Missing required environment variables');
  console.error('   Required: DATABASE_URL, DIRECT_URL');
  console.error('\n💡 Configure them in Vercel Dashboard:');
  console.error('   Settings → Environment Variables');
  process.exit(1);
}

console.log('\n📊 Environment:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'production'}`);
console.log(`   VERCEL_ENV: ${process.env.VERCEL_ENV || 'N/A'}`);
console.log(`   DATABASE_URL: ${process.env.DATABASE_URL?.substring(0, 40)}...`);
console.log(`   DIRECT_URL: ${process.env.DIRECT_URL?.substring(0, 40)}...`);

// Step 1: Apply migrations (uses DIRECT_URL)
run('pnpm exec prisma migrate deploy', 'Applying database migrations');

// Step 2: Generate Prisma Client
run('pnpm exec prisma generate', 'Generating Prisma Client');

// Step 3: Build Next.js application
run('pnpm exec next build', 'Building Next.js application');

console.log('\n' + '━'.repeat(60));
console.log('✅ BUILD COMPLETED SUCCESSFULLY! 🎉');
console.log('━'.repeat(60) + '\n');
