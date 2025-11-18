import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

async function listRemaining() {
  console.log('📋 DOCUMENTAIRES RESTANTS À CORRIGER\n')
  console.log('='.repeat(80))

  // Lire le fichier MD
  const mdPath = path.join(process.cwd(), 'content/expertises/fr/gestion-administrative-et-editoriale.md')
  const mdContent = fs.readFileSync(mdPath, 'utf8')
  const { data } = matter(mdContent)

  const remaining: any[] = []

  if (data.documentaires) {
    data.documentaires.forEach((doc: any, index: number) => {
      // Un documentaire n'est pas corrigé si son srcLg ne commence pas par /images/projets/
      if (!doc.srcLg || !doc.srcLg.startsWith('/images/projets/')) {
        remaining.push({ ...doc, index: index + 1 })
      }
    })
  }

  console.log(`\n❌ DOCUMENTAIRES NON CORRIGÉS: ${remaining.length}\n`)

  remaining.forEach((doc, i) => {
    console.log(`${i + 1}. "${doc.title}"`)
    console.log(`   Position: #${doc.index}/${data.documentaires.length}`)
    console.log(`   Catégorie: ${doc.category || 'N/A'}`)
    console.log(`   Chemin actuel: ${doc.srcLg || 'N/A'}`)
    console.log(`   Lien: ${doc.link || 'N/A'}`)
    console.log()
  })

  console.log('='.repeat(80))
}

listRemaining()
  .catch(console.error)
