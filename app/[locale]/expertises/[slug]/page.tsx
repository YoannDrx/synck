import { notFound } from 'next/navigation'

import { getDictionary } from '@/lib/dictionaries'
import type { Locale } from '@/lib/i18n-config'
import { getAllExpertiseSlugs, getAllExpertises, getExpertise } from '@/lib/prismaExpertiseUtils'

import { ExpertiseDetailClient } from '@/components/sections/expertise-detail-client'

// Generate static params for all expertise slugs
export async function generateStaticParams() {
  const slugs = await getAllExpertiseSlugs()
  const locales: Locale[] = ['fr', 'en']

  const params: { locale: Locale; slug: string }[] = []

  locales.forEach((locale) => {
    slugs.forEach((slug) => {
      params.push({ locale, slug })
    })
  })

  return params
}

type ExpertiseDetailParams = {
  params: Promise<{
    locale: Locale
    slug: string
  }>
}

export default async function ExpertiseDetailPage({ params }: ExpertiseDetailParams) {
  const { locale, slug } = await params
  const safeLocale = locale === 'en' ? 'en' : 'fr'
  const expertise = await getExpertise(slug, safeLocale)
  const allExpertises = await getAllExpertises(safeLocale)
  const dictionary = await getDictionary(safeLocale)

  if (!expertise) {
    notFound()
  }

  return (
    <ExpertiseDetailClient
      locale={safeLocale}
      expertise={expertise}
      allExpertises={allExpertises}
      nav={dictionary.nav}
      copy={dictionary.expertiseDetail}
    />
  )
}
