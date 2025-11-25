"use client";

import { motion, type HTMLMotionProps, type Transition } from "framer-motion";
import { forwardRef } from "react";
import { smoothTransition } from "@/lib/animations";
import { cn } from "@/lib/utils";

export type MotionScaleProps = HTMLMotionProps<"div"> & {
  scaleFrom?: number;
  delay?: number;
  duration?: number;
  once?: boolean;
  amount?: number | "some" | "all";
  fade?: boolean;
};

export const MotionScale = forwardRef<HTMLDivElement, MotionScaleProps>(
  (
    {
      children,
      className,
      scaleFrom = 0.9,
      delay = 0,
      duration,
      once = true,
      amount = 0.3,
      fade = true,
      ...props
    },
    ref,
  ) => {
    const hidden = {
      scale: scaleFrom,
      ...(fade && { opacity: 0 }),
    };

    const visible = {
      scale: 1,
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

MotionScale.displayName = "MotionScale";
