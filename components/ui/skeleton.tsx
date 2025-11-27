import * as React from 'react'

import { type VariantProps, cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const skeletonVariants = cva('rounded-[var(--radius-md)]', {
  variants: {
    variant: {
      // Default pulse animation
      default: 'bg-[var(--neutral-800)] animate-pulse',
      // Shimmer effect (gradient sweep)
      shimmer:
        'bg-gradient-to-r from-[var(--neutral-800)] via-[var(--neutral-700)] to-[var(--neutral-800)] bg-[length:200%_100%] animate-shimmer',
      // Neon glow pulse
      glow: 'bg-[var(--neutral-800)] animate-pulse shadow-[var(--shadow-glow-neon-sm)]',
      // Teal glow pulse
      'glow-teal': 'bg-[var(--neutral-800)] animate-pulse shadow-[var(--shadow-glow-teal-sm)]',
      // Wave animation
      wave: 'bg-[var(--neutral-800)] relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-wave before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent',
    },
    rounded: {
      none: 'rounded-none',
      sm: 'rounded-[var(--radius-sm)]',
      default: 'rounded-[var(--radius-md)]',
      lg: 'rounded-[var(--radius-lg)]',
      full: 'rounded-full',
    },
  },
  defaultVariants: {
    variant: 'default',
    rounded: 'default',
  },
})

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof skeletonVariants>

function Skeleton({ className, variant, rounded, ...props }: SkeletonProps) {
  return <div className={cn(skeletonVariants({ variant, rounded }), className)} {...props} />
}

export { Skeleton, skeletonVariants }
