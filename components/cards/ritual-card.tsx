import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type RitualCardProps = {
  focus: string;
  headline: string;
  copy: string;
  className?: string;
};

export function RitualCard({
  focus,
  headline,
  copy,
  className,
}: RitualCardProps) {
  return (
    <Card
      variant="gradient"
      hover="border"
      padding="default"
      className={cn(
        "rounded-[var(--radius-2xl)] border-2 shadow-[var(--shadow-xl)]",
        "transition-all duration-[var(--duration-normal)]",
        "hover:shadow-[var(--shadow-2xl)]",
        className,
      )}
    >
      <p className="text-xs uppercase tracking-[0.4em] text-[var(--brand-neon)]">
        {focus}
      </p>
      <p className="py-3 text-2xl font-semibold text-[var(--color-text-primary)]">
        {headline}
      </p>
      <p className="text-sm text-[var(--color-text-secondary)]">{copy}</p>
    </Card>
  );
}
