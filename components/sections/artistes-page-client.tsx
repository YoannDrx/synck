"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useInView } from "framer-motion";

import { Breadcrumb } from "@/components/breadcrumb";
import { GalleryShell } from "@/components/galleries/gallery-shell";
import { PageLayout } from "@/components/layout/page-layout";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n-config";
import type { GalleryArtist } from "@/lib/prismaProjetsUtils";
import type { ArtistsPageDictionary } from "@/types/dictionary";

type ArtistsPageClientProps = {
  locale: Locale;
  artists: GalleryArtist[];
  nav: {
    home: string;
    artists: string;
  };
  copy: ArtistsPageDictionary;
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
  artist,
  index,
  locale,
  copy,
}: {
  artist: GalleryArtist;
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
        data-testid="artist-card"
        href={`/${locale}/artistes/${artist.slug}`}
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
            {artist.image ? (
              <Image
                src={artist.image}
                alt={artist.imageAlt ?? artist.name}
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
                  {artist.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Name */}
        <h3 className="line-clamp-1 text-center text-sm font-bold text-white/90 transition-colors group-hover:text-white">
          {artist.name}
        </h3>

        {/* Works count badge */}
        <div
          className={cn(
            "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider",
            artistAccent.badge,
          )}
        >
          {renderWorksCount(artist.worksCount)}
        </div>
      </Link>
    </motion.div>
  );
}

export function ArtistesPageClient({
  locale,
  artists,
  nav,
  copy,
}: ArtistsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  // State for search and sort
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"date" | "title">(
    (searchParams.get("sortBy") as "date" | "title") ?? "title",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    (searchParams.get("sortOrder") as "asc" | "desc") ?? "asc",
  );

  // Calculate total works
  const totalWorks = artists.reduce((sum, c) => sum + c.worksCount, 0);

  // Handle sort change with URL update
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

    const newUrl = `/${locale}/artistes?${params.toString()}`;
    router.push(newUrl, { scroll: false });
  };

  // Get toggle options based on current sortBy
  const getToggleOptions = (): [string, string] => {
    if (sortBy === "title") {
      return [copy.sortOrderTitleAsc, copy.sortOrderTitleDesc];
    } else {
      return [copy.sortOrderDateAsc, copy.sortOrderDateDesc];
    }
  };

  // Filter and sort artists
  const filteredArtists = useMemo(() => {
    return artists
      .filter((artist) =>
        artist.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .sort((a, b) => {
        let comparison = 0;
        if (sortBy === "date") {
          // Sort by works count
          comparison = a.worksCount - b.worksCount;
        } else {
          // Sort by name
          comparison = a.name.localeCompare(b.name, locale);
        }
        return sortOrder === "asc" ? comparison : -comparison;
      });
  }, [artists, searchQuery, sortBy, sortOrder, locale]);

  return (
    <PageLayout orbsConfig="subtle" className="mx-auto max-w-[1600px]">
      <Breadcrumb
        items={[
          { label: nav.home, href: `/${locale}` },
          { label: nav.artists },
        ]}
      />

      <GalleryShell
        title={nav.artists}
        description={copy.description}
        titleVariant="large"
        highlightColor="#d5ff0a"
        containerRef={sectionRef}
        isInView={isInView}
        stats={[
          { value: artists.length, label: copy.statsArtists },
          {
            value: totalWorks,
            label: copy.statsProjects,
            valueClassName: "text-[#d5ff0a]",
          },
        ]}
        search={{
          value: searchQuery,
          onChange: (value) => {
            setSearchQuery(value);
          },
          onClear: () => {
            setSearchQuery("");
          },
          placeholder: copy.searchPlaceholder,
          inputAccentClassName: "focus:border-[#d5ff0a]/50",
          clearButtonAccentClassName: "hover:text-[#d5ff0a]",
          inputTestId: "artists-search",
        }}
        sort={{
          sortBy,
          sortByOptions: [
            { value: "title", label: copy.sortByTitle },
            { value: "date", label: copy.sortByDate },
          ],
          onSortByChange: (value) => {
            handleSortChange(value, undefined);
          },
          sortOrder,
          sortOrderLabels: getToggleOptions(),
          onSortOrderChange: (value) => {
            handleSortChange(undefined, value);
          },
        }}
        hasItems={filteredArtists.length > 0}
        emptyContent={
          <p className="text-white/40">
            {searchQuery ? copy.noResults : copy.empty}
          </p>
        }
        afterContent={
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
        }
      >
        {/* Artists Grid */}
        <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filteredArtists.map((artist, index) => (
            <ArtistCard
              key={artist.id}
              artist={artist}
              index={index}
              locale={locale}
              copy={copy}
            />
          ))}
        </div>
      </GalleryShell>
    </PageLayout>
  );
}
