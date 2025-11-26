"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";
import { smoothTransition } from "@/lib/animations";

export type PageHeaderProps = {
  /** Page title (H1) */
  title: string;
  /** Highlight the first letter with gradient */
  highlightFirstLetter?: boolean;
  /** Optional description below the title */
  description?: string;
  /** Optional eyebrow text above the title */
  eyebrow?: string;
  /** Additional class names */
  className?: string;
  /** Custom title class names (overrides default) */
  titleClassName?: string;
  /** Animate on scroll into view */
  animate?: boolean;
  /** Center alignment */
  centered?: boolean;
};

/** Standardized H1 typography */
const H1_CLASSES =
  "text-4xl sm:text-8xl lg:text-9xl font-black uppercase tracking-tighter";

/** Gradient for first letter */
const GRADIENT_CLASSES =
  "bg-gradient-to-r from-lime-300 to-emerald-400 bg-clip-text text-transparent";

export function PageHeader({
  title,
  highlightFirstLetter = true,
  description,
  eyebrow,
  className,
  titleClassName,
  animate = true,
  centered = false,
}: PageHeaderProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const shouldAnimate = animate && isInView;

  // Split title for first letter highlight
  const firstLetter = title.charAt(0);
  const restOfTitle = title.slice(1);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: smoothTransition,
    },
  };

  return (
    <motion.div
      ref={ref}
      className={cn("mb-8 sm:mb-12", centered && "text-center", className)}
      variants={containerVariants}
      initial="hidden"
      animate={shouldAnimate ? "visible" : "hidden"}
    >
      {/* Eyebrow */}
      {eyebrow && (
        <motion.p
          variants={itemVariants}
          className="mb-4 text-xs uppercase tracking-[0.5em] text-white/50"
        >
          {eyebrow}
        </motion.p>
      )}

      {/* Title */}
      <motion.h1
        variants={itemVariants}
        className={cn(H1_CLASSES, titleClassName)}
      >
        {highlightFirstLetter ? (
          <>
            <span className={GRADIENT_CLASSES}>{firstLetter}</span>
            <span className="text-white">{restOfTitle}</span>
          </>
        ) : (
          <span className="text-white">{title}</span>
        )}
      </motion.h1>

      {/* Description */}
      {description && (
        <motion.p
          variants={itemVariants}
          className={cn(
            "mt-4 max-w-2xl text-lg text-white/70",
            centered && "mx-auto",
          )}
        >
          {description}
        </motion.p>
      )}
    </motion.div>
  );
}

/** Section header (H2) with same styling patterns */
export type SectionHeaderProps = {
  title: string;
  highlightFirstLetter?: boolean;
  description?: string;
  eyebrow?: string;
  className?: string;
  animate?: boolean;
  centered?: boolean;
};

export function SectionHeader({
  title,
  highlightFirstLetter = true,
  description,
  eyebrow,
  className,
  animate = true,
  centered = false,
}: SectionHeaderProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const shouldAnimate = animate && isInView;

  const firstLetter = title.charAt(0);
  const restOfTitle = title.slice(1);

  return (
    <motion.div
      ref={ref}
      className={cn("mb-6 sm:mb-8", centered && "text-center", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={shouldAnimate ? { opacity: 1, y: 0 } : {}}
      transition={smoothTransition}
    >
      {eyebrow && (
        <p className="mb-2 text-xs uppercase tracking-[0.4em] text-white/50">
          {eyebrow}
        </p>
      )}

      <h2 className="text-3xl sm:text-4xl font-black">
        {highlightFirstLetter ? (
          <>
            <span className={GRADIENT_CLASSES}>{firstLetter}</span>
            <span className="text-white">{restOfTitle}</span>
          </>
        ) : (
          <span className="text-white">{title}</span>
        )}
      </h2>

      {description && (
        <p
          className={cn(
            "mt-3 max-w-xl text-base text-white/60",
            centered && "mx-auto",
          )}
        >
          {description}
        </p>
      )}
    </motion.div>
  );
}
