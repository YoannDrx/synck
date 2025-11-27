import { notFound } from 'next/navigation'

import type { Locale } from '@/lib/i18n-config'

type BlogDetailParams = {
  params: Promise<{
    locale: Locale
    slug: string
  }>
}

export default async function BlogDetailPage({ params }: BlogDetailParams) {
  await params
  notFound()
}

export function generateStaticParams() {
  return []
}
