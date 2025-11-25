import { getDictionary } from "@/lib/dictionaries";
import { getAllExpertises } from "@/lib/prismaExpertiseUtils";
import type { Locale } from "@/lib/i18n-config";
import { ExpertisesPageClient } from "@/components/sections/expertises-page-client";

type ExpertisesPageParams = {
  params: Promise<{
    locale: Locale;
  }>;
};

export default async function ExpertisesPage({ params }: ExpertisesPageParams) {
  const { locale } = await params;
  const safeLocale = locale === "en" ? "en" : "fr";
  const dictionary = await getDictionary(safeLocale);
  const expertises = await getAllExpertises(safeLocale);
  const copy = dictionary.expertisesPage;

  return (
    <ExpertisesPageClient
      locale={safeLocale}
      expertises={expertises}
      nav={{
        home: dictionary.nav.home,
        expertises: dictionary.nav.expertises,
      }}
      copy={{
        description: copy.description,
        cardCta: copy.cardCta,
        ctaTitle: copy.ctaTitle,
        ctaDescription: copy.ctaDescription,
        ctaButton: copy.ctaButton,
      }}
    />
  );
}
