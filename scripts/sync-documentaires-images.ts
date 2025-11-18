import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const prisma = new PrismaClient()

async function syncDocumentairesImages() {
  console.log('🔄 SYNCHRONISATION DES IMAGES DOCUMENTAIRES\n')
  console.log('='.repeat(70))

  // Lire le fichier MD
  const mdPath = path.join(process.cwd(), 'content/expertises/fr/gestion-administrative-et-editoriale.md')
  const mdContent = fs.readFileSync(mdPath, 'utf8')
  const { data, content } = matter(mdContent)

  console.log(`\n📄 Fichier MD: ${data.documentaires?.length || 0} documentaires\n`)

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

  console.log(`📊 DB: ${works.length} documentaires\n`)

  // Créer un map title -> coverImage path
  const imageMap = new Map<string, string>()
  works.forEach(work => {
    const title = work.translations[0]?.title
    if (title && work.coverImage?.path) {
      // Normaliser le titre pour la comparaison
      const normalizedTitle = title.toLowerCase().trim()
      imageMap.set(normalizedTitle, work.coverImage.path)
    }
  })

  console.log('🔍 Recherche de correspondances...\n')

  let matched = 0
  let notMatched = 0

  // Mettre à jour les chemins d'images dans le MD
  if (data.documentaires) {
    data.documentaires = data.documentaires.map((doc: any) => {
      const normalizedTitle = doc.title.toLowerCase().trim()
      const dbImagePath = imageMap.get(normalizedTitle)

      if (dbImagePath) {
        matched++
        console.log(`✅ ${doc.title}`)
        return {
          ...doc,
          href: dbImagePath,
          src: dbImagePath,
          srcLg: dbImagePath
        }
      } else {
        notMatched++
        console.log(`❌ ${doc.title} (pas trouvé dans la DB)`)
        return doc
      }
    })
  }

  console.log(`\n📈 Résultats:`)
  console.log(`  ✅ Correspondances: ${matched}`)
  console.log(`  ❌ Non trouvés: ${notMatched}`)

  // Sauvegarder le fichier MD mis à jour
  const newContent = matter.stringify(content, data)
  fs.writeFileSync(mdPath, newContent, 'utf8')

  console.log(`\n💾 Fichier MD mis à jour!`)
  console.log('='.repeat(70))
}

syncDocumentairesImages()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
