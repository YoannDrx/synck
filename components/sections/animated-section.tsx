"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { smoothTransition } from "@/lib/animations";

type AnimatedSectionProps = {
  children: ReactNode;
  className?: string;
  id?: string;
  animation?: "fade" | "slide-up" | "scale" | "none";
  parallax?: boolean;
  parallaxSpeed?: number;
  scrollParallax?: boolean;
  glow?: "neon" | "teal" | "none";
  delay?: number;
};

const glowStyles = {
  neon: "before:absolute before:inset-0 before:bg-[var(--gradient-glow-neon)] before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100",
  teal: "before:absolute before:inset-0 before:bg-[var(--gradient-glow-teal)] before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100",
  none: "",
};

const animationVariants = {
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  "slide-up": {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  },
  none: {
    hidden: {},
    visible: {},
  },
};

export function AnimatedSection({
  children,
  className,
  id,
  animation = "slide-up",
  parallax = false,
  parallaxSpeed = 0.2,
  scrollParallax = false,
  glow = "none",
  delay = 0,
}: AnimatedSectionProps) {
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Parallax simple (translation Y)
  const rawY = useTransform(
    scrollYProgress,
    [0, 1],
    [50 * parallaxSpeed, -50 * parallaxSpeed],
  );
  const y = useSpring(rawY, { stiffness: 100, damping: 30 });

  // Scroll-based parallax complet (opacité, scale, translation)
  const scrollOpacity = useTransform(
    scrollYProgress,
    [0, 0.15, 0.85, 1],
    [0, 1, 1, 0.3],
  );
  const scrollY = useTransform(
    scrollYProgress,
    [0, 0.15, 0.85, 1],
    [50, 0, 0, -25],
  );
  const scrollScale = useTransform(
    scrollYProgress,
    [0, 0.15, 0.85, 1],
    [0.96, 1, 1, 0.98],
  );

  const content = parallax ? (
    <motion.div style={{ y }}>{children}</motion.div>
  ) : (
    children
  );

  // Mode scrollParallax : effet complet d'apparition/disparition basé sur scroll
  if (scrollParallax) {
    return (
      <motion.section
        ref={ref}
        id={id}
        style={{
          opacity: scrollOpacity,
          y: scrollY,
          scale: scrollScale,
        }}
        className={cn(
          "relative will-change-transform",
          glowStyles[glow],
          className,
        )}
      >
        {content}
      </motion.section>
    );
  }

  return (
    <motion.section
      ref={ref}
      id={id}
      className={cn("relative overflow-hidden", glowStyles[glow], className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={animationVariants[animation]}
      transition={{
        ...smoothTransition,
        delay,
      }}
    >
      {content}
    </motion.section>
  );
}

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  align?: "left" | "center";
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  className,
  align = "left",
}: SectionHeaderProps) {
  return (
    <motion.div
      className={cn(
        "space-y-4",
        align === "center" && "text-center",
        className,
      )}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={smoothTransition}
    >
      {eyebrow && (
        <p className="text-xs uppercase tracking-[0.5em] text-[var(--color-text-muted)]">
          {eyebrow}
        </p>
      )}
      <h2 className="text-4xl font-black text-[var(--color-text-primary)]">
        {title}
      </h2>
      {description && (
        <p className="max-w-2xl text-[var(--color-text-secondary)]">
          {description}
        </p>
      )}
    </motion.div>
  );
}

type StaggerGridProps = {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
};

export function StaggerGrid({
  children,
  className,
  staggerDelay = 0.1,
}: StaggerGridProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

type StaggerItemProps = {
  children: ReactNode;
  className?: string;
};

export function StaggerItem({ children, className }: StaggerItemProps) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: {
          opacity: 1,
          y: 0,
          transition: smoothTransition,
        },
      }}
    >
      {children}
    </motion.div>
  );
}
