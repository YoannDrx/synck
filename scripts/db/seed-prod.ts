/**
 * Seed PRODUCTION database (no reset)
 * Uses .env only (ignores .env.local)
 * Safe for CI (works with injected environment variables)
 */
import { loadEnv, log, runPrismaSeed, runScript, validateEnv } from './utils'

runScript('seed-prod', () => {
  log.header('Seed PRODUCTION Database')
  log.warning('This seeds the PRODUCTION database!')
  log.separator()

  // Step 1: Load environment
  log.step(1, 2, 'Loading environment...')
  loadEnv('production')
  validateEnv()
  log.db(process.env.DATABASE_URL!)
  log.separator()

  // Step 2: Seed database
  log.step(2, 2, 'Seeding database...')
  runPrismaSeed()
  log.success('Production database seeded!')
})
