import * as React from 'react'

import { type VariantProps, cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const cardVariants = cva('rounded-[var(--radius-lg)] transition-all', {
  variants: {
    variant: {
      // Default
      default:
        'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)]',
      // Elevated with shadow
      elevated:
        'bg-[var(--color-surface-elevated)] border border-[var(--color-border)] shadow-[var(--shadow-lg)] text-[var(--color-text-primary)]',
      // Outline only
      outline:
        'bg-transparent border border-[var(--color-border)] hover:border-[var(--neutral-700)] text-[var(--color-text-primary)]',
      // Ghost (subtle)
      ghost:
        'bg-[var(--color-surface)]/50 border border-transparent text-[var(--color-text-primary)]',
      // Glassmorphism
      glass: 'bg-white/5 border border-white/10 backdrop-blur-sm text-[var(--color-text-primary)]',
      // Glow neon
      'glow-neon':
        'bg-[var(--color-surface)] border border-[var(--brand-neon)]/20 shadow-[var(--shadow-glow-neon-sm)] text-[var(--color-text-primary)]',
      // Glow teal
      'glow-teal':
        'bg-[var(--color-surface)] border border-[var(--brand-emerald)]/20 shadow-[var(--shadow-glow-teal-sm)] text-[var(--color-text-primary)]',
      // Gradient background
      gradient:
        'bg-[var(--gradient-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)]',
    },
    padding: {
      none: 'p-0',
      sm: 'p-4',
      default: 'p-6',
      lg: 'p-8',
    },
    hover: {
      none: '',
      lift: 'hover:-translate-y-1 hover:shadow-[var(--shadow-xl)]',
      glow: 'hover:border-[var(--brand-neon)]/30 hover:shadow-[var(--shadow-glow-neon-sm)]',
      'glow-teal':
        'hover:border-[var(--brand-emerald)]/30 hover:shadow-[var(--shadow-glow-teal-sm)]',
      border: 'hover:border-[var(--neutral-700)]',
      scale: 'hover:scale-[1.02]',
    },
  },
  defaultVariants: {
    variant: 'default',
    padding: 'none',
    hover: 'none',
  },
})

export type CardProps = React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants>

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, hover, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, padding, hover }), className)}
      {...props}
    />
  )
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  )
)
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('text-2xl font-semibold text-[var(--color-text-primary)]', className)}
      {...props}
    />
  )
)
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('text-sm text-[var(--color-text-secondary)]', className)}
      {...props}
    />
  )
)
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
)
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
  )
)
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants }
