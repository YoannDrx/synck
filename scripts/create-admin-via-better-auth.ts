import { auth } from '../lib/auth'
import { prisma } from '../lib/prisma'

async function createAdminViaBetterAuth() {
  try {
    console.log("\n👤 Création de l'admin via BetterAuth...\n")

    const email = 'admin@synck.fr'
    const password = 'admin123456'
    const name = 'Admin'

    // Supprimer l'ancien compte si existant
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: { accounts: true },
    })

    if (existingUser) {
      console.log("🗑️  Suppression de l'ancien compte...")
      await prisma.account.deleteMany({
        where: { userId: existingUser.id },
      })
      await prisma.user.delete({
        where: { id: existingUser.id },
      })
    }

    // Créer l'utilisateur via BetterAuth API
    console.log('📝 Création du nouvel utilisateur...')

    // Utiliser l'API interne de BetterAuth pour créer un utilisateur
    const result = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    })

    console.log('✅ Utilisateur créé avec succès via BetterAuth!')
    console.log(`   Email: ${email}`)
    console.log(`   Password: ${password}`)
    console.log(`   User ID: ${result.user.id}\n`)

    // Mettre à jour le rôle et le statut
    await prisma.user.update({
      where: { id: result.user.id },
      data: {
        role: 'ADMIN',
        emailVerified: true,
        isActive: true,
      },
    })
    console.log('✅ Rôle ADMIN assigné et compte activé\n')
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminViaBetterAuth()
