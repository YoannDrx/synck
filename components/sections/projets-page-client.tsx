"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Breadcrumb } from "@/components/breadcrumb";
import { YouTubeModal } from "@/components/youtube-modal";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { SortToggle } from "@/components/ui/sort-toggle";
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
  viewProjectLabel: string;
};

export function ProjetsPageClient({
  locale,
  nav,
  copy,
  viewProjectLabel,
}: ProjetsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

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

  // Sync selectedCategory and sort params with URL
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

  // Update URL when category changes
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

  // Update URL when sort changes
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

  // Get toggle options based on sortBy
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

  if (loading) {
    return (
      <div className="relative min-h-screen bg-[#050505] text-white">
        <div className="pointer-events-none fixed inset-0 -z-10 opacity-80">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(213,255,10,0.15),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(255,75,162,0.1),transparent_50%)]" />
          <div className="absolute inset-0 noise-layer" />
        </div>
        <main className="relative z-10 mx-auto w-full max-w-[1600px] px-4 pb-20 pt-16 sm:px-8 lg:px-16">
          <div className="flex min-h-[60vh] items-center justify-center text-xl text-white/50">
            {copy.loading}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#050505] text-white">
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(213,255,10,0.15),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(255,75,162,0.1),transparent_50%)]" />
        <div className="absolute inset-0 noise-layer" />
      </div>

      <main className="relative z-10 mx-auto w-full max-w-[1600px] px-4 pb-16 pt-6 sm:px-8 sm:pt-16 lg:px-16">
        <Breadcrumb
          items={[
            { label: nav.home, href: `/${locale}` },
            { label: nav.projets },
          ]}
        />

        <div className="mb-12">
          <h1 className="mb-2 text-4xl font-black uppercase tracking-tighter sm:text-7xl lg:text-9xl">
            <span className="bg-gradient-to-r from-lime-300 to-emerald-400 bg-clip-text text-transparent">
              {nav.projets.charAt(0)}
            </span>
            <span>{nav.projets.slice(1)}</span>
          </h1>
          <p className="mb-6 max-w-2xl text-lg text-white/70">
            {copy.description}
          </p>

          {/* Search bar and sort controls */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                data-testid="projects-search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
                placeholder={copy.searchPlaceholder}
                className="w-full rounded-full border-2 border-white/30 bg-black/20 px-6 py-3 text-white placeholder:text-white/50 focus:border-lime-300 focus:outline-none focus:ring-2 focus:ring-lime-300/50"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
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

          <div className="flex flex-wrap gap-3">
            <button
              data-testid="category-filter"
              onClick={() => {
                handleCategoryChange("all");
              }}
              className={`rounded-full border-2 px-6 py-2 text-sm font-bold uppercase tracking-wider transition-all ${
                selectedCategory === "all"
                  ? "border-lime-300 bg-lime-300 text-[#050505]"
                  : "border-white/30 bg-transparent text-white hover:border-lime-300 hover:text-lime-300"
              }`}
            >
              {copy.filterAll}{" "}
              <span
                className={`ml-1.5 text-xs font-normal ${
                  selectedCategory === "all" ? "opacity-70" : "opacity-50"
                }`}
              >
                ({works.length})
              </span>
            </button>
            {categories.map((category) => {
              const count = works.filter(
                (w) => w.category === category.name,
              ).length;
              return (
                <button
                  key={category.id}
                  data-testid="category-filter"
                  onClick={() => {
                    handleCategoryChange(category.name);
                  }}
                  className={`rounded-full border-2 px-6 py-2 text-sm font-bold uppercase tracking-wider transition-all ${
                    selectedCategory === category.name
                      ? "border-lime-300 bg-lime-300 text-[#050505]"
                      : "border-white/30 bg-transparent text-white hover:border-lime-300 hover:text-lime-300"
                  }`}
                >
                  {category.name}{" "}
                  <span
                    className={`ml-1.5 text-xs font-normal ${
                      selectedCategory === category.name
                        ? "opacity-70"
                        : "opacity-50"
                    }`}
                  >
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredWorks.map((work) => {
            const isClip = work.categorySlug === "clips" && work.youtubeUrl;
            const handleClick = (e: React.MouseEvent) => {
              if (isClip) {
                e.preventDefault();
                setYoutubeModal({
                  isOpen: true,
                  url: work.youtubeUrl ?? "",
                  title: work.title,
                });
              }
            };

            const CardContent = (
              <>
                <div className="relative overflow-hidden bg-black/20">
                  {work.coverImage &&
                  work.coverImage !== "/images/placeholder.jpg" ? (
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <Image
                        src={work.coverImage}
                        alt={work.coverImageAlt}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                        className="object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="relative aspect-[3/4] flex items-center justify-center bg-gradient-to-br from-lime-300/10 to-emerald-400/10">
                      <span className="text-6xl font-black uppercase text-white/20 leading-none">
                        {work.title.charAt(0)}
                      </span>
                    </div>
                  )}
                  {isClip && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <svg
                        className="h-20 w-20 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-lime-400">
                      {work.category}
                    </span>
                    {work.year && (
                      <span className="text-xs font-bold text-white/50">
                        {work.year}
                      </span>
                    )}
                  </div>
                  <h2 className="mb-2 text-lg font-bold uppercase leading-tight">
                    {work.title}
                  </h2>
                  {work.subtitle && (
                    <p className="mb-3 text-sm text-white/70 line-clamp-2">
                      {work.subtitle}
                    </p>
                  )}
                  {work.composers.length > 0 && (
                    <div className="text-xs text-white/50">
                      {work.composers.join(", ")}
                    </div>
                  )}
                  <div className="mt-3 inline-block text-xs font-bold uppercase text-lime-300 opacity-0 transition-opacity group-hover:opacity-100">
                    {isClip ? "Voir le clip →" : `${viewProjectLabel} →`}
                  </div>
                </div>
              </>
            );

            const projectUrl =
              selectedCategory !== "all"
                ? `/${locale}/projets/${work.slug}?category=${selectedCategory}`
                : `/${locale}/projets/${work.slug}`;

            return isClip ? (
              <button
                key={work.id}
                onClick={handleClick}
                className="group relative overflow-hidden border-4 border-white/10 bg-[#0a0a0e] text-left transition-all duration-300 hover:-translate-y-2 hover:border-lime-300/70 hover:shadow-[0_30px_90px_rgba(213,255,10,0.15)] w-full"
              >
                {CardContent}
              </button>
            ) : (
              <Link
                key={work.id}
                data-testid="project-card"
                href={projectUrl}
                className="group relative overflow-hidden border-4 border-white/10 bg-[#0a0a0e] transition-all duration-300 hover:-translate-y-2 hover:border-lime-300/70 hover:shadow-[0_30px_90px_rgba(213,255,10,0.15)]"
              >
                {CardContent}
              </Link>
            );
          })}
        </div>

        <YouTubeModal
          youtubeUrl={youtubeModal.url}
          title={youtubeModal.title}
          isOpen={youtubeModal.isOpen}
          onClose={() => {
            setYoutubeModal({ isOpen: false, url: "", title: "" });
          }}
        />

        {filteredWorks.length === 0 && (
          <div className="py-20 text-center text-xl text-white/50">
            {searchQuery ? copy.noResults : copy.empty}
          </div>
        )}

        <div className="mt-16">
          <div className="border-4 border-lime-300 bg-gradient-to-r from-lime-300 to-emerald-400 p-12">
            <h2 className="mb-4 text-3xl font-bold uppercase text-[#050505]">
              {copy.ctaTitle}
            </h2>
            <p className="mb-6 text-[#050505]/80">{copy.ctaDescription}</p>
            <Link
              href={`/${locale}/contact`}
              className="inline-block border-4 border-[#050505] bg-[#050505] px-8 py-3 font-bold uppercase text-white transition-transform hover:scale-105"
            >
              {copy.ctaButton}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
