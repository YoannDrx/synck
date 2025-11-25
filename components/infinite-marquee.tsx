"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

type InfiniteMarqueeProps = {
  items: string[];
  className?: string;
};

export function InfiniteMarquee({ items, className }: InfiniteMarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();

  // Smooth spring for parallax effect
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 20,
  });

  // Parallax transforms - line 1 moves faster than line 2
  const line1X = useTransform(smoothProgress, [0, 1], [0, -400]);
  const line2X = useTransform(smoothProgress, [0, 1], [0, 200]);

  // Subtle 3D perspective rotation on scroll
  const rotateX = useTransform(smoothProgress, [0, 0.5, 1], [2, 0, -2]);

  // Repeat items many times for seamless infinite loop
  const repeatedItems = [
    ...items,
    ...items,
    ...items,
    ...items,
    ...items,
    ...items,
    ...items,
    ...items,
  ];

  // Reverse for second line
  const reversedItems = [...repeatedItems].reverse();

  return (
    <div
      ref={containerRef}
      className={`marquee-container relative overflow-hidden py-8 sm:py-12 lg:py-16 ${className ?? ""}`}
      style={{
        perspective: "1000px",
        width: "100vw",
        marginLeft: "calc(-50vw + 50%)",
      }}
    >
      {/* Gradient masks for fade effect on edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 sm:w-40 lg:w-64 bg-gradient-to-r from-[#050505] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 sm:w-40 lg:w-64 bg-gradient-to-l from-[#050505] to-transparent" />

      {/* Subtle glow behind */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(213,255,10,0.03)] to-transparent" />

      <motion.div
        className="space-y-4 sm:space-y-6 lg:space-y-8"
        style={{ rotateX }}
      >
        {/* Line 1 - scrolls left */}
        <motion.div className="flex w-max items-center" style={{ x: line1X }}>
          <div className="flex animate-marquee-left items-center">
            {repeatedItems.map((item, index) => (
              <span
                key={`line1-${String(index)}`}
                className="flex shrink-0 items-center"
              >
                <span className="mx-4 sm:mx-6 lg:mx-8 whitespace-nowrap text-3xl sm:text-5xl lg:text-7xl xl:text-8xl font-black uppercase tracking-[0.02em] sm:tracking-[0.04em] text-white/90 transition-colors duration-300 hover:text-white">
                  {item}
                </span>
                <span className="relative flex h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 items-center justify-center">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--brand-neon)] opacity-40" />
                  <span className="relative inline-flex h-2 w-2 sm:h-2.5 sm:w-2.5 lg:h-3 lg:w-3 rounded-full bg-[var(--brand-neon)] shadow-[0_0_20px_rgba(213,255,10,0.8),0_0_40px_rgba(213,255,10,0.4)]" />
                </span>
              </span>
            ))}
          </div>
          {/* Duplicate for seamless loop */}
          <div className="flex animate-marquee-left items-center" aria-hidden>
            {repeatedItems.map((item, index) => (
              <span
                key={`line1-dup-${String(index)}`}
                className="flex shrink-0 items-center"
              >
                <span className="mx-4 sm:mx-6 lg:mx-8 whitespace-nowrap text-3xl sm:text-5xl lg:text-7xl xl:text-8xl font-black uppercase tracking-[0.02em] sm:tracking-[0.04em] text-white/90 transition-colors duration-300 hover:text-white">
                  {item}
                </span>
                <span className="relative flex h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 items-center justify-center">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--brand-neon)] opacity-40" />
                  <span className="relative inline-flex h-2 w-2 sm:h-2.5 sm:w-2.5 lg:h-3 lg:w-3 rounded-full bg-[var(--brand-neon)] shadow-[0_0_20px_rgba(213,255,10,0.8),0_0_40px_rgba(213,255,10,0.4)]" />
                </span>
              </span>
            ))}
          </div>
        </motion.div>

        {/* Line 2 - scrolls right (opposite direction) */}
        <motion.div className="flex w-max items-center" style={{ x: line2X }}>
          <div className="flex animate-marquee-right items-center">
            {reversedItems.map((item, index) => (
              <span
                key={`line2-${String(index)}`}
                className="flex shrink-0 items-center"
              >
                <span className="relative flex h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 items-center justify-center">
                  <span
                    className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fuchsia-500 opacity-40"
                    style={{ animationDelay: "0.5s" }}
                  />
                  <span className="relative inline-flex h-2 w-2 sm:h-2.5 sm:w-2.5 lg:h-3 lg:w-3 rounded-full bg-fuchsia-500 shadow-[0_0_20px_rgba(255,75,162,0.8),0_0_40px_rgba(255,75,162,0.4)]" />
                </span>
                <span className="mx-4 sm:mx-6 lg:mx-8 whitespace-nowrap text-3xl sm:text-5xl lg:text-7xl xl:text-8xl font-black uppercase tracking-[0.02em] sm:tracking-[0.04em] text-white/60 transition-colors duration-300 hover:text-white/90">
                  {item}
                </span>
              </span>
            ))}
          </div>
          {/* Duplicate for seamless loop */}
          <div className="flex animate-marquee-right items-center" aria-hidden>
            {reversedItems.map((item, index) => (
              <span
                key={`line2-dup-${String(index)}`}
                className="flex shrink-0 items-center"
              >
                <span className="relative flex h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 items-center justify-center">
                  <span
                    className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fuchsia-500 opacity-40"
                    style={{ animationDelay: "0.5s" }}
                  />
                  <span className="relative inline-flex h-2 w-2 sm:h-2.5 sm:w-2.5 lg:h-3 lg:w-3 rounded-full bg-fuchsia-500 shadow-[0_0_20px_rgba(255,75,162,0.8),0_0_40px_rgba(255,75,162,0.4)]" />
                </span>
                <span className="mx-4 sm:mx-6 lg:mx-8 whitespace-nowrap text-3xl sm:text-5xl lg:text-7xl xl:text-8xl font-black uppercase tracking-[0.02em] sm:tracking-[0.04em] text-white/60 transition-colors duration-300 hover:text-white/90">
                  {item}
                </span>
              </span>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
