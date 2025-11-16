import Image from "next/image";
import Link from "next/link";
import { getDictionary } from "@/lib/dictionaries";
import { getAllExpertises } from "@/lib/expertiseUtils";
import type { Locale } from "@/lib/i18n-config";
import { Breadcrumb } from "@/components/breadcrumb";

type ExpertisesPageParams = {
  params: Promise<{
    locale: Locale;
  }>;
};

export default async function ExpertisesPage({ params }: ExpertisesPageParams) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);
  const expertises = getAllExpertises(locale);

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
            { label: "Expertises" },
          ]}
        />

        {/* Page Header */}
        <div className="mb-12">
          <h1 className="mb-2 text-7xl font-black uppercase tracking-tighter sm:text-8xl lg:text-9xl">
            <span className="bg-gradient-to-r from-lime-300 to-emerald-400 bg-clip-text text-transparent">
              E
            </span>
            <span>xpertises</span>
          </h1>
          <p className="text-lg text-white/70 max-w-2xl">
            Découvrez mes domaines d&apos;expertise en gestion de droits d&apos;auteur et droits musicaux
          </p>
        </div>

        {/* Expertises Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {expertises.map((expertise) => (
            <Link
              key={expertise.id}
              href={`/${locale}/expertises/${expertise.slug}`}
              className="group relative overflow-hidden border-4 border-white bg-[#050505] transition-transform hover:scale-105"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={expertise.imgHome}
                  alt={expertise.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover transition-transform group-hover:scale-110"
                />
              </div>
              <div className="p-6">
                <h2 className="mb-3 text-2xl font-bold uppercase">
                  {expertise.title}
                </h2>
                <p className="text-sm text-white/70 leading-relaxed">
                  {expertise.description}
                </p>
                <div className="mt-4 inline-block text-sm font-bold uppercase text-lime-400">
                  En savoir plus →
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="border-4 border-white bg-gradient-to-r from-lime-400 to-fuchsia-600 p-12">
            <h2 className="mb-4 text-3xl font-bold uppercase text-[#050505]">
              Besoin d&apos;accompagnement ?
            </h2>
            <p className="mb-6 text-[#050505]/80">
              Contactez-moi pour discuter de vos besoins en gestion de droits
            </p>
            <Link
              href={`/${locale}/contact`}
              className="inline-block border-4 border-[#050505] bg-[#050505] px-8 py-3 font-bold uppercase text-white transition-transform hover:scale-105"
            >
              {dictionary.cta.contact}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
