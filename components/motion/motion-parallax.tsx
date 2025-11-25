"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type MotionParallaxProps = {
  children: ReactNode;
  className?: string;
  speed?: number;
  direction?: "up" | "down";
  offset?: [
    "start start" | "start end" | "end start" | "end end",
    "start start" | "start end" | "end start" | "end end",
  ];
  smooth?: boolean;
  smoothConfig?: {
    stiffness?: number;
    damping?: number;
  };
};

export function MotionParallax({
  children,
  className,
  speed = 0.5,
  direction = "up",
  offset = ["start end", "end start"],
  smooth = true,
  smoothConfig = { stiffness: 100, damping: 30 },
}: MotionParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset,
  });

  const range =
    direction === "up"
      ? [100 * speed, -100 * speed]
      : [-100 * speed, 100 * speed];

  const rawY = useTransform(scrollYProgress, [0, 1], range);
  const smoothY = useSpring(rawY, smoothConfig);
  const y = smooth ? smoothY : rawY;

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
}
