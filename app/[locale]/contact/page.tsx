import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n-config";
import { ContactForm } from "@/components/contact-form";
import { Breadcrumb } from "@/components/breadcrumb";

type ContactPageParams = {
  params: Promise<{
    locale: Locale;
  }>;
};

export default async function ContactPage({ params }: ContactPageParams) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);
  const contactLabel = dictionary.nav.contact;

  return (
    <div className="relative min-h-screen bg-[#050505] text-white">
      {/* Background layers */}
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(213,255,10,0.15),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(255,75,162,0.1),transparent_50%)]" />
        <div className="absolute inset-0 noise-layer" />
      </div>

      <main className="relative z-10 w-full max-w-[1600px] mx-auto px-4 pb-20 pt-16 sm:px-8 lg:px-16">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Accueil", href: `/${locale}` },
            { label: contactLabel },
          ]}
        />

        {/* Page Header */}
        <div className="mb-12">
          <h1 className="mb-2 text-7xl font-black uppercase tracking-tighter sm:text-8xl lg:text-9xl">
            <span className="bg-gradient-to-r from-lime-300 to-emerald-400 bg-clip-text text-transparent">
              {contactLabel.charAt(0)}
            </span>
            <span>{contactLabel.slice(1)}</span>
          </h1>
          <p className="text-lg text-white/70 max-w-2xl">
            Une question, un projet ou simplement envie d&apos;échanger ? N&apos;hésitez pas à me contacter
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column - Contact Form */}
          <div className="space-y-8">
            <div className="border-4 border-white/10 bg-[#0a0a0e] p-8 shadow-[0_25px_60px_rgba(0,0,0,0.65)]">
              <h2 className="mb-2 text-2xl font-bold uppercase tracking-tight">
                Envoyez-moi un message
              </h2>
              <p className="text-white/60 mb-8 text-sm">
                Remplissez le formulaire ci-dessous et je vous répondrai dans les plus brefs délais
              </p>

              <ContactForm />
            </div>
          </div>

          {/* Right Column - Info Cards */}
          <div className="space-y-6">
            {/* Contact Info Card */}
            <div className="border-4 border-white/10 bg-[#0a0a0e] p-8 shadow-[0_25px_60px_rgba(0,0,0,0.65)]">
              <h3 className="mb-6 text-xl font-bold uppercase tracking-tight">
                Coordonnées
              </h3>

              {/* Email */}
              <div className="mb-6 pb-6 border-b border-white/10">
                <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-lime-300">
                  Email
                </h4>
                <a
                  href="mailto:caroline.senyk@gmail.com"
                  className="text-base font-bold hover:text-lime-300 transition-colors break-all"
                >
                  caroline.senyk@gmail.com
                </a>
              </div>

              {/* LinkedIn */}
              <div className="mb-6 pb-6 border-b border-white/10">
                <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-lime-300">
                  LinkedIn
                </h4>
                <a
                  href="https://www.linkedin.com/in/caroline-senyk-0307752a7/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-base font-bold hover:text-lime-300 transition-colors"
                >
                  <span>Voir le profil</span>
                  <span>↗</span>
                </a>
              </div>

              {/* Availability */}
              <div>
                <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-lime-300">
                  Disponibilité
                </h4>
                <p className="text-sm text-white/70 leading-relaxed">
                  Je réponds généralement sous 24-48h. Pour les demandes urgentes,
                  précisez-le dans le sujet de votre message.
                </p>
              </div>
            </div>

            {/* Services Card */}
            <div className="border-4 border-white/10 bg-[#0a0a0e] p-8 shadow-[0_25px_60px_rgba(0,0,0,0.65)]">
              <h3 className="mb-6 text-xl font-bold uppercase tracking-tight">
                Services
              </h3>
              <ul className="space-y-4 text-sm text-white/70">
                <li className="flex items-start gap-3">
                  <span className="text-lime-300 font-bold text-base">→</span>
                  <div>
                    <div className="font-bold text-white mb-1">Gestion de droits d&apos;auteur</div>
                    <div className="text-xs text-white/50">Suivi et protection de vos œuvres</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-lime-300 font-bold text-base">→</span>
                  <div>
                    <div className="font-bold text-white mb-1">Conseil en droits musicaux</div>
                    <div className="text-xs text-white/50">Expertise juridique et conseil</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-lime-300 font-bold text-base">→</span>
                  <div>
                    <div className="font-bold text-white mb-1">Accompagnement artistique</div>
                    <div className="text-xs text-white/50">Support de vos projets musicaux</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-lime-300 font-bold text-base">→</span>
                  <div>
                    <div className="font-bold text-white mb-1">Expertise SACEM</div>
                    <div className="text-xs text-white/50">Gestion et optimisation SACEM</div>
                  </div>
                </li>
              </ul>
            </div>

            {/* CTA Banner */}
            <div className="border-4 border-lime-300 bg-gradient-to-r from-lime-300 to-emerald-400 p-8 text-center">
              <h3 className="mb-2 text-2xl font-bold uppercase text-[#050505]">
                Première consultation gratuite
              </h3>
              <p className="text-sm text-[#050505]/80">
                Pour tout nouveau projet, je vous offre un premier échange de 30 minutes
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
