import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none text-sm font-bold uppercase tracking-wider ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border-2 border-white/20",
  {
    variants: {
      variant: {
        default:
          "bg-[#d5ff0a] text-black hover:bg-[#d5ff0a]/90 hover:scale-[1.02] hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] active:scale-[0.98]",
        outline:
          "border-white/20 bg-transparent text-white hover:bg-white/5 hover:scale-[1.02] hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] active:scale-[0.98]",
        secondary:
          "bg-white/10 text-white hover:bg-white/15 hover:scale-[1.02]",
        ghost: "border-none hover:bg-white/5 hover:text-white",
        link: "border-none text-[#d5ff0a] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-9 px-4",
        lg: "h-12 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
