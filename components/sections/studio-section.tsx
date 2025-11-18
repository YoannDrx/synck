import { RitualCard } from "@/components/cards/ritual-card";
import { TimelineEntry as TimelineEntryComponent } from "@/components/cards/timeline-entry";

type StudioRitual = {
  focus: string;
  headline: string;
  copy: string;
}

type TimelineEntry = {
  year: string;
  role: string;
  summary: string;
  locale: string;
  tags: string[];
}

type StudioSectionProps = {
  rituals: StudioRitual[];
  timeline: TimelineEntry[];
  eyebrow: string;
  timelineTitle: string;
  timelineStatus: string;
}

export function StudioSection({ rituals, timeline, eyebrow, timelineTitle, timelineStatus }: StudioSectionProps) {
  return (
    <section
      id="studio"
      className="rounded-[32px] border-4 border-white/15 bg-[#0c0b12]/80 p-6 shadow-[0_25px_60px_rgba(0,0,0,0.6)] sm:p-10"
    >
      <div className="flex flex-col gap-10 lg:grid lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-6">
          <div className="text-xs uppercase tracking-[0.5em] text-white/55">{eyebrow}</div>
          <div className="space-y-5">
            {rituals.map((ritual) => (
              <RitualCard key={ritual.headline} {...ritual} />
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border-2 border-white/15 bg-white/5 p-6">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.4em] text-white/60">
            <span>{timelineTitle}</span>
            <span>{timelineStatus}</span>
          </div>
          <div className="mt-6 divide-y divide-white/15">
            {timeline.map((entry) => (
              <TimelineEntryComponent key={entry.year} {...entry} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
