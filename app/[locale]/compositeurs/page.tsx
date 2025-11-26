import type { Locale } from "@/lib/i18n-config";
import { getComposersFromPrisma } from "@/lib/prismaProjetsUtils";
import { getDictionary } from "@/lib/dictionaries";
import { CompositeursPageClient } from "@/components/sections/compositeurs-page-client";

type ComposersPageParams = {
  params: Promise<{
    locale: Locale;
  }>;
};

export default async function ComposeursPage({ params }: ComposersPageParams) {
  const { locale } = await params;
  const safeLocale = locale === "en" ? "en" : "fr";
  const composers = await getComposersFromPrisma(safeLocale);
  const dictionary = await getDictionary(safeLocale);
  const copy = dictionary.composersPage;

  return (
    <CompositeursPageClient
      locale={safeLocale}
      composers={composers}
      nav={{
        home: dictionary.nav.home,
        composers: dictionary.nav.composers,
      }}
      copy={copy}
    />
  );
}
