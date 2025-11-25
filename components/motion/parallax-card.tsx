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
    // Start tracking earlier, end later for more visible effect
    offset: ["start 95%", "end 5%"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 150,
    damping: 20,
  });

  // More pronounced parallax effect based on index
  const yOffset = 80 + index * 15;
  const y = useTransform(
    smoothProgress,
    [0, 0.3, 0.7, 1],
    [yOffset * parallaxSpeed, 0, 0, -yOffset * parallaxSpeed * 0.5],
  );

  // Opacity: always visible, subtle fade
  const opacity = useTransform(
    smoothProgress,
    [0, 0.15, 0.85, 1],
    [0.85, 1, 1, 0.85],
  );

  // Scale effect - more noticeable
  const scale = useTransform(
    smoothProgress,
    [0, 0.25, 0.75, 1],
    scaleOnScroll ? [0.92, 1, 1, 0.96] : [1, 1, 1, 1],
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
      className={cn("h-full will-change-transform", className)}
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
