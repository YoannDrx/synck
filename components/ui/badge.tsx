import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-none border-2 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-[#d5ff0a]/30 bg-[#d5ff0a]/10 text-[#d5ff0a] hover:bg-[#d5ff0a]/20",
        secondary:
          "border-white/20 bg-white/5 text-white/80 hover:bg-white/10",
        destructive:
          "border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500/20",
        outline: "border-white/30 text-white/70",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export type BadgeProps = {} & React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
