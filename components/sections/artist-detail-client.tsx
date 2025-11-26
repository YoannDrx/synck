"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";

import { Breadcrumb } from "@/components/breadcrumb";
import { PageLayout } from "@/components/layout/page-layout";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n-config";
import type { ArtistDetailDictionary } from "@/types/dictionary";

/** Accent color for artist detail - Neon lime */
const artistAccent = {
  border: "border-[#d5ff0a]/30",
  borderHover: "hover:border-[#d5ff0a]",
  glow: "hover:shadow-[0_0_25px_rgba(213,255,10,0.2)]",
  badge: "bg-[#d5ff0a]/10 text-[#d5ff0a] border-[#d5ff0a]/30",
  ring: "ring-[#d5ff0a]/50",
  gradient: "from-[#d5ff0a] via-[#9eff00] to-[#00d9ff]",
};

type SocialLink = {
  label: string;
  url: string;
};

type ArtistWork = {
  id: string;
  slug: string;
  title: string;
  coverImage: string;
  coverImageAlt: string;
  category: string;
};

type ArtistDetailClientProps = {
  locale: Locale;
  artist: {
    slug: string;
    name: string;
    bio?: string;
    image?: string;
    imageAlt?: string;
  };
  works: ArtistWork[];
  socialLinks: SocialLink[];
  nav: {
    home: string;
    artists: string;
  };
  copy: ArtistDetailDictionary;
};

/** Work card component with animation */
function WorkCard({
  work,
  index,
  locale,
}: {
  work: ArtistWork;
  index: number;
  locale: Locale;
}) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const isInView = useInView(cardRef, {
    once: true,
    margin: "0px 0px -50px 0px",
  });

  // Stagger delay based on column position for wave effect
  const columnPosition = index % 4;
  const staggerDelay = columnPosition * 0.05;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.5,
        delay: staggerDelay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Link
        ref={cardRef}
        href={`/${locale}/projets/${work.slug}`}
        className={cn(
          "group relative flex flex-col overflow-hidden",
          "rounded-[20px] border-2 bg-white/[0.02]",
          "transition-all duration-300",
          "hover:-translate-y-1",
          artistAccent.border,
          artistAccent.borderHover,
          artistAccent.glow,
        )}
      >
        {/* Hover gradient overlay */}
        <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-50 bg-gradient-to-br from-[#d5ff0a]/20 via-[#9eff00]/10 to-transparent pointer-events-none z-10" />

        {/* Cover Image */}
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={work.coverImage}
            alt={work.coverImageAlt}
            width={400}
            height={400}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Work Info */}
        <div className="relative z-20 p-4">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-white/50">
            {work.category}
          </div>
          <h3 className="text-sm font-bold text-white/90 line-clamp-2 transition-colors group-hover:text-white">
            {work.title}
          </h3>
        </div>
      </Link>
    </motion.div>
  );
}

/** Social link button component */
function SocialLinkButton({ link }: { link: SocialLink }) {
  // Get icon based on platform
  const getIcon = (url: string) => {
    if (url.includes("spotify")) return "🎵";
    if (url.includes("soundcloud")) return "☁";
    if (url.includes("youtube") || url.includes("youtu.be")) return "▶";
    if (url.includes("deezer")) return "🎧";
    if (url.includes("apple")) return "🍎";
    if (url.includes("instagram")) return "📷";
    if (url.includes("twitter") || url.includes("x.com")) return "𝕏";
    if (url.includes("facebook")) return "📘";
    return "🔗";
  };

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-2",
        "border-2 border-[#d5ff0a]/40 bg-[#d5ff0a]/5",
        "text-xs font-bold uppercase tracking-wider text-[#d5ff0a]",
        "transition-all duration-300",
        "hover:bg-[#d5ff0a] hover:text-[#050505] hover:border-[#d5ff0a]",
        "hover:shadow-[0_0_20px_rgba(213,255,10,0.3)]",
      )}
    >
      <span>{getIcon(link.url)}</span>
      <span>{link.label}</span>
      <span className="opacity-60">↗</span>
    </a>
  );
}

export function ArtistDetailClient({
  locale,
  artist,
  works,
  socialLinks,
  nav,
  copy,
}: ArtistDetailClientProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const worksRef = useRef<HTMLDivElement>(null);
  const isHeroInView = useInView(heroRef, { once: true, margin: "-50px" });
  const isWorksInView = useInView(worksRef, { once: true, margin: "-100px" });

  const hasValidImage = artist.image && artist.image.trim() !== "";
  const worksCount = works.length;
  const worksLabel = worksCount > 1 ? copy.worksPlural : copy.worksSingular;

  return (
    <PageLayout orbsConfig="subtle" className="mx-auto max-w-[1400px]">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: nav.home, href: `/${locale}` },
          { label: nav.artists, href: `/${locale}/artistes` },
          { label: artist.name },
        ]}
      />

      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        initial={{ opacity: 0, y: 40 }}
        animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8 rounded-[32px] border-4 border-white/10 bg-[#0a0a0f]/90 p-6 shadow-[0_25px_60px_rgba(0,0,0,0.5)] backdrop-blur-sm sm:p-8 lg:p-10"
      >
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          {/* Left: Avatar + Name + Bio */}
          <div className="flex-1">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
              {/* Avatar */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isHeroInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="relative flex-shrink-0"
              >
                <div
                  className={cn(
                    "relative h-32 w-32 overflow-hidden rounded-full sm:h-40 sm:w-40",
                    "ring-4 ring-white/10",
                    "transition-all duration-300",
                  )}
                >
                  {hasValidImage && artist.image ? (
                    <Image
                      src={artist.image}
                      alt={artist.imageAlt ?? artist.name}
                      fill
                      sizes="160px"
                      className="object-cover"
                    />
                  ) : (
                    <div
                      className={cn(
                        "flex h-full w-full items-center justify-center",
                        "bg-gradient-to-br",
                        artistAccent.gradient,
                      )}
                    >
                      <span className="text-5xl font-black text-white/80">
                        {artist.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                {/* Glow effect behind avatar */}
                <div className="absolute inset-0 -z-10 rounded-full bg-[#d5ff0a]/20 blur-2xl" />
              </motion.div>

              {/* Name + Badge */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={isHeroInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-center sm:text-left"
              >
                <h1 className="mb-3 text-3xl font-black uppercase tracking-tight sm:text-4xl lg:text-5xl">
                  <span className="text-[#d5ff0a]">
                    {artist.name.charAt(0)}
                  </span>
                  {artist.name.slice(1)}
                </h1>
                <div
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-4 py-1.5",
                    "border-2 text-xs font-bold uppercase tracking-wider",
                    artistAccent.badge,
                  )}
                >
                  <span className="text-base">🎵</span>
                  <span>
                    {worksCount} {worksLabel}
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Bio */}
            {artist.bio && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-6"
              >
                <p className="text-base leading-relaxed text-white/70 whitespace-pre-line max-w-2xl">
                  {artist.bio}
                </p>
              </motion.div>
            )}

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-6 flex flex-wrap gap-3"
              >
                {socialLinks.map((link) => (
                  <SocialLinkButton key={link.url} link={link} />
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </motion.section>

      {/* Works Section */}
      {works.length > 0 && (
        <motion.section
          ref={worksRef}
          initial={{ opacity: 0, y: 40 }}
          animate={isWorksInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 rounded-[32px] border-4 border-white/10 bg-[#0a0a0f]/90 p-6 shadow-[0_25px_60px_rgba(0,0,0,0.5)] backdrop-blur-sm sm:p-8 lg:p-10"
        >
          {/* Section Header */}
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-2xl font-black uppercase tracking-tight sm:text-3xl">
              <span className="text-[#d5ff0a]">
                {copy.worksTitle.charAt(0)}
              </span>
              {copy.worksTitle.slice(1)}
            </h2>
            <div className="text-right">
              <p className="text-2xl font-black text-white">{worksCount}</p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                {copy.worksPlural}
              </p>
            </div>
          </div>

          {/* Works Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {works.map((work, index) => (
              <WorkCard
                key={work.id}
                work={work}
                index={index}
                locale={locale}
              />
            ))}
          </div>
        </motion.section>
      )}

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isWorksInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="rounded-[24px] border-2 border-[#d5ff0a]/40 bg-gradient-to-br from-[#d5ff0a]/10 via-[#9eff00]/5 to-transparent p-6 sm:p-8"
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
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-6 py-3",
              "border-2 border-[#d5ff0a] bg-[#d5ff0a]",
              "text-sm font-bold uppercase tracking-wider text-[#050505]",
              "transition-all duration-300",
              "hover:bg-transparent hover:text-[#d5ff0a]",
              "hover:shadow-[0_0_25px_rgba(213,255,10,0.3)]",
            )}
          >
            {copy.ctaButton}
            <span>→</span>
          </Link>
        </div>
      </motion.div>
    </PageLayout>
  );
}
