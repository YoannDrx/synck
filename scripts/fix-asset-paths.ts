import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

function findMatchingFile(dbPath: string, publicDir: string): string | null {
  const fullDbPath = path.join(publicDir, dbPath)

  // 1. Essayer le path exact
  if (fs.existsSync(fullDbPath)) {
    return dbPath
  }

  // 2. Essayer de trouver une version avec casse différente et/ou extension différente
  const dir = path.dirname(fullDbPath)
  const basename = path.basename(fullDbPath, path.extname(fullDbPath))

  if (!fs.existsSync(dir)) {
    return null
  }

  const filesInDir = fs.readdirSync(dir)

  // Essayer de trouver un fichier correspondant
  const matchingFile = filesInDir.find(file => {
    const fileBasename = path.basename(file, path.extname(file))
    return fileBasename.toLowerCase() === basename.toLowerCase()
  })

  if (matchingFile) {
    const relativePath = path.join(path.dirname(dbPath), matchingFile)
    // Normaliser le path pour utiliser des slashes
    return relativePath.replace(/\\/g, '/')
  }

  return null
}

async function fixAssetPaths() {
  console.log('🔧 CORRECTION DES CHEMINS D\'ASSETS\n')
  console.log('=' .repeat(70))

  const publicDir = path.join(process.cwd(), 'public')

  // Récupérer tous les assets
  const assets = await prisma.asset.findMany({
    select: {
      id: true,
      path: true
    }
  })

  console.log(`\n📦 Total assets à vérifier: ${assets.length}\n`)

  let fixed = 0
  let alreadyOk = 0
  let notFound = 0
  const corrections: Array<{ old: string; new: string }> = []
  const missing: string[] = []

  for (const asset of assets) {
    const correctPath = findMatchingFile(asset.path, publicDir)

    if (!correctPath) {
      missing.push(asset.path)
      notFound++
      continue
    }

    if (correctPath === asset.path) {
      alreadyOk++
      continue
    }

    // Le path est différent, on doit le corriger
    await prisma.asset.update({
      where: { id: asset.id },
      data: { path: correctPath }
    })

    corrections.push({
      old: asset.path,
      new: correctPath
    })

    fixed++

    if (fixed % 50 === 0) {
      console.log(`  ✓ ${fixed} corrections effectuées...`)
    }
  }

  console.log('\n' + '='.repeat(70))
  console.log('📊 RÉSUMÉ:\n')
  console.log(`✅ Déjà corrects: ${alreadyOk}`)
  console.log(`🔧 Corrigés: ${fixed}`)
  console.log(`❌ Introuvables: ${notFound}`)

  if (corrections.length > 0) {
    console.log('\n🔧 EXEMPLES DE CORRECTIONS:\n')
    corrections.slice(0, 10).forEach(corr => {
      console.log(`  ${corr.old}`)
      console.log(`    → ${corr.new}\n`)
    })

    if (corrections.length > 10) {
      console.log(`  ... et ${corrections.length - 10} autres corrections`)
    }
  }

  if (missing.length > 0) {
    console.log('\n❌ FICHIERS INTROUVABLES:\n')
    missing.slice(0, 10).forEach(m => {
      console.log(`  - ${m}`)
    })

    if (missing.length > 10) {
      console.log(`  ... et ${missing.length - 10} autres fichiers introuvables`)
    }
  }

  console.log('\n' + '='.repeat(70))
}

fixAssetPaths()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
