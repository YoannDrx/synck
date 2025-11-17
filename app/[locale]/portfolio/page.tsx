import { PortfolioPageClient } from "@/components/sections/portfolio-page-client";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n-config";

interface PortfolioPageParams {
  params: Promise<{
    locale: Locale;
  }>;
}

export default async function PortfolioPage({ params }: PortfolioPageParams) {
  const { locale } = await params;
  const safeLocale = (locale === "en" ? "en" : "fr") as Locale;
  const dictionary = await getDictionary(safeLocale);

  return (
    <PortfolioPageClient
      locale={safeLocale}
      nav={{ home: dictionary.nav.home, portfolio: dictionary.nav.portfolio }}
      copy={dictionary.portfolioPage}
      viewProjectLabel={dictionary.cta.viewProject}
    />
  );
}
