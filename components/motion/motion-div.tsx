'use client'

import { forwardRef } from 'react'

import { type HTMLMotionProps, type Transition, motion } from 'framer-motion'

import {
  fadeIn,
  fadeInDown,
  fadeInScale,
  fadeInScaleUp,
  fadeInUp,
  slideInLeft,
  slideInRight,
  smoothTransition,
} from '@/lib/animations'
import { cn } from '@/lib/utils'

const presetVariants = {
  fadeIn,
  fadeInUp,
  fadeInDown,
  fadeInScale,
  fadeInScaleUp,
  slideInLeft,
  slideInRight,
} as const

type PresetVariant = keyof typeof presetVariants

export type MotionDivProps = HTMLMotionProps<'div'> & {
  preset?: PresetVariant
  delay?: number
  duration?: number
  once?: boolean
  amount?: number | 'some' | 'all'
}

export const MotionDiv = forwardRef<HTMLDivElement, MotionDivProps>(
  (
    {
      children,
      className,
      preset,
      delay = 0,
      duration,
      once = true,
      amount = 0.3,
      initial = 'initial',
      whileInView,
      transition,
      variants: customVariants,
      ...props
    },
    ref
  ) => {
    const variants = preset ? presetVariants[preset] : customVariants

    const mergedTransition: Transition = {
      ...smoothTransition,
      ...(duration !== undefined && { duration }),
      ...(delay > 0 && { delay }),
      ...(typeof transition === 'object' ? transition : {}),
    }

    return (
      <motion.div
        ref={ref}
        className={cn(className)}
        initial={initial}
        whileInView={whileInView ?? 'animate'}
        viewport={{ once, amount }}
        variants={variants}
        transition={mergedTransition}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

MotionDiv.displayName = 'MotionDiv'
