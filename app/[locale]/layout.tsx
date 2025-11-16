import type { Metadata } from "next";
import { i18n, type Locale } from "@/lib/i18n-config";

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale = (locale === "en" ? "en" : "fr") as Locale;

  return {
    title: safeLocale === "fr" ? "SYNCK - Caroline Senyk Portfolio" : "SYNCK - Caroline Senyk Portfolio",
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
  await params;
  return <>{children}</>;
}
