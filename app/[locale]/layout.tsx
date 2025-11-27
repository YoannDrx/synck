import type { Metadata } from 'next'
import { headers } from 'next/headers'

import { getDictionary } from '@/lib/dictionaries'
import { i18n } from '@/lib/i18n-config'

import { SiteHeader } from '@/components/layout/site-header'

export function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const safeLocale = locale === 'en' ? 'en' : 'fr'

  return {
    title:
      safeLocale === 'fr' ? 'SYNCK - Caroline Senyk Projets' : 'SYNCK - Caroline Senyk Projects',
    description:
      safeLocale === 'fr'
        ? "Gestionnaire de droits d'auteur et experte en droits musicaux"
        : 'Copyright Manager & Music Rights Expert',
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const safeLocale = locale === 'en' ? 'en' : 'fr'
  const dictionary = await getDictionary(safeLocale)
  const headersList = await headers()

  // Get current path from headers
  const currentPath =
    headersList.get('x-pathname') ??
    headersList.get('x-invoke-path') ??
    headersList.get('x-matched-path') ??
    headersList.get('next-url') ??
    ''

  // More strict check: path must START with /locale/admin, not just contain it
  // This prevents false positives from referer headers
  const isAdmin = currentPath.startsWith(`/${safeLocale}/admin`)

  return (
    <>
      {!isAdmin && (
        <SiteHeader
          locale={safeLocale}
          navigation={dictionary.nav}
          language={dictionary.layout.language}
          menu={dictionary.layout.menu}
        />
      )}
      {children}
    </>
  )
}
