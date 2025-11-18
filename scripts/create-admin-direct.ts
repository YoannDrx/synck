import { PrismaClient } from '@prisma/client'
import { scryptSync, randomBytes } from 'crypto'

const prisma = new PrismaClient()

function hashPasswordScrypt(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

async function createAdminDirect() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@synck.fr'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456'

  console.log('🔄 Creating admin user directly in database...')

  try {
    // Delete existing user if exists
    const existing = await prisma.user.findUnique({
      where: { email: adminEmail },
    })

    if (existing) {
      console.log('🗑️  Deleting existing admin user...')
      await prisma.account.deleteMany({ where: { userId: existing.id } })
      await prisma.session.deleteMany({ where: { userId: existing.id } })
      await prisma.user.delete({ where: { id: existing.id } })
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Caroline Senyk',
        emailVerified: true,
        role: 'ADMIN',
        isActive: true,
      },
    })

    console.log('✅ User created:', user.email)

    // Hash password with scrypt (like Better Auth does)
    const hashedPassword = hashPasswordScrypt(adminPassword)

    // Create account with email/password
    await prisma.account.create({
      data: {
        userId: user.id,
        accountId: user.email,
        providerId: 'credential',
        password: hashedPassword,
      },
    })

    console.log('✅ Admin account created successfully!')
    console.log(`   Email: ${adminEmail}`)
    console.log(`   Password: ${adminPassword}`)
    console.log(`   ⚠️  IMPORTANT: Change this password after first login!`)
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createAdminDirect()
