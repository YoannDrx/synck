'use client'

import { type CSSProperties, type ReactNode, useRef } from 'react'

import { motion, useScroll, useSpring, useTransform } from 'framer-motion'

import { cn } from '@/lib/utils'

import {
  type GlowConfig,
  MotionGlowTracker,
  glowPresets,
} from '@/components/motion/motion-glow-tracker'
import { MotionOrbs, type OrbConfig, orbPresets } from '@/components/motion/motion-orbs'

export type PageLayoutProps = {
  children: ReactNode
  /** Show animated orbs in background */
  showOrbs?: boolean
  /** Custom orb configuration or preset name */
  orbsConfig?: OrbConfig[] | keyof typeof orbPresets
  /** Enable mouse-following glow effect */
  glowTracking?: boolean
  /** Custom glow configuration or preset name */
  glowConfig?: GlowConfig | keyof typeof glowPresets
  /** Make glow effect cover full viewport instead of container */
  glowFullscreen?: boolean
  /** Enable scroll-based parallax on content */
  scrollParallax?: boolean
  /** Show background gradients */
  showBackgroundGradients?: boolean
  /** Show noise texture overlay */
  showNoise?: boolean
  /** Additional class names for main element */
  className?: string
  /** Additional class names for content wrapper */
  contentClassName?: string
  /** Custom style */
  style?: CSSProperties
}

/** Standardized padding for all pages */
const STANDARD_PADDING = 'px-4 pb-20 pt-8 sm:pt-16 sm:px-8 lg:px-16'

export function PageLayout({
  children,
  showOrbs = true,
  orbsConfig = 'default',
  glowTracking = false,
  glowConfig = 'default',
  glowFullscreen = false,
  scrollParallax = false,
  showBackgroundGradients = true,
  showNoise = true,
  className,
  contentClassName,
  style,
}: PageLayoutProps) {
  const mainRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: mainRef,
    offset: ['start start', 'end start'],
  })

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
  })

  const contentY = useTransform(smoothProgress, [0, 1], [0, scrollParallax ? 30 : 0])
  const contentOpacity = useTransform(
    smoothProgress,
    [0, 0.8, 1],
    [1, scrollParallax ? 0.7 : 1, scrollParallax ? 0.5 : 1]
  )

  // Resolve orbs configuration
  const resolvedOrbs = typeof orbsConfig === 'string' ? orbPresets[orbsConfig] : orbsConfig

  // Resolve glow configuration
  const resolvedGlow = typeof glowConfig === 'string' ? glowPresets[glowConfig] : glowConfig

  const content = (
    <motion.div
      className={cn('relative z-10', contentClassName)}
      style={scrollParallax ? { y: contentY, opacity: contentOpacity } : undefined}
    >
      {children}
    </motion.div>
  )

  return (
    <main
      ref={mainRef}
      className={cn('relative min-h-screen overflow-hidden', STANDARD_PADDING, className)}
      style={style}
    >
      {/* Background gradients */}
      {showBackgroundGradients && (
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-[var(--color-background)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(213,255,10,0.08),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(0,193,139,0.06),transparent_50%)]" />
        </div>
      )}

      {/* Noise texture overlay */}
      {showNoise && (
        <div className="pointer-events-none fixed inset-0 -z-10 opacity-[0.015]">
          <div className="noise-layer absolute inset-0" />
        </div>
      )}

      {/* Animated orbs */}
      {showOrbs && resolvedOrbs && <MotionOrbs orbs={resolvedOrbs} containerRef={mainRef} />}

      {/* Fullscreen glow layer (fixed to viewport, tracks mouse via window events) */}
      {glowTracking && glowFullscreen && (
        <MotionGlowTracker
          config={resolvedGlow}
          fullscreen
          className="pointer-events-none fixed inset-0 z-0"
          glowClassName=""
        >
          <div />
        </MotionGlowTracker>
      )}

      {/* Glow tracking wrapper or direct content */}
      {glowTracking && !glowFullscreen ? (
        <MotionGlowTracker
          config={resolvedGlow}
          className="relative"
          glowClassName="rounded-[var(--radius-2xl)]"
        >
          {content}
        </MotionGlowTracker>
      ) : (
        content
      )}
    </main>
  )
}

/** Lighter version without orbs (for simple pages) */
export function PageLayoutSimple({
  children,
  className,
  contentClassName,
}: Pick<PageLayoutProps, 'children' | 'className' | 'contentClassName'>) {
  return (
    <main className={cn('relative min-h-screen', STANDARD_PADDING, className)}>
      <div className={cn('relative', contentClassName)}>{children}</div>
    </main>
  )
}

/** Export standard padding for use in other components */
export const standardPadding = STANDARD_PADDING
