import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { getDictionary } from "@/lib/dictionaries";
import { i18n } from "@/lib/i18n-config";

export function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale = (locale === "en" ? "en" : "fr");

  return {
    title: safeLocale === "fr" ? "SYNCK - Caroline Senyk Projets" : "SYNCK - Caroline Senyk Projects",
    description:
      safeLocale === "fr"
        ? "Gestionnaire de droits d'auteur et experte en droits musicaux"
        : "Copyright Manager & Music Rights Expert",
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safeLocale = (locale === "en" ? "en" : "fr");
  const dictionary = await getDictionary(safeLocale);

  return (
    <>
      <SiteHeader
        locale={safeLocale}
        navigation={dictionary.nav}
        language={dictionary.layout.language}
        menu={dictionary.layout.menu}
      />
      {children}
    </>
  );
}
