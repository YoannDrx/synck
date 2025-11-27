import { getDictionary } from '@/lib/dictionaries'
import type { Locale } from '@/lib/i18n-config'
import { getArtistsFromPrisma, getProjetsFromPrisma } from '@/lib/prismaProjetsUtils'

import { ArtistesPageClient } from '@/components/sections/artistes-page-client'

type ArtistsPageParams = {
  params: Promise<{
    locale: Locale
  }>
}

export default async function ComposeursPage({ params }: ArtistsPageParams) {
  const { locale } = await params
  const safeLocale = locale === 'en' ? 'en' : 'fr'
  const artists = await getArtistsFromPrisma(safeLocale)
  const projets = await getProjetsFromPrisma(safeLocale)
  const dictionary = await getDictionary(safeLocale)
  const copy = dictionary.artistsPage

  return (
    <ArtistesPageClient
      locale={safeLocale}
      artists={artists}
      totalProjects={projets.length}
      nav={{
        home: dictionary.nav.home,
        artists: dictionary.nav.artists,
      }}
      copy={copy}
    />
  )
}
