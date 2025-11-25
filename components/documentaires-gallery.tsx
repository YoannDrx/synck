"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import Masonry from "react-masonry-css";
import { cn } from "@/lib/utils";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { SortToggle } from "@/components/ui/sort-toggle";

type Documentaire = {
  title: string;
  subtitle: string;
  href: string;
  src: string;
  srcLg: string;
  link: string;
  category: string;
  productionCompanies?: string[];
  year?: number;
  height?: string;
  width?: number;
  imgHeight?: number;
  aspectRatio?: number;
};

/** Masonry breakpoints configuration */
const masonryBreakpoints = {
  default: 4,
  1280: 3,
  1024: 2,
  640: 1,
};

/** Color accents by category */
const categoryAccents: Record<
  string,
  {
    glow: string;
    borderHover: string;
    badge: string;
    accent: string;
  }
> = {
  // Société - Cyan
  société: {
    glow: "hover:shadow-[0_0_30px_rgba(78,205,196,0.3)]",
    borderHover: "hover:border-cyan-400",
    badge: "bg-cyan-400/20 text-cyan-400 border border-cyan-400/30",
    accent: "#4ecdc4",
  },
  // Sport - Orange
  sport: {
    glow: "hover:shadow-[0_0_30px_rgba(251,146,60,0.3)]",
    borderHover: "hover:border-orange-400",
    badge: "bg-orange-400/20 text-orange-400 border border-orange-400/30",
    accent: "#fb923c",
  },
  // Histoire - Purple
  histoire: {
    glow: "hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]",
    borderHover: "hover:border-purple-400",
    badge: "bg-purple-400/20 text-purple-400 border border-purple-400/30",
    accent: "#a855f7",
  },
  // Culture - Pink
  culture: {
    glow: "hover:shadow-[0_0_30px_rgba(244,114,182,0.3)]",
    borderHover: "hover:border-pink-400",
    badge: "bg-pink-400/20 text-pink-400 border border-pink-400/30",
    accent: "#f472b6",
  },
  // Nature - Emerald
  nature: {
    glow: "hover:shadow-[0_0_30px_rgba(52,211,153,0.3)]",
    borderHover: "hover:border-emerald-400",
    badge: "bg-emerald-400/20 text-emerald-400 border border-emerald-400/30",
    accent: "#34d399",
  },
  // Fallback - Lime
  default: {
    glow: "hover:shadow-[0_0_30px_rgba(163,230,53,0.3)]",
    borderHover: "hover:border-lime-400",
    badge: "bg-lime-400/20 text-lime-400 border border-lime-400/30",
    accent: "#a3e635",
  },
};

/** Color accents by production company for filters and cards */
const companyAccents: Record<
  string,
  {
    filterActive: string;
    filterInactive: string;
    borderHover: string;
    glow: string;
    badge: string;
    accent: string;
  }
> = {
  // 13prods - Lime/Vert
  "13prods": {
    filterActive: "border-lime-400 bg-lime-400 text-[#050505]",
    filterInactive:
      "border-white/10 bg-black/20 text-white/60 hover:border-lime-400 hover:text-lime-400",
    borderHover: "hover:border-lime-400",
    glow: "hover:shadow-[0_0_30px_rgba(163,230,53,0.3)]",
    badge: "bg-lime-400/20 text-lime-400 border border-lime-400/30",
    accent: "#a3e635",
  },
  // Little Big Story - Cyan
  "little-big-story": {
    filterActive: "border-cyan-400 bg-cyan-400 text-[#050505]",
    filterInactive:
      "border-white/10 bg-black/20 text-white/60 hover:border-cyan-400 hover:text-cyan-400",
    borderHover: "hover:border-cyan-400",
    glow: "hover:shadow-[0_0_30px_rgba(78,205,196,0.3)]",
    badge: "bg-cyan-400/20 text-cyan-400 border border-cyan-400/30",
    accent: "#4ecdc4",
  },
  // Pop Films - Purple
  "pop-films": {
    filterActive: "border-purple-400 bg-purple-400 text-[#050505]",
    filterInactive:
      "border-white/10 bg-black/20 text-white/60 hover:border-purple-400 hover:text-purple-400",
    borderHover: "hover:border-purple-400",
    glow: "hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]",
    badge: "bg-purple-400/20 text-purple-400 border border-purple-400/30",
    accent: "#a855f7",
  },
  // Via Découverte - Orange
  "via-decouverte": {
    filterActive: "border-orange-400 bg-orange-400 text-[#050505]",
    filterInactive:
      "border-white/10 bg-black/20 text-white/60 hover:border-orange-400 hover:text-orange-400",
    borderHover: "hover:border-orange-400",
    glow: "hover:shadow-[0_0_30px_rgba(251,146,60,0.3)]",
    badge: "bg-orange-400/20 text-orange-400 border border-orange-400/30",
    accent: "#fb923c",
  },
  // Default - Pink
  default: {
    filterActive: "border-pink-400 bg-pink-400 text-[#050505]",
    filterInactive:
      "border-white/10 bg-black/20 text-white/60 hover:border-pink-400 hover:text-pink-400",
    borderHover: "hover:border-pink-400",
    glow: "hover:shadow-[0_0_30px_rgba(244,114,182,0.3)]",
    badge: "bg-pink-400/20 text-pink-400 border border-pink-400/30",
    accent: "#f472b6",
  },
};

/** Get category accent */
const getCategoryAccent = (category: string) => {
  const key = category
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return categoryAccents[key] ?? categoryAccents.default;
};

/** Get company accent for filters */
const getCompanyAccent = (company: string) => {
  // Normalize: lowercase, remove accents, replace spaces with hyphens
  const key = company
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/\s+/g, "-"); // Replace spaces with hyphens

  return companyAccents[key] ?? companyAccents.default;
};

type DocumentairesGalleryProps = {
  documentaires: Documentaire[];
  copy: {
    title: string;
    filterAll: string;
    searchPlaceholder: string;
    empty: string;
    noResults: string;
    statsDocumentaries: string;
    statsCategories: string;
    statsProducers: string;
    sortByDate: string;
    sortByTitle: string;
    sortOrderTitleAsc: string;
    sortOrderTitleDesc: string;
    sortOrderDateAsc: string;
    sortOrderDateDesc: string;
  };
};

export function DocumentairesGallery({
  documentaires,
  copy,
}: DocumentairesGalleryProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });

  // Extract unique production companies
  const productionCompanies = Array.from(
    new Set(documentaires.flatMap((doc) => doc.productionCompanies ?? [])),
  ).sort();

  // Extract unique categories
  const categories = Array.from(
    new Set(documentaires.map((doc) => doc.category)),
  ).sort();

  const [selectedProductionCompany, setSelectedProductionCompany] =
    useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"date" | "title">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const getToggleOptions = (): [string, string] => {
    if (sortBy === "title") {
      return [copy.sortOrderTitleAsc, copy.sortOrderTitleDesc];
    } else {
      return [copy.sortOrderDateAsc, copy.sortOrderDateDesc];
    }
  };

  const filteredDocs = documentaires
    .filter(
      (doc) =>
        selectedProductionCompany === "all" ||
        doc.productionCompanies?.includes(selectedProductionCompany),
    )
    .filter((doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === "date") {
        comparison = (a.year ?? 0) - (b.year ?? 0);
      } else {
        comparison = a.title.localeCompare(b.title);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

  // Group filtered docs by category for display
  const groupedDocs = filteredDocs.reduce<Record<string, Documentaire[]>>(
    (acc, doc) => {
      if (!acc[doc.category]) {
        acc[doc.category] = [];
      }
      acc[doc.category].push(doc);
      return acc;
    },
    {},
  );

  return (
    <motion.div
      ref={sectionRef}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="mt-12"
    >
      <div className="rounded-[32px] border-4 border-white/10 bg-[#0a0a0f]/90 p-4 shadow-[0_25px_60px_rgba(0,0,0,0.5)] backdrop-blur-sm sm:p-6 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6 flex flex-col gap-4 lg:mb-8 lg:flex-row lg:items-end lg:justify-between"
        >
          <div>
            <h3 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              <span className="text-[#d5ff0a]">{copy.title.charAt(0)}</span>
              {copy.title.slice(1)}
            </h3>
          </div>

          {/* Stats */}
          <div className="flex gap-8">
            <div className="text-right">
              <p className="text-3xl font-black text-white">
                {documentaires.length}
              </p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                {copy.statsDocumentaries}
              </p>
            </div>
            <div className="h-12 w-px bg-white/10" />
            <div className="text-right">
              <p className="text-3xl font-black text-cyan-400">
                {categories.length}
              </p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                {copy.statsCategories}
              </p>
            </div>
            {productionCompanies.length > 0 && (
              <>
                <div className="h-12 w-px bg-white/10" />
                <div className="text-right">
                  <p className="text-3xl font-black text-[#d5ff0a]">
                    {productionCompanies.length}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                    {copy.statsProducers}
                  </p>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Filters Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8 border-4 border-white/10 bg-[#0a0a0e] p-4 sm:p-6"
        >
          {/* Search and sort */}
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
                placeholder={copy.searchPlaceholder}
                className="w-full border-2 border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/30 transition-all focus:border-[#d5ff0a]/50 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-[#d5ff0a] transition-colors text-xs"
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
                  setSortBy(newSortBy);
                }}
              />
              <SortToggle
                options={getToggleOptions()}
                value={sortOrder}
                onChange={(newOrder) => {
                  setSortOrder(newOrder);
                }}
              />
            </div>
          </div>

          {/* Production Company Filters */}
          {productionCompanies.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setSelectedProductionCompany("all");
                }}
                className={cn(
                  "px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border-2",
                  selectedProductionCompany === "all"
                    ? "border-[#d5ff0a] bg-[#d5ff0a] text-[#050505]"
                    : "border-white/10 bg-black/20 text-white/60 hover:border-[#d5ff0a] hover:text-[#d5ff0a]",
                )}
              >
                {copy.filterAll}
                <span className="ml-1.5 opacity-70">
                  ({documentaires.length})
                </span>
              </button>
              {productionCompanies.map((company) => {
                const count = documentaires.filter((d) =>
                  d.productionCompanies?.includes(company),
                ).length;
                const displayName = company
                  .split("-")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ");
                const companyAccent = getCompanyAccent(company);
                return (
                  <button
                    key={company}
                    onClick={() => {
                      setSelectedProductionCompany(company);
                    }}
                    className={cn(
                      "px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border-2",
                      selectedProductionCompany === company
                        ? companyAccent.filterActive
                        : companyAccent.filterInactive,
                    )}
                  >
                    {displayName}
                    <span className="ml-1.5 opacity-70">({count})</span>
                  </button>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Documentaires Grid by Category */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {Object.entries(groupedDocs).map(([category, docs]) => {
            const catAccent = getCategoryAccent(category);
            return (
              <div key={category} className="mb-10 last:mb-0">
                <h4 className="mb-6 flex items-center gap-3 text-lg font-bold uppercase tracking-wide">
                  <span style={{ color: catAccent.accent }}>{category}</span>
                  <span className="text-white/30">({docs.length})</span>
                </h4>
                <Masonry
                  breakpointCols={masonryBreakpoints}
                  className="flex w-auto -ml-4"
                  columnClassName="pl-4 bg-clip-padding"
                >
                  {docs.map((doc, index) => (
                    <DocumentaireCard key={index} doc={doc} index={index} />
                  ))}
                </Masonry>
              </div>
            );
          })}
        </motion.div>

        {/* Empty State */}
        {filteredDocs.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-white/40">
              {searchQuery ? copy.noResults : copy.empty}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/** Documentaire Card Component */
function DocumentaireCard({
  doc,
  index,
}: {
  doc: Documentaire;
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, {
    once: true,
    margin: "0px 0px -30px 0px",
  });

  // Get accent based on production company for border/glow
  const primaryCompany = doc.productionCompanies?.[0] ?? "";
  const companyAccent = getCompanyAccent(primaryCompany);

  // Stagger delay based on column position (max 4 columns)
  const columnPosition = index % 4;
  const staggerDelay = columnPosition * 0.03;

  const cardClasses = cn(
    "group relative flex h-full flex-col overflow-hidden",
    "border-2 border-white/10 bg-black/20",
    "transition-all duration-300",
    "hover:-translate-y-1",
    companyAccent.glow,
    companyAccent.borderHover,
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
      className="mb-4"
    >
      <a
        href={doc.link}
        target="_blank"
        rel="noopener noreferrer"
        className={cardClasses}
      >
        {/* Image */}
        <div className="relative overflow-hidden">
          {doc.srcLg ? (
            <Image
              src={doc.srcLg}
              alt={doc.title}
              width={doc.width ?? 400}
              height={doc.imgHeight ?? 300}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="w-full h-auto object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
            />
          ) : (
            <div className="aspect-[4/3] flex h-full w-full items-center justify-center bg-gradient-to-br from-white/5 to-white/10">
              <span className="text-5xl font-black uppercase text-white/10">
                {doc.title.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-2 p-4">
          <h3 className="line-clamp-2 text-sm font-bold text-white group-hover:text-white">
            {doc.title}
          </h3>

          {/* Production companies tags */}
          {doc.productionCompanies && doc.productionCompanies.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {doc.productionCompanies.slice(0, 2).map((company) => {
                const accent = getCompanyAccent(company);
                const displayName = company
                  .split("-")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" ");

                return (
                  <span
                    key={company}
                    className={cn(
                      "rounded-sm px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                      accent.badge,
                    )}
                  >
                    {displayName}
                  </span>
                );
              })}
              {doc.productionCompanies.length > 2 && (
                <span className="rounded-sm bg-white/5 px-2 py-0.5 text-[9px] font-medium text-white/50">
                  +{doc.productionCompanies.length - 2}
                </span>
              )}
            </div>
          )}

          <div className="mt-auto">
            {doc.year && (
              <div className="flex justify-end border-t border-white/5 pt-3">
                <div className="rounded-sm bg-white/10 px-2 py-1 text-[10px] font-bold text-white/70">
                  {doc.year}
                </div>
              </div>
            )}

            {/* Hover CTA */}
            <div
              className={cn(
                "mt-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider opacity-0 transition-all duration-300 group-hover:opacity-100",
                !doc.year && "mt-0",
              )}
              style={{ color: companyAccent.accent }}
            >
              Voir le documentaire
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </div>
          </div>
        </div>
      </a>
    </motion.div>
  );
}
