"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { RitualCard } from "@/components/cards/ritual-card";
import { TimelineEntry as TimelineEntryComponent } from "@/components/cards/timeline-entry";
import { cn } from "@/lib/utils";

type StudioRitual = {
  focus: string;
  headline: string;
  copy: string;
};

type TimelineEntry = {
  year: string;
  role: string;
  summary: string;
  locale: string;
  tags: string[];
};

type StudioSectionProps = {
  rituals: StudioRitual[];
  timeline: TimelineEntry[];
  eyebrow: string;
  timelineTitle: string;
  timelineStatus: string;
};

const ritualAccents = [
  {
    border: "border-[#d5ff0a]/30",
    glow: "hover:shadow-[0_0_30px_rgba(213,255,10,0.2)]",
  },
  {
    border: "border-[#4ecdc4]/30",
    glow: "hover:shadow-[0_0_30px_rgba(78,205,196,0.2)]",
  },
  {
    border: "border-[#a855f7]/30",
    glow: "hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]",
  },
];

function AnimatedRitualCard({
  ritual,
  index,
}: {
  ritual: StudioRitual;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const accent = ritualAccents[index % ritualAccents.length];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -40 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{
        duration: 0.6,
        delay: index * 0.15,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <RitualCard
        {...ritual}
        className={cn(
          accent.border,
          accent.glow,
          "transition-all duration-300 hover:-translate-y-1",
        )}
      />
    </motion.div>
  );
}

function AnimatedTimelineEntry({
  entry,
  index,
}: {
  entry: TimelineEntry;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: 30 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <TimelineEntryComponent {...entry} />
    </motion.div>
  );
}

export function StudioSection({
  rituals,
  timeline,
  eyebrow,
  timelineTitle,
  timelineStatus,
}: StudioSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [0, 1, 1, 0.3],
  );
  const y = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [60, 0, 0, -30]);
  const scale = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [0.95, 1, 1, 0.98],
  );

  return (
    <motion.section
      ref={sectionRef}
      id="studio"
      style={{ opacity, y, scale }}
      className="rounded-[32px] border-4 border-white/15 bg-[#0c0b12]/80 p-6 shadow-[0_25px_60px_rgba(0,0,0,0.6)] sm:p-10 will-change-transform"
    >
      <div className="flex flex-col gap-10 lg:grid lg:grid-cols-[1.1fr,0.9fr]">
        {/* Rituals Column */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-xs uppercase tracking-[0.5em] text-white/55"
          >
            {eyebrow}
          </motion.div>
          <div className="space-y-5">
            {rituals.map((ritual, index) => (
              <AnimatedRitualCard
                key={ritual.headline}
                ritual={ritual}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* Timeline Column */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="rounded-[28px] border-2 border-white/15 bg-white/5 p-6 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.4em] text-white/60">
            <motion.span
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.4 }}
            >
              {timelineTitle}
            </motion.span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-2"
            >
              <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--brand-neon)]" />
              {timelineStatus}
            </motion.span>
          </div>
          <div className="mt-6 divide-y divide-white/15">
            {timeline.map((entry, index) => (
              <AnimatedTimelineEntry
                key={entry.year}
                entry={entry}
                index={index}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
