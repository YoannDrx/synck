/**
 * Reset + seed PRODUCTION database
 * Uses .env only (ignores .env.local)
 * DANGER: This will delete all production data!
 */
import { loadEnv, log, runPrismaReset, runPrismaSeed, runScript, validateEnv } from './utils'

runScript('reset-seed-prod', () => {
  log.header('Reset + Seed PRODUCTION Database')
  log.warning('DANGER: This will DELETE ALL PRODUCTION DATA!')
  log.separator()

  // Step 1: Load environment
  log.step(1, 4, 'Loading environment...')
  loadEnv('production')
  validateEnv()
  log.db(process.env.DATABASE_URL!)
  log.separator()

  // Step 2: Reset database
  log.step(2, 4, 'Resetting database...')
  runPrismaReset()
  log.success('Database reset complete')
  log.separator()

  // Step 3: Seed database
  log.step(3, 4, 'Seeding database...')
  runPrismaSeed()
  log.success('Database seeded')
  log.separator()

  // Step 4: Done
  log.step(4, 4, 'Complete!')
  log.success('Production database ready!')
})
