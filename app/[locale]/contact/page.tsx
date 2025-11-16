import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n-config";
import { ContactForm } from "@/components/contact-form";
import { Breadcrumb } from "@/components/breadcrumb";

interface ContactPageParams {
  params: Promise<{
    locale: Locale;
  }>;
}

export default async function ContactPage({ params }: ContactPageParams) {
  const { locale } = await params;
  const safeLocale = (locale === "en" ? "en" : "fr") as Locale;
  const dictionary = await getDictionary(safeLocale);
  const contactLabel = dictionary.nav.contact;
  const copy = dictionary.contactPage;

  return (
    <div className="relative min-h-screen bg-[#050505] text-white">
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(213,255,10,0.15),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(255,75,162,0.1),transparent_50%)]" />
        <div className="absolute inset-0 noise-layer" />
      </div>

      <main className="relative z-10 w-full max-w-[1600px] mx-auto px-4 pb-20 pt-8 sm:pt-16 sm:px-8 lg:px-16">
        <Breadcrumb
          items={[
            { label: dictionary.nav.home, href: `/${safeLocale}` },
            { label: contactLabel },
          ]}
        />

        <div className="mb-8 sm:mb-12">
          <h1 className="mb-2 text-4xl font-black uppercase tracking-tighter sm:text-8xl lg:text-9xl">
            <span className="bg-gradient-to-r from-lime-300 to-emerald-400 bg-clip-text text-transparent">
              {contactLabel.charAt(0)}
            </span>
            <span>{contactLabel.slice(1)}</span>
          </h1>
          <p className="text-lg text-white/70 max-w-2xl">{copy.heroDescription}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-8">
            <div className="border-4 border-white/10 bg-[#0a0a0e] p-8 shadow-[0_25px_60px_rgba(0,0,0,0.65)]">
              <h2 className="mb-2 text-2xl font-bold uppercase tracking-tight">{copy.introTitle}</h2>
              <p className="text-white/60 mb-8 text-sm">{copy.introDescription}</p>
              <ContactForm dictionary={dictionary.contactForm} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="border-4 border-white/10 bg-[#0a0a0e] p-8 shadow-[0_25px_60px_rgba(0,0,0,0.65)]">
              <h3 className="mb-6 text-xl font-bold uppercase tracking-tight">{copy.contactInfoTitle}</h3>

              <div className="mb-6 pb-6 border-b border-white/10">
                <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-lime-300">{copy.emailLabel}</h4>
                <a href={`mailto:${copy.emailValue}`} className="text-base font-bold hover:text-lime-300 transition-colors break-all">
                  {copy.emailValue}
                </a>
              </div>

              <div className="mb-6 pb-6 border-b border-white/10">
                <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-lime-300">{copy.locationLabel}</h4>
                <p className="text-sm font-bold text-white">{copy.locationValue}</p>
              </div>

              <div className="mb-6 pb-6 border-b border-white/10">
                <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-lime-300">{copy.linkedinLabel}</h4>
                <a
                  href={copy.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-base font-bold hover:text-lime-300 transition-colors"
                >
                  <span>{copy.linkedinCta}</span>
                  <span>↗</span>
                </a>
              </div>

              <div>
                <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-lime-300">{copy.availabilityLabel}</h4>
                <p className="text-sm text-white/70 leading-relaxed">{copy.availabilityValue}</p>
              </div>
            </div>

            <div className="border-4 border-white/10 bg-[#0a0a0e] p-8 shadow-[0_25px_60px_rgba(0,0,0,0.65)]">
              <h3 className="mb-6 text-xl font-bold uppercase tracking-tight">{copy.servicesTitle}</h3>
              <ul className="space-y-4 text-sm text-white/70">
                {copy.services.map((service) => (
                  <li key={service.title} className="flex items-start gap-3">
                    <span className="text-lime-300 font-bold text-base">→</span>
                    <div>
                      <div className="font-bold text-white mb-1">{service.title}</div>
                      <div className="text-xs text-white/50">{service.description}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-4 border-lime-300 bg-gradient-to-r from-lime-300 to-emerald-400 p-8 text-center">
              <h3 className="mb-2 text-2xl font-bold uppercase text-[#050505]">{copy.consultationTitle}</h3>
              <p className="text-sm text-[#050505]/80">{copy.consultationDescription}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
