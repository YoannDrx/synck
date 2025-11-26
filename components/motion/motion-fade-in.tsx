"use client";

import { motion, type HTMLMotionProps, type Transition } from "framer-motion";
import { forwardRef } from "react";
import { smoothTransition } from "@/lib/animations";
import { cn } from "@/lib/utils";

type Direction = "up" | "down" | "left" | "right" | "none";

const directionOffsets: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 40 },
  down: { x: 0, y: -40 },
  left: { x: 40, y: 0 },
  right: { x: -40, y: 0 },
  none: { x: 0, y: 0 },
};

export type MotionFadeInProps = HTMLMotionProps<"div"> & {
  direction?: Direction;
  distance?: number;
  delay?: number;
  duration?: number;
  once?: boolean;
  amount?: number | "some" | "all";
  scale?: number;
};

export const MotionFadeIn = forwardRef<HTMLDivElement, MotionFadeInProps>(
  (
    {
      children,
      className,
      direction = "up",
      distance,
      delay = 0,
      duration,
      once = true,
      amount = 0.3,
      scale,
      ...props
    },
    ref,
  ) => {
    const offset = directionOffsets[direction];
    const multiplier = distance !== undefined ? distance / 40 : 1;

    const hidden = {
      opacity: 0,
      x: offset.x * multiplier,
      y: offset.y * multiplier,
      ...(scale !== undefined && { scale }),
    };

    const visible = {
      opacity: 1,
      x: 0,
      y: 0,
      ...(scale !== undefined && { scale: 1 }),
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

MotionFadeIn.displayName = "MotionFadeIn";
