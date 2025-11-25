"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";

import { Breadcrumb } from "@/components/breadcrumb";
import { PageLayout } from "@/components/layout/page-layout";
import { PageHeader } from "@/components/layout/page-header";
import { CTASection } from "@/components/layout/cta-section";
import { cardGridStagger } from "@/lib/animations";
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
    ctaTitle: string;
    ctaDescription: string;
    ctaButton: string;
  };
};

/** Accent colors for composer cards - matching home section */
const composerAccents = [
  {
    bg: "from-[#ff6b6b] via-[#ff8e53] to-[#feca57]",
    ring: "ring-[#ff6b6b]/50",
    text: "text-[#ff6b6b]",
    glow: "shadow-[0_0_40px_rgba(255,107,107,0.4)]",
    borderColor: "rgba(255,107,107,0.7)",
  },
  {
    bg: "from-[#4ecdc4] via-[#44a08d] to-[#093637]",
    ring: "ring-[#4ecdc4]/50",
    text: "text-[#4ecdc4]",
    glow: "shadow-[0_0_40px_rgba(78,205,196,0.4)]",
    borderColor: "rgba(78,205,196,0.7)",
  },
  {
    bg: "from-[#a855f7] via-[#7c3aed] to-[#4f46e5]",
    ring: "ring-[#a855f7]/50",
    text: "text-[#a855f7]",
    glow: "shadow-[0_0_40px_rgba(168,85,247,0.4)]",
    borderColor: "rgba(168,85,247,0.7)",
  },
  {
    bg: "from-[#d5ff0a] via-[#9eff00] to-[#00d9ff]",
    ring: "ring-[#d5ff0a]/50",
    text: "text-[#d5ff0a]",
    glow: "shadow-[0_0_40px_rgba(213,255,10,0.4)]",
    borderColor: "rgba(213,255,10,0.7)",
  },
  {
    bg: "from-[#f472b6] via-[#ec4899] to-[#db2777]",
    ring: "ring-[#f472b6]/50",
    text: "text-[#f472b6]",
    glow: "shadow-[0_0_40px_rgba(244,114,182,0.4)]",
    borderColor: "rgba(244,114,182,0.7)",
  },
  {
    bg: "from-[#fb923c] via-[#f97316] to-[#ea580c]",
    ring: "ring-[#fb923c]/50",
    text: "text-[#fb923c]",
    glow: "shadow-[0_0_40px_rgba(251,146,60,0.4)]",
    borderColor: "rgba(251,146,60,0.7)",
  },
];

/** Animated composer card - matching home design */
function ComposerCard({
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
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });
  const accent = composerAccents[index % composerAccents.length];

  const renderWorksCount = (count: number) =>
    `${String(count)} ${count > 1 ? copy.worksPlural : copy.worksSingular}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{
        duration: 0.6,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative h-full"
    >
      <Link
        ref={cardRef}
        data-testid="composer-card"
        href={`/${locale}/compositeurs/${composer.slug}`}
        className={cn(
          "relative flex h-full flex-col items-center gap-4 p-6",
          "rounded-2xl bg-[var(--color-surface)]/80 backdrop-blur-sm",
          "border-2 border-transparent",
          "transition-all duration-500 ease-out",
          "hover:scale-105 hover:bg-[var(--color-surface)]",
        )}
        style={
          {
            "--accent-border": accent.borderColor,
            borderColor: "rgba(255,255,255,0.1)",
          } as React.CSSProperties
        }
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = accent.borderColor;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
        }}
      >
        {/* Gradient orb behind image */}
        <div
          className={cn(
            "absolute -top-4 left-1/2 -translate-x-1/2",
            "h-32 w-32 rounded-full opacity-0 blur-3xl",
            "transition-opacity duration-500 group-hover:opacity-60",
            "bg-gradient-to-br",
            accent.bg,
          )}
        />

        {/* Avatar with animated ring */}
        <div className="relative">
          <motion.div
            className={cn(
              "absolute -inset-2 rounded-full opacity-0",
              "bg-gradient-to-br",
              accent.bg,
              "transition-opacity duration-300 group-hover:opacity-100",
            )}
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            style={{ filter: "blur(8px)" }}
          />
          <div
            className={cn(
              "relative h-24 w-24 overflow-hidden rounded-full",
              "ring-2 ring-white/20 ring-offset-2 ring-offset-[var(--color-surface)]",
              "transition-all duration-300",
              `group-hover:ring-4 group-hover:${accent.ring}`,
            )}
          >
            {composer.image ? (
              <Image
                src={composer.image}
                alt={composer.imageAlt ?? composer.name}
                fill
                sizes="96px"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div
                className={cn(
                  "flex h-full w-full items-center justify-center",
                  "bg-gradient-to-br",
                  accent.bg,
                )}
              >
                <span className="text-3xl font-black text-white">
                  {composer.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Name with gradient on hover */}
        <h3
          className={cn(
            "line-clamp-1 text-center text-lg font-bold tracking-tight",
            "text-[var(--color-text-primary)]",
            "transition-all duration-300",
            "group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:text-transparent",
            `group-hover:${accent.bg}`,
          )}
        >
          {composer.name}
        </h3>

        {/* Works count badge */}
        <div
          className={cn(
            "rounded-full px-3 py-1",
            "bg-white/5 text-xs font-medium",
            "text-[var(--color-text-muted)]",
            "transition-all duration-300",
            `group-hover:bg-gradient-to-r group-hover:${accent.bg}`,
            "group-hover:text-white group-hover:shadow-lg",
          )}
        >
          {renderWorksCount(composer.worksCount)}
        </div>

        {/* Bio preview - fixed height */}
        <p className="min-h-[2rem] text-center text-xs text-white/50 line-clamp-2">
          {composer.bio ?? ""}
        </p>

        {/* Floating music notes decoration */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className={cn("absolute text-lg", accent.text)}
              initial={{ y: 100, x: 20 + i * 30, opacity: 0 }}
              animate={{
                y: [-20, -60],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                delay: i * 0.3,
                repeat: Infinity,
                ease: "easeOut",
              }}
            >
              ♪
            </motion.span>
          ))}
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
  const gridRef = useRef<HTMLDivElement>(null);
  const isGridInView = useInView(gridRef, { once: true, margin: "-50px" });

  return (
    <PageLayout orbsConfig="subtle" className="mx-auto max-w-[1600px]">
      <Breadcrumb
        items={[
          { label: nav.home, href: `/${locale}` },
          { label: nav.composers },
        ]}
      />

      <PageHeader
        title={nav.composers}
        description={copy.description}
        highlightFirstLetter
      />

      {/* Composers Grid with stagger animation */}
      <motion.div
        ref={gridRef}
        className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        variants={cardGridStagger}
        initial="initial"
        animate={isGridInView ? "animate" : "initial"}
      >
        {composers.map((composer, index) => (
          <ComposerCard
            key={composer.id}
            composer={composer}
            index={index}
            locale={locale}
            copy={copy}
          />
        ))}
      </motion.div>

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
