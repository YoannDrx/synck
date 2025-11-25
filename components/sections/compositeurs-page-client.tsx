"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";

import { Breadcrumb } from "@/components/breadcrumb";
import { PageLayout } from "@/components/layout/page-layout";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n-config";
import type { GalleryComposer } from "@/lib/prismaProjetsUtils";

type ComposersPageClientProps = {
  locale: Locale;
  composers: GalleryComposer[];
  nav: {
    home: string;
    composers: string;
  };
  copy: {
    description: string;
    worksPlural: string;
    worksSingular: string;
    statsArtists: string;
    statsProjects: string;
    ctaTitle: string;
    ctaDescription: string;
    ctaButton: string;
  };
};

/** Accent color for artist cards - Neon lime */
const artistAccent = {
  border: "border-[#d5ff0a]/30",
  borderHover: "hover:border-[#d5ff0a]",
  glow: "hover:shadow-[0_0_25px_rgba(213,255,10,0.2)]",
  badge: "bg-[#d5ff0a]/10 text-[#d5ff0a]",
  ring: "ring-[#d5ff0a]/50",
  gradient: "from-[#d5ff0a] via-[#9eff00] to-[#00d9ff]",
};

/** Artist card component */
function ArtistCard({
  composer,
  index,
  locale,
  copy,
}: {
  composer: GalleryComposer;
  index: number;
  locale: Locale;
  copy: { worksPlural: string; worksSingular: string };
}) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  // Trigger when card is 30px inside the viewport (just after crossing bottom edge)
  const isInView = useInView(cardRef, {
    once: true,
    margin: "0px 0px -30px 0px",
  });

  const renderWorksCount = (count: number) =>
    `${String(count)} ${count > 1 ? copy.worksPlural : copy.worksSingular}`;

  // Stagger delay based on column position (0-5) for wave effect per row
  const columnPosition = index % 6;
  const staggerDelay = columnPosition * 0.03;

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.4,
        delay: staggerDelay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Link
        ref={cardRef}
        data-testid="composer-card"
        href={`/${locale}/compositeurs/${composer.slug}`}
        className={cn(
          "group relative flex flex-col items-center gap-4 p-5",
          "rounded-[20px] border-2 bg-white/[0.02]",
          "transition-all duration-300",
          "hover:-translate-y-1",
          artistAccent.border,
          artistAccent.borderHover,
          artistAccent.glow,
        )}
      >
        {/* Avatar */}
        <div className="relative">
          <div
            className={cn(
              "relative h-20 w-20 overflow-hidden rounded-full",
              "ring-2 ring-white/10",
              "transition-all duration-300",
              "group-hover:ring-4",
              `group-hover:${artistAccent.ring}`,
            )}
          >
            {composer.image ? (
              <Image
                src={composer.image}
                alt={composer.imageAlt ?? composer.name}
                fill
                sizes="80px"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div
                className={cn(
                  "flex h-full w-full items-center justify-center",
                  "bg-gradient-to-br",
                  artistAccent.gradient,
                )}
              >
                <span className="text-2xl font-black text-white">
                  {composer.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Name */}
        <h3 className="line-clamp-1 text-center text-sm font-bold text-white/90 transition-colors group-hover:text-white">
          {composer.name}
        </h3>

        {/* Works count badge */}
        <div
          className={cn(
            "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider",
            artistAccent.badge,
          )}
        >
          {renderWorksCount(composer.worksCount)}
        </div>
      </Link>
    </motion.div>
  );
}

export function CompositeursPageClient({
  locale,
  composers,
  nav,
  copy,
}: ComposersPageClientProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  // Calculate total works
  const totalWorks = composers.reduce((sum, c) => sum + c.worksCount, 0);

  return (
    <PageLayout orbsConfig="subtle" className="mx-auto max-w-[1600px]">
      <Breadcrumb
        items={[
          { label: nav.home, href: `/${locale}` },
          { label: nav.composers },
        ]}
      />

      {/* Main Bento Container */}
      <motion.section
        ref={sectionRef}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-[32px] border-4 border-white/10 bg-[#0a0a0f]/90 p-4 shadow-[0_25px_60px_rgba(0,0,0,0.5)] backdrop-blur-sm sm:p-6 lg:p-8"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6 flex flex-col gap-4 lg:mb-8 lg:flex-row lg:items-end lg:justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="text-[#d5ff0a]">{nav.composers.charAt(0)}</span>
              {nav.composers.slice(1)}
            </h1>
            <p className="mt-3 max-w-2xl text-base text-white/50">
              {copy.description}
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-8">
            <div className="text-right">
              <p className="text-3xl font-black text-white">
                {composers.length}
              </p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                {copy.statsArtists}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-[#d5ff0a]">{totalWorks}</p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                {copy.statsProjects}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Artists Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
        >
          {composers.map((composer, index) => (
            <ArtistCard
              key={composer.id}
              composer={composer}
              index={index}
              locale={locale}
              copy={copy}
            />
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 rounded-[24px] border-2 border-[#d5ff0a]/40 bg-gradient-to-br from-[#d5ff0a]/10 via-[#9eff00]/5 to-transparent p-6 sm:p-8"
        >
          <div className="flex flex-col items-center gap-4 text-center lg:flex-row lg:justify-between lg:text-left">
            <div>
              <h2 className="mb-2 text-xl font-bold text-white sm:text-2xl">
                {copy.ctaTitle}
              </h2>
              <p className="text-sm text-white/60">{copy.ctaDescription}</p>
            </div>
            <Link
              href={`/${locale}/contact`}
              className="inline-flex items-center gap-2 rounded-full border-2 border-[#d5ff0a] bg-[#d5ff0a] px-6 py-3 text-sm font-bold uppercase tracking-wider text-[#050505] transition-all hover:bg-transparent hover:text-[#d5ff0a]"
            >
              {copy.ctaButton}
              <span>→</span>
            </Link>
          </div>
        </motion.div>
      </motion.section>
    </PageLayout>
  );
}
