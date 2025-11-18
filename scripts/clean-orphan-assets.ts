import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function cleanOrphanAssets() {
  console.log('🧹 NETTOYAGE DES ASSETS ORPHELINS\n')
  console.log('=' .repeat(70))

  const publicDir = path.join(process.cwd(), 'public')

  // Récupérer tous les assets
  const assets = await prisma.asset.findMany({
    select: {
      id: true,
      path: true,
      // Vérifier les relations
      workImages: { select: { id: true } },
      workCover: { select: { id: true } },
      categoryImages: { select: { id: true } },
      labelImages: { select: { id: true } },
      composerImages: { select: { id: true } },
      blogPostImages: { select: { id: true } },
      blogPostCover: { select: { id: true } },
      expertiseImages: { select: { id: true } },
      expertiseCover: { select: { id: true } }
    }
  })

  console.log(`\n📦 Total assets à vérifier: ${assets.length}\n`)

  const orphans: Array<{
    id: string
    path: string
    hasRelations: boolean
  }> = []

  for (const asset of assets) {
    const fullPath = path.join(publicDir, asset.path)

    // Vérifier si le fichier existe
    if (!fs.existsSync(fullPath)) {
      // Vérifier si l'asset a des relations
      const hasRelations =
        asset.workImages.length > 0 ||
        asset.workCover.length > 0 ||
        asset.categoryImages.length > 0 ||
        asset.labelImages.length > 0 ||
        asset.composerImages.length > 0 ||
        asset.blogPostImages.length > 0 ||
        asset.blogPostCover.length > 0 ||
        asset.expertiseImages.length > 0 ||
        asset.expertiseCover.length > 0

      orphans.push({
        id: asset.id,
        path: asset.path,
        hasRelations
      })
    }
  }

  console.log('📊 RÉSULTATS:\n')
  console.log(`Total assets: ${assets.length}`)
  console.log(`Assets orphelins trouvés: ${orphans.length}`)

  const withRelations = orphans.filter(o => o.hasRelations)
  const withoutRelations = orphans.filter(o => !o.hasRelations)

  console.log(`  - Avec relations (⚠️ à traiter manuellement): ${withRelations.length}`)
  console.log(`  - Sans relations (✅ safe à supprimer): ${withoutRelations.length}`)

  if (withRelations.length > 0) {
    console.log('\n⚠️  ASSETS ORPHELINS AVEC RELATIONS:\n')
    console.log('Ces assets sont référencés mais les fichiers n\'existent pas.')
    console.log('Ils doivent être traités manuellement.\n')

    withRelations.slice(0, 10).forEach(asset => {
      console.log(`  - ${asset.path}`)
    })

    if (withRelations.length > 10) {
      console.log(`  ... et ${withRelations.length - 10} autres`)
    }
  }

  if (withoutRelations.length > 0) {
    console.log('\n✅ ASSETS ORPHELINS SANS RELATIONS:\n')
    console.log('Ces assets peuvent être supprimés en toute sécurité.\n')

    withoutRelations.slice(0, 10).forEach(asset => {
      console.log(`  - ${asset.path}`)
    })

    if (withoutRelations.length > 10) {
      console.log(`  ... et ${withoutRelations.length - 10} autres`)
    }

    console.log('\n❓ Voulez-vous supprimer ces assets orphelins sans relations?')
    console.log('   Pour confirmer, relancez avec: npx tsx scripts/clean-orphan-assets.ts --confirm')
  }

  // Si --confirm est passé, supprimer les assets sans relations
  const args = process.argv.slice(2)
  if (args.includes('--confirm') && withoutRelations.length > 0) {
    console.log('\n🗑️  SUPPRESSION DES ASSETS ORPHELINS...\n')

    let deleted = 0

    for (const asset of withoutRelations) {
      try {
        await prisma.asset.delete({
          where: { id: asset.id }
        })
        deleted++

        if (deleted % 50 === 0) {
          console.log(`  ✓ ${deleted}/${withoutRelations.length} supprimés...`)
        }
      } catch (error) {
        console.error(`❌ Erreur lors de la suppression de ${asset.path}:`, error)
      }
    }

    console.log(`\n✅ ${deleted} assets orphelins supprimés de la base de données`)
  }

  console.log('\n' + '='.repeat(70))
}

cleanOrphanAssets()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
