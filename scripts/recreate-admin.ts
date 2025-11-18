import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function recreateAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@synck.fr'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456'

  console.log('🔄 Recreating admin user via Better Auth API...')

  try {
    // Delete existing admin if exists
    const existing = await prisma.user.findUnique({
      where: { email: adminEmail },
    })

    if (existing) {
      console.log('🗑️  Deleting existing admin user...')
      await prisma.account.deleteMany({ where: { userId: existing.id } })
      await prisma.session.deleteMany({ where: { userId: existing.id } })
      await prisma.user.delete({ where: { id: existing.id } })
    }

    // Call Better Auth signup API to create user with properly hashed password
    const response = await fetch('http://localhost:3000/api/auth/sign-up/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: adminEmail,
        password: adminPassword,
        name: 'Caroline Senyk',
      }),
    })

    console.log(`Response status: ${response.status}`)
    const text = await response.text()
    console.log(`Response text: ${text}`)

    if (!response.ok) {
      throw new Error(`Failed to create user via API (${response.status}): ${text}`)
    }

    console.log('✅ User created via Better Auth API')

    // Update user to be admin with emailVerified
    await prisma.user.update({
      where: { email: adminEmail },
      data: {
        role: 'ADMIN',
        isActive: true,
        emailVerified: true,
      },
    })

    console.log(`✅ Admin user ready: ${adminEmail}`)
    console.log(`   Password: ${adminPassword}`)
    console.log(`   ⚠️  IMPORTANT: Change this password after first login!`)
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

recreateAdmin()
