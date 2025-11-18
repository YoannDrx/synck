import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function checkFilenameCaseMismatch() {
  console.log('🔍 VÉRIFICATION DES PROBLÈMES DE CASSE\n')
  console.log('=' .repeat(70))

  // Récupérer tous les assets
  const assets = await prisma.asset.findMany({
    select: {
      id: true,
      path: true,
      alt: true
    }
  })

  console.log(`\n📦 Total assets à vérifier: ${assets.length}\n`)

  const mismatches: Array<{
    assetId: string
    dbPath: string
    actualFile: string | null
    alt: string | null
  }> = []

  for (const asset of assets) {
    // Construire le chemin absolu
    const fullPath = path.join(process.cwd(), 'public', asset.path)

    // Vérifier si le fichier existe exactement comme dans la DB
    if (!fs.existsSync(fullPath)) {
      // Le fichier n'existe pas avec cette casse exacte
      // Essayer de trouver une version avec une casse différente
      const dir = path.dirname(fullPath)
      const filename = path.basename(fullPath)

      if (fs.existsSync(dir)) {
        const filesInDir = fs.readdirSync(dir)
        const matchingFile = filesInDir.find(
          f => f.toLowerCase() === filename.toLowerCase()
        )

        if (matchingFile && matchingFile !== filename) {
          mismatches.push({
            assetId: asset.id,
            dbPath: asset.path,
            actualFile: matchingFile,
            alt: asset.alt
          })
        }
      }
    }
  }

  if (mismatches.length > 0) {
    console.log(`❌ PROBLÈMES DÉTECTÉS: ${mismatches.length} fichiers avec casse incorrecte\n`)

    // Grouper par dossier
    const byFolder: Record<string, typeof mismatches> = {}

    mismatches.forEach(m => {
      const folder = path.dirname(m.dbPath)
      if (!byFolder[folder]) byFolder[folder] = []
      byFolder[folder].push(m)
    })

    Object.entries(byFolder).forEach(([folder, items]) => {
      console.log(`\n📁 ${folder} (${items.length} fichiers):`)
      items.forEach(item => {
        const dbFilename = path.basename(item.dbPath)
        console.log(`  ❌ DB: ${dbFilename}`)
        console.log(`  ✓  Fichier: ${item.actualFile}`)
        console.log(`     Alt: ${item.alt || 'N/A'}`)
        console.log(`     ID: ${item.assetId}`)
        console.log('')
      })
    })

    console.log('\n' + '='.repeat(70))
    console.log('📊 RÉSUMÉ PAR DOSSIER:\n')
    Object.entries(byFolder).forEach(([folder, items]) => {
      console.log(`  ${folder}: ${items.length} problèmes`)
    })

  } else {
    console.log('✅ Aucun problème de casse détecté - tous les fichiers correspondent')
  }

  console.log('\n' + '='.repeat(70))
}

checkFilenameCaseMismatch()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
