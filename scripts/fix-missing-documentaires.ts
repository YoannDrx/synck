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
    .replace(/['']/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s'-]/g, '')
}

// Calculer la similarité
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

async function fixMissing() {
  console.log('🔧 CORRECTION DES DOCUMENTAIRES MANQUANTS\n')
  console.log('='.repeat(80))

  // Lire le fichier MD
  const mdPath = path.join(process.cwd(), 'content/expertises/fr/gestion-administrative-et-editoriale.md')
  const mdContent = fs.readFileSync(mdPath, 'utf8')
  const { data, content } = matter(mdContent)

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
  const dbMap = new Map<string, { work: typeof works[0] }>()
  works.forEach(work => {
    const title = work.translations[0]?.title
    if (title) {
      const normalized = normalizeTitle(title)
      dbMap.set(normalized, { work })
    }
  })

  console.log(`\n📄 MD: ${data.documentaires?.length || 0} documentaires`)
  console.log(`📊 DB: ${works.length} documentaires\n`)

  let fixed = 0
  let skipped = 0

  // Mettre à jour les chemins d'images
  if (data.documentaires) {
    data.documentaires = data.documentaires.map((doc: any) => {
      const mdNormalized = normalizeTitle(doc.title)

      // Si l'image existe déjà et commence par /images/projets/, ne pas toucher
      if (doc.srcLg && doc.srcLg.startsWith('/images/projets/')) {
        skipped++
        return doc
      }

      // Chercher une correspondance exacte
      let match = dbMap.get(mdNormalized)

      // Si pas de correspondance exacte, chercher par similarité
      if (!match) {
        let bestMatch: { work: typeof works[0]; similarity: number } | undefined
        let bestSimilarity = 0

        for (const [normalized, { work }] of dbMap.entries()) {
          const sim = similarity(mdNormalized, normalized)
          if (sim > bestSimilarity && sim >= 0.80) { // Seuil de 80%
            bestSimilarity = sim
            bestMatch = { work, similarity: sim }
          }
        }

        if (bestMatch && bestMatch.work.coverImage?.path) {
          const percent = Math.round(bestMatch.similarity * 100)
          console.log(`✅ ${doc.title}`)
          console.log(`   → ${bestMatch.work.translations[0]?.title} (${percent}%)`)
          console.log(`   → ${bestMatch.work.coverImage.path}`)
          fixed++
          return {
            ...doc,
            href: bestMatch.work.coverImage.path,
            src: bestMatch.work.coverImage.path,
            srcLg: bestMatch.work.coverImage.path
          }
        }
      } else if (match.work.coverImage?.path) {
        console.log(`✅ ${doc.title} (exact)`)
        fixed++
        return {
          ...doc,
          href: match.work.coverImage.path,
          src: match.work.coverImage.path,
          srcLg: match.work.coverImage.path
        }
      }

      return doc
    })
  }

  console.log(`\n📈 Résultats:`)
  console.log(`  ✅ Fixés: ${fixed}`)
  console.log(`  ⏭️  Ignorés (déjà corrects): ${skipped}`)
  console.log(`  ❌ Restants: ${data.documentaires.length - fixed - skipped}`)

  // Sauvegarder le fichier MD mis à jour
  const newContent = matter.stringify(content, data)
  fs.writeFileSync(mdPath, newContent, 'utf8')

  console.log(`\n💾 Fichier MD mis à jour!`)
  console.log('='.repeat(80))
}

fixMissing()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
