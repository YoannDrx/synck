"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, useInView } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { X } from "lucide-react";

import { Breadcrumb } from "@/components/breadcrumb";
import { PageLayout } from "@/components/layout/page-layout";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n-config";
import type { ProjetDetailDictionary } from "@/types/dictionary";

// Couleurs par catégorie (cohérent avec projets-page-client.tsx)
const categoryAccents: Record<
  string,
  {
    primary: string;
    glow: string;
    border: string;
    activeBorder: string;
    badge: string;
    text: string;
  }
> = {
  "album-de-librairie-musicale": {
    primary: "#a3e635",
    glow: "shadow-[0_0_30px_rgba(163,230,53,0.2)]",
    border: "border-lime-400/30 hover:border-lime-400",
    activeBorder:
      "hover:border-lime-400 focus:border-lime-400 focus:ring-lime-400/50",
    badge: "bg-lime-400/15 text-lime-400 border-lime-400/30",
    text: "text-lime-400",
  },
  documentaire: {
    primary: "#4ecdc4",
    glow: "shadow-[0_0_30px_rgba(78,205,196,0.2)]",
    border: "border-cyan-400/30 hover:border-cyan-400",
    activeBorder:
      "hover:border-cyan-400 focus:border-cyan-400 focus:ring-cyan-400/50",
    badge: "bg-cyan-400/15 text-cyan-400 border-cyan-400/30",
    text: "text-cyan-400",
  },
  synchro: {
    primary: "#a855f7",
    glow: "shadow-[0_0_30px_rgba(168,85,247,0.2)]",
    border: "border-purple-400/30 hover:border-purple-400",
    activeBorder:
      "hover:border-purple-400 focus:border-purple-400 focus:ring-purple-400/50",
    badge: "bg-purple-400/15 text-purple-400 border-purple-400/30",
    text: "text-purple-400",
  },
  vinyle: {
    primary: "#fb923c",
    glow: "shadow-[0_0_30px_rgba(251,146,60,0.2)]",
    border: "border-orange-400/30 hover:border-orange-400",
    activeBorder:
      "hover:border-orange-400 focus:border-orange-400 focus:ring-orange-400/50",
    badge: "bg-orange-400/15 text-orange-400 border-orange-400/30",
    text: "text-orange-400",
  },
  clip: {
    primary: "#f472b6",
    glow: "shadow-[0_0_30px_rgba(244,114,182,0.2)]",
    border: "border-pink-400/30 hover:border-pink-400",
    activeBorder:
      "hover:border-pink-400 focus:border-pink-400 focus:ring-pink-400/50",
    badge: "bg-pink-400/15 text-pink-400 border-pink-400/30",
    text: "text-pink-400",
  },
  default: {
    primary: "#d5ff0a",
    glow: "shadow-[0_0_30px_rgba(213,255,10,0.2)]",
    border: "border-[#d5ff0a]/30 hover:border-[#d5ff0a]",
    activeBorder:
      "hover:border-[#d5ff0a] focus:border-[#d5ff0a] focus:ring-[#d5ff0a]/50",
    badge: "bg-[#d5ff0a]/15 text-[#d5ff0a] border-[#d5ff0a]/30",
    text: "text-[#d5ff0a]",
  },
};

const getCategoryAccent = (categorySlug?: string) => {
  if (!categorySlug) return categoryAccents.default;
  return categoryAccents[categorySlug] ?? categoryAccents.default;
};

type Artist = {
  id: string;
  slug: string;
  name: string;
  image?: string;
  imageAlt?: string;
};

type GalleryImage = {
  id: string;
  path: string;
  alt?: string;
};

type NavWork = {
  slug: string;
  title: string;
} | null;

type RelatedWork = {
  slug: string;
  title: string;
  subtitle?: string;
  category: string;
  categorySlug?: string;
  coverImage: string;
  coverImageAlt: string;
};

type ProjetDetailClientProps = {
  locale: Locale;
  project: {
    slug: string;
    title: string;
    subtitle?: string;
    description?: string;
    coverImage?: string;
    coverImageAlt?: string;
    category?: string;
    categorySlug?: string;
    label?: string;
    genre?: string;
    releaseDate?: string;
    externalUrl?: string;
    youtubeUrl?: string;
    spotifyEmbedUrl?: string;
  };
  artists: Artist[];
  gallery: GalleryImage[];
  relatedClips?: RelatedWork[];
  relatedProjects?: RelatedWork[];
  relatedProjectArtists?: Artist[];
  prevWork: NavWork;
  nextWork: NavWork;
  nav: {
    home: string;
    projets: string;
  };
  copy: ProjetDetailDictionary;
  categoryParam?: string;
};

export function ProjetDetailClient({
  locale,
  project,
  artists,
  gallery,
  prevWork,
  nextWork,
  nav,
  copy,
  categoryParam,
  relatedClips = [],
  relatedProjects = [],
  relatedProjectArtists = [],
}: ProjetDetailClientProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  const isHeroInView = useInView(heroRef, { once: true, margin: "-50px" });
  const isInfoInView = useInView(infoRef, { once: true, margin: "-50px" });
  const isGalleryInView = useInView(galleryRef, {
    once: true,
    margin: "-50px",
  });

  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [isCoverOpen, setIsCoverOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
    }, 0);
  }, []);

  const accent = getCategoryAccent(project.categorySlug);
  const hasArtists = artists.length > 0;
  const hasGallery = gallery.length > 0;
  const hasYoutube = Boolean(project.youtubeUrl);
  const hasSpotify = Boolean(project.spotifyEmbedUrl);
  const hasPrimaryMedia = hasYoutube || hasSpotify;
  const hasExternalLink = Boolean(project.externalUrl) && !hasYoutube;
  const hasCoverImage = Boolean(project.coverImage);
  const isClipCategory = (() => {
    const slug = (project.categorySlug ?? "").toLowerCase();
    const name = (project.category ?? "").toLowerCase();
    return (
      slug === "clip" ||
      slug === "music-video" ||
      name.includes("clip") ||
      name.includes("music video") ||
      name.includes("video")
    );
  })();
  const hasRelatedClips = !isClipCategory && relatedClips.length > 0;
  const hasRelatedProjects = isClipCategory && relatedProjects.length > 0;
  const hasRelatedProjectArtists =
    isClipCategory && relatedProjectArtists.length > 0;

  const closeLabel = locale === "fr" ? "Fermer" : "Close";
  const enlargeLabel = locale === "fr" ? "Agrandir l'image" : "Enlarge image";

  // Extract YouTube video ID
  const youtubeVideoId = project.youtubeUrl
    ? (() => {
        try {
          const url = new URL(project.youtubeUrl);
          if (
            url.hostname.includes("youtube.com") &&
            url.searchParams.has("v")
          ) {
            return url.searchParams.get("v");
          }
          if (url.hostname === "youtu.be") {
            return url.pathname.slice(1);
          }
          return null;
        } catch {
          return null;
        }
      })()
    : null;

  return (
    <PageLayout orbsConfig="subtle" className="mx-auto max-w-[1400px]">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: nav.home, href: `/${locale}` },
          {
            label: nav.projets,
            href: categoryParam
              ? `/${locale}/projets?category=${categoryParam}`
              : `/${locale}/projets`,
          },
          { label: project.title },
        ]}
      />

      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        initial={{ opacity: 0, y: 40 }}
        animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "mb-8 rounded-[32px] border-4 border-white/10 bg-[#0a0a0f]/90 p-6 backdrop-blur-sm sm:p-8 lg:p-10",
          accent.glow,
        )}
      >
        <div
          className={cn(
            "flex flex-col gap-8",
            hasPrimaryMedia
              ? "lg:grid lg:grid-cols-[1.05fr_0.95fr]"
              : "lg:flex-row",
          )}
        >
          <div className="flex flex-col gap-6 order-1 lg:order-1">
            {/* Cover Image */}
            {project.coverImage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={isHeroInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex-shrink-0 lg:w-[340px]"
              >
                <button
                  type="button"
                  aria-label={enlargeLabel}
                  className={cn(
                    "relative block overflow-hidden rounded-[20px] border-2 border-white/10 transition-all duration-300 focus:outline-none focus:ring-4",
                    hasCoverImage && "cursor-zoom-in hover:scale-105",
                    hasCoverImage && accent.activeBorder,
                  )}
                  onClick={() => {
                    if (hasCoverImage) setIsCoverOpen(true);
                  }}
                  disabled={!hasCoverImage}
                >
                  <Image
                    src={project.coverImage}
                    alt={project.coverImageAlt ?? project.title}
                    width={800}
                    height={800}
                    className="h-full w-full object-cover"
                  />
                </button>
              </motion.div>
            )}

            {/* Project Info */}
            <div className="flex-1 space-y-4">
              {/* Category Badge */}
              {project.category && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={isHeroInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.15 }}
                >
                  <span
                    className={cn(
                      "inline-block rounded-full border-2 px-4 py-1.5 text-xs font-bold uppercase tracking-wider",
                      accent.badge,
                    )}
                  >
                    {project.category}
                  </span>
                </motion.div>
              )}

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-3xl font-black uppercase tracking-tight sm:text-4xl lg:text-5xl"
              >
                <span style={{ color: accent.primary }}>
                  {project.title.charAt(0)}
                </span>
                {project.title.slice(1)}
              </motion.h1>

              {/* Subtitle */}
              {project.subtitle && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.25 }}
                  className="text-lg text-white/70 sm:text-xl"
                >
                  {project.subtitle}
                </motion.p>
              )}

              {/* Description */}
              {project.description && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="prose prose-invert prose-sm max-w-none text-white/70"
                >
                  <ReactMarkdown>{project.description}</ReactMarkdown>
                </motion.div>
              )}

              {/* External Link Button */}
              {hasExternalLink && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.35 }}
                >
                  <a
                    href={project.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border-2 px-5 py-2",
                      "text-xs font-bold uppercase tracking-wider",
                      "transition-all duration-300",
                      accent.border,
                      accent.text,
                      "hover:bg-white/5",
                    )}
                  >
                    {copy.externalResourcesButton}
                    <span>↗</span>
                  </a>
                </motion.div>
              )}
            </div>
          </div>

          {/* Media column */}
          {hasPrimaryMedia && (
            <div className="grid gap-4 order-2 lg:order-2 w-full lg:self-start">
              {hasYoutube && youtubeVideoId && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="overflow-hidden rounded-[20px] border-2 border-white/10 bg-black"
                >
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                    className="aspect-video w-full"
                  />
                </motion.div>
              )}

              {hasSpotify && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.25 }}
                  className="overflow-hidden rounded-[20px] border-2 border-white/10 bg-white/[0.02]"
                >
                  <iframe
                    src={project.spotifyEmbedUrl}
                    width="100%"
                    height="352"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    className="h-[352px] w-full sm:h-[352px] lg:h-full"
                    style={{ minHeight: 240 }}
                  />
                </motion.div>
              )}
            </div>
          )}
        </div>
      </motion.section>

      {/* Info Grid: Artists + Related Project Artists + Details */}
      <motion.section
        ref={infoRef}
        initial={{ opacity: 0, y: 40 }}
        animate={isInfoInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8 grid gap-6 lg:grid-cols-2"
      >
        {/* Artists */}
        {(hasArtists || hasRelatedProjectArtists) && (
          <div className="grid gap-6">
            {hasArtists && (
              <ArtistListCard
                locale={locale}
                title={copy.artistsTitle}
                artists={artists}
                accent={accent}
                isInfoInView={isInfoInView}
              />
            )}
            {hasRelatedProjectArtists && (
              <ArtistListCard
                locale={locale}
                title={copy.relatedProjectArtistsTitle}
                artists={relatedProjectArtists}
                accent={getCategoryAccent("clip")}
                isInfoInView={isInfoInView}
              />
            )}
          </div>
        )}

        {/* Project Details */}
        <div className="rounded-[24px] border-4 border-white/10 bg-[#0a0a0f]/90 p-6 backdrop-blur-sm">
          <h2
            className={cn(
              "mb-5 text-lg font-bold uppercase tracking-wider",
              accent.text,
            )}
          >
            {copy.infoTitle}
          </h2>
          <div className="space-y-3">
            {project.releaseDate && (
              <InfoRow label={copy.releaseDate} value={project.releaseDate} />
            )}
            {project.category && (
              <InfoRow label={copy.category} value={project.category} />
            )}
            {project.genre && (
              <InfoRow label={copy.genre} value={project.genre} />
            )}
            {project.label && (
              <InfoRow label={copy.label} value={project.label} />
            )}
          </div>
        </div>
      </motion.section>

      {(hasRelatedClips || hasRelatedProjects) && (
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 rounded-[24px] border-4 border-white/10 bg-[#0a0a0f]/90 p-6 backdrop-blur-sm"
        >
          <h2
            className={cn(
              "mb-5 text-lg font-bold uppercase tracking-wider",
              accent.text,
            )}
          >
            {isClipCategory
              ? copy.relatedProjectsTitle
              : copy.relatedClipsTitle}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(isClipCategory ? relatedProjects : relatedClips).map(
              (item, index) => (
                <motion.div
                  key={item.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <RelatedWorkCard
                    locale={locale}
                    work={item}
                    accent={getCategoryAccent(item.categorySlug)}
                  />
                </motion.div>
              ),
            )}
          </div>
        </motion.section>
      )}

      {/* Gallery */}
      {hasGallery && (
        <motion.section
          ref={galleryRef}
          initial={{ opacity: 0, y: 40 }}
          animate={isGalleryInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 rounded-[24px] border-4 border-white/10 bg-[#0a0a0f]/90 p-6 backdrop-blur-sm"
        >
          <h2
            className={cn(
              "mb-5 text-lg font-bold uppercase tracking-wider",
              accent.text,
            )}
          >
            {copy.galleryTitle}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.map((image, index) => (
              <motion.button
                key={image.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={isGalleryInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                onClick={() => {
                  setLightboxImage(image.path);
                }}
                className={cn(
                  "group relative overflow-hidden rounded-[16px] border-2",
                  "transition-all duration-300",
                  accent.border,
                )}
              >
                <Image
                  src={image.path}
                  alt={image.alt ?? "Gallery image"}
                  width={400}
                  height={300}
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20" />
              </motion.button>
            ))}
          </div>
        </motion.section>
      )}

      {/* Prev/Next Navigation */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8 grid gap-4 sm:grid-cols-2"
      >
        {prevWork ? (
          <Link
            href={`/${locale}/projets/${prevWork.slug}`}
            className={cn(
              "group rounded-[20px] border-4 border-white/10 bg-[#0a0a0f]/90 p-6",
              "transition-all duration-300",
              "hover:border-white/20 hover:bg-white/[0.02]",
            )}
          >
            <div
              className={cn(
                "mb-2 text-xs font-bold uppercase tracking-wider",
                accent.text,
              )}
            >
              {copy.previousLabel}
            </div>
            <div className="text-lg font-bold uppercase text-white/80 transition-colors group-hover:text-white line-clamp-1">
              {prevWork.title}
            </div>
          </Link>
        ) : (
          <div />
        )}

        {nextWork ? (
          <Link
            href={`/${locale}/projets/${nextWork.slug}`}
            className={cn(
              "group rounded-[20px] border-4 border-white/10 bg-[#0a0a0f]/90 p-6 text-right",
              "transition-all duration-300",
              "hover:border-white/20 hover:bg-white/[0.02]",
            )}
          >
            <div
              className={cn(
                "mb-2 text-xs font-bold uppercase tracking-wider",
                accent.text,
              )}
            >
              {copy.nextLabel}
            </div>
            <div className="text-lg font-bold uppercase text-white/80 transition-colors group-hover:text-white line-clamp-1">
              {nextWork.title}
            </div>
          </Link>
        ) : (
          <div />
        )}
      </motion.section>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
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

      {/* Gallery Lightbox (Existing) */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => {
            setLightboxImage(null);
          }}
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw] w-full md:w-auto rounded-[24px] border border-white/10 bg-[#0b0b0f]/80 p-4 shadow-[0_25px_60px_rgba(0,0,0,0.6)]"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <button
              onClick={() => {
                setLightboxImage(null);
              }}
              className="absolute right-3 top-3 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
              aria-label="Fermer la galerie"
            >
              <X size={24} />
            </button>
            <div className="relative max-h-[80vh]">
              <Image
                src={lightboxImage}
                alt="Gallery image"
                width={1200}
                height={900}
                className="h-auto max-h-[75vh] w-full rounded-[16px] object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Cover Image Lightbox Portal */}
      {mounted &&
        isCoverOpen &&
        project.coverImage &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
            onClick={() => {
              setIsCoverOpen(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <button
                onClick={() => {
                  setIsCoverOpen(false);
                }}
                aria-label={closeLabel}
                className="absolute top-4 right-4 z-50 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <X size={24} />
              </button>
              <Image
                src={project.coverImage}
                alt={project.coverImageAlt ?? project.title}
                width={1200}
                height={1200}
                className="h-auto max-h-[85vh] w-auto object-contain"
                quality={90}
              />
            </motion.div>
          </div>,
          document.body,
        )}
    </PageLayout>
  );
}

function RelatedWorkCard({
  locale,
  work,
  accent,
}: {
  locale: Locale;
  work: RelatedWork;
  accent: ReturnType<typeof getCategoryAccent>;
}) {
  return (
    <Link
      href={`/${locale}/projets/${work.slug}`}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-[16px] border-2 bg-white/[0.02] p-3",
        accent.border,
        accent.glow,
      )}
    >
      <div className="relative mb-3 aspect-[16/10] overflow-hidden rounded-[12px]">
        <Image
          src={work.coverImage}
          alt={work.coverImageAlt}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <div
          className={cn(
            "w-fit rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide",
            accent.badge,
          )}
        >
          {work.category}
        </div>
        <div className="text-base font-bold text-white transition-colors group-hover:text-white">
          {work.title}
        </div>
        {work.subtitle && (
          <div className="text-xs text-white/60 line-clamp-1">
            {work.subtitle}
          </div>
        )}
        <div
          className={cn(
            "mt-auto inline-flex items-center gap-2 text-xs font-semibold",
            accent.text,
          )}
        >
          {locale === "fr" ? "Voir le projet" : "View project"} <span>→</span>
        </div>
      </div>
    </Link>
  );
}

function ArtistListCard({
  locale,
  title,
  artists,
  accent,
  isInfoInView,
}: {
  locale: Locale;
  title: string;
  artists: Artist[];
  accent: ReturnType<typeof getCategoryAccent>;
  isInfoInView: boolean;
}) {
  return (
    <div className="rounded-[24px] border-4 border-white/10 bg-[#0a0a0f]/90 p-6 backdrop-blur-sm">
      <h2
        className={cn(
          "mb-5 text-lg font-bold uppercase tracking-wider",
          accent.text,
        )}
      >
        {title}
      </h2>
      <div
        className={
          artists.length > 3 ? "grid gap-3 sm:grid-cols-2" : "space-y-3"
        }
      >
        {artists.map((artist, index) => (
          <motion.div
            key={`${title}-${artist.id}`}
            initial={{ opacity: 0, x: -20 }}
            animate={isInfoInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
          >
            <Link
              href={`/${locale}/artistes/${artist.slug}`}
              className={cn(
                "group flex items-center gap-3 rounded-[12px] p-3",
                "border-2 border-transparent bg-white/[0.02]",
                "transition-all duration-300",
                "hover:border-white/10 hover:bg-white/5",
              )}
            >
              <div
                className={cn(
                  "relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full",
                  "ring-2 ring-white/10 transition-all duration-300",
                  "group-hover:ring-4",
                  `group-hover:ring-[${accent.primary}]/30`,
                )}
              >
                {artist.image ? (
                  <Image
                    src={artist.image}
                    alt={artist.imageAlt ?? artist.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white/10 to-white/5">
                    <span className="text-lg font-black text-white/40">
                      {artist.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-white transition-colors group-hover:text-white">
                  {artist.name}
                </div>
              </div>
              <span
                className={cn(
                  "text-sm opacity-0 transition-all duration-300",
                  "group-hover:opacity-100 group-hover:translate-x-1",
                  accent.text,
                )}
              >
                →
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/** Info row component */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-dashed border-white/10 pb-3 last:border-0">
      <span className="text-sm text-white/50">{label}</span>
      <span className="text-sm font-bold text-white">{value}</span>
    </div>
  );
}
