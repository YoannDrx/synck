import { getDictionary } from '@/lib/dictionaries'
import type { Locale } from '@/lib/i18n-config'

import { HomePage } from '@/components/sections/home-page'

type HomePageParams = {
  params: Promise<{
    locale: Locale
  }>
}

export default async function LocaleHome({ params }: HomePageParams) {
  const { locale } = await params
  const safeLocale = locale === 'en' ? 'en' : 'fr'
  const dictionary = await getDictionary(safeLocale)

  return <HomePage locale={safeLocale} layout={dictionary.layout} home={dictionary.home} />
}
