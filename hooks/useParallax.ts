"use client";

import { useRef } from "react";
import {
  useScroll,
  useTransform,
  useSpring,
  type MotionValue,
  type SpringOptions,
} from "framer-motion";

/* ============================================
   PARALLAX HOOK
   ============================================ */

type UseParallaxOptions = {
  /** Distance to move (positive = down, negative = up) */
  distance?: number;
  /** Spring configuration for smooth movement */
  springConfig?: SpringOptions;
  /** Offset for scroll trigger [start, end] */
  offset?: ["start" | "center" | "end", "start" | "center" | "end"];
};

/**
 * Creates a parallax effect based on scroll position
 *
 * @example
 * ```tsx
 * const { ref, y } = useParallax({ distance: 50 })
 *
 * return (
 *   <motion.div ref={ref} style={{ y }}>
 *     Content
 *   </motion.div>
 * )
 * ```
 */
export function useParallax(options: UseParallaxOptions = {}) {
  const {
    distance = 100,
    springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 },
    offset = ["start", "end"],
  } = options;

  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: [`${offset[0]} end`, `${offset[1]} start`],
  });

  const rawY = useTransform(scrollYProgress, [0, 1], [-distance, distance]);
  const y = useSpring(rawY, springConfig);

  return { ref, y, scrollYProgress };
}

/* ============================================
   PARALLAX TRANSFORM HOOK
   ============================================ */

type UseParallaxTransformOptions = {
  /** Input range for scroll progress */
  inputRange?: [number, number];
  /** Output range for the transform value */
  outputRange: [number, number];
  /** Spring configuration */
  springConfig?: SpringOptions;
};

/**
 * Creates a custom parallax transform based on a scroll progress value
 *
 * @example
 * ```tsx
 * const { scrollYProgress } = useScroll()
 * const opacity = useParallaxTransform(scrollYProgress, {
 *   outputRange: [0, 1],
 * })
 * ```
 */
export function useParallaxTransform(
  scrollProgress: MotionValue<number>,
  options: UseParallaxTransformOptions,
) {
  const {
    inputRange = [0, 1],
    outputRange,
    springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 },
  } = options;

  const rawValue = useTransform(scrollProgress, inputRange, outputRange);
  const smoothValue = useSpring(rawValue, springConfig);

  return smoothValue;
}

/* ============================================
   SECTION PARALLAX HOOK
   ============================================ */

/**
 * Creates a parallax effect for a section with glow/background elements
 *
 * @example
 * ```tsx
 * const { containerRef, glowY, contentY } = useSectionParallax()
 *
 * return (
 *   <section ref={containerRef}>
 *     <motion.div className="glow" style={{ y: glowY }} />
 *     <motion.div style={{ y: contentY }}>Content</motion.div>
 *   </section>
 * )
 * ```
 */
export function useSectionParallax(
  options: {
    glowSpeed?: number;
    contentSpeed?: number;
  } = {},
) {
  const { glowSpeed = 0.3, contentSpeed = 0.1 } = options;

  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const glowRawY = useTransform(
    scrollYProgress,
    [0, 1],
    [-50 * glowSpeed, 50 * glowSpeed],
  );
  const glowY = useSpring(glowRawY, { stiffness: 50, damping: 20 });

  const contentRawY = useTransform(
    scrollYProgress,
    [0, 1],
    [-30 * contentSpeed, 30 * contentSpeed],
  );
  const contentY = useSpring(contentRawY, { stiffness: 100, damping: 30 });

  return { containerRef, glowY, contentY, scrollYProgress };
}

/* ============================================
   THREE LAYER PARALLAX HOOK
   ============================================ */

/**
 * Creates a three-layer parallax effect (background, mid, foreground)
 * This is a fixed-layer version that follows React hooks rules
 *
 * @example
 * ```tsx
 * const { ref, background, midground, foreground } = useThreeLayerParallax()
 *
 * return (
 *   <div ref={ref}>
 *     <motion.div style={{ y: background }}>Background</motion.div>
 *     <motion.div style={{ y: midground }}>Midground</motion.div>
 *     <motion.div style={{ y: foreground }}>Foreground</motion.div>
 *   </div>
 * )
 * ```
 */
export function useThreeLayerParallax(
  options: {
    baseDistance?: number;
    backgroundSpeed?: number;
    midgroundSpeed?: number;
    foregroundSpeed?: number;
  } = {},
) {
  const {
    baseDistance = 100,
    backgroundSpeed = 0.2,
    midgroundSpeed = 0.5,
    foregroundSpeed = 1.2,
  } = options;

  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };

  // Background layer (slowest)
  const bgDistance = baseDistance * backgroundSpeed;
  const bgRawY = useTransform(
    scrollYProgress,
    [0, 1],
    [-bgDistance, bgDistance],
  );
  const background = useSpring(bgRawY, springConfig);

  // Midground layer
  const midDistance = baseDistance * midgroundSpeed;
  const midRawY = useTransform(
    scrollYProgress,
    [0, 1],
    [-midDistance, midDistance],
  );
  const midground = useSpring(midRawY, springConfig);

  // Foreground layer (fastest)
  const fgDistance = baseDistance * foregroundSpeed;
  const fgRawY = useTransform(
    scrollYProgress,
    [0, 1],
    [-fgDistance, fgDistance],
  );
  const foreground = useSpring(fgRawY, springConfig);

  return { ref, background, midground, foreground, scrollYProgress };
}
