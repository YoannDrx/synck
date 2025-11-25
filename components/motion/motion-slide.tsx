"use client";

import { motion, type HTMLMotionProps, type Transition } from "framer-motion";
import { forwardRef } from "react";
import { smoothTransition } from "@/lib/animations";
import { cn } from "@/lib/utils";

type SlideDirection = "left" | "right" | "up" | "down";

export type MotionSlideProps = HTMLMotionProps<"div"> & {
  direction?: SlideDirection;
  distance?: number;
  delay?: number;
  duration?: number;
  once?: boolean;
  amount?: number | "some" | "all";
  fade?: boolean;
};

export const MotionSlide = forwardRef<HTMLDivElement, MotionSlideProps>(
  (
    {
      children,
      className,
      direction = "left",
      distance = 100,
      delay = 0,
      duration,
      once = true,
      amount = 0.3,
      fade = true,
      ...props
    },
    ref,
  ) => {
    const getOffset = (): { x: number; y: number } => {
      switch (direction) {
        case "left":
          return { x: -distance, y: 0 };
        case "right":
          return { x: distance, y: 0 };
        case "up":
          return { x: 0, y: -distance };
        case "down":
          return { x: 0, y: distance };
      }
    };

    const offset = getOffset();

    const hidden = {
      x: offset.x,
      y: offset.y,
      ...(fade && { opacity: 0 }),
    };

    const visible = {
      x: 0,
      y: 0,
      ...(fade && { opacity: 1 }),
    };

    const mergedTransition: Transition = {
      ...smoothTransition,
      ...(duration !== undefined && { duration }),
      ...(delay > 0 && { delay }),
    };

    return (
      <motion.div
        ref={ref}
        className={cn(className)}
        initial={hidden}
        whileInView={visible}
        viewport={{ once, amount }}
        transition={mergedTransition}
        {...props}
      >
        {children}
      </motion.div>
    );
  },
);

MotionSlide.displayName = "MotionSlide";
