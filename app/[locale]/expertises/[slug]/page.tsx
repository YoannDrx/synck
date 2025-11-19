import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Locale } from "@/lib/i18n-config";
import {
  getExpertise,
  getAllExpertiseSlugs,
  getAllExpertises,
  getSectionLayout,
} from "@/lib/prismaExpertiseUtils";
import { getDictionary } from "@/lib/dictionaries";
import { Breadcrumb } from "@/components/breadcrumb";
import { DocumentairesGallery } from "@/components/documentaires-gallery";
import { AlternatingSection } from "@/components/alternating-section";
import { ExpertisesCarousel } from "@/components/expertises-carousel";

// Generate static params for all expertise slugs
export async function generateStaticParams() {
  const slugs = await getAllExpertiseSlugs();
  const locales: Locale[] = ["fr", "en"];

  const params: { locale: Locale; slug: string }[] = [];

  locales.forEach((locale) => {
    slugs.forEach((slug) => {
      params.push({ locale, slug });
    });
  });

  return params;
}

type ExpertiseDetailParams = {
  params: Promise<{
    locale: Locale;
    slug: string;
  }>;
};

export default async function ExpertiseDetailPage({
  params,
}: ExpertiseDetailParams) {
  const { locale, slug } = await params;
  const safeLocale = locale === "en" ? "en" : "fr";
  const expertise = await getExpertise(slug, safeLocale);
  const allExpertises = await getAllExpertises(safeLocale);
  const dictionary = await getDictionary(safeLocale);
  const detailCopy = dictionary.expertiseDetail;

  if (!expertise) {
    notFound();
  }

  // Use documentaires from markdown if available
  const documentaires = expertise.documentaires ?? [];

  return (
    <div className="relative min-h-screen bg-[#050505] text-white">
      {/* Background layers */}
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(213,255,10,0.15),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(255,75,162,0.1),transparent_50%)]" />
        <div className="absolute inset-0 noise-layer" />
      </div>

      <main className="relative z-10 w-full max-w-[1600px] mx-auto px-4 pb-20 pt-8 sm:pt-16 sm:px-8 lg:px-16">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: dictionary.nav.home, href: `/${safeLocale}` },
            {
              label: dictionary.nav.expertises,
              href: `/${safeLocale}/expertises`,
            },
            { label: expertise.title },
          ]}
        />

        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="mb-4 text-4xl font-black uppercase tracking-tight sm:text-6xl lg:text-7xl">
            <span className="bg-gradient-to-r from-lime-300 to-emerald-400 bg-clip-text text-transparent">
              {expertise.title.charAt(0)}
            </span>
            <span>{expertise.title.slice(1)}</span>
          </h1>
          {expertise.description && (
            <p className="text-xl text-white/70 max-w-3xl">
              {expertise.description}
            </p>
          )}
        </div>

        {/* Alternating Sections with Images */}
        <div className="mb-16 md:mb-20 lg:mb-24">
          {expertise.sections.map((section, index) => {
            const layout = getSectionLayout(expertise, index);
            const isLast = index === expertise.sections.length - 1;

            return (
              <AlternatingSection
                key={index}
                content={section}
                image={layout.image}
                imagePosition={layout.position}
                index={index}
                isLast={isLast}
              />
            );
          })}
        </div>

        {/* Labels Gallery - Full Width (Non-clickable for now) */}
        {expertise.labels && expertise.labels.length > 0 && (
          <div className="mt-16">
            <div className="border-4 border-white/10 bg-[#0a0a0e] p-8 shadow-[0_25px_60px_rgba(0,0,0,0.65)]">
              <h3 className="mb-8 text-2xl font-bold uppercase tracking-tight text-lime-300">
                {detailCopy.labelsTitle}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {expertise.labels.map((label, index) => (
                  <div
                    key={index}
                    className="group border-2 border-white/10 bg-black/20 p-4 transition-all hover:border-lime-300 hover:shadow-[0_0_20px_rgba(213,255,10,0.4)]"
                  >
                    {label.src && (
                      <Image
                        src={label.src}
                        alt={label.name}
                        width={200}
                        height={120}
                        className="h-auto w-full object-contain transition-all duration-300 group-hover:scale-110 group-hover:brightness-110"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Documentaires Gallery - Full Width with Filter */}
        {documentaires && documentaires.length > 0 && (
          <DocumentairesGallery
            documentaires={documentaires}
            copy={detailCopy.documentaries}
          />
        )}

        {/* Footer Image */}
        {expertise.imgFooter && (
          <div className="mt-12 border-4 border-white/10 overflow-hidden max-w-2xl mx-auto">
            <Image
              src={expertise.imgFooter}
              alt={expertise.title}
              width={1200}
              height={800}
              className="h-auto w-full object-cover"
            />
          </div>
        )}

        {/* Expertises Carousel */}
        <ExpertisesCarousel
          expertises={allExpertises}
          currentSlug={slug}
          locale={safeLocale}
          title={
            safeLocale === "fr"
              ? "Découvrez nos autres expertises"
              : "Discover our other expertises"
          }
          description={
            safeLocale === "fr"
              ? "Explorez l'ensemble de nos domaines d'intervention"
              : "Explore our full range of services"
          }
        />

        {/* CTA */}
        <div className="mt-16">
          <div className="border-4 border-lime-300 bg-gradient-to-r from-lime-300 to-emerald-400 p-12 text-center">
            <h2 className="mb-4 text-3xl font-bold uppercase text-[#050505]">
              {detailCopy.ctaTitle}
            </h2>
            <p className="mb-6 text-[#050505]/80">
              {detailCopy.ctaDescription}
            </p>
            <Link
              href={`/${safeLocale}/contact`}
              className="inline-block border-4 border-[#050505] bg-[#050505] px-8 py-3 font-bold uppercase text-white transition-transform hover:scale-105"
            >
              {detailCopy.ctaButton}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
