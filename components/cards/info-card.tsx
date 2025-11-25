import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type InfoCardProps = {
  label: string;
  content: string;
  href?: string;
  className?: string;
};

export function InfoCard({ label, content, href, className }: InfoCardProps) {
  return (
    <Card
      variant="glass"
      padding="sm"
      className={cn("rounded-[var(--radius-xl)]", className)}
    >
      <p className="text-xs uppercase tracking-[0.4em] text-[var(--color-text-muted)]">
        {label}
      </p>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-lg font-semibold text-white underline-offset-4 transition-colors hover:text-white/80 hover:underline"
        >
          {content}
        </a>
      ) : (
        <p className="text-lg font-semibold text-[var(--color-text-primary)]">
          {content}
        </p>
      )}
    </Card>
  );
}
