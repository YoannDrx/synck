import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-neon)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary - Neon yellow
        default:
          "bg-[var(--brand-neon)] text-[var(--neutral-950)] hover:bg-[var(--neon-300)] shadow-md hover:shadow-[var(--shadow-glow-neon-sm)] active:scale-[0.98]",
        // Neon with glow
        neon: "bg-[var(--brand-neon)] text-[var(--neutral-950)] shadow-[var(--shadow-glow-neon-md)] hover:shadow-[var(--shadow-glow-neon-lg)] active:scale-[0.98]",
        // Secondary - Emerald
        secondary:
          "bg-[var(--brand-emerald)] text-white hover:bg-[var(--brand-green)] shadow-md active:scale-[0.98]",
        // Outline
        outline:
          "border border-[var(--color-border)] bg-transparent text-[var(--color-text-primary)] hover:border-[var(--brand-neon)]/50 hover:text-[var(--brand-neon)] active:scale-[0.98]",
        // Ghost
        ghost:
          "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--neutral-800)]/50",
        // Link
        link: "text-[var(--brand-emerald)] hover:text-[var(--brand-green)] underline-offset-4 hover:underline",
        // Gradient neon to emerald
        gradient:
          "bg-[var(--gradient-neon)] text-[var(--neutral-950)] hover:shadow-[var(--shadow-glow-neon-md)] active:scale-[0.98]",
        // Gradient teal
        "gradient-teal":
          "bg-[var(--gradient-teal)] text-white hover:shadow-[var(--shadow-glow-teal-md)] active:scale-[0.98]",
        // Destructive
        destructive:
          "bg-[var(--color-error)] text-white hover:bg-[var(--color-error)]/90 active:scale-[0.98]",
      },
      size: {
        sm: "h-8 px-3 text-sm rounded-[var(--radius-md)] gap-1.5",
        default: "h-10 px-4 text-sm rounded-[var(--radius-md)] gap-2",
        lg: "h-12 px-6 text-base rounded-[var(--radius-lg)] gap-2",
        xl: "h-14 px-8 text-lg rounded-[var(--radius-xl)] gap-3",
        icon: "h-10 w-10 rounded-[var(--radius-md)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonProps = {
  asChild?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
