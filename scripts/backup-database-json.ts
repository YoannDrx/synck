import { PrismaClient } from '@prisma/client'
import { writeFileSync } from 'fs'
import { mkdirSync } from 'fs'

const prisma = new PrismaClient()

async function backupDatabase() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
  const backupFile = `backups/synck_backup_${timestamp}.json`

  console.log('🔄 Creating database backup...')
  console.log(`   File: ${backupFile}`)

  try {
    // Create backups directory
    mkdirSync('backups', { recursive: true })

    // Export all data
    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      data: {
        users: await prisma.user.findMany({
          include: {
            accounts: true,
            sessions: true,
          },
        }),
        categories: await prisma.category.findMany({
          include: {
            translations: true,
          },
        }),
        labels: await prisma.label.findMany({
          include: {
            translations: true,
          },
        }),
        composers: await prisma.composer.findMany({
          include: {
            translations: true,
          },
        }),
        works: await prisma.work.findMany({
          include: {
            translations: true,
            contributions: true,
            images: true,
          },
        }),
        assets: await prisma.asset.findMany(),
        expertises: await prisma.expertise.findMany(),
        invitations: await prisma.invitation.findMany(),
        verifications: await prisma.verification.findMany(),
      },
    }

    // Write to file
    writeFileSync(backupFile, JSON.stringify(backup, null, 2))

    const stats = require('fs').statSync(backupFile)
    const fileSizeInBytes = stats.size
    const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2)

    console.log('✅ Backup created successfully!')
    console.log(`   Size: ${fileSizeInMB} MB`)
    console.log(`   Location: ${backupFile}`)

  } catch (error) {
    console.error('❌ Backup failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

backupDatabase()
