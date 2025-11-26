import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const textareaVariants = cva(
  "flex w-full min-h-24 rounded-[var(--radius-md)] text-sm transition-all outline-none resize-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        // Default dark style
        default:
          "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] selection:bg-[var(--brand-neon)]/20 selection:text-[var(--color-text-primary)] focus-visible:border-[var(--brand-neon)]/50 focus-visible:ring-2 focus-visible:ring-[var(--brand-neon)]/20",
        // Glass style
        glass:
          "bg-white/5 border border-white/10 backdrop-blur-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] selection:bg-[var(--brand-neon)]/20 focus-visible:border-[var(--brand-neon)]/50 focus-visible:ring-2 focus-visible:ring-[var(--brand-neon)]/20",
        // Outline only
        outline:
          "bg-transparent border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus-visible:border-[var(--brand-neon)]/50 focus-visible:ring-2 focus-visible:ring-[var(--brand-neon)]/20",
        // Neon glow on focus
        neon: "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus-visible:border-[var(--brand-neon)]/70 focus-visible:ring-2 focus-visible:ring-[var(--brand-neon)]/30 focus-visible:shadow-[var(--shadow-glow-neon-sm)]",
      },
      textareaSize: {
        sm: "px-2.5 py-2 text-xs min-h-20",
        default: "px-3 py-2.5 min-h-24",
        lg: "px-4 py-3 text-base min-h-32",
      },
    },
    defaultVariants: {
      variant: "default",
      textareaSize: "default",
    },
  },
);

export type TextareaProps = React.ComponentProps<"textarea"> &
  VariantProps<typeof textareaVariants>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, textareaSize, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        data-slot="textarea"
        className={cn(
          textareaVariants({ variant, textareaSize }),
          "aria-invalid:border-[var(--color-error)] aria-invalid:ring-[var(--color-error)]/20",
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea, textareaVariants };
