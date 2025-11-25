"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

export type ParallaxCardProps = {
  children: ReactNode;
  className?: string;
  index?: number;
  parallaxSpeed?: number;
  scaleOnScroll?: boolean;
  rotateOnScroll?: boolean;
};

export function ParallaxCard({
  children,
  className,
  index = 0,
  parallaxSpeed = 0.15,
  scaleOnScroll = true,
  rotateOnScroll = false,
}: ParallaxCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
  });

  // Stagger the parallax effect based on index
  const yOffset = 50 + index * 10;
  const y = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    [yOffset * parallaxSpeed, 0, -yOffset * parallaxSpeed],
  );

  // Opacity: fade in as it enters, fade out as it leaves
  const opacity = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  // Scale effect
  const scale = useTransform(
    smoothProgress,
    [0, 0.2, 0.8, 1],
    scaleOnScroll ? [0.95, 1, 1, 0.95] : [1, 1, 1, 1],
  );

  // Subtle rotation based on position
  const rotateDirection = index % 2 === 0 ? 1 : -1;
  const rotate = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    rotateOnScroll ? [rotateDirection * 2, 0, rotateDirection * -2] : [0, 0, 0],
  );

  return (
    <motion.div
      ref={ref}
      className={cn("will-change-transform", className)}
      style={{
        y,
        opacity,
        scale,
        rotate,
      }}
    >
      {children}
    </motion.div>
  );
}

type ParallaxGridProps = {
  children: ReactNode;
  className?: string;
};

export function ParallaxGrid({ children, className }: ParallaxGridProps) {
  return <div className={cn("relative", className)}>{children}</div>;
}
