import type { Variants, Transition } from "framer-motion";

/* ============================================
   TRANSITION PRESETS
   ============================================ */

export const springTransition: Transition = {
  type: "spring",
  stiffness: 100,
  damping: 15,
};

export const smoothTransition: Transition = {
  duration: 0.6,
  ease: [0.4, 0, 0.2, 1],
};

export const fastTransition: Transition = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1],
};

export const slowTransition: Transition = {
  duration: 0.8,
  ease: [0.4, 0, 0.2, 1],
};

export const bounceTransition: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 20,
};

/* ============================================
   FADE VARIANTS
   ============================================ */

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 40 },
  animate: {
    opacity: 1,
    y: 0,
    transition: smoothTransition,
  },
  exit: { opacity: 0, y: 40 },
};

export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -40 },
  animate: {
    opacity: 1,
    y: 0,
    transition: smoothTransition,
  },
  exit: { opacity: 0, y: -40 },
};

export const fadeInScale: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: springTransition,
  },
  exit: { opacity: 0, scale: 0.9 },
};

export const fadeInScaleUp: Variants = {
  initial: { opacity: 0, scale: 0.9, y: 20 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springTransition,
  },
  exit: { opacity: 0, scale: 0.9, y: 20 },
};

/* ============================================
   SLIDE VARIANTS
   ============================================ */

export const slideInLeft: Variants = {
  initial: { opacity: 0, x: -50 },
  animate: {
    opacity: 1,
    x: 0,
    transition: smoothTransition,
  },
  exit: { opacity: 0, x: -50 },
};

export const slideInRight: Variants = {
  initial: { opacity: 0, x: 50 },
  animate: {
    opacity: 1,
    x: 0,
    transition: smoothTransition,
  },
  exit: { opacity: 0, x: 50 },
};

/* ============================================
   CONTAINER VARIANTS (STAGGER)
   ============================================ */

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
  exit: {},
};

export const staggerContainerFast: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {},
};

export const staggerContainerSlow: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
  exit: {},
};

/* ============================================
   STAGGER ITEM VARIANTS
   ============================================ */

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: smoothTransition,
  },
  exit: { opacity: 0, y: 30 },
};

export const staggerItemScale: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: springTransition,
  },
  exit: { opacity: 0, scale: 0.9 },
};

/* ============================================
   SPECIAL EFFECTS
   ============================================ */

export const scaleOnHover = {
  scale: 1.02,
  transition: fastTransition,
};

export const scaleOnTap = {
  scale: 0.98,
};

export const glowPulse: Variants = {
  initial: { opacity: 0.4 },
  animate: {
    opacity: [0.4, 0.8, 0.4],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const float: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

/* ============================================
   PAGE TRANSITIONS
   ============================================ */

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 1, 1],
    },
  },
};

/* ============================================
   HELPER FUNCTIONS
   ============================================ */

/**
 * Creates a delayed version of any variant
 */
export function withDelay(variants: Variants, delay: number): Variants {
  const animateVariant = variants.animate;
  const existingTransition =
    typeof animateVariant === "object" &&
    animateVariant !== null &&
    "transition" in animateVariant
      ? (animateVariant.transition as Record<string, unknown>)
      : {};

  return {
    initial: variants.initial,
    animate: {
      ...(typeof animateVariant === "object" ? animateVariant : {}),
      transition: {
        ...existingTransition,
        delay,
      },
    },
    exit: variants.exit,
  };
}

/**
 * Creates variants for scroll-triggered animations
 */
export function createScrollVariants(
  options: {
    y?: number;
    x?: number;
    scale?: number;
    opacity?: number;
    duration?: number;
    delay?: number;
  } = {},
): Variants {
  const {
    y = 40,
    x = 0,
    scale = 1,
    opacity = 0,
    duration = 0.6,
    delay = 0,
  } = options;

  return {
    hidden: {
      opacity,
      y,
      x,
      scale: scale < 1 ? scale : 1,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      transition: {
        duration,
        delay,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };
}

/**
 * Creates stagger variants with custom settings
 */
export function createStaggerVariants(
  staggerDelay = 0.1,
  initialDelay = 0.2,
): Variants {
  return {
    initial: {},
    animate: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: initialDelay,
      },
    },
    exit: {},
  };
}
