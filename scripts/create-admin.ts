import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@synck.fr'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456'

  console.log('🔄 Creating admin user via Better Auth API...')

  try {
    // Delete existing admin if exists
    const existing = await prisma.user.findUnique({
      where: { email: adminEmail },
      include: { accounts: true, sessions: true },
    })

    if (existing) {
      console.log('🗑️  Deleting existing admin user...')
      await prisma.session.deleteMany({ where: { userId: existing.id } })
      await prisma.account.deleteMany({ where: { userId: existing.id } })
      await prisma.user.delete({ where: { id: existing.id } })
    }

    // Call Better Auth signup API
    const response = await fetch('http://localhost:3000/api/auth/sign-up/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: adminEmail,
        password: adminPassword,
        name: 'Caroline Senyk',
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Failed to create user: ${JSON.stringify(error)}`)
    }

    const data = await response.json()
    console.log('✅ User created via Better Auth')

    // Update user to be admin
    const user = await prisma.user.update({
      where: { email: adminEmail },
      data: {
        role: 'ADMIN',
        isActive: true,
        emailVerified: true,
      },
    })

    console.log(`✅ Admin user ready: ${user.email}`)
    console.log(`   Password: ${adminPassword}`)
    console.log(`   ⚠️  IMPORTANT: Change this password after first login!`)
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
