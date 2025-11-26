"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

export type OrbConfig = {
  /** Tailwind color class (e.g., "lime-300/30", "fuchsia-500/25") */
  color: string;
  /** Size in pixels */
  size: number;
  /** Blur amount in pixels */
  blur: number;
  /** Position as percentage or Tailwind classes */
  position: {
    x: string;
    y: string;
  };
  /** Parallax speed multiplier (default: 1) */
  parallaxSpeed?: number;
  /** Animation duration in seconds (default: 8) */
  duration?: number;
  /** Animation delay in seconds (default: 0) */
  delay?: number;
};

export type MotionOrbsProps = {
  /** Array of orb configurations */
  orbs: OrbConfig[];
  /** Additional class names */
  className?: string;
  /** Container ref for scroll tracking (optional) */
  containerRef?: React.RefObject<HTMLElement | null>;
};

const defaultOrbs: OrbConfig[] = [
  {
    color: "lime-300/30",
    size: 208,
    blur: 120,
    position: { x: "left-10", y: "top-6" },
    parallaxSpeed: 1,
    duration: 8,
  },
  {
    color: "fuchsia-500/25",
    size: 160,
    blur: 120,
    position: { x: "right-20", y: "bottom-10" },
    parallaxSpeed: 0.6,
    duration: 10,
    delay: 1,
  },
];

function SingleOrb({
  orb,
  scrollYProgress,
}: {
  orb: OrbConfig;
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const parallaxSpeed = orb.parallaxSpeed ?? 1;
  const duration = orb.duration ?? 8;
  const delay = orb.delay ?? 0;

  const y = useTransform(scrollYProgress, [0, 1], [0, -100 * parallaxSpeed]);

  return (
    <motion.div
      className={cn(
        "absolute rounded-full",
        orb.position.x,
        orb.position.y,
        `bg-${orb.color}`,
      )}
      style={{
        width: orb.size,
        height: orb.size,
        filter: `blur(${String(orb.blur)}px)`,
        y,
      }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.5, 0.3],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    />
  );
}

export function MotionOrbs({
  orbs = defaultOrbs,
  className,
  containerRef,
}: MotionOrbsProps) {
  const internalRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef ?? internalRef,
    offset: ["start end", "end start"],
  });

  return (
    <div
      ref={containerRef ? undefined : internalRef}
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      {orbs.map((orb, index) => (
        <SingleOrb
          key={`orb-${String(index)}-${orb.color}`}
          orb={orb}
          scrollYProgress={scrollYProgress}
        />
      ))}
    </div>
  );
}

/** Preset configurations for common orb layouts */
export const orbPresets = {
  /** Default dual orbs (lime + fuchsia) */
  default: defaultOrbs,

  /** Single lime orb */
  lime: [
    {
      color: "lime-300/30",
      size: 208,
      blur: 120,
      position: { x: "left-10", y: "top-10" },
      duration: 8,
    },
  ] as OrbConfig[],

  /** Triple orbs for hero sections */
  hero: [
    {
      color: "fuchsia-500/30",
      size: 256,
      blur: 140,
      position: { x: "-left-32", y: "top-6" },
      parallaxSpeed: 0.8,
      duration: 8,
    },
    {
      color: "lime-300/30",
      size: 160,
      blur: 120,
      position: { x: "right-10", y: "bottom-0" },
      parallaxSpeed: 1.2,
      duration: 10,
    },
  ] as OrbConfig[],

  /** Subtle background orbs */
  subtle: [
    {
      color: "lime-300/20",
      size: 300,
      blur: 150,
      position: { x: "left-1/4", y: "top-1/4" },
      parallaxSpeed: 0.5,
      duration: 12,
    },
    {
      color: "emerald-400/15",
      size: 250,
      blur: 140,
      position: { x: "right-1/4", y: "bottom-1/4" },
      parallaxSpeed: 0.4,
      duration: 14,
      delay: 2,
    },
  ] as OrbConfig[],
} as const;
