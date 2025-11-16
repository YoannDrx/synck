import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n-config";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return (
    <div className="relative min-h-screen bg-[#050505] text-white">
      {/* Background layers */}
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(213,255,10,0.15),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(255,75,162,0.1),transparent_50%)]" />
        <div className="absolute inset-0 noise-layer" />
      </div>

      <main className="relative z-10 w-full max-w-[1600px] mx-auto px-4 pb-20 pt-16 sm:px-8 lg:px-16">
        {/* Page Header */}
        <div className="mb-16 text-center">
          <h1 className="mb-4 text-5xl font-bold uppercase tracking-tight sm:text-6xl lg:text-7xl">
            <span className="bg-gradient-to-r from-lime-400 to-fuchsia-600 bg-clip-text text-transparent">
              {dictionary.contact.title}
            </span>
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Une question, un projet ou simplement envie d'échanger ? N'hésitez pas à me contacter
          </p>
        </div>

        {/* Contact Content */}
        <div className="max-w-4xl mx-auto">
          {/* Main Contact Card */}
          <div className="border-4 border-white bg-[#050505] p-8 sm:p-12 mb-12">
            <div className="space-y-8">
              {/* Introduction */}
              <div>
                <h2 className="mb-4 text-2xl font-bold uppercase">
                  Travaillons ensemble
                </h2>
                <p className="text-white/70 leading-relaxed">
                  Que vous ayez besoin d'accompagnement en gestion de droits d'auteur,
                  de conseil en droits musicaux ou d'expertise dans le secteur musical,
                  je serai ravie d'échanger avec vous sur votre projet.
                </p>
              </div>

              {/* Email Section */}
              <div className="border-t-2 border-white/20 pt-8">
                <h3 className="mb-3 text-sm font-bold uppercase text-lime-400">
                  Email
                </h3>
                <a
                  href="mailto:caroline.senyk@example.com"
                  className="text-2xl font-bold uppercase hover:text-lime-400 transition-colors"
                >
                  caroline.senyk@example.com
                </a>
              </div>

              {/* LinkedIn Section */}
              <div className="border-t-2 border-white/20 pt-8">
                <h3 className="mb-3 text-sm font-bold uppercase text-fuchsia-600">
                  LinkedIn
                </h3>
                <a
                  href="https://linkedin.com/in/caroline-senyk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xl font-bold uppercase hover:text-fuchsia-600 transition-colors"
                >
                  linkedin.com/in/caroline-senyk →
                </a>
              </div>
            </div>
          </div>

          {/* Availability Info */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Availability Card */}
            <div className="border-4 border-white bg-gradient-to-br from-lime-400/10 to-transparent p-6">
              <h3 className="mb-3 text-lg font-bold uppercase text-lime-400">
                Disponibilité
              </h3>
              <p className="text-sm text-white/70">
                Je réponds généralement sous 24-48h. Pour les demandes urgentes,
                précisez-le dans l'objet de votre message.
              </p>
            </div>

            {/* Services Card */}
            <div className="border-4 border-white bg-gradient-to-br from-fuchsia-600/10 to-transparent p-6">
              <h3 className="mb-3 text-lg font-bold uppercase text-fuchsia-600">
                Services
              </h3>
              <p className="text-sm text-white/70">
                Gestion de droits d'auteur, conseil en droits musicaux,
                accompagnement de projets artistiques et expertise SACEM.
              </p>
            </div>
          </div>

          {/* CTA Banner */}
          <div className="mt-12 border-4 border-white bg-gradient-to-r from-lime-400 to-fuchsia-600 p-8 text-center">
            <h2 className="mb-2 text-2xl font-bold uppercase text-[#050505]">
              Première consultation gratuite
            </h2>
            <p className="text-sm text-[#050505]/80">
              Pour tout nouveau projet, je vous offre un premier échange de 30 minutes
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
