"use client";

import { Fragment, type ReactNode, type Ref } from "react";
import { motion } from "framer-motion";

import { SortToggle } from "@/components/ui/sort-toggle";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { cn } from "@/lib/utils";

type SortOption = { value: "date" | "title"; label: string };

type GalleryShellProps = {
  title: string;
  description?: string;
  titleVariant?: "medium" | "large";
  highlightColor?: string;
  stats: { value: number; label: string; valueClassName?: string }[];
  search: {
    value: string;
    onChange: (value: string) => void;
    onClear: () => void;
    placeholder: string;
    inputAccentClassName?: string;
    clearButtonAccentClassName?: string;
    inputTestId?: string;
  };
  sort: {
    sortBy: "date" | "title";
    sortByOptions: SortOption[];
    onSortByChange: (value: "date" | "title") => void;
    sortOrder: "asc" | "desc";
    sortOrderLabels: [string, string];
    onSortOrderChange: (value: "asc" | "desc") => void;
  };
  filters?: ReactNode;
  children: ReactNode;
  hasItems: boolean;
  emptyContent: ReactNode;
  afterContent?: ReactNode;
  isInView?: boolean;
  containerRef?: Ref<HTMLElement>;
  className?: string;
};

export function GalleryShell({
  title,
  description,
  titleVariant = "medium",
  highlightColor = "#d5ff0a",
  stats,
  search,
  sort,
  filters,
  children,
  hasItems,
  emptyContent,
  afterContent,
  isInView = true,
  containerRef,
  className,
}: GalleryShellProps) {
  const TitleTag = titleVariant === "large" ? "h1" : "h3";
  const titleClasses =
    titleVariant === "large"
      ? "text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
      : "text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl";

  return (
    <motion.section
      ref={containerRef}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "rounded-[32px] border-4 border-white/10 bg-[#0a0a0f]/90 p-4 shadow-[0_25px_60px_rgba(0,0,0,0.5)] backdrop-blur-sm sm:p-6 lg:p-8",
        className,
      )}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
      >
        <div>
          <TitleTag className={titleClasses}>
            <span style={{ color: highlightColor }}>{title.charAt(0)}</span>
            {title.slice(1)}
          </TitleTag>
          {description && (
            <p className="max-w-2xl text-base text-white/60">{description}</p>
          )}
        </div>

        <div className="flex gap-8">
          {stats.map((stat, index) => (
            <Fragment key={`${stat.label}-${index}`}>
              {index > 0 && <div className="h-12 w-px bg-white/10" />}
              <div className="text-right">
                <p
                  className={cn(
                    "text-3xl font-black text-white",
                    stat.valueClassName,
                  )}
                >
                  {stat.value}
                </p>
                <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                  {stat.label}
                </p>
              </div>
            </Fragment>
          ))}
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
              data-testid={search.inputTestId}
              value={search.value}
              onChange={(e) => {
                search.onChange(e.target.value);
              }}
              placeholder={search.placeholder}
              className={cn(
                "w-full border-2 border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/30 transition-all focus:outline-none",
                search.inputAccentClassName ?? "focus:border-lime-300/50",
              )}
            />
            {search.value && (
              <button
                onClick={search.onClear}
                className={cn(
                  "absolute right-3 top-1/2 -translate-y-1/2 text-white/30 transition-colors text-xs",
                  search.clearButtonAccentClassName ?? "hover:text-lime-300",
                )}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            <ToggleSwitch
              options={sort.sortByOptions}
              value={sort.sortBy}
              onChange={(value) => {
                sort.onSortByChange(value);
              }}
            />
            <SortToggle
              options={sort.sortOrderLabels}
              value={sort.sortOrder}
              onChange={(value) => {
                sort.onSortOrderChange(value);
              }}
            />
          </div>
        </div>

        {filters}
      </motion.div>

      {/* Grid / Empty */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {hasItems ? (
          children
        ) : (
          <div className="py-16 text-center">{emptyContent}</div>
        )}
      </motion.div>

      {afterContent}
    </motion.section>
  );
}
