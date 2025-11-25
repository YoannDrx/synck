import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n-config";
import { ContactPageClient } from "@/components/sections/contact-page-client";

type ContactPageParams = {
  params: Promise<{
    locale: Locale;
  }>;
};

export default async function ContactPage({ params }: ContactPageParams) {
  const { locale } = await params;
  const safeLocale = locale === "en" ? "en" : "fr";
  const dictionary = await getDictionary(safeLocale);
  const copy = dictionary.contactPage;

  return (
    <ContactPageClient
      locale={safeLocale}
      nav={{
        home: dictionary.nav.home,
        contact: dictionary.nav.contact,
      }}
      copy={{
        heroDescription: copy.heroDescription,
        introTitle: copy.introTitle,
        introDescription: copy.introDescription,
        contactInfoTitle: copy.contactInfoTitle,
        emailLabel: copy.emailLabel,
        emailValue: copy.emailValue,
        locationLabel: copy.locationLabel,
        locationValue: copy.locationValue,
        linkedinLabel: copy.linkedinLabel,
        linkedinUrl: copy.linkedinUrl,
        linkedinCta: copy.linkedinCta,
        availabilityLabel: copy.availabilityLabel,
        availabilityValue: copy.availabilityValue,
        servicesTitle: copy.servicesTitle,
        services: copy.services,
        consultationTitle: copy.consultationTitle,
        consultationDescription: copy.consultationDescription,
      }}
      formDictionary={dictionary.contactForm}
    />
  );
}
