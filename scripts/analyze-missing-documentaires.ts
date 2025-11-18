import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const prisma = new PrismaClient()

// Normalisation du titre pour comparaison
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/['']/g, "'")  // Normaliser les apostrophes
    .replace(/[–—]/g, '-')  // Normaliser les tirets
    .replace(/\s+/g, ' ')   // Normaliser les espaces
    .replace(/[^\w\s'-]/g, '') // Retirer la ponctuation
}

// Calculer la similarité entre deux chaînes (Levenshtein simplifié)
function similarity(s1: string, s2: string): number {
  const longer = s1.length > s2.length ? s1 : s2
  const shorter = s1.length > s2.length ? s2 : s1

  if (longer.length === 0) return 1.0

  const editDistance = levenshteinDistance(longer, shorter)
  return (longer.length - editDistance) / longer.length
}

function levenshteinDistance(s1: string, s2: string): number {
  const costs: number[] = []
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j
      } else if (j > 0) {
        let newValue = costs[j - 1]
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1
        }
        costs[j - 1] = lastValue
        lastValue = newValue
      }
    }
    if (i > 0) costs[s2.length] = lastValue
  }
  return costs[s2.length]
}

async function analyzeMissing() {
  console.log('🔍 ANALYSE DÉTAILLÉE DES DOCUMENTAIRES MANQUANTS\n')
  console.log('='.repeat(80))

  // Lire le fichier MD
  const mdPath = path.join(process.cwd(), 'content/expertises/fr/gestion-administrative-et-editoriale.md')
  const mdContent = fs.readFileSync(mdPath, 'utf8')
  const { data } = matter(mdContent)

  // Récupérer tous les documentaires de la DB
  const works = await prisma.work.findMany({
    where: {
      isActive: true,
      category: { slug: 'documentaires' }
    },
    include: {
      coverImage: true,
      translations: { where: { locale: 'fr' } }
    }
  })

  // Créer des maps pour la comparaison
  const dbTitles = new Map<string, { work: typeof works[0], normalized: string }>()
  works.forEach(work => {
    const title = work.translations[0]?.title
    if (title) {
      const normalized = normalizeTitle(title)
      dbTitles.set(normalized, { work, normalized })
    }
  })

  console.log(`\n📄 MD: ${data.documentaires?.length || 0} documentaires`)
  console.log(`📊 DB: ${works.length} documentaires\n`)
  console.log('='.repeat(80))

  const missing: Array<{ mdTitle: string; bestMatch?: { dbTitle: string; similarity: number; path: string } }> = []

  // Analyser chaque documentaire du MD
  if (data.documentaires) {
    for (const doc of data.documentaires) {
      const mdNormalized = normalizeTitle(doc.title)

      // Chercher une correspondance exacte
      const exactMatch = dbTitles.get(mdNormalized)

      if (!exactMatch) {
        // Chercher la meilleure correspondance par similarité
        let bestMatch: { dbTitle: string; similarity: number; path: string } | undefined
        let bestSimilarity = 0

        for (const [normalized, { work }] of dbTitles.entries()) {
          const sim = similarity(mdNormalized, normalized)
          if (sim > bestSimilarity && sim > 0.6) { // Seuil de 60% de similarité
            bestSimilarity = sim
            bestMatch = {
              dbTitle: work.translations[0]?.title || work.slug,
              similarity: sim,
              path: work.coverImage?.path || ''
            }
          }
        }

        missing.push({ mdTitle: doc.title, bestMatch })
      }
    }
  }

  console.log(`\n❌ DOCUMENTAIRES NON TROUVÉS: ${missing.length}\n`)

  // Afficher les résultats
  missing.forEach((item, index) => {
    console.log(`${index + 1}. MD: "${item.mdTitle}"`)
    if (item.bestMatch) {
      const percent = Math.round(item.bestMatch.similarity * 100)
      console.log(`   🎯 Meilleure correspondance (${percent}%): "${item.bestMatch.dbTitle}"`)
      console.log(`   📷 Image: ${item.bestMatch.path || 'N/A'}`)
    } else {
      console.log(`   ❌ Aucune correspondance trouvée dans la DB`)
    }
    console.log()
  })

  console.log('='.repeat(80))

  // Vérifier aussi les images locales
  const localImagesDir = path.join(process.cwd(), 'public/images/projets/documentaires')
  if (fs.existsSync(localImagesDir)) {
    const localImages = fs.readdirSync(localImagesDir)
    console.log(`\n📁 Images locales dans documentaires/: ${localImages.length} fichiers`)
  }

  console.log('\n💡 Suggestions:')
  console.log('   1. Les titres avec >80% de similarité peuvent être mappés automatiquement')
  console.log('   2. Les autres nécessitent une vérification manuelle')
}

analyzeMissing()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
