"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";

import type { Locale } from "@/lib/i18n-config";
import type {
  Expertise,
  ExpertiseListItem,
  SectionLayout,
} from "@/lib/prismaExpertiseUtils";
import type { ExpertiseDetailDictionary } from "@/types/dictionary";
import { ParallaxSection } from "@/components/parallax-section";
import { LogoGrid, type LogoGridItem } from "@/components/logo-grid";
import { DocumentairesGallery } from "@/components/documentaires-gallery";
import { ExpertisesCarousel } from "@/components/expertises-carousel";
import { Breadcrumb } from "@/components/breadcrumb";

// Helper to get section layout (moved from page.tsx)
function getSectionLayout(
  expertise: Expertise,
  sectionIndex: number,
): SectionLayout {
  // If sectionsLayout is defined, use it
  if (expertise.sectionsLayout?.[sectionIndex]) {
    const layout = expertise.sectionsLayout[sectionIndex];
    let resolvedImage: string | null = null;

    if (layout.image) {
      if (layout.image.startsWith("/")) {
        resolvedImage = layout.image;
      } else {
        const imageKey = layout.image as keyof Expertise;
        resolvedImage = (expertise[imageKey] as string) ?? null;
      }
    }

    return {
      image: resolvedImage,
      position: layout.position ?? "auto",
    };
  }

  // Fallback: use img1-5
  const imageKey = `img${String(sectionIndex + 1)}` as keyof Expertise;
  const image = expertise[imageKey] as string | undefined;

  return {
    image: image ?? null,
    position: "auto",
  };
}

type ExpertiseDetailClientProps = {
  locale: Locale;
  expertise: Expertise;
  allExpertises: ExpertiseListItem[];
  nav: { home: string; expertises: string };
  copy: ExpertiseDetailDictionary;
};

export function ExpertiseDetailClient({
  locale,
  expertise,
  allExpertises,
  nav,
  copy,
}: ExpertiseDetailClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Convert supports to LogoGrid items
  const supportItems: LogoGridItem[] =
    expertise.supports?.map((s) => ({
      name: s.name,
      logo: s.logo,
      description: s.description,
      links: s.links,
    })) ?? [];

  // Convert labels to LogoGrid items
  const labelItems: LogoGridItem[] =
    expertise.labels?.map((l) => ({
      name: l.name,
      logo: l.src, // Map src to logo
      href: l.href,
    })) ?? [];

  // Convert production companies to LogoGrid items
  const companyItems: LogoGridItem[] =
    expertise.productionCompanies?.map((c) => ({
      name: c.name,
      logo: c.logo,
      description: c.description,
      website: c.website,
    })) ?? [];

  // Parallax for hero - slightly more subtle since it's inside the card flow now
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, 50]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);

  // Only show documentaires gallery for specific expertise
  const showDocumentaires =
    expertise.slug === "gestion-administrative-et-editoriale";

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen bg-[#050505] text-white overflow-hidden"
    >
      {/* Background Elements */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(213,255,10,0.08),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_40%,rgba(0,217,255,0.08),transparent_50%)]" />
        <div className="absolute inset-0 noise-layer opacity-30" />
      </div>

      <main className="relative z-10 pt-32 pb-20 px-4 sm:px-8 lg:px-16">
        {/* Main Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto w-full max-w-[1600px] rounded-[32px] border-4 border-white/10 bg-[#0a0a0f]/90 p-4 shadow-[0_25px_60px_rgba(0,0,0,0.5)] backdrop-blur-sm sm:p-6 lg:p-8"
        >
          {/* Header (Breadcrumb + Title) inside Card */}
          <div className="mb-8 lg:mb-12">
            <Breadcrumb
              items={[
                { label: nav.home, href: `/${locale}` },
                { label: nav.expertises, href: `/${locale}/expertises` },
                { label: expertise.title },
              ]}
            />

            <motion.div
              style={{ y: heroY, opacity: heroOpacity }}
              className="mt-8 lg:mt-10"
            >
              <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                <span className="text-[#d5ff0a]">
                  {expertise.title.charAt(0)}
                </span>
                {expertise.title.slice(1)}
              </h1>
              {expertise.description && (
                <p className="mt-4 max-w-3xl text-lg text-white/50 leading-relaxed">
                  {expertise.description}
                </p>
              )}
            </motion.div>
          </div>

          {/* Sections content */}
          <div className="space-y-8">
            {expertise.sections.map((section, index) => {
              const layout = getSectionLayout(expertise, index);
              return (
                <ParallaxSection
                  key={index}
                  content={section}
                  image={layout.image ?? undefined}
                  // Alternating logic: Auto calculation based on index if not forced
                  imagePosition={
                    layout.position === "auto"
                      ? index % 2 === 0
                        ? "right"
                        : "left"
                      : layout.position
                  }
                  index={index}
                  isLast={index === expertise.sections.length - 1}
                />
              );
            })}
          </div>

          {/* Specialized Grids - Integrated inside the card flow but separated */}
          {/* Production Companies */}
          {companyItems.length > 0 && (
            <div className="mt-16 pt-16 border-t border-white/10">
              <LogoGrid
                items={companyItems}
                title={
                  locale === "fr"
                    ? "Sociétés de production"
                    : "Production Companies"
                }
                statsLabel={copy.productionCompanies.statsCompanies}
                columns={4}
                showModal={true}
                accentColor="purple"
              />
            </div>
          )}

          {/* Financial Supports */}
          {supportItems.length > 0 && (
            <div className="mt-16 pt-16 border-t border-white/10">
              <LogoGrid
                items={supportItems}
                title={
                  locale === "fr"
                    ? "Les aides pour les éditeurs et auteurs"
                    : "Support for publishers and authors"
                }
                statsLabel="Supports"
                columns={3}
                showModal={true}
                accentColor="lime"
              />
            </div>
          )}

          {/* Labels */}
          {labelItems.length > 0 && (
            <div className="mt-16 pt-16 border-t border-white/10">
              <LogoGrid
                items={labelItems}
                title={copy.labelsTitle}
                statsLabel="Labels"
                columns={6}
                showModal={false}
                accentColor="cyan"
              />
            </div>
          )}
        </motion.div>

        {/* Documentaires Gallery - Outside main card */}
        {showDocumentaires &&
          expertise.documentaires &&
          expertise.documentaires.length > 0 && (
            <div className="mt-24 mx-auto max-w-[1600px]">
              <DocumentairesGallery
                documentaires={expertise.documentaires}
                copy={copy.documentaries}
              />
            </div>
          )}

        {/* Footer Image */}
        {expertise.imgFooter && (
          <div className="mt-24 mx-auto max-w-[1600px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="relative overflow-hidden rounded-[32px] border-4 border-white/10"
            >
              <Image
                src={expertise.imgFooter}
                alt=""
                width={1600}
                height={900}
                className="w-full h-auto object-cover"
              />
            </motion.div>
          </div>
        )}

        {/* Other Expertises Carousel */}
        <div className="mt-24 mx-auto max-w-[1600px]">
          <ExpertisesCarousel
            expertises={allExpertises}
            currentSlug={expertise.slug}
            locale={locale}
            title={
              locale === "fr"
                ? "Découvrez mes autres expertises"
                : "Discover our other expertises"
            }
            description={
              locale === "fr"
                ? "Explorez l'ensemble de nos domaines d'intervention"
                : "Explore our full range of services"
            }
          />
        </div>

        {/* Subtle CTA Section */}
        <div className="mt-24 mx-auto max-w-[1600px]">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.02] p-8 sm:p-12 text-center"
          >
            {/* Subtle gradient glow */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(213,255,10,0.1),transparent_70%)]" />

            <div className="relative z-10 flex flex-col items-center justify-center">
              <h2 className="mb-4 text-2xl font-bold uppercase tracking-tight text-white sm:text-3xl">
                {copy.ctaTitle}
              </h2>
              <p className="mb-8 max-w-xl text-base text-white/60">
                {copy.ctaDescription}
              </p>
              <Link
                href={`/${locale}/contact`}
                className="group flex items-center gap-2 rounded-full border border-[#d5ff0a]/30 bg-[#d5ff0a]/10 px-6 py-3 text-sm font-bold uppercase text-[#d5ff0a] transition-all hover:bg-[#d5ff0a] hover:text-black"
              >
                <span>{copy.ctaButton}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
