import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
  accent?: "neon" | "teal" | "emerald";
  className?: string;
};

const accentColors = {
  neon: "text-[var(--brand-neon)]",
  teal: "text-[var(--brand-teal)]",
  emerald: "text-[var(--brand-emerald)]",
};

export function MetricCard({
  label,
  value,
  detail,
  accent = "neon",
  className,
}: MetricCardProps) {
  return (
    <Card
      variant="glass"
      padding="sm"
      className={cn("rounded-[var(--radius-xl)]", className)}
    >
      <p className="text-xs uppercase tracking-[0.35em] text-[var(--color-text-muted)]">
        {label}
      </p>
      <p className={cn("pt-2 text-3xl font-black", accentColors[accent])}>
        {value}
      </p>
      <p className="text-xs uppercase tracking-[0.4em] text-[var(--color-text-muted)]">
        {detail}
      </p>
    </Card>
  );
}
