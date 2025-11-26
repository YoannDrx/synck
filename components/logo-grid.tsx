"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ExternalLink, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Link item for supports */
export type LogoGridLink = {
  title: string;
  url: string;
};

/** Generic item for the logo grid */
export type LogoGridItem = {
  name: string;
  logo: string;
  description?: string;
  website?: string;
  href?: string;
  links?: LogoGridLink[];
};

type LogoGridProps = {
  items: LogoGridItem[];
  title: string;
  statsLabel?: string;
  accentColor?: "lime" | "cyan" | "purple" | "orange";
  columns?: 2 | 3 | 4 | 6;
  showModal?: boolean;
  showStats?: boolean;
};

/** Accent color configurations */
const accentColors = {
  lime: {
    text: "text-[#d5ff0a]",
    border: "border-[#d5ff0a]",
    borderHover: "hover:border-[#d5ff0a]",
    bg: "bg-[#d5ff0a]",
    glow: "hover:shadow-[0_0_30px_rgba(213,255,10,0.2)]",
  },
  cyan: {
    text: "text-[#00d9ff]",
    border: "border-[#00d9ff]",
    borderHover: "hover:border-[#00d9ff]",
    bg: "bg-[#00d9ff]",
    glow: "hover:shadow-[0_0_30px_rgba(0,217,255,0.2)]",
  },
  purple: {
    text: "text-[#a855f7]",
    border: "border-[#a855f7]",
    borderHover: "hover:border-[#a855f7]",
    bg: "bg-[#a855f7]",
    glow: "hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]",
  },
  orange: {
    text: "text-[#ff6b35]",
    border: "border-[#ff6b35]",
    borderHover: "hover:border-[#ff6b35]",
    bg: "bg-[#ff6b35]",
    glow: "hover:shadow-[0_0_30px_rgba(255,107,53,0.2)]",
  },
};

/** Column configurations */
const columnClasses = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  6: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6",
};

export function LogoGrid({
  items,
  title,
  statsLabel,
  accentColor = "lime",
  columns = 4,
  showModal = false,
  showStats = true,
}: LogoGridProps) {
  const [selectedItem, setSelectedItem] = useState<LogoGridItem | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });

  const colors = accentColors[accentColor];

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
              <span className={colors.text}>{title.charAt(0)}</span>
              {title.slice(1)}
            </h3>
          </div>

          {/* Stats */}
          {showStats && statsLabel && (
            <div className="flex gap-8">
              <div className="text-right">
                <p className="text-3xl font-black text-white">{items.length}</p>
                <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                  {statsLabel}
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={cn("grid gap-4", columnClasses[columns])}
        >
          {items.map((item, index) => (
            <LogoCard
              key={index}
              item={item}
              index={index}
              columns={columns}
              accentColor={accentColor}
              showModal={showModal}
              onSelect={() => {
                if (showModal) setSelectedItem(item);
              }}
            />
          ))}
        </motion.div>
      </div>

      {/* Modal */}
      {selectedItem && showModal && (
        <LogoModal
          item={selectedItem}
          accentColor={accentColor}
          onClose={() => { setSelectedItem(null); }}
        />
      )}
    </motion.div>
  );
}

/** Individual Logo Card */
function LogoCard({
  item,
  index,
  columns,
  accentColor,
  showModal,
  onSelect,
}: {
  item: LogoGridItem;
  index: number;
  columns: number;
  accentColor: "lime" | "cyan" | "purple" | "orange";
  showModal: boolean;
  onSelect: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, {
    once: true,
    margin: "0px 0px -30px 0px",
  });

  const colors = accentColors[accentColor];
  const columnPosition = index % columns;
  const staggerDelay = columnPosition * 0.03;

  // Simple card for columns=6 (just logo)
  if (columns === 6) {
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
        {item.href ? (
          <Link
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "group block overflow-hidden",
              "rounded-[16px] border-2 border-white/10 bg-black/20 p-4",
              "transition-all duration-300",
              colors.borderHover,
              colors.glow,
            )}
          >
            {item.logo && (
              <Image
                src={item.logo}
                alt={item.name}
                width={200}
                height={120}
                className="h-auto w-full object-contain transition-all duration-300 group-hover:scale-110 group-hover:brightness-110"
              />
            )}
          </Link>
        ) : (
          <div
            className={cn(
              "group overflow-hidden",
              "rounded-[16px] border-2 border-white/10 bg-black/20 p-4",
              "transition-all duration-300",
              colors.borderHover,
              colors.glow,
            )}
          >
            {item.logo && (
              <Image
                src={item.logo}
                alt={item.name}
                width={200}
                height={120}
                className="h-auto w-full object-contain transition-all duration-300 group-hover:scale-110 group-hover:brightness-110"
              />
            )}
          </div>
        )}
      </motion.div>
    );
  }

  // Full card with details
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
      <div
        className={cn(
          "group relative flex h-full flex-col overflow-hidden",
          "rounded-[20px] border-2 border-white/10 bg-white/[0.02]",
          "transition-all duration-300",
          "hover:-translate-y-1",
          colors.borderHover,
          colors.glow,
        )}
      >
        {/* Logo */}
        <div className="flex h-28 items-center justify-center bg-black/40 p-4">
          {item.logo && (
            <Image
              src={item.logo}
              alt={item.name}
              width={200}
              height={80}
              className="h-auto w-full max-h-20 object-contain transition-transform duration-300 group-hover:scale-110"
            />
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-4">
          <h4 className="mb-2 text-sm font-bold uppercase text-white group-hover:text-white">
            {item.name}
          </h4>

          {/* Description Preview */}
          {item.description && (
            <p className="mb-3 text-xs text-white/50 line-clamp-3">
              {item.description}
            </p>
          )}

          {/* Links (for supports) */}
          {item.links && item.links.length > 0 && !showModal && (
            <div className="mt-auto space-y-2 border-t border-white/5 pt-3">
              {item.links.slice(0, 2).map((link, linkIndex) => (
                <Link
                  key={linkIndex}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "group/link flex items-start gap-2 text-xs transition-colors",
                    colors.text,
                  )}
                >
                  <ExternalLink className="mt-0.5 h-3 w-3 flex-shrink-0 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
                  <span className="line-clamp-1 underline decoration-current/30 group-hover/link:decoration-current">
                    {link.title}
                  </span>
                </Link>
              ))}
            </div>
          )}

          {/* Footer Actions */}
          <div className="mt-auto flex items-center justify-between gap-2 border-t border-white/5 pt-3">
            {showModal && item.description && (
              <button
                onClick={onSelect}
                className={cn(
                  "flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors",
                  colors.text,
                )}
              >
                <Info className="h-3 w-3" />
                <span>En savoir plus</span>
              </button>
            )}

            {item.website && (
              <Link
                href={item.website}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white/40 transition-colors",
                  `hover:${colors.text}`,
                )}
              >
                <ExternalLink className="h-3 w-3" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/** Detail Modal */
function LogoModal({
  item,
  accentColor,
  onClose,
}: {
  item: LogoGridItem;
  accentColor: "lime" | "cyan" | "purple" | "orange";
  onClose: () => void;
}) {
  const colors = accentColors[accentColor];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={cn(
          "relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[24px] border-4 bg-[#0a0a0f] p-6 sm:p-8",
          colors.border,
        )}
        onClick={(e) => { e.stopPropagation(); }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className={cn(
            "absolute right-4 top-4 p-2 text-white/70 transition-colors",
            `hover:${colors.text}`,
          )}
          aria-label="Fermer"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Logo */}
        {item.logo && (
          <div className="mb-6 flex h-24 items-center justify-center rounded-[16px] bg-white/5">
            <Image
              src={item.logo}
              alt={item.name}
              width={200}
              height={80}
              className="h-auto w-full max-h-20 object-contain p-2"
            />
          </div>
        )}

        {/* Title */}
        <h3 className={cn("mb-4 text-2xl font-bold sm:text-3xl", colors.text)}>
          {item.name}
        </h3>

        {/* Full Description */}
        {item.description && (
          <p className="mb-6 text-base leading-relaxed text-white/80">
            {item.description}
          </p>
        )}

        {/* Links */}
        {item.links && item.links.length > 0 && (
          <div className="space-y-3 border-t border-white/10 pt-4">
            <h4 className="text-sm font-bold uppercase text-white/70">
              Liens utiles :
            </h4>
            {item.links.map((link, linkIndex) => (
              <Link
                key={linkIndex}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "group/link flex items-start gap-2 text-sm transition-colors",
                  colors.text,
                )}
              >
                <ExternalLink className="mt-0.5 h-4 w-4 flex-shrink-0 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
                <span className="underline decoration-current/30 group-hover/link:decoration-current">
                  {link.title}
                </span>
              </Link>
            ))}
          </div>
        )}

        {/* Website Link */}
        {item.website && (
          <div className="mt-4 border-t border-white/10 pt-4">
            <h4 className="mb-3 text-sm font-bold uppercase text-white/70">
              Site web :
            </h4>
            <Link
              href={item.website}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "group/link flex items-start gap-2 text-sm transition-colors",
                colors.text,
              )}
            >
              <ExternalLink className="mt-0.5 h-4 w-4 flex-shrink-0 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
              <span className="underline decoration-current/30 group-hover/link:decoration-current">
                {item.website}
              </span>
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
