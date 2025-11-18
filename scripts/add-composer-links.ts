import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Mapping des noms de compositeurs aux liens
const composerLinks: Record<string, Array<{ platform: string; url: string; label?: string }>> = {
  '2080': [
    { platform: 'youtube', url: 'https://www.youtube.com/@The2080', label: 'YouTube Channel' },
    { platform: 'soundcloud', url: 'https://soundcloud.com/2080', label: 'SoundCloud' }
  ],
  'Minimatic': [
    { platform: 'youtube', url: 'https://www.youtube.com/@MinimaticMusic', label: 'YouTube Channel' },
    { platform: 'soundcloud', url: 'https://soundcloud.com/minimatic', label: 'SoundCloud' }
  ],
  'Mutant Ninja Records': [
    { platform: 'youtube', url: 'https://www.youtube.com/@MutantNinjaRecords', label: 'YouTube Channel' },
    { platform: 'soundcloud', url: 'https://soundcloud.com/mutantninja', label: 'SoundCloud' },
    { platform: 'soundcloud', url: 'https://soundcloud.com/tcheep', label: 'Tcheep' },
    { platform: 'soundcloud', url: 'https://soundcloud.com/Liqid', label: 'Liqid' },
    { platform: 'soundcloud', url: 'https://soundcloud.com/Bonetrips', label: 'Bonetrips' },
    { platform: 'soundcloud', url: 'https://soundcloud.com/arom-de-la-spirale', label: 'Arom de la Spirale' },
    { platform: 'soundcloud', url: 'https://soundcloud.com/chicho-cortez', label: 'Chicho Cortez' }
  ],
  '9 O\'Clock': [
    { platform: 'youtube', url: 'https://www.youtube.com/@9oclock162', label: 'YouTube Channel' },
    { platform: 'soundcloud', url: 'https://soundcloud.com/9-oclock', label: 'SoundCloud' }
  ],
  'BEATSQUEEZE RECORDS': [
    { platform: 'youtube', url: 'https://www.youtube.com/@BEATSQUEEZE', label: 'YouTube Channel' },
    { platform: 'soundcloud', url: 'https://soundcloud.com/mistermodouglymacbeer', label: 'SoundCloud' }
  ],
  'UGLY MAC BEER': [
    { platform: 'youtube', url: 'https://www.youtube.com/channel/UCj8mVWiBl256CIfVl3qFHwA', label: 'YouTube Channel' },
    { platform: 'soundcloud', url: 'https://soundcloud.com/uglymacbeer', label: 'SoundCloud' }
  ],
  'MISTER MODO': [
    { platform: 'youtube', url: 'https://www.youtube.com/channel/UCj8mVWiBl256CIfVl3qFHwA', label: 'YouTube Channel' },
    { platform: 'soundcloud', url: 'https://soundcloud.com/mister-modo', label: 'SoundCloud' }
  ],
  'Mr Viktor': [
    { platform: 'youtube', url: 'https://www.youtube.com/channel/UC4U1YdCBptWTIrrXWpck52w', label: 'YouTube Channel' },
    { platform: 'soundcloud', url: 'https://soundcloud.com/mr-viktor', label: 'SoundCloud' }
  ],
  'ARAT KILO': [
    { platform: 'youtube', url: 'https://www.youtube.com/@aratkilo7994', label: 'YouTube Channel' },
    { platform: 'soundcloud', url: 'https://soundcloud.com/arat_kilo_band', label: 'SoundCloud' }
  ],
  'N\'ZENG': [
    { platform: 'youtube', url: 'https://www.youtube.com/@nzeng5115', label: 'YouTube Channel' },
    { platform: 'soundcloud', url: 'https://soundcloud.com/nzeng', label: 'SoundCloud N\'ZENG' },
    { platform: 'soundcloud', url: 'https://soundcloud.com/s-bastien-blanchon', label: 'SoundCloud Sébastien Blanchon' }
  ],
  'NICODRUM & FRIENDS': [
    { platform: 'youtube', url: 'https://www.youtube.com/channel/UC-wBKGqXxqbzTJM2xQH42ug', label: 'YouTube Channel' },
    { platform: 'spotify', url: 'https://open.spotify.com/intl-fr/artist/55h2juci7J6sa1hSIBYf3W', label: 'Spotify' }
  ],
  'Laurent Dury': [
    { platform: 'youtube', url: 'https://www.youtube.com/channel/UCmmr9nj-GOwiB3qB2xGa2ow', label: 'YouTube Channel' },
    { platform: 'soundcloud', url: 'https://soundcloud.com/laurentdury', label: 'SoundCloud' }
  ],
  'THE REAL FAKE MC': [
    { platform: 'youtube', url: 'https://www.youtube.com/@THEREALFAKEMC', label: 'YouTube Channel' },
    { platform: 'soundcloud', url: 'https://soundcloud.com/therealfakemc', label: 'SoundCloud' }
  ],
  'MADBEN': [
    { platform: 'youtube', url: 'https://www.youtube.com/channel/UChTegJsrojWlBiUhpWY7IOQ', label: 'YouTube Channel' },
    { platform: 'soundcloud', url: 'https://soundcloud.com/madben', label: 'SoundCloud' }
  ],
  'Drixxxé': [
    { platform: 'youtube', url: 'https://www.youtube.com/user/DRIXXXEBEATS', label: 'YouTube Channel' },
    { platform: 'soundcloud', url: 'https://soundcloud.com/drixxxe-2', label: 'SoundCloud' }
  ],
  'Cœur': [
    { platform: 'youtube', url: 'https://www.youtube.com/@Coeurkokoro', label: 'YouTube Channel' },
    { platform: 'soundcloud', url: 'https://soundcloud.com/user-585670844', label: 'SoundCloud' }
  ],
  'After In Paris': [
    { platform: 'youtube', url: 'https://www.youtube.com/channel/UCTEyPqy3PEAGWDDGr03sysw', label: 'YouTube Channel' }
  ],
  'The Architect': [
    { platform: 'youtube', url: 'https://www.youtube.com/channel/UCB5YJuWzpqeAa-t6wDwZBpw', label: 'YouTube Channel' },
    { platform: 'soundcloud', url: 'https://soundcloud.com/fresh-and-dusty-loops', label: 'SoundCloud' }
  ],
  'JB HANAK': [
    { platform: 'facebook', url: 'https://www.facebook.com/jbhak/?locale=fr_FR', label: 'Facebook' }
  ],
  'dDamage': [
    { platform: 'youtube', url: 'https://www.youtube.com/channel/UCuSV_oQIah-mMF8C6OcvQdQ', label: 'YouTube Channel' }
  ],
  'dDash': [
    { platform: 'apple-music', url: 'https://music.apple.com/us/artist/ddash/412245274?l=fr-FR', label: 'Apple Music' },
    { platform: 'spotify', url: 'https://open.spotify.com/intl-fr/artist/2HXjjAcmNeyqM1InDkqFbu', label: 'Spotify' }
  ],
  'Cédric HANAK': [
    { platform: 'spotify', url: 'https://open.spotify.com/intl-fr/artist/12M2hO0FUtnsXYMp5jjGuN', label: 'Spotify' }
  ],
  'BRUNO HOVART': [
    { platform: 'youtube', url: 'https://www.youtube.com/@brunopatchworks4249', label: 'YouTube Channel' }
  ],
  'Yann Kornowicz': [
    { platform: 'youtube', url: 'https://www.youtube.com/channel/UCNVPNRi4dBCOeCBG0rJJ-IA', label: 'YouTube Channel' },
    { platform: 'soundcloud', url: 'https://soundcloud.com/chaosinchatelet', label: 'SoundCloud' }
  ],
  'F. STOKES': [
    { platform: 'youtube', url: 'https://www.youtube.com/@TheRealFStokes', label: 'YouTube Channel' }
  ],
  'FLORE': [
    { platform: 'youtube', url: 'https://www.youtube.com/@FloreMusic/releases', label: 'YouTube Channel' },
    { platform: 'soundcloud', url: 'https://soundcloud.com/flore', label: 'SoundCloud' }
  ],
  'SYRA': [
    { platform: 'youtube', url: 'https://www.youtube.com/@syra7874/featured', label: 'YouTube Channel' },
    { platform: 'soundcloud', url: 'https://soundcloud.com/syra-sc', label: 'SoundCloud' }
  ],
  'DJ TROUBL': [
    { platform: 'soundcloud', url: 'https://soundcloud.com/djtroubl', label: 'SoundCloud' }
  ],
  'Modulhater': [
    { platform: 'soundcloud', url: 'https://soundcloud.com/lediktat', label: 'SoundCloud' }
  ],
  'BLANKA': [
    { platform: 'soundcloud', url: 'https://soundcloud.com/blankalfe', label: 'SoundCloud' }
  ],
  'ARANDEL': [
    { platform: 'soundcloud', url: 'https://soundcloud.com/arandel', label: 'SoundCloud' }
  ],
  'NSDOS': [
    { platform: 'youtube', url: 'https://www.youtube.com/@NSDOS', label: 'YouTube Channel' },
    { platform: 'soundcloud', url: 'https://soundcloud.com/nsdoslazerconnect', label: 'SoundCloud' }
  ],
  'Well Quartet': [
    { platform: 'youtube', url: 'https://www.youtube.com/@WellQuartet', label: 'YouTube Channel' },
    { platform: 'soundcloud', url: 'https://soundcloud.com/wellquartet', label: 'SoundCloud' }
  ],
  'Charlotte Savary': [
    { platform: 'youtube', url: 'https://www.youtube.com/@CharlotteSavaryMusic/featured', label: 'YouTube Channel' },
    { platform: 'soundcloud', url: 'https://soundcloud.com/charlottesavary', label: 'SoundCloud' }
  ],
  'Aeon Seven': [
    { platform: 'youtube', url: 'https://www.youtube.com/@aeonseven4130', label: 'YouTube Channel' },
    { platform: 'soundcloud', url: 'https://soundcloud.com/aeon-seven', label: 'SoundCloud' }
  ],
  'DUCER': [
    { platform: 'soundcloud', url: 'https://soundcloud.com/ducermusic', label: 'SoundCloud' }
  ],
  'PANA BLACK': [
    { platform: 'soundcloud', url: 'https://soundcloud.com/panablack', label: 'SoundCloud' }
  ],
  'PALMACOCO RECORDS': [
    { platform: 'soundcloud', url: 'https://soundcloud.com/palmacoco', label: 'SoundCloud' }
  ],
  'SR ORTEGON': [
    { platform: 'youtube', url: 'https://www.youtube.com/@SrOrtegon', label: 'YouTube Channel' }
  ],
  'Emmanuel Marée': [
    { platform: 'spotify', url: 'https://open.spotify.com/intl-fr/artist/6WPBlXYBmOPAoZAxSeBORf', label: 'Spotify' }
  ],
  'SCHERAZADE': [
    { platform: 'facebook', url: 'https://www.facebook.com/scherazadeofficiel', label: 'Facebook' },
    { platform: 'youtube', url: 'https://www.youtube.com/channel/UCsG36srWE1YHxYJI6ASnKGQ', label: 'YouTube Channel' }
  ],
  'VIRO MAJOR RECORDS': [
    { platform: 'facebook', url: 'https://www.facebook.com/viromajor/', label: 'Facebook' },
    { platform: 'bandcamp', url: 'https://viromajorrecords.bandcamp.com/', label: 'Bandcamp' }
  ],
  'FOREVER PAVOT': [
    { platform: 'facebook', url: 'https://www.facebook.com/ForeverPavot/?locale=fr_FR', label: 'Facebook' },
    { platform: 'spotify', url: 'https://open.spotify.com/intl-fr/artist/0IeJOb65ZEwVTKs77bx9vW', label: 'Spotify' }
  ],
  'ANA KAP': [
    { platform: 'facebook', url: 'https://www.facebook.com/anakaptrio/?locale=fr_FR', label: 'Facebook' },
    { platform: 'youtube', url: 'https://www.youtube.com/@anakap8263', label: 'YouTube Channel' }
  ],
  'Cory Tate': [
    { platform: 'youtube', url: 'https://www.youtube.com/channel/UCvzoh7xQ3fYX47auU_HCc2w', label: 'YouTube Channel' },
    { platform: 'soundcloud', url: 'https://soundcloud.com/corytate', label: 'SoundCloud' }
  ],
  'Chris Kemp': [
    { platform: 'soundcloud', url: 'https://soundcloud.com/kempfest', label: 'SoundCloud' }
  ],
  'ROMA LUCA': [
    { platform: 'youtube', url: 'https://www.youtube.com/@romaluca', label: 'YouTube Channel' },
    { platform: 'soundcloud', url: 'https://soundcloud.com/camilleluca', label: 'SoundCloud' }
  ],
  'DAN AMOZIG': [
    { platform: 'facebook', url: 'https://www.facebook.com/daniel.amozig', label: 'Facebook' }
  ],
  'NICOLAS PISANI': [
    { platform: 'soundcloud', url: 'https://soundcloud.com/cosmicdude', label: 'SoundCloud' }
  ],
  'REBECCA MEYER': [
    { platform: 'youtube', url: 'https://www.youtube.com/channel/UCRweKKqx5mtXOkRuFy8yXVg/about', label: 'YouTube Channel' },
    { platform: 'spotify', url: 'https://open.spotify.com/intl-fr/artist/4tpHyEUjJcXlLSQPBpSNkk', label: 'Spotify' }
  ],
  'DJ HERTZ': [
    { platform: 'soundcloud', url: 'https://soundcloud.com/djhertz-music', label: 'SoundCloud' }
  ],
  'LOIC LAPORTE': [
    { platform: 'spotify', url: 'https://open.spotify.com/intl-fr/artist/0vtfBa0fLhllA1mwMNGGnj', label: 'Spotify' },
    { platform: 'youtube', url: 'https://www.youtube.com/channel/UCjcp93JQUJwdY2CsZimsMXw', label: 'YouTube Channel' }
  ],
  'Fabien Girard': [
    { platform: 'website', url: 'https://www.fabien-girard.com/', label: 'Official Website' }
  ],
  'Xavier Sibre': [
    { platform: 'soundcloud', url: 'https://soundcloud.com/xavier-sibre', label: 'SoundCloud' }
  ],
  'Zoé Wolf': [
    { platform: 'spotify', url: 'https://open.spotify.com/intl-fr/artist/6sJbyR4JKjsQaCp6T0E3Pz', label: 'Spotify' }
  ],
  'Cally Reed': [
    { platform: 'spotify', url: 'https://open.spotify.com/intl-fr/artist/4R7CNJ3OyT9G1bEkvcCi9X', label: 'Spotify' }
  ],
  'Les Cavaliers': [
    { platform: 'spotify', url: 'https://open.spotify.com/intl-fr/artist/68VVrFrf8sXN9NxkIRvYNO', label: 'Spotify' }
  ],
  'Les Arondes': [
    { platform: 'spotify', url: 'https://open.spotify.com/intl-fr/artist/5TugFO50h3uzx6lsAmZaoA', label: 'Spotify' }
  ],
  'LovLion': [
    { platform: 'spotify', url: 'https://open.spotify.com/intl-fr/artist/4iLSUJSIR7y2vknbGaZXD1', label: 'Spotify' }
  ],
  'DaXoVii': [
    { platform: 'spotify', url: 'https://open.spotify.com/intl-fr/artist/4nQRld5mxpXtOY7GJt7AJN', label: 'Spotify' }
  ],
  'Hexahedre': [
    { platform: 'website', url: 'https://www.mowno.com/news/infos/avec-hexahedre-jb-hanak-et-cyril-laurent-invitent-au-voyage-extra-corporel/', label: 'Article Mowno' }
  ],
  'Marie Sophie Mallet': [
    { platform: 'spotify', url: 'https://open.spotify.com/intl-fr/track/4BOrPAF6kbOW3mXbLQrfgX', label: 'Spotify Track' }
  ]
}

async function addComposerLinks() {
  console.log('🔗 AJOUT DES LIENS DES COMPOSITEURS\n')
  console.log('='.repeat(80))

  let added = 0
  let skipped = 0
  let notFound = 0
  let errors = 0

  for (const [composerName, links] of Object.entries(composerLinks)) {
    console.log(`\n📝 Traitement: "${composerName}"`)

    try {
      // Chercher le compositeur par nom (translations)
      const composers = await prisma.composer.findMany({
        where: {
          translations: {
            some: {
              name: {
                contains: composerName,
                mode: 'insensitive'
              }
            }
          }
        },
        include: {
          translations: { where: { locale: 'fr' } },
          links: true
        }
      })

      if (composers.length === 0) {
        console.log(`   ❌ Compositeur non trouvé dans la DB`)
        notFound++
        continue
      }

      if (composers.length > 1) {
        console.log(`   ⚠️  Plusieurs compositeurs trouvés (${composers.length}), utilisation du premier`)
      }

      const composer = composers[0]
      console.log(`   ✅ Compositeur trouvé: ${composer.translations[0]?.name} (${composer.slug})`)
      console.log(`   📊 Liens existants: ${composer.links.length}`)

      // Ajouter les liens manquants
      for (const link of links) {
        // Vérifier si le lien existe déjà
        const existingLink = composer.links.find(l => l.url === link.url)

        if (existingLink) {
          console.log(`   ⏭️  Lien existe déjà: ${link.platform} - ${link.url}`)
          skipped++
          continue
        }

        // Créer le lien
        await prisma.composerLink.create({
          data: {
            composerId: composer.id,
            platform: link.platform,
            url: link.url,
            label: link.label,
            order: composer.links.length
          }
        })

        console.log(`   ✅ Lien ajouté: ${link.platform} - ${link.url}`)
        added++
      }

    } catch (error) {
      console.log(`   ❌ Erreur: ${error}`)
      errors++
    }
  }

  console.log('\n' + '='.repeat(80))
  console.log(`\n📊 Résultats:`)
  console.log(`   ✅ Liens ajoutés: ${added}`)
  console.log(`   ⏭️  Liens ignorés (déjà présents): ${skipped}`)
  console.log(`   ❌ Compositeurs non trouvés: ${notFound}`)
  console.log(`   ❌ Erreurs: ${errors}`)
  console.log('\n' + '='.repeat(80))
}

addComposerLinks()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
