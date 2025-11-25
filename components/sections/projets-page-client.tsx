"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useInView } from "framer-motion";

import { Breadcrumb } from "@/components/breadcrumb";
import { YouTubeModal } from "@/components/youtube-modal";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { SortToggle } from "@/components/ui/sort-toggle";
import { PageLayout } from "@/components/layout/page-layout";
import { PageHeader } from "@/components/layout/page-header";
import { CTASection } from "@/components/layout/cta-section";
import { ParallaxCard } from "@/components/motion/parallax-card";
import { cardGridStagger, smoothTransition } from "@/lib/animations";
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
  composers: string[];
  externalUrl?: string;
  youtubeUrl?: string;
  year?: number;
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

/** Animated filter button */
function FilterButton({
  label,
  count,
  isActive,
  onClick,
  index,
}: {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
  index: number;
}) {
  return (
    <motion.button
      data-testid="category-filter"
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, ...smoothTransition }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      className={`rounded-full border-2 px-6 py-2 text-sm font-bold uppercase tracking-wider transition-colors ${
        isActive
          ? "border-lime-300 bg-lime-300 text-[#050505]"
          : "border-white/30 bg-transparent text-white hover:border-lime-300 hover:text-lime-300"
      }`}
    >
      {label}{" "}
      <span
        className={`ml-1.5 text-xs font-normal ${isActive ? "opacity-70" : "opacity-50"}`}
      >
        ({count})
      </span>
    </motion.button>
  );
}

/** Accent colors for project cards - matching home section */
const projectAccents = [
  {
    gradient: "from-[#d5ff0a]/25 via-[#9eff00]/15 to-transparent",
    border: "border-[#d5ff0a]/30",
    hoverBorder: "hover:border-[#d5ff0a]/70",
    glow: "hover:shadow-[0_0_30px_rgba(213,255,10,0.3)]",
    accent: "#d5ff0a",
  },
  {
    gradient: "from-[#ff6b6b]/25 via-[#ff8e53]/15 to-transparent",
    border: "border-[#ff6b6b]/30",
    hoverBorder: "hover:border-[#ff6b6b]/70",
    glow: "hover:shadow-[0_0_30px_rgba(255,107,107,0.3)]",
    accent: "#ff6b6b",
  },
  {
    gradient: "from-[#4ecdc4]/25 via-[#45b7aa]/15 to-transparent",
    border: "border-[#4ecdc4]/30",
    hoverBorder: "hover:border-[#4ecdc4]/70",
    glow: "hover:shadow-[0_0_30px_rgba(78,205,196,0.3)]",
    accent: "#4ecdc4",
  },
  {
    gradient: "from-[#a855f7]/25 via-[#7c3aed]/15 to-transparent",
    border: "border-[#a855f7]/30",
    hoverBorder: "hover:border-[#a855f7]/70",
    glow: "hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]",
    accent: "#a855f7",
  },
  {
    gradient: "from-[#f472b6]/25 via-[#ec4899]/15 to-transparent",
    border: "border-[#f472b6]/30",
    hoverBorder: "hover:border-[#f472b6]/70",
    glow: "hover:shadow-[0_0_30px_rgba(244,114,182,0.3)]",
    accent: "#f472b6",
  },
  {
    gradient: "from-[#fb923c]/25 via-[#f97316]/15 to-transparent",
    border: "border-[#fb923c]/30",
    hoverBorder: "hover:border-[#fb923c]/70",
    glow: "hover:shadow-[0_0_30px_rgba(251,146,60,0.3)]",
    accent: "#fb923c",
  },
];

/** Project card with animations - matching home design */
function ProjectCard({
  work,
  index,
  locale,
  selectedCategory,
  onClipClick,
}: {
  work: GalleryWork;
  index: number;
  locale: Locale;
  selectedCategory: string;
  onClipClick: (url: string, title: string) => void;
}) {
  const isClip = work.categorySlug === "clips" && work.youtubeUrl;
  const accent = projectAccents[index % projectAccents.length];

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
      {/* Gradient overlay */}
      <div
        className={cn(
          "absolute inset-0 opacity-40 transition-opacity duration-300 group-hover:opacity-80",
          "bg-gradient-to-br",
          accent.gradient,
        )}
      />

      <div className="relative z-10 flex h-full flex-col p-4">
        {/* Header: category + index */}
        <div className="mb-3 flex items-center justify-between text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
          <span className="truncate">{work.category}</span>
          <span className="shrink-0">{String(index + 1).padStart(2, "0")}</span>
        </div>

        {/* Image - contain to show full image without cropping */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-black/40">
          {work.coverImage && work.coverImage !== "/images/placeholder.jpg" ? (
            <>
              {/* Blurred background to fill empty space */}
              <div
                className="absolute inset-0 scale-110 blur-xl opacity-50"
                style={{
                  backgroundImage: `url(${work.coverImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              {/* Main image - object-contain to show full image */}
              <Image
                src={work.coverImage}
                alt={work.coverImageAlt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                className="object-contain transition-transform duration-500 group-hover:scale-105"
              />
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white/5 to-white/10">
              <span className="text-4xl font-black uppercase text-white/20">
                {work.title.charAt(0)}
              </span>
            </div>
          )}
          {/* Play icon for clips */}
          {isClip && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <motion.svg
                className="h-16 w-16 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
                initial={{ scale: 0.8 }}
                whileHover={{ scale: 1.1 }}
              >
                <path d="M8 5v14l11-7z" />
              </motion.svg>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="mt-3 flex flex-1 flex-col">
          {/* Title */}
          <h3 className="line-clamp-2 min-h-[2.5rem] text-base font-bold leading-tight text-[var(--color-text-primary)]">
            {work.title}
          </h3>

          {/* Year */}
          {work.year && (
            <span className="mt-1 text-xs font-medium text-white/40">
              {work.year}
            </span>
          )}

          {/* Composers badges */}
          {work.composers.length > 0 && (
            <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
              {work.composers.slice(0, 2).map((composer) => (
                <span
                  key={composer}
                  className="rounded-full border border-white/20 bg-white/5 px-2 py-0.5 text-[0.55rem] font-medium uppercase tracking-wider text-white/60"
                >
                  {composer}
                </span>
              ))}
              {work.composers.length > 2 && (
                <span className="rounded-full border border-white/20 bg-white/5 px-2 py-0.5 text-[0.55rem] font-medium text-white/60">
                  +{work.composers.length - 2}
                </span>
              )}
            </div>
          )}

          {/* CTA on hover */}
          <div
            className="mt-3 flex items-center gap-1 text-xs font-semibold opacity-0 transition-all duration-300 group-hover:opacity-100"
            style={{ color: accent.accent }}
          >
            {isClip ? "Voir le clip" : "Voir le projet"}
            <span className="transform transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </div>
        </div>
      </div>
    </>
  );

  const cardClasses = cn(
    "group relative flex h-full flex-col overflow-hidden",
    "rounded-[var(--radius-xl)] border-2",
    "bg-[var(--color-surface)]",
    "transition-all duration-300",
    "hover:-translate-y-1",
    accent.border,
    accent.hoverBorder,
    accent.glow,
  );

  return (
    <ParallaxCard
      index={index}
      parallaxSpeed={0.12}
      scaleOnScroll
      className="h-full"
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
    </ParallaxCard>
  );
}

export function ProjetsPageClient({
  locale,
  nav,
  copy,
}: ProjetsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const gridRef = useRef<HTMLDivElement>(null);
  const isGridInView = useInView(gridRef, { once: true, margin: "-50px" });

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
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-lime-300 border-t-transparent" />
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

      <PageHeader
        title={nav.projets}
        description={copy.description}
        highlightFirstLetter
      />

      {/* Search and filters section */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, ...smoothTransition }}
      >
        {/* Search bar and sort controls */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
          <div className="relative flex-1 max-w-md">
            <motion.input
              type="text"
              data-testid="projects-search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              placeholder={copy.searchPlaceholder}
              className="w-full rounded-full border-2 border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-3 text-white placeholder:text-white/50 transition-all focus:border-[var(--brand-neon)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-neon)]/50"
              whileFocus={{ scale: 1.02 }}
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex gap-3 flex-wrap sm:flex-nowrap">
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
        <div className="flex flex-wrap gap-3">
          <FilterButton
            label={copy.filterAll}
            count={works.length}
            isActive={selectedCategory === "all"}
            onClick={() => {
              handleCategoryChange("all");
            }}
            index={0}
          />
          {categories.map((category, index) => {
            const count = works.filter(
              (w) => w.category === category.name,
            ).length;
            return (
              <FilterButton
                key={category.id}
                label={category.name}
                count={count}
                isActive={selectedCategory === category.name}
                onClick={() => {
                  handleCategoryChange(category.name);
                }}
                index={index + 1}
              />
            );
          })}
        </div>
      </motion.div>

      {/* Projects grid with stagger animation */}
      <motion.div
        ref={gridRef}
        className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        variants={cardGridStagger}
        initial="initial"
        animate={isGridInView ? "animate" : "initial"}
      >
        {filteredWorks.map((work, index) => (
          <ProjectCard
            key={work.id}
            work={work}
            index={index}
            locale={locale}
            selectedCategory={selectedCategory}
            onClipClick={handleClipClick}
          />
        ))}
      </motion.div>

      <YouTubeModal
        youtubeUrl={youtubeModal.url}
        title={youtubeModal.title}
        isOpen={youtubeModal.isOpen}
        onClose={() => {
          setYoutubeModal({ isOpen: false, url: "", title: "" });
        }}
      />

      {filteredWorks.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-20 text-center text-xl text-white/50"
        >
          {searchQuery ? copy.noResults : copy.empty}
        </motion.div>
      )}

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
