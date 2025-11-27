import { notFound } from 'next/navigation'

import { getDictionary } from '@/lib/dictionaries'
import type { Locale } from '@/lib/i18n-config'
import { i18n } from '@/lib/i18n-config'
import { prisma } from '@/lib/prisma'

import { ArtistForm } from '@/components/admin/artist-form'

async function getArtist(id: string) {
  const artist = await prisma.artist.findUnique({
    where: { id },
    include: {
      translations: true,
      image: true,
      links: true,
    },
  })

  return artist
}

export default async function EditArtistePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale: rawLocale, id } = await params
  const locale = (
    i18n.locales.includes(rawLocale as Locale) ? rawLocale : i18n.defaultLocale
  ) as Locale

  const dict = await getDictionary(locale)
  const artist = await getArtist(id)

  if (!artist) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">{dict.admin.artists.editTitle}</h1>
        <p className="mt-2 text-white/50">
          Modifier le artiste{' '}
          {artist.translations.find((t) => t.locale === locale)?.name ??
            artist.translations[0]?.name}
        </p>
      </div>

      {/* Form */}
      <div className="rounded-lg border border-[var(--brand-neon)]/20 bg-black p-6">
        <ArtistForm dictionary={dict.admin} artist={artist} mode="edit" locale={locale} />
      </div>
    </div>
  )
}
