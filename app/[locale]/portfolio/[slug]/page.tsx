import Link from "next/link";
import { notFound } from "next/navigation";
import type { Locale } from "@/lib/i18n-config";
import {
  getWorkBySlug,
  getAllWorkSlugs,
  getPortfolioWorksFromPrisma,
} from "@/lib/prismaPortfolioUtils";
import { getDictionary } from "@/lib/dictionaries";

// Generate static params for all work slugs
export async function generateStaticParams() {
  const slugs = await getAllWorkSlugs();
  const locales: Locale[] = ["fr", "en"];

  const params: { locale: Locale; slug: string }[] = [];

  locales.forEach((locale) => {
    slugs.forEach((slug) => {
      params.push({ locale, slug });
    });
  });

  return params;
}

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const work = await getWorkBySlug(slug, locale);
  const dictionary = await getDictionary(locale);

  if (!work) {
    notFound();
  }

  // Get all works for prev/next navigation
  const allWorks = await getPortfolioWorksFromPrisma(locale);
  const currentIndex = allWorks.findIndex((w) => w.slug === slug);
  const prevWork = currentIndex > 0 ? allWorks[currentIndex - 1] : null;
  const nextWork =
    currentIndex < allWorks.length - 1 ? allWorks[currentIndex + 1] : null;

  // Extract data from Prisma work
  const translation = work.translations[0];
  const categoryTranslation = work.category?.translations[0];
  const labelTranslation = work.label?.translations[0];

  return (
    <div className="relative min-h-screen bg-[#050505] text-white">
      {/* Background layers */}
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(213,255,10,0.15),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(255,75,162,0.1),transparent_50%)]" />
        <div className="absolute inset-0 noise-layer" />
      </div>

      <main className="relative z-10 w-full max-w-[1400px] mx-auto px-4 pb-20 pt-16 sm:px-8 lg:px-16">
        {/* Back to Portfolio */}
        <Link
          href={`/${locale}/portfolio`}
          className="inline-flex items-center gap-2 mb-8 text-sm font-bold uppercase text-lime-300 hover:text-lime-400 transition-colors"
        >
          ← Retour au portfolio
        </Link>

        {/* Main Content Grid */}
        <div className="grid gap-12 lg:grid-cols-[400px,1fr]">
          {/* Left Column - Image & Spotify */}
          <div className="space-y-6">
            {/* Cover Image - Taille réduite à 400px max */}
            {work.coverImage && (
              <div className="relative overflow-hidden border-4 border-white/10 bg-black/20">
                <img
                  src={work.coverImage.path}
                  alt={work.coverImage.alt || translation?.title || work.slug}
                  className="w-full h-auto object-contain max-h-[400px]"
                />
              </div>
            )}

            {/* Spotify Embed */}
            {work.spotifyUrl && (
              <div className="border-4 border-white/10 bg-[#0a0a0e] p-4">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-lime-300">
                  Écouter
                </h3>
                <div className="aspect-square overflow-hidden rounded">
                  <iframe
                    src={work.spotifyUrl.replace(
                      "https://open.spotify.com/",
                      "https://open.spotify.com/embed/"
                    )}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    className="rounded"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Content */}
          <div className="space-y-8">
            {/* Header */}
            <div>
              {/* Category Badge */}
              {categoryTranslation && (
                <div className="mb-4 inline-block rounded-full border-2 border-lime-300 bg-lime-300/10 px-4 py-1 text-xs font-bold uppercase tracking-wider text-lime-300">
                  {categoryTranslation.name}
                </div>
              )}

              {/* Title */}
              <h1 className="mb-4 text-4xl font-black uppercase tracking-tight sm:text-5xl lg:text-6xl">
                {translation?.title || work.slug}
              </h1>

              {/* Description - MAINTENANT AFFICHÉE */}
              {translation?.description && (
                <div className="prose prose-invert max-w-none">
                  <p className="text-lg text-white/80 whitespace-pre-line">
                    {translation.description}
                  </p>
                </div>
              )}
            </div>

            {/* Project Details Grid */}
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Contributors / Composers */}
              {work.contributions && work.contributions.length > 0 && (
                <div className="border-4 border-white/10 bg-[#0a0a0e] p-6">
                  <h2 className="mb-4 text-lg font-bold uppercase tracking-wider text-lime-300">
                    Artistes
                  </h2>
                  <div className={work.contributions.length > 3 ? "grid gap-4 sm:grid-cols-2" : "space-y-4"}>
                    {work.contributions.map((contribution) => {
                      const composerTranslation =
                        contribution.composer.translations[0];

                      return (
                        <Link
                          key={contribution.id}
                          href={`/${locale}/artistes/${contribution.composer.slug}`}
                          className="flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-white/5"
                        >
                          {contribution.composer.image ? (
                            <div className="h-12 w-12 flex-shrink-0 overflow-hidden border-2 border-white/20 rounded-full">
                              <img
                                src={contribution.composer.image.path}
                                alt={
                                  contribution.composer.image.alt ||
                                  composerTranslation?.name ||
                                  "Composer"
                                }
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="h-12 w-12 flex-shrink-0 overflow-hidden border-2 border-white/20 rounded-full bg-gradient-to-br from-lime-300/20 to-emerald-400/20 flex items-center justify-center">
                              <span className="text-lg font-black text-white/40">
                                {composerTranslation?.name?.charAt(0).toUpperCase() || "?"}
                              </span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-white group-hover:text-lime-300 transition-colors">
                              {composerTranslation?.name || "Unknown Artist"}
                            </div>
                            {composerTranslation?.bio && (
                              <div className="text-xs text-white/60 line-clamp-1">
                                {composerTranslation.bio}
                              </div>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Project Info */}
              <div className="border-4 border-white/10 bg-[#0a0a0e] p-6">
                <h2 className="mb-4 text-lg font-bold uppercase tracking-wider text-lime-300">
                  Informations
                </h2>
                <div className="space-y-3 text-sm">
                  {work.releaseDate && (
                    <div className="flex justify-between border-b border-dashed border-white/15 pb-2">
                      <span className="text-white/60">Date de sortie</span>
                      <span className="font-bold text-white">
                        {work.releaseDate}
                      </span>
                    </div>
                  )}
                  {categoryTranslation && (
                    <div className="flex justify-between border-b border-dashed border-white/15 pb-2">
                      <span className="text-white/60">Catégorie</span>
                      <span className="font-bold text-white">
                        {categoryTranslation.name}
                      </span>
                    </div>
                  )}
                  {work.genre && (
                    <div className="flex justify-between border-b border-dashed border-white/15 pb-2">
                      <span className="text-white/60">Genre</span>
                      <span className="font-bold text-white">
                        {work.genre}
                      </span>
                    </div>
                  )}
                  {labelTranslation && (
                    <div className="flex justify-between border-b border-dashed border-white/15 pb-2">
                      <span className="text-white/60">Label</span>
                      <span className="font-bold text-white">
                        {labelTranslation.name}
                      </span>
                    </div>
                  )}
                  {work.isrcCode && (
                    <div className="flex justify-between">
                      <span className="text-white/60">Code ISRC</span>
                      <span className="font-mono text-xs text-white">
                        {work.isrcCode}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Images Gallery */}
            {work.images && work.images.length > 0 && (
              <div>
                <h2 className="mb-4 text-xl font-bold uppercase tracking-wider text-lime-300">
                  Galerie
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {work.images.map((image) => (
                    <div
                      key={image.id}
                      className="relative overflow-hidden border-4 border-white/10 bg-black/20 hover:border-lime-300/50 transition-all"
                    >
                      <img
                        src={image.path}
                        alt={image.alt || "Gallery image"}
                        className="w-full h-auto object-contain"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Prev/Next Navigation */}
        <div className="mt-16 grid gap-4 sm:grid-cols-2">
          {prevWork ? (
            <Link
              href={`/${locale}/portfolio/${prevWork.slug}`}
              className="group border-4 border-white/10 bg-[#0a0a0e] p-6 transition-all hover:border-lime-300/70 hover:shadow-[0_20px_60px_rgba(213,255,10,0.15)]"
            >
              <div className="mb-2 text-xs font-bold uppercase text-lime-400">
                ← Projet précédent
              </div>
              <div className="text-xl font-bold uppercase group-hover:text-lime-300 transition-colors">
                {prevWork.title}
              </div>
            </Link>
          ) : (
            <div />
          )}

          {nextWork ? (
            <Link
              href={`/${locale}/portfolio/${nextWork.slug}`}
              className="group border-4 border-white/10 bg-[#0a0a0e] p-6 text-right transition-all hover:border-lime-300/70 hover:shadow-[0_20px_60px_rgba(213,255,10,0.15)]"
            >
              <div className="mb-2 text-xs font-bold uppercase text-lime-400">
                Projet suivant →
              </div>
              <div className="text-xl font-bold uppercase group-hover:text-lime-300 transition-colors">
                {nextWork.title}
              </div>
            </Link>
          ) : (
            <div />
          )}
        </div>

        {/* CTA */}
        <div className="mt-16">
          <div className="border-4 border-lime-300 bg-gradient-to-r from-lime-300 to-emerald-400 p-12 text-center">
            <h2 className="mb-4 text-3xl font-bold uppercase text-[#050505]">
              Vous avez un projet similaire ?
            </h2>
            <p className="mb-6 text-[#050505]/80">
              Discutons de votre projet de gestion de droits musicaux
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
