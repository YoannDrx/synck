"use client";

import { cn } from "@/lib/utils";

type ExperimentCardProps = {
  title: string;
  descriptor: string;
  status: string;
  variant?: "neon" | "teal" | "emerald" | "gradient";
  className?: string;
};

const variantStyles = {
  neon: "bg-gradient-to-br from-[var(--brand-neon)] to-[var(--neon-300)]",
  teal: "bg-gradient-to-br from-[var(--brand-teal)] to-[var(--brand-ocean)]",
  emerald:
    "bg-gradient-to-br from-[var(--brand-emerald)] to-[var(--brand-green)]",
  gradient: "bg-[var(--gradient-brand)]",
};

export function ExperimentCard({
  title,
  descriptor,
  status,
  variant = "neon",
  className,
}: ExperimentCardProps) {
  return (
    <div
      className={cn(
        "relative min-w-[260px] snap-center overflow-hidden rounded-[var(--radius-2xl)]",
        "border-2 border-white/25 p-5 text-[var(--neutral-950)]",
        "shadow-[var(--shadow-xl)] transition-transform duration-[var(--duration-normal)]",
        "hover:scale-[1.02]",
        variantStyles[variant],
        className,
      )}
    >
      <div className="absolute inset-0 opacity-40 mix-blend-overlay">
        <div className="h-full w-full bg-[radial-gradient(circle,_rgba(255,255,255,0.5),_transparent_60%)]" />
      </div>
      <div className="relative z-10 flex h-full flex-col gap-4">
        <div className="text-xs uppercase tracking-[0.4em] opacity-70">
          {status}
        </div>
        <h3 className="text-2xl font-black uppercase tracking-tight">
          {title}
        </h3>
        <p className="text-sm uppercase tracking-[0.4em]">{descriptor}</p>
        <div className="mt-auto text-xs uppercase tracking-[0.4em] opacity-70">
          Scroll to engage
        </div>
      </div>
    </div>
  );
}
