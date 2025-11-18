import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

async function fixMesParents() {
  console.log('🔧 CORRECTION DE "MES PARENTS CES HÉROS ORDINAIRES"\n')
  console.log('='.repeat(80))

  const mdPath = path.join(process.cwd(), 'content/expertises/fr/gestion-administrative-et-editoriale.md')
  const mdContent = fs.readFileSync(mdPath, 'utf8')
  const { data, content } = matter(mdContent)

  const imagePath = '/images/projets/documentaires/13prods/mes-parents.jpg'

  if (data.documentaires) {
    data.documentaires = data.documentaires.map((doc: any) => {
      if (doc.title === 'Mes parents ces héros ordinaires') {
        console.log(`✅ Fixation de "${doc.title}"`)
        console.log(`   Ancien chemin: ${doc.srcLg}`)
        console.log(`   Nouveau chemin: ${imagePath}`)
        return {
          ...doc,
          href: imagePath,
          src: imagePath,
          srcLg: imagePath
        }
      }
      return doc
    })
  }

  // Sauvegarder
  const newContent = matter.stringify(content, data)
  fs.writeFileSync(mdPath, newContent, 'utf8')

  console.log(`\n💾 Fichier mis à jour!`)
  console.log('='.repeat(80))
}

fixMesParents()
  .catch(console.error)
