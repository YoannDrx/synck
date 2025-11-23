"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        className:
          "border-2 border-lime-300/80 bg-black text-white shadow-lg shadow-lime-300/10 backdrop-blur-sm",
        descriptionClassName: "text-white/80",
        duration: 4000,
      }}
      icons={{
        success: <CircleCheckIcon className="size-4 text-lime-300" />,
        info: <InfoIcon className="size-4 text-white" />,
        warning: <TriangleAlertIcon className="size-4 text-orange-300" />,
        error: <OctagonXIcon className="size-4 text-red-400" />,
        loading: <Loader2Icon className="size-4 animate-spin text-white" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
