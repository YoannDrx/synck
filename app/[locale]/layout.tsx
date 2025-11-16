import type { Metadata } from "next"
import { getDictionary } from "@/lib/dictionaries"
import { i18n, type Locale } from "@/lib/i18n-config"

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params

  return {
    title: locale === "fr" ? "SYNCK - Caroline Senyk Portfolio" : "SYNCK - Caroline Senyk Portfolio",
    description:
      locale === "fr"
        ? "Gestionnaire de droits d'auteur et experte en droits musicaux"
        : "Copyright Manager & Music Rights Expert",
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const dictionary = await getDictionary(locale)

  return <>{children}</>
}
