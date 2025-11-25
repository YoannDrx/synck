"use client";

import {
  useState,
  useCallback,
  type ReactNode,
  type PointerEvent,
  type CSSProperties,
} from "react";
import { cn } from "@/lib/utils";

export type GlowConfig = {
  /** Primary glow color in rgba format */
  primaryColor?: string;
  /** Secondary glow color in rgba format (optional) */
  secondaryColor?: string;
  /** Primary glow radius percentage (default: 45) */
  primaryRadius?: number;
  /** Secondary glow position (default: { x: 90, y: 10 }) */
  secondaryPosition?: { x: number; y: number };
  /** Overall opacity (default: 0.8) */
  opacity?: number;
  /** Transition duration in ms (default: 300) */
  transitionDuration?: number;
};

export type MotionGlowTrackerProps = {
  children: ReactNode;
  /** Enable/disable glow effect */
  enabled?: boolean;
  /** Glow configuration */
  config?: GlowConfig;
  /** Additional class names for the wrapper */
  className?: string;
  /** Additional class names for the glow layer */
  glowClassName?: string;
  /** Element tag to use (default: "div") */
  as?: "div" | "section" | "article" | "main";
  /** Additional style for the wrapper */
  style?: CSSProperties;
};

const defaultConfig: Required<GlowConfig> = {
  primaryColor: "rgba(213,255,10,0.3)",
  secondaryColor: "rgba(255,75,162,0.25)",
  primaryRadius: 45,
  secondaryPosition: { x: 90, y: 10 },
  opacity: 0.8,
  transitionDuration: 300,
};

export function MotionGlowTracker({
  children,
  enabled = true,
  config = {},
  className,
  glowClassName,
  as: Component = "div",
  style,
}: MotionGlowTrackerProps) {
  const [glow, setGlow] = useState({ x: 50, y: 50 });

  const mergedConfig = { ...defaultConfig, ...config };

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (!enabled) return;

      const rect = event.currentTarget.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      setGlow({ x, y });
    },
    [enabled],
  );

  const glowBackground = enabled
    ? `radial-gradient(circle at ${String(glow.x)}% ${String(glow.y)}%, ${mergedConfig.primaryColor}, transparent ${String(mergedConfig.primaryRadius)}%), radial-gradient(circle at ${String(mergedConfig.secondaryPosition.x)}% ${String(mergedConfig.secondaryPosition.y)}%, ${mergedConfig.secondaryColor}, transparent 45%)`
    : undefined;

  return (
    <Component
      className={cn("relative", className)}
      onPointerMove={handlePointerMove}
      style={style}
    >
      {enabled && (
        <div
          className={cn("pointer-events-none absolute inset-0", glowClassName)}
          style={{
            background: glowBackground,
            opacity: mergedConfig.opacity,
            transition: `all ${String(mergedConfig.transitionDuration)}ms`,
          }}
        />
      )}
      {children}
    </Component>
  );
}

/** Hook for custom glow tracking implementations */
export function useGlowTracker(initialPosition = { x: 50, y: 50 }) {
  const [position, setPosition] = useState(initialPosition);

  const handlePointerMove = useCallback((event: PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setPosition({ x, y });
  }, []);

  const getGradientStyle = useCallback(
    (config: GlowConfig = {}) => {
      const merged = { ...defaultConfig, ...config };
      return {
        background: `radial-gradient(circle at ${String(position.x)}% ${String(position.y)}%, ${merged.primaryColor}, transparent ${String(merged.primaryRadius)}%), radial-gradient(circle at ${String(merged.secondaryPosition.x)}% ${String(merged.secondaryPosition.y)}%, ${merged.secondaryColor}, transparent 45%)`,
        opacity: merged.opacity,
        transition: `all ${String(merged.transitionDuration)}ms`,
      };
    },
    [position],
  );

  return {
    position,
    handlePointerMove,
    getGradientStyle,
  };
}

/** Preset configurations for common glow styles */
export const glowPresets = {
  /** Default neon + fuchsia glow */
  default: defaultConfig,

  /** Neon only (no secondary) */
  neon: {
    primaryColor: "rgba(213,255,10,0.35)",
    secondaryColor: "transparent",
    primaryRadius: 50,
    opacity: 0.9,
  } as GlowConfig,

  /** Subtle glow for cards */
  subtle: {
    primaryColor: "rgba(213,255,10,0.15)",
    secondaryColor: "rgba(0,193,139,0.1)",
    primaryRadius: 60,
    opacity: 0.7,
  } as GlowConfig,

  /** Intense glow for hero sections */
  intense: {
    primaryColor: "rgba(213,255,10,0.4)",
    secondaryColor: "rgba(255,75,162,0.3)",
    primaryRadius: 40,
    opacity: 0.85,
  } as GlowConfig,

  /** Contact section style */
  contact: {
    primaryColor: "rgba(213,255,10,0.25)",
    secondaryColor: "rgba(217,70,239,0.2)",
    secondaryPosition: { x: 90, y: 80 },
    primaryRadius: 50,
    opacity: 0.7,
  } as GlowConfig,
} as const;
