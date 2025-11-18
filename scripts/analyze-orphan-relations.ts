import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function analyzeOrphanRelations() {
  console.log('🔍 ANALYSE DÉTAILLÉE DES ASSETS ORPHELINS\n')
  console.log('=' .repeat(70))

  const publicDir = path.join(process.cwd(), 'public')

  // Récupérer tous les assets orphelins avec leurs relations
  const assets = await prisma.asset.findMany({
    include: {
      workImages: {
        include: {
          translations: {
            where: { locale: 'fr' }
          }
        }
      },
      workCover: {
        include: {
          translations: {
            where: { locale: 'fr' }
          }
        }
      },
      categoryImages: true,
      labelImages: true,
      composerImages: true,
      blogPostImages: true,
      blogPostCover: true,
      expertiseImages: true,
      expertiseCover: true
    }
  })

  const orphans = assets.filter(asset => {
    const fullPath = path.join(publicDir, asset.path)
    return !fs.existsSync(fullPath)
  })

  console.log(`\n📦 Total assets: ${assets.length}`)
  console.log(`❌ Assets orphelins: ${orphans.length}\n`)

  // Analyser où sont référencés les orphelins
  const byRelation: Record<string, number> = {
    workImages: 0,
    workCover: 0,
    categoryImages: 0,
    labelImages: 0,
    composerImages: 0,
    blogPostImages: 0,
    blogPostCover: 0,
    expertiseImages: 0,
    expertiseCover: 0
  }

  const details: Array<{
    path: string
    relations: string[]
    workTitles?: string[]
  }> = []

  for (const orphan of orphans) {
    const relations: string[] = []
    const workTitles: string[] = []

    if (orphan.workImages.length > 0) {
      byRelation.workImages += orphan.workImages.length
      relations.push(`workImages (${orphan.workImages.length})`)
      orphan.workImages.forEach(work => {
        workTitles.push(work.translations[0]?.title || work.slug)
      })
    }
    if (orphan.workCover.length > 0) {
      byRelation.workCover += orphan.workCover.length
      relations.push(`workCover (${orphan.workCover.length})`)
      orphan.workCover.forEach(work => {
        workTitles.push(work.translations[0]?.title || work.slug)
      })
    }
    if (orphan.categoryImages.length > 0) {
      byRelation.categoryImages += orphan.categoryImages.length
      relations.push(`categoryImages (${orphan.categoryImages.length})`)
    }
    if (orphan.labelImages.length > 0) {
      byRelation.labelImages += orphan.labelImages.length
      relations.push(`labelImages (${orphan.labelImages.length})`)
    }
    if (orphan.composerImages.length > 0) {
      byRelation.composerImages += orphan.composerImages.length
      relations.push(`composerImages (${orphan.composerImages.length})`)
    }
    if (orphan.blogPostImages.length > 0) {
      byRelation.blogPostImages += orphan.blogPostImages.length
      relations.push(`blogPostImages (${orphan.blogPostImages.length})`)
    }
    if (orphan.blogPostCover.length > 0) {
      byRelation.blogPostCover += orphan.blogPostCover.length
      relations.push(`blogPostCover (${orphan.blogPostCover.length})`)
    }
    if (orphan.expertiseImages.length > 0) {
      byRelation.expertiseImages += orphan.expertiseImages.length
      relations.push(`expertiseImages (${orphan.expertiseImages.length})`)
    }
    if (orphan.expertiseCover.length > 0) {
      byRelation.expertiseCover += orphan.expertiseCover.length
      relations.push(`expertiseCover (${orphan.expertiseCover.length})`)
    }

    if (relations.length > 0) {
      details.push({
        path: orphan.path,
        relations,
        workTitles: workTitles.length > 0 ? workTitles : undefined
      })
    }
  }

  console.log('📊 RÉPARTITION PAR TYPE DE RELATION:\n')
  Object.entries(byRelation).forEach(([key, count]) => {
    if (count > 0) {
      console.log(`  ${key}: ${count}`)
    }
  })

  console.log('\n' + '='.repeat(70))
  console.log('📋 DÉTAILS DES 10 PREMIERS ASSETS:\n')

  details.slice(0, 10).forEach(detail => {
    console.log(`  ${path.basename(detail.path)}`)
    console.log(`    Relations: ${detail.relations.join(', ')}`)
    if (detail.workTitles && detail.workTitles.length > 0) {
      console.log(`    Projets: ${detail.workTitles.join(', ')}`)
    }
    console.log('')
  })

  if (details.length > 10) {
    console.log(`  ... et ${details.length - 10} autres assets\n`)
  }

  console.log('=' .repeat(70))
  console.log('\n💡 RECOMMANDATION:\n')
  console.log('Ces assets sont principalement référencés dans workImages.')
  console.log('Pour les nettoyer, il faut supprimer les relations dans la table.')
  console.log('\nCommande suggérée:')
  console.log('  npx tsx scripts/cleanup-all-orphan-assets.ts --confirm')
  console.log('\n' + '='.repeat(70))
}

analyzeOrphanRelations()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
