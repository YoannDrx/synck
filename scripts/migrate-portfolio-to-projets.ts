/**
 * Script de migration : Portfolio → Projets
 *
 * Ce script met à jour tous les chemins d'images dans la base de données
 * pour remplacer "/images/portfolio/" par "/images/projets/"
 *
 * Utilisation :
 *   tsx scripts/migrate-portfolio-to-projets.ts
 */

import { prisma } from '../lib/prisma'

async function migratePortfolioToProjets() {
  console.log('🚀 Démarrage de la migration Portfolio → Projets...\n')

  try {
    // Compter le nombre d'assets concernés
    const assetsToUpdate = await prisma.asset.findMany({
      where: {
        path: {
          contains: '/images/portfolio/'
        }
      }
    })

    console.log(`📊 ${assetsToUpdate.length} assets trouvés avec des chemins "/images/portfolio/"\n`)

    if (assetsToUpdate.length === 0) {
      console.log('✅ Aucune migration nécessaire, tous les chemins sont déjà à jour.')
      return
    }

    // Afficher quelques exemples
    console.log('📋 Exemples de chemins à mettre à jour :')
    assetsToUpdate.slice(0, 5).forEach(asset => {
      const newPath = asset.path.replace('/images/portfolio/', '/images/projets/')
      console.log(`   ${asset.path}`)
      console.log(`   → ${newPath}`)
    })
    console.log()

    // Demander confirmation
    console.log('⚠️  Cette opération va mettre à jour tous les chemins en base de données.')
    console.log('   Assurez-vous que les fichiers ont bien été déplacés physiquement.')
    console.log()

    // Exécuter la mise à jour pour chaque asset
    console.log('🔄 Mise à jour en cours...')
    let updatedCount = 0

    for (const asset of assetsToUpdate) {
      const newPath = asset.path.replace('/images/portfolio/', '/images/projets/')

      await prisma.asset.update({
        where: { id: asset.id },
        data: { path: newPath }
      })

      updatedCount++

      if (updatedCount % 10 === 0) {
        console.log(`   Progression: ${updatedCount}/${assetsToUpdate.length} assets mis à jour`)
      }
    }

    console.log(`\n✅ Migration terminée avec succès !`)
    console.log(`   ${updatedCount} assets ont été mis à jour.\n`)

    // Vérification finale
    const remainingOldPaths = await prisma.asset.count({
      where: {
        path: {
          contains: '/images/portfolio/'
        }
      }
    })

    if (remainingOldPaths === 0) {
      console.log('✅ Vérification: Aucun ancien chemin restant en base de données.')
    } else {
      console.warn(`⚠️  Attention: ${remainingOldPaths} assets ont encore des anciens chemins.`)
    }

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter la migration
migratePortfolioToProjets()
  .then(() => {
    console.log('\n🎉 Script terminé.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Échec de la migration:', error)
    process.exit(1)
  })
