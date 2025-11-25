"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";

import { Breadcrumb } from "@/components/breadcrumb";
import { PageLayout } from "@/components/layout/page-layout";
import { PageHeader } from "@/components/layout/page-header";
import { CTASection } from "@/components/layout/cta-section";
import { ParallaxCard } from "@/components/motion/parallax-card";
import { cardGridStagger } from "@/lib/animations";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n-config";

type Expertise = {
  slug: string;
  title: string;
  description: string;
  imgHome: string;
};

type ExpertisesPageClientProps = {
  locale: Locale;
  expertises: Expertise[];
  nav: {
    home: string;
    expertises: string;
  };
  copy: {
    description: string;
    cardCta: string;
    ctaTitle: string;
    ctaDescription: string;
    ctaButton: string;
  };
};

/** Accent colors for expertise cards - matching home section */
const expertiseAccents = [
  {
    gradient: "from-[#d5ff0a]/30 via-[#9eff00]/20 to-transparent",
    border: "border-[#d5ff0a]/40",
    hoverBorder: "hover:border-[#d5ff0a]/80",
    glow: "hover:shadow-[0_0_40px_rgba(213,255,10,0.25)]",
    badge: "bg-[#d5ff0a]/20 text-[#d5ff0a] border-[#d5ff0a]/30",
    accent: "#d5ff0a",
  },
  {
    gradient: "from-[#4ecdc4]/30 via-[#45b7aa]/20 to-transparent",
    border: "border-[#4ecdc4]/40",
    hoverBorder: "hover:border-[#4ecdc4]/80",
    glow: "hover:shadow-[0_0_40px_rgba(78,205,196,0.25)]",
    badge: "bg-[#4ecdc4]/20 text-[#4ecdc4] border-[#4ecdc4]/30",
    accent: "#4ecdc4",
  },
  {
    gradient: "from-[#a855f7]/30 via-[#7c3aed]/20 to-transparent",
    border: "border-[#a855f7]/40",
    hoverBorder: "hover:border-[#a855f7]/80",
    glow: "hover:shadow-[0_0_40px_rgba(168,85,247,0.25)]",
    badge: "bg-[#a855f7]/20 text-[#a855f7] border-[#a855f7]/30",
    accent: "#a855f7",
  },
  {
    gradient: "from-[#ff6b6b]/30 via-[#ff8e53]/20 to-transparent",
    border: "border-[#ff6b6b]/40",
    hoverBorder: "hover:border-[#ff6b6b]/80",
    glow: "hover:shadow-[0_0_40px_rgba(255,107,107,0.25)]",
    badge: "bg-[#ff6b6b]/20 text-[#ff6b6b] border-[#ff6b6b]/30",
    accent: "#ff6b6b",
  },
  {
    gradient: "from-[#f472b6]/30 via-[#ec4899]/20 to-transparent",
    border: "border-[#f472b6]/40",
    hoverBorder: "hover:border-[#f472b6]/80",
    glow: "hover:shadow-[0_0_40px_rgba(244,114,182,0.25)]",
    badge: "bg-[#f472b6]/20 text-[#f472b6] border-[#f472b6]/30",
    accent: "#f472b6",
  },
  {
    gradient: "from-[#fb923c]/30 via-[#f97316]/20 to-transparent",
    border: "border-[#fb923c]/40",
    hoverBorder: "hover:border-[#fb923c]/80",
    glow: "hover:shadow-[0_0_40px_rgba(251,146,60,0.25)]",
    badge: "bg-[#fb923c]/20 text-[#fb923c] border-[#fb923c]/30",
    accent: "#fb923c",
  },
];

/** Animated expertise card - matching home design */
function ExpertiseCard({
  expertise,
  index,
  locale,
  cardCta,
}: {
  expertise: Expertise;
  index: number;
  locale: Locale;
  cardCta: string;
}) {
  const accent = expertiseAccents[index % expertiseAccents.length];

  return (
    <ParallaxCard index={index} parallaxSpeed={0.12} className="h-full">
      <Link
        data-testid="expertise-card"
        href={`/${locale}/expertises/${expertise.slug}`}
        className={cn(
          "group relative flex h-full flex-col overflow-hidden",
          "rounded-2xl border-2",
          "bg-[var(--color-surface)]",
          "transition-all duration-300",
          "hover:-translate-y-1",
          accent.border,
          accent.hoverBorder,
          accent.glow,
        )}
      >
        {/* Gradient overlay */}
        <div
          className={cn(
            "absolute inset-0 opacity-30 transition-opacity duration-300 group-hover:opacity-60",
            "bg-gradient-to-br",
            accent.gradient,
          )}
        />

        {/* Image section */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url(${expertise.imgHome})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-surface)] via-[var(--color-surface)]/20 to-transparent" />

          {/* Badge numéro */}
          <div
            className={cn(
              "absolute right-4 top-4 rounded-full border px-3 py-1",
              "text-xs font-bold uppercase tracking-wider",
              "backdrop-blur-sm transition-all duration-300",
              accent.badge,
            )}
          >
            0{index + 1}
          </div>
        </div>

        {/* Content section */}
        <div className="relative z-10 flex flex-1 flex-col gap-3 p-5">
          <h3 className="line-clamp-1 text-xl font-bold leading-tight text-[var(--color-text-primary)] transition-colors duration-300">
            {expertise.title}
          </h3>

          <p className="line-clamp-2 min-h-[2.5rem] text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {expertise.description}
          </p>

          <div
            className="mt-auto flex items-center gap-2 text-sm font-semibold transition-colors duration-300"
            style={{ color: accent.accent }}
          >
            {cardCta}
            <span className="transform transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </div>
        </div>
      </Link>
    </ParallaxCard>
  );
}

export function ExpertisesPageClient({
  locale,
  expertises,
  nav,
  copy,
}: ExpertisesPageClientProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const isGridInView = useInView(gridRef, { once: true, margin: "-50px" });

  return (
    <PageLayout orbsConfig="subtle" className="mx-auto max-w-[1600px]">
      <Breadcrumb
        items={[
          { label: nav.home, href: `/${locale}` },
          { label: nav.expertises },
        ]}
      />

      <PageHeader
        title={nav.expertises}
        description={copy.description}
        highlightFirstLetter
      />

      {/* Expertises Grid with stagger animation */}
      <motion.div
        ref={gridRef}
        className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
        variants={cardGridStagger}
        initial="initial"
        animate={isGridInView ? "animate" : "initial"}
      >
        {expertises.map((expertise, index) => (
          <ExpertiseCard
            key={expertise.slug}
            expertise={expertise}
            index={index}
            locale={locale}
            cardCta={copy.cardCta}
          />
        ))}
      </motion.div>

      {/* CTA Section - NO FUCHSIA, using lime-emerald */}
      <CTASection
        title={copy.ctaTitle}
        description={copy.ctaDescription}
        buttonLabel={copy.ctaButton}
        buttonHref={`/${locale}/contact`}
        variant="lime"
      />
    </PageLayout>
  );
}
