import Link from "next/link";
import { getDictionary } from "@/lib/dictionaries";
import { getPortfolioWorksFromPrisma } from "@/lib/prismaPortfolioUtils";
import type { Locale } from "@/lib/i18n-config";

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);
  const works = await getPortfolioWorksFromPrisma(locale);

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
              {dictionary.nav.portfolio}
            </span>
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Découvrez mes projets et réalisations en gestion de droits musicaux
          </p>
        </div>

        {/* Works Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {works.map((work) => (
            <Link
              key={work.id}
              href={`/${locale}/portfolio/${work.slug}`}
              className="group relative overflow-hidden border-4 border-white bg-[#050505] transition-transform hover:scale-105"
            >
              {/* Image */}
              <div className="aspect-square overflow-hidden">
                <img
                  src={work.coverImage}
                  alt={work.coverImageAlt}
                  className="h-full w-full object-cover transition-transform group-hover:scale-110"
                />
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Category */}
                <div className="mb-2 text-xs font-bold uppercase text-lime-400">
                  {work.category}
                </div>

                {/* Title */}
                <h2 className="mb-2 text-lg font-bold uppercase leading-tight">
                  {work.title}
                </h2>

                {/* Subtitle */}
                {work.subtitle && (
                  <p className="mb-3 text-sm text-white/70 line-clamp-2">
                    {work.subtitle}
                  </p>
                )}

                {/* Composers */}
                {work.composers && work.composers.length > 0 && (
                  <div className="text-xs text-white/50">
                    {work.composers.join(", ")}
                  </div>
                )}

                {/* Hover indicator */}
                <div className="mt-3 inline-block text-xs font-bold uppercase text-fuchsia-600 opacity-0 transition-opacity group-hover:opacity-100">
                  Voir le projet →
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty state */}
        {works.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-white/50">
              Aucun projet disponible pour le moment
            </p>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="border-4 border-white bg-gradient-to-r from-lime-400 to-fuchsia-600 p-12">
            <h2 className="mb-4 text-3xl font-bold uppercase text-[#050505]">
              Intéressé par une collaboration ?
            </h2>
            <p className="mb-6 text-[#050505]/80">
              N'hésitez pas à me contacter pour discuter de votre projet
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
