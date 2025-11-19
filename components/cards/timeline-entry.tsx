import { Badge } from "@/components/ui/badge";

type TimelineEntryProps = {
  year: string;
  role: string;
  summary: string;
  locale: string;
  tags: string[];
}

export function TimelineEntry({
  year,
  role,
  summary,
  locale,
  tags,
}: TimelineEntryProps) {
  return (
    <div className="flex flex-col gap-3 py-5 text-sm text-white/70">
      <div className="flex flex-wrap items-center justify-between text-xs uppercase tracking-[0.4em] text-white/50">
        <span>{year}</span>
        <span>{locale}</span>
      </div>
      <p className="text-lg font-semibold text-white">{role}</p>
      <p>{summary}</p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="outline"
            className="text-[0.65rem] uppercase tracking-[0.35em]"
          >
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
}
