import * as React from 'react'

import { type VariantProps, cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const inputVariants = cva(
  'flex w-full min-w-0 rounded-[var(--radius-md)] text-sm transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[var(--color-text-primary)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        // Default dark style
        default:
          'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] selection:bg-[var(--brand-neon)]/20 selection:text-[var(--color-text-primary)] focus-visible:border-[var(--brand-neon)]/50 focus-visible:ring-2 focus-visible:ring-[var(--brand-neon)]/20',
        // Glass style
        glass:
          'bg-white/5 border border-white/10 backdrop-blur-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] selection:bg-[var(--brand-neon)]/20 focus-visible:border-[var(--brand-neon)]/50 focus-visible:ring-2 focus-visible:ring-[var(--brand-neon)]/20',
        // Outline only
        outline:
          'bg-transparent border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus-visible:border-[var(--brand-neon)]/50 focus-visible:ring-2 focus-visible:ring-[var(--brand-neon)]/20',
        // Ghost (minimal)
        ghost:
          'bg-transparent border border-transparent text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] hover:bg-[var(--neutral-800)]/50 focus-visible:bg-[var(--neutral-800)]/50',
        // Neon glow on focus
        neon: 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus-visible:border-[var(--brand-neon)]/70 focus-visible:ring-2 focus-visible:ring-[var(--brand-neon)]/30 focus-visible:shadow-[var(--shadow-glow-neon-sm)]',
      },
      inputSize: {
        sm: 'h-8 px-2.5 text-xs',
        default: 'h-10 px-3',
        lg: 'h-12 px-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'default',
    },
  }
)

export type InputProps = Omit<React.ComponentProps<'input'>, 'size'> &
  VariantProps<typeof inputVariants>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, inputSize, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        data-slot="input"
        className={cn(
          inputVariants({ variant, inputSize }),
          'aria-invalid:border-[var(--color-error)] aria-invalid:ring-[var(--color-error)]/20',
          className
        )}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input, inputVariants }
