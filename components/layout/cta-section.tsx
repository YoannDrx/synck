'use client'

import Link from 'next/link'
import { useRef } from 'react'

import { motion, useInView } from 'framer-motion'

import { smoothTransition } from '@/lib/animations'
import { cn } from '@/lib/utils'

export type CTASectionProps = {
  /** CTA title */
  title: string
  /** CTA description */
  description?: string
  /** Primary button label */
  buttonLabel: string
  /** Primary button href */
  buttonHref: string
  /** Secondary button (optional) */
  secondaryButton?: {
    label: string
    href: string
  }
  /** Visual variant */
  variant?: 'lime' | 'gradient' | 'outline'
  /** Additional class names */
  className?: string
  /** Animate on scroll */
  animate?: boolean
  /** Center content */
  centered?: boolean
}

/** Standardized CTA styles - NO FUCHSIA */
const BUTTON_BASE =
  'inline-flex items-center justify-center rounded-full px-8 py-4 text-sm font-bold uppercase tracking-[0.3em] transition-all duration-300'

const BUTTON_VARIANTS = {
  lime: cn(
    BUTTON_BASE,
    'border-4 border-[var(--brand-neon)] bg-[var(--gradient-brand-short)] text-[#050505]',
    'hover:shadow-[0_0_30px_rgba(213,255,10,0.5)] hover:scale-105'
  ),
  gradient: cn(
    BUTTON_BASE,
    'border-4 border-[var(--brand-neon)] bg-[var(--gradient-brand-short)] text-[#050505]',
    'hover:shadow-[0_0_30px_rgba(213,255,10,0.5)] hover:scale-105'
  ),
  outline: cn(
    BUTTON_BASE,
    'border-4 border-white/30 bg-transparent text-white',
    'hover:border-[var(--brand-neon)] hover:text-[var(--brand-neon)] hover:shadow-[0_0_20px_rgba(213,255,10,0.3)]'
  ),
}

export function CTASection({
  title,
  description,
  buttonLabel,
  buttonHref,
  secondaryButton,
  variant = 'lime',
  className,
  animate = true,
  centered = true,
}: CTASectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  const shouldAnimate = animate && isInView

  return (
    <motion.div
      ref={ref}
      className={cn('mt-12 sm:mt-16', centered && 'text-center', className)}
      initial={{ opacity: 0, y: 30 }}
      animate={shouldAnimate ? { opacity: 1, y: 0 } : {}}
      transition={smoothTransition}
    >
      {/* Title */}
      <h3 className="text-2xl font-bold text-white sm:text-3xl">{title}</h3>

      {/* Description */}
      {description && (
        <p className={cn('mt-3 max-w-xl text-base text-white/60', centered && 'mx-auto')}>
          {description}
        </p>
      )}

      {/* Buttons */}
      <div className={cn('mt-6 flex flex-wrap gap-4', centered && 'justify-center')}>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
          <Link href={buttonHref} className={BUTTON_VARIANTS[variant]}>
            {buttonLabel}
          </Link>
        </motion.div>

        {secondaryButton && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
            <Link href={secondaryButton.href} className={BUTTON_VARIANTS.outline}>
              {secondaryButton.label}
            </Link>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

/** Inline CTA button for use within sections */
export type CTAButtonProps = {
  label: string
  href: string
  variant?: 'lime' | 'gradient' | 'outline'
  className?: string
}

export function CTAButton({ label, href, variant = 'lime', className }: CTAButtonProps) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className={className}>
      <Link href={href} className={BUTTON_VARIANTS[variant]}>
        {label}
      </Link>
    </motion.div>
  )
}
