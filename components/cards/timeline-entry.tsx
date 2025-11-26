import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type TimelineEntryProps = {
  year: string;
  role: string;
  summary: string;
  locale: string;
  tags: string[];
  className?: string;
};

export function TimelineEntry({
  year,
  role,
  summary,
  locale,
  tags,
  className,
}: TimelineEntryProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 py-5 text-sm text-[var(--color-text-secondary)]",
        "border-l-2 border-[var(--color-border)] pl-6",
        "relative before:absolute before:left-[-5px] before:top-6 before:h-2 before:w-2",
        "before:rounded-full before:bg-[var(--brand-neon)]",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between text-xs uppercase tracking-[0.4em] text-[var(--color-text-muted)]">
        <span>{year}</span>
        <span>{locale}</span>
      </div>
      <p className="text-lg font-semibold text-[var(--color-text-primary)]">
        {role}
      </p>
      <p>{summary}</p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="outline"
            size="sm"
            className="text-[0.65rem] uppercase tracking-[0.35em]"
          >
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
}
