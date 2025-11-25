"use client";

import { useRef, useEffect, useState } from "react";
import { useInView, useAnimation } from "framer-motion";

/* ============================================
   SCROLL REVEAL HOOK
   ============================================ */

type UseScrollRevealOptions = {
  /** Trigger animation only once */
  once?: boolean;
  /** Margin around the element to trigger animation */
  margin?:
    | `${number}px`
    | `${number}px ${number}px`
    | `${number}px ${number}px ${number}px ${number}px`;
  /** Threshold of visibility to trigger (0-1) */
  threshold?: number;
  /** Delay before animation starts (in seconds) */
  delay?: number;
};

/**
 * Hook for scroll-triggered reveal animations
 *
 * @example
 * ```tsx
 * const { ref, isInView, controls } = useScrollReveal()
 *
 * return (
 *   <motion.div
 *     ref={ref}
 *     initial="hidden"
 *     animate={controls}
 *     variants={fadeInUp}
 *   >
 *     Content
 *   </motion.div>
 * )
 * ```
 */
export function useScrollReveal(options: UseScrollRevealOptions = {}) {
  const { once = true, margin = "-100px", threshold = 0, delay = 0 } = options;

  const ref = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  const isInView = useInView(ref, {
    once,
    margin,
    amount: threshold,
  });

  useEffect(() => {
    if (isInView) {
      if (delay > 0) {
        const timeout = setTimeout(() => {
          void controls.start("visible");
        }, delay * 1000);
        return () => {
          clearTimeout(timeout);
        };
      } else {
        void controls.start("visible");
      }
    } else if (!once) {
      void controls.start("hidden");
    }
  }, [isInView, controls, delay, once]);

  return { ref, isInView, controls };
}

/* ============================================
   SIMPLE IN VIEW HOOK
   ============================================ */

type UseSimpleInViewOptions = {
  once?: boolean;
  margin?:
    | `${number}px`
    | `${number}px ${number}px`
    | `${number}px ${number}px ${number}px ${number}px`;
  threshold?: number;
};

/**
 * Simplified hook that just returns isInView state
 *
 * @example
 * ```tsx
 * const { ref, isInView } = useSimpleInView()
 *
 * return (
 *   <motion.div
 *     ref={ref}
 *     initial={{ opacity: 0, y: 40 }}
 *     animate={isInView ? { opacity: 1, y: 0 } : {}}
 *   >
 *     Content
 *   </motion.div>
 * )
 * ```
 */
export function useSimpleInView(options: UseSimpleInViewOptions = {}) {
  const { once = true, margin = "-100px", threshold = 0 } = options;

  const ref = useRef<HTMLDivElement>(null);

  const isInView = useInView(ref, {
    once,
    margin,
    amount: threshold,
  });

  return { ref, isInView };
}

/* ============================================
   STAGGER REVEAL HOOK
   ============================================ */

type UseStaggerRevealOptions = {
  /** Delay between each item (in seconds) */
  staggerDelay?: number;
  /** Initial delay before first item (in seconds) */
  initialDelay?: number;
  /** Trigger animation only once */
  once?: boolean;
  /** Margin for viewport detection */
  margin?:
    | `${number}px`
    | `${number}px ${number}px`
    | `${number}px ${number}px ${number}px ${number}px`;
};

/**
 * Hook for staggered reveal animations
 *
 * @example
 * ```tsx
 * const { containerRef, isInView, getItemDelay } = useStaggerReveal()
 *
 * return (
 *   <div ref={containerRef}>
 *     {items.map((item, i) => (
 *       <motion.div
 *         key={item.id}
 *         initial={{ opacity: 0, y: 30 }}
 *         animate={isInView ? { opacity: 1, y: 0 } : {}}
 *         transition={{ delay: getItemDelay(i) }}
 *       >
 *         {item.content}
 *       </motion.div>
 *     ))}
 *   </div>
 * )
 * ```
 */
export function useStaggerReveal(options: UseStaggerRevealOptions = {}) {
  const {
    staggerDelay = 0.1,
    initialDelay = 0.2,
    once = true,
    margin = "-100px",
  } = options;

  const containerRef = useRef<HTMLDivElement>(null);

  const isInView = useInView(containerRef, {
    once,
    margin,
  });

  const getItemDelay = (index: number): number => {
    return initialDelay + index * staggerDelay;
  };

  return { containerRef, isInView, getItemDelay };
}

/* ============================================
   PROGRESSIVE REVEAL HOOK
   ============================================ */

/**
 * Hook that reveals items progressively as they enter viewport
 * Each item has its own intersection observer
 *
 * @example
 * ```tsx
 * const { createItemRef, isItemVisible } = useProgressiveReveal()
 *
 * return (
 *   <div>
 *     {items.map((item, i) => (
 *       <motion.div
 *         key={item.id}
 *         ref={createItemRef(i)}
 *         initial={{ opacity: 0 }}
 *         animate={isItemVisible(i) ? { opacity: 1 } : {}}
 *       >
 *         {item.content}
 *       </motion.div>
 *     ))}
 *   </div>
 * )
 * ```
 */
export function useProgressiveReveal(
  options: {
    threshold?: number;
    margin?: string;
  } = {},
) {
  const { threshold = 0.1, margin = "-50px" } = options;

  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const itemRefs = useRef<Map<number, HTMLElement>>(new Map());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = parseInt(
            entry.target.getAttribute("data-index") ?? "0",
          );
          if (entry.isIntersecting) {
            setVisibleItems((prev) => new Set(prev).add(index));
          }
        });
      },
      {
        threshold,
        rootMargin: margin,
      },
    );

    itemRefs.current.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, [threshold, margin]);

  const createItemRef = (index: number) => (element: HTMLElement | null) => {
    if (element) {
      element.setAttribute("data-index", index.toString());
      itemRefs.current.set(index, element);
    } else {
      itemRefs.current.delete(index);
    }
  };

  const isItemVisible = (index: number): boolean => {
    return visibleItems.has(index);
  };

  return { createItemRef, isItemVisible, visibleItems };
}

/* ============================================
   SECTION SCROLL PROGRESS HOOK
   ============================================ */

/**
 * Hook that tracks scroll progress through a section
 * Useful for progress indicators or scroll-linked animations
 *
 * @example
 * ```tsx
 * const { ref, progress } = useSectionProgress()
 *
 * return (
 *   <section ref={ref}>
 *     <motion.div style={{ scaleX: progress }} />
 *     Content
 *   </section>
 * )
 * ```
 */
export function useSectionProgress() {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleScroll = () => {
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calculate progress (0 when entering, 1 when leaving)
      const start = rect.top - windowHeight;
      const end = rect.bottom;
      const total = end - start;
      const current = -start;

      const calculatedProgress = Math.min(Math.max(current / total, 0), 1);
      setProgress(calculatedProgress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return { ref, progress };
}
