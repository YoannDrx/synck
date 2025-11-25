"use client";

import { Children, type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ParallaxCard } from "./parallax-card";
import {
  staggerContainer,
  staggerContainerFast,
  staggerContainerSlow,
  staggerItem,
} from "@/lib/animations";

export type GridColumns = {
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
};

export type MotionCardGridProps = {
  children: ReactNode;
  /** Grid columns configuration */
  columns?: GridColumns;
  /** Gap between items (Tailwind spacing unit, default: 8) */
  gap?: number;
  /** Stagger speed: "fast" | "normal" | "slow" */
  staggerSpeed?: "fast" | "normal" | "slow";
  /** Enable parallax on cards */
  enableParallax?: boolean;
  /** Parallax speed multiplier */
  parallaxSpeed?: number;
  /** Enable scale on scroll */
  scaleOnScroll?: boolean;
  /** Additional class names */
  className?: string;
  /** Animate once or on every scroll */
  once?: boolean;
  /** Viewport amount for triggering animation */
  amount?: number;
};

const defaultColumns: GridColumns = {
  sm: 2,
  lg: 3,
  xl: 4,
};

const staggerVariants = {
  fast: staggerContainerFast,
  normal: staggerContainer,
  slow: staggerContainerSlow,
};

function getGridClasses(columns: GridColumns, gap: number): string {
  const classes = ["grid", `gap-${String(gap)}`];

  if (columns.sm) classes.push(`sm:grid-cols-${String(columns.sm)}`);
  if (columns.md) classes.push(`md:grid-cols-${String(columns.md)}`);
  if (columns.lg) classes.push(`lg:grid-cols-${String(columns.lg)}`);
  if (columns.xl) classes.push(`xl:grid-cols-${String(columns.xl)}`);

  return classes.join(" ");
}

export function MotionCardGrid({
  children,
  columns = defaultColumns,
  gap = 8,
  staggerSpeed = "normal",
  enableParallax = true,
  parallaxSpeed = 0.15,
  scaleOnScroll = true,
  className,
  once = true,
  amount = 0.1,
}: MotionCardGridProps) {
  const containerVariants = staggerVariants[staggerSpeed];
  const gridClasses = getGridClasses(columns, gap);

  const childrenArray = Children.toArray(children);

  return (
    <motion.div
      className={cn(gridClasses, className)}
      variants={containerVariants}
      initial="initial"
      whileInView="animate"
      viewport={{ once, amount }}
    >
      {childrenArray.map((child, index) => {
        if (enableParallax) {
          return (
            <ParallaxCard
              key={index}
              index={index}
              parallaxSpeed={parallaxSpeed}
              scaleOnScroll={scaleOnScroll}
            >
              <motion.div variants={staggerItem}>{child}</motion.div>
            </ParallaxCard>
          );
        }

        return (
          <motion.div key={index} variants={staggerItem}>
            {child}
          </motion.div>
        );
      })}
    </motion.div>
  );
}

/** Simple stagger grid without parallax (lighter) */
export function MotionStaggerGrid({
  children,
  columns = defaultColumns,
  gap = 8,
  staggerSpeed = "normal",
  className,
  once = true,
  amount = 0.1,
}: Omit<
  MotionCardGridProps,
  "enableParallax" | "parallaxSpeed" | "scaleOnScroll"
>) {
  const containerVariants = staggerVariants[staggerSpeed];
  const gridClasses = getGridClasses(columns, gap);

  return (
    <motion.div
      className={cn(gridClasses, className)}
      variants={containerVariants}
      initial="initial"
      whileInView="animate"
      viewport={{ once, amount }}
    >
      {Children.map(children, (child, index) => (
        <motion.div key={index} variants={staggerItem}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

/** Grid item with custom animation control */
export type MotionGridItemProps = {
  children: ReactNode;
  className?: string;
  /** Custom delay override */
  delay?: number;
  /** Enable hover effects */
  hoverEffect?: boolean;
};

export function MotionGridItem({
  children,
  className,
  delay,
  hoverEffect = true,
}: MotionGridItemProps) {
  return (
    <motion.div
      className={cn("will-change-transform", className)}
      variants={staggerItem}
      custom={delay}
      whileHover={
        hoverEffect ? { y: -8, transition: { duration: 0.3 } } : undefined
      }
    >
      {children}
    </motion.div>
  );
}
