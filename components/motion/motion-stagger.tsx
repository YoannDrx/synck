'use client'

import { forwardRef } from 'react'

import { type HTMLMotionProps, motion } from 'framer-motion'

import {
  staggerContainer,
  staggerContainerFast,
  staggerContainerSlow,
  staggerItem,
} from '@/lib/animations'
import { cn } from '@/lib/utils'

type StaggerSpeed = 'fast' | 'normal' | 'slow'

const containerVariants: Record<StaggerSpeed, typeof staggerContainer> = {
  fast: staggerContainerFast,
  normal: staggerContainer,
  slow: staggerContainerSlow,
}

export type MotionStaggerProps = HTMLMotionProps<'div'> & {
  speed?: StaggerSpeed
  delay?: number
  once?: boolean
  amount?: number | 'some' | 'all'
}

export const MotionStagger = forwardRef<HTMLDivElement, MotionStaggerProps>(
  (
    { children, className, speed = 'normal', delay = 0, once = true, amount = 0.2, ...props },
    ref
  ) => {
    const variants = containerVariants[speed]

    return (
      <motion.div
        ref={ref}
        className={cn(className)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, amount }}
        variants={variants}
        transition={delay > 0 ? { delayChildren: delay } : undefined}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

MotionStagger.displayName = 'MotionStagger'

export type MotionStaggerItemProps = HTMLMotionProps<'div'>

export const MotionStaggerItem = forwardRef<HTMLDivElement, MotionStaggerItemProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <motion.div ref={ref} className={cn(className)} variants={staggerItem} {...props}>
        {children}
      </motion.div>
    )
  }
)

MotionStaggerItem.displayName = 'MotionStaggerItem'
