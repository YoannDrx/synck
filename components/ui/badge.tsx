import * as React from 'react'

import { type VariantProps, cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand-neon)]/50 focus:ring-offset-2',
  {
    variants: {
      variant: {
        // Default neutral
        default:
          'bg-[var(--neutral-800)] text-[var(--neutral-300)] border border-[var(--neutral-700)]',
        // Neon yellow (primary)
        neon: 'bg-[var(--brand-neon)]/15 text-[var(--brand-neon)] border border-[var(--brand-neon)]/30',
        // Green (success)
        green:
          'bg-[var(--brand-green)]/15 text-[var(--brand-green)] border border-[var(--brand-green)]/30',
        // Emerald
        emerald:
          'bg-[var(--brand-emerald)]/15 text-[var(--brand-emerald)] border border-[var(--brand-emerald)]/30',
        // Teal (info)
        teal: 'bg-[var(--brand-teal)]/15 text-[var(--brand-teal)] border border-[var(--brand-teal)]/30',
        // Ocean
        ocean:
          'bg-[var(--brand-ocean)]/15 text-[var(--brand-ocean)] border border-[var(--brand-ocean)]/30',
        // Slate (muted)
        slate:
          'bg-[var(--brand-slate)]/30 text-[var(--neutral-300)] border border-[var(--brand-slate)]',
        // Outline only
        outline: 'border border-[var(--neutral-700)] text-[var(--neutral-400)] bg-transparent',
        // Secondary (white tinted)
        secondary: 'border border-white/20 bg-white/5 text-white/80 hover:bg-white/10',
        // Destructive
        destructive:
          'bg-[var(--color-error)]/15 text-[var(--color-error)] border border-[var(--color-error)]/30',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs rounded-[var(--radius-sm)]',
        default: 'px-2.5 py-1 text-xs rounded-[var(--radius-md)]',
        lg: 'px-3 py-1.5 text-sm rounded-[var(--radius-md)]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export type BadgeProps = React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
}

export { Badge, badgeVariants }
