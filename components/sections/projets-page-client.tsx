"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useInView } from "framer-motion";
import Masonry from "react-masonry-css";

import { Breadcrumb } from "@/components/breadcrumb";
import { YouTubeModal } from "@/components/youtube-modal";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { SortToggle } from "@/components/ui/sort-toggle";
import { PageLayout } from "@/components/layout/page-layout";
import { cn } from "@/lib/utils";
import type { ProjetsPageDictionary } from "@/types/dictionary";
import type { Locale } from "@/lib/i18n-config";

type GalleryWork = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  category: string;
  categorySlug: string;
  coverImage: string;
  coverImageAlt: string;
  coverImageWidth?: number;
  coverImageHeight?: number;
  coverImageAspectRatio?: number;
  coverImageBlurDataUrl?: string;
  composers: string[];
  externalUrl?: string;
  youtubeUrl?: string;
  year?: number;
};

const masonryBreakpoints = {
  default: 4,
  1280: 3,
  1024: 2,
  640: 1,
};

type Category = {
  id: string;
  slug: string;
  name: string;
  color: string | null;
};

type ProjetsPageClientProps = {
  locale: Locale;
  nav: {
    home: string;
    projets: string;
  };
  copy: ProjetsPageDictionary;
};

// Couleurs par catégorie de projet
const categoryAccents: Record<
  string,
  {
    glow: string;
    borderHover: string;
    accent: string;
    badge: string;
    filterActive: string;
    filterInactive: string;
  }
> = {
  // Album de librairie musicale - Lime/Vert
  "album-de-librairie-musicale": {
    glow: "hover:shadow-[0_0_30px_rgba(163,230,53,0.3)]",
    borderHover: "hover:border-lime-400",
    accent: "#a3e635",
    badge: "bg-lime-400/20 text-lime-400 border border-lime-400/30",
    filterActive: "border-lime-400 bg-lime-400 text-[#050505]",
    filterInactive:
      "border-white/10 bg-black/20 text-white/60 hover:border-lime-400 hover:text-lime-400",
  },
  // Documentaire - Cyan/Turquoise
  documentaire: {
    glow: "hover:shadow-[0_0_30px_rgba(78,205,196,0.3)]",
    borderHover: "hover:border-cyan-400",
    accent: "#4ecdc4",
    badge: "bg-cyan-400/20 text-cyan-400 border border-cyan-400/30",
    filterActive: "border-cyan-400 bg-cyan-400 text-[#050505]",
    filterInactive:
      "border-white/10 bg-black/20 text-white/60 hover:border-cyan-400 hover:text-cyan-400",
  },
  // Synchronisation - Violet/Purple
  synchro: {
    glow: "hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]",
    borderHover: "hover:border-purple-400",
    accent: "#a855f7",
    badge: "bg-purple-400/20 text-purple-400 border border-purple-400/30",
    filterActive: "border-purple-400 bg-purple-400 text-[#050505]",
    filterInactive:
      "border-white/10 bg-black/20 text-white/60 hover:border-purple-400 hover:text-purple-400",
  },
  // Vinyle - Orange/Ambre
  vinyle: {
    glow: "hover:shadow-[0_0_30px_rgba(251,146,60,0.3)]",
    borderHover: "hover:border-orange-400",
    accent: "#fb923c",
    badge: "bg-orange-400/20 text-orange-400 border border-orange-400/30",
    filterActive: "border-orange-400 bg-orange-400 text-[#050505]",
    filterInactive:
      "border-white/10 bg-black/20 text-white/60 hover:border-orange-400 hover:text-orange-400",
  },
  // Clips - Rose/Pink
  clip: {
    glow: "hover:shadow-[0_0_30px_rgba(244,114,182,0.3)]",
    borderHover: "hover:border-pink-400",
    accent: "#f472b6",
    badge: "bg-pink-400/20 text-pink-400 border border-pink-400/30",
    filterActive: "border-pink-400 bg-pink-400 text-[#050505]",
    filterInactive:
      "border-white/10 bg-black/20 text-white/60 hover:border-pink-400 hover:text-pink-400",
  },
  // Fallback/Autre - Emerald
  default: {
    glow: "hover:shadow-[0_0_30px_rgba(52,211,153,0.3)]",
    borderHover: "hover:border-emerald-400",
    accent: "#34d399",
    badge: "bg-emerald-400/20 text-emerald-400 border border-emerald-400/30",
    filterActive: "border-emerald-400 bg-emerald-400 text-[#050505]",
    filterInactive:
      "border-white/10 bg-black/20 text-white/60 hover:border-emerald-400 hover:text-emerald-400",
  },
};

// Helper pour obtenir l'accent d'une catégorie
const getCategoryAccent = (categorySlug: string) => {
  return categoryAccents[categorySlug] ?? categoryAccents.default;
};

export function ProjetsPageClient({
  locale,
  nav,
  copy,
}: ProjetsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const [works, setWorks] = useState<GalleryWork[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    categoryParam ?? "all",
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"date" | "title">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(true);
  const [youtubeModal, setYoutubeModal] = useState<{
    isOpen: boolean;
    url: string;
    title: string;
  }>({
    isOpen: false,
    url: "",
    title: "",
  });

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const [worksRes, categoriesRes] = await Promise.all([
          fetch(`/api/projets?locale=${locale}`),
          fetch(`/api/categories?locale=${locale}`),
        ]);

        if (worksRes.ok) {
          setWorks((await worksRes.json()) as GalleryWork[]);
        }
        if (categoriesRes.ok) {
          setCategories((await categoriesRes.json()) as Category[]);
        }
      } finally {
        setLoading(false);
      }
    }

    void init();
  }, [locale]);

  useEffect(() => {
    if (categoryParam && categoryParam !== selectedCategory) {
      setSelectedCategory(categoryParam);
    }

    const sortByParam = searchParams.get("sortBy") as "date" | "title" | null;
    const sortOrderParam = searchParams.get("sortOrder") as
      | "asc"
      | "desc"
      | null;

    if (sortByParam && (sortByParam === "date" || sortByParam === "title")) {
      setSortBy(sortByParam);
    }
    if (
      sortOrderParam &&
      (sortOrderParam === "asc" || sortOrderParam === "desc")
    ) {
      setSortOrder(sortOrderParam);
    }
  }, [categoryParam, selectedCategory, searchParams]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const params = new URLSearchParams(searchParams.toString());
    if (category === "all") {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    const newUrl = params.toString()
      ? `/${locale}/projets?${params.toString()}`
      : `/${locale}/projets`;
    router.push(newUrl, { scroll: false });
  };

  const handleSortChange = (newSortBy?: string, newSortOrder?: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newSortBy) {
      setSortBy(newSortBy as "date" | "title");
      params.set("sortBy", newSortBy);
    }
    if (newSortOrder) {
      setSortOrder(newSortOrder as "asc" | "desc");
      params.set("sortOrder", newSortOrder);
    }

    const newUrl = `/${locale}/projets?${params.toString()}`;
    router.push(newUrl, { scroll: false });
  };

  const getToggleOptions = (): [string, string] => {
    if (sortBy === "title") {
      return [copy.sortOrderTitleAsc, copy.sortOrderTitleDesc];
    } else {
      return [copy.sortOrderDateAsc, copy.sortOrderDateDesc];
    }
  };

  const filteredWorks = works
    .filter(
      (work) =>
        selectedCategory === "all" || work.category === selectedCategory,
    )
    .filter((work) =>
      work.title.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === "date") {
        comparison = (a.year ?? 0) - (b.year ?? 0);
      } else {
        comparison = a.title.localeCompare(b.title, locale);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

  const handleClipClick = (url: string, title: string) => {
    setYoutubeModal({ isOpen: true, url, title });
  };

  if (loading) {
    return (
      <PageLayout showOrbs={false}>
        <div className="flex min-h-[60vh] items-center justify-center text-xl text-white/50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#d5ff0a] border-t-transparent" />
            {copy.loading}
          </motion.div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout orbsConfig="subtle" className="mx-auto max-w-[1600px]">
      <Breadcrumb
        items={[
          { label: nav.home, href: `/${locale}` },
          { label: nav.projets },
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
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                <span className="text-[#d5ff0a]">{nav.projets.charAt(0)}</span>
                {nav.projets.slice(1)}
              </h1>
              <p className="max-w-2xl text-base text-white/60">
                {copy.description}
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-8">
              <div className="text-right">
                <p className="text-3xl font-black text-white">{works.length}</p>
                <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                  {copy.statsProjects}
                </p>
              </div>
              <div className="h-12 w-px bg-white/10" />
              <div className="text-right">
                <p className="text-3xl font-black text-lime-300">
                  {categories.length}
                </p>
                <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                  {copy.statsCategories}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8 border-4 border-white/10 bg-[#0a0a0e] p-4 sm:p-6"
        >
          {/* Search and sort */}
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                data-testid="projects-search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
                placeholder={copy.searchPlaceholder}
                className="w-full border-2 border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/30 transition-all focus:border-lime-300/50 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-lime-300 transition-colors text-xs"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              <ToggleSwitch
                options={[
                  { value: "date" as const, label: copy.sortByDate },
                  { value: "title" as const, label: copy.sortByTitle },
                ]}
                value={sortBy}
                onChange={(newSortBy) => {
                  handleSortChange(newSortBy, undefined);
                }}
              />
              <SortToggle
                options={getToggleOptions()}
                value={sortOrder}
                onChange={(newOrder) => {
                  handleSortChange(undefined, newOrder);
                }}
              />
            </div>
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2">
            <button
              data-testid="category-filter"
              onClick={() => {
                handleCategoryChange("all");
              }}
              className={cn(
                "px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all",
                selectedCategory === "all"
                  ? "border-2 border-lime-300 bg-lime-300 text-[#050505]"
                  : "border-2 border-white/10 bg-black/20 text-white/60 hover:border-lime-300 hover:text-lime-300",
              )}
            >
              {copy.filterAll}
              <span className="ml-1.5 opacity-70">({works.length})</span>
            </button>
            {categories.map((category) => {
              const count = works.filter(
                (w) => w.category === category.name,
              ).length;
              const filterAccent = getCategoryAccent(category.slug);
              return (
                <button
                  key={category.id}
                  data-testid="category-filter"
                  onClick={() => {
                    handleCategoryChange(category.name);
                  }}
                  className={cn(
                    "px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border-2",
                    selectedCategory === category.name
                      ? filterAccent.filterActive
                      : filterAccent.filterInactive,
                  )}
                >
                  {category.name}
                  <span className="ml-1.5 opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Projects Grid */}
        <motion.div
          ref={gridRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {filteredWorks.length > 0 ? (
            <Masonry
              breakpointCols={masonryBreakpoints}
              className="flex w-auto -ml-4"
              columnClassName="pl-4 bg-clip-padding"
            >
              {filteredWorks.map((work, index) => (
                <div key={work.id} className="mb-4">
                  <ProjectCard
                    work={work}
                    locale={locale}
                    selectedCategory={selectedCategory}
                    onClipClick={handleClipClick}
                    index={index}
                  />
                </div>
              ))}
            </Masonry>
          ) : (
            <div className="py-16 text-center">
              <p className="text-white/40">
                {searchQuery ? copy.noResults : copy.empty}
              </p>
            </div>
          )}
        </motion.div>

        {/* CTA Box - Style Expertise */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 overflow-hidden rounded-[24px] border-4 border-lime-300 bg-gradient-to-r from-lime-300 to-emerald-400 p-8 text-center sm:p-10"
        >
          <h3 className="mb-3 text-2xl font-bold uppercase text-[#050505] sm:text-3xl">
            {copy.ctaTitle}
          </h3>
          <p className="mx-auto mb-6 max-w-xl text-sm text-[#050505]/70 sm:text-base">
            {copy.ctaDescription}
          </p>
          <Link
            href={`/${locale}/contact`}
            className="inline-flex items-center gap-2 border-4 border-[#050505] bg-[#050505] px-8 py-3 text-sm font-bold uppercase tracking-wide text-white transition-transform hover:scale-105"
          >
            {copy.ctaButton}
            <span>→</span>
          </Link>
        </motion.div>
      </motion.section>

      <YouTubeModal
        youtubeUrl={youtubeModal.url}
        title={youtubeModal.title}
        isOpen={youtubeModal.isOpen}
        onClose={() => {
          setYoutubeModal({ isOpen: false, url: "", title: "" });
        }}
      />
    </PageLayout>
  );
}

/** Project Card - Style unifié */
function ProjectCard({
  work,
  locale,
  selectedCategory,
  onClipClick,
  index,
}: {
  work: GalleryWork;
  locale: Locale;
  selectedCategory: string;
  onClipClick: (url: string, title: string) => void;
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  // Trigger when card is 30px inside viewport (just after crossing bottom edge)
  const isInView = useInView(cardRef, {
    once: true,
    margin: "0px 0px -30px 0px",
  });

  const isClip = work.categorySlug === "clips" && work.youtubeUrl;
  const accent = getCategoryAccent(work.categorySlug);

  // Stagger delay based on column position (max 4 columns) for wave effect
  const columnPosition = index % 4;
  const staggerDelay = columnPosition * 0.03;

  const handleClick = (e: React.MouseEvent) => {
    if (isClip) {
      e.preventDefault();
      onClipClick(work.youtubeUrl ?? "", work.title);
    }
  };

  const projectUrl =
    selectedCategory !== "all"
      ? `/${locale}/projets/${work.slug}?category=${selectedCategory}`
      : `/${locale}/projets/${work.slug}`;

  const CardContent = (
    <>
      {/* Image */}
      <div className="relative overflow-hidden">
        {work.coverImage && work.coverImage !== "/images/placeholder.jpg" ? (
          <Image
            src={work.coverImage}
            alt={work.coverImageAlt}
            width={work.coverImageWidth ?? 400}
            height={work.coverImageHeight ?? 300}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="w-full h-auto object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
            placeholder={work.coverImageBlurDataUrl ? "blur" : "empty"}
            blurDataURL={work.coverImageBlurDataUrl}
          />
        ) : (
          <div className="aspect-[4/3] flex h-full w-full items-center justify-center bg-gradient-to-br from-white/5 to-white/10">
            <span className="text-5xl font-black uppercase text-white/10">
              {work.title.charAt(0)}
            </span>
          </div>
        )}

        {/* Play icon for clips */}
        {isClip && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <svg
                className="ml-1 h-8 w-8 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-sm font-bold text-white group-hover:text-white">
          {work.title}
        </h3>

        {work.composers.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {work.composers.slice(0, 2).map((composer) => (
              <span
                key={composer}
                className="rounded-sm bg-white/5 px-2 py-0.5 text-[9px] font-medium text-white/50"
              >
                {composer}
              </span>
            ))}
            {work.composers.length > 2 && (
              <span className="rounded-sm bg-white/5 px-2 py-0.5 text-[9px] font-medium text-white/50">
                +{work.composers.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Tags footer: Category + Year */}
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-white/5 pt-3">
          <div
            className={cn(
              "rounded-sm px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider",
              accent.badge,
            )}
          >
            {work.category}
          </div>
          {work.year && (
            <div className="rounded-sm bg-white/10 px-2 py-1 text-[10px] font-bold text-white/60">
              {work.year}
            </div>
          )}
        </div>

        {/* Hover CTA */}
        <div
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider opacity-0 transition-all duration-300 group-hover:opacity-100"
          style={{ color: accent.accent }}
        >
          {isClip ? "Voir le clip" : "Voir le projet"}
          <span className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </div>
      </div>
    </>
  );

  const cardClasses = cn(
    "group relative flex h-full flex-col overflow-hidden",
    "border-2 border-white/10 bg-black/20",
    "transition-all duration-300",
    "hover:-translate-y-1",
    accent.glow,
    accent.borderHover,
  );

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 25 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.4,
        delay: staggerDelay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {isClip ? (
        <button
          onClick={handleClick}
          className={cn(cardClasses, "w-full text-left")}
        >
          {CardContent}
        </button>
      ) : (
        <Link
          data-testid="project-card"
          href={projectUrl}
          className={cardClasses}
        >
          {CardContent}
        </Link>
      )}
    </motion.div>
  );
}
