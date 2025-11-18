import { ProjetsPageClient } from "@/components/sections/projets-page-client";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n-config";

interface ProjetsPageParams {
  params: Promise<{
    locale: Locale;
  }>;
}

export default async function ProjetsPage({ params }: ProjetsPageParams) {
  const { locale } = await params;
  const safeLocale = (locale === "en" ? "en" : "fr") as Locale;
  const dictionary = await getDictionary(safeLocale);

  return (
    <ProjetsPageClient
      locale={safeLocale}
      nav={{ home: dictionary.nav.home, projets: dictionary.nav.projets }}
      copy={dictionary.projetsPage}
      viewProjectLabel={dictionary.cta.viewProject}
    />
  );
}
