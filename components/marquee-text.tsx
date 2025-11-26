"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

type MarqueeTextProps = {
  items: string[];
  className?: string;
  speed?: number;
};

export function MarqueeText({ items, className, speed = 1 }: MarqueeTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();

  // Transform scroll progress to X translation
  // Multiplier controls how much it moves per scroll
  const rawX = useTransform(scrollYProgress, [0, 1], [0, -2000 * speed]);
  const x = useSpring(rawX, { stiffness: 100, damping: 30 });

  // Duplicate items multiple times to ensure seamless loop
  const repeatedItems = [...items, ...items, ...items, ...items];

  return (
    <div
      ref={containerRef}
      className={cn(
        "overflow-hidden rounded-full border-2 border-[var(--color-border)] bg-white/5",
        className,
      )}
    >
      <motion.div
        className="flex w-max items-center gap-8 px-6 py-6 text-xs font-black uppercase tracking-[0.6em]"
        style={{ x }}
      >
        {repeatedItems.map((item, index) => (
          <span
            key={`${String(index)}-${item}`}
            className="flex shrink-0 items-center gap-4"
          >
            <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--brand-neon)] shadow-[0_0_8px_rgba(213,255,10,0.6)]" />
            <span className="whitespace-nowrap text-[var(--color-text-primary)]">
              {item}
            </span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
