"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { motion, type TargetAndTransition } from "framer-motion";
import { MetricCard } from "@/components/cards/metric-card";
import { Button } from "@/components/ui/button";
import type { HomeHeroDictionary } from "@/types/dictionary";

type MorphPhase = "intro" | "morph" | "locked";

const ORIGINAL_TEXT = "Caroline SENYK";
const FINAL_WORD = "SYNCK";
const MORPH_LETTERS = [
  { char: "S", index: 9 },
  { char: "Y", index: 12 },
  { char: "N", index: 11 },
  { char: "C", index: 0 },
  { char: "K", index: 13 },
] as const;
const FINAL_LETTERS = MORPH_LETTERS.map(({ char }) => char);
const exitVector = (index: number) => {
  const horizontal = (index % 2 === 0 ? -1 : 1) * (24 + index * 3);
  const vertical = (index % 3 === 0 ? -1 : 1) * (18 + index * 2.5);
  return { x: horizontal, y: vertical };
};

let hasNameMorphLinePlayed = false;

const NameMorphLine = () => {
  const [shouldAnimate] = useState(() => !hasNameMorphLinePlayed);
  const [phase, setPhase] = useState<MorphPhase>(() => (shouldAnimate ? "intro" : "locked"));
  const [offsets, setOffsets] = useState<Record<number, number>>({});
  const initialRefs = useRef<Record<number, HTMLSpanElement | null>>({});
  const finalRefs = useRef<Record<string, HTMLSpanElement | null>>({});

  const initialLetters = useMemo(
    () =>
      Array.from(ORIGINAL_TEXT).map((char, index) => ({
        char,
        index,
        isSpace: char === " ",
      })),
    []
  );

  const morphLookup = useMemo(() => {
    const map = new Map<number, { char: string; order: number }>();
    MORPH_LETTERS.forEach((entry, order) => {
      map.set(entry.index, { char: entry.char, order });
    });
    return map;
  }, []);

  useEffect(() => {
    if (!shouldAnimate) {
      return;
    }

    const morphTimer = setTimeout(() => setPhase("morph"), 1400);
    const lockTimer = setTimeout(() => setPhase("locked"), 3200);
    return () => {
      clearTimeout(morphTimer);
      clearTimeout(lockTimer);
    };
  }, [shouldAnimate]);

  useEffect(() => {
    if (phase === "locked" && shouldAnimate) {
      hasNameMorphLinePlayed = true;
    }
  }, [phase, shouldAnimate]);

  useLayoutEffect(() => {
    if (!shouldAnimate) {
      return;
    }

    const updateOffsets = () => {
      const next: Record<number, number> = {};
      MORPH_LETTERS.forEach(({ index, char }, order) => {
        const origin = initialRefs.current[index];
        const target = finalRefs.current[char];
        if (origin && target) {
          const diff = target.getBoundingClientRect().left - origin.getBoundingClientRect().left;
          next[index] = diff;
        } else {
          next[index] = order * 60 - index * 6;
        }
      });
      setOffsets(next);
    };

    const frame = requestAnimationFrame(updateOffsets);
    window.addEventListener("resize", updateOffsets);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", updateOffsets);
    };
  }, [shouldAnimate]);

  if (!shouldAnimate && phase === "locked") {
    return (
      <div className="relative inline-flex min-h-[1.1em] w-full flex-col text-left text-2xl uppercase tracking-[0.08em] leading-[1.05] sm:text-5xl sm:tracking-[0.22em] lg:text-6xl lg:tracking-[0.26em]">
        <span className="sr-only">{FINAL_WORD}</span>
        <div className="flex gap-[0.04em] whitespace-nowrap sm:gap-[0.08em]">
          {FINAL_LETTERS.map((char, order) => (
            <span key={`final-static-${char}-${order}`} className="text-white">
              {char}
            </span>
          ))}
        </div>
      </div>
    );
  }

  const isMorphing = phase === "morph";

  return (
    <div className="relative inline-flex min-h-[1.1em] w-full flex-col text-left text-2xl uppercase tracking-[0.08em] leading-[1.05] sm:text-5xl sm:tracking-[0.22em] lg:text-6xl lg:tracking-[0.26em]">
      <span className="sr-only">{FINAL_WORD}</span>

      <div className="flex flex-nowrap gap-[0.04em] whitespace-nowrap text-left tracking-[0.12em] sm:gap-[0.08em] sm:tracking-[0.25em]">
        {initialLetters.map((letter) => {
          const mapping = morphLookup.get(letter.index);
          const exit = exitVector(letter.index);
          const animateProps: TargetAndTransition =
            phase === "intro"
              ? {
                  opacity: 1,
                  y: 0,
                  x: 0,
                  transition: {
                    delay: letter.index * 0.035,
                    type: "spring",
                    stiffness: 480,
                    damping: 32,
                  },
                }
              : mapping
              ? {
                  x: offsets[letter.index] ?? 0,
                  opacity: 1,
                  y: 0,
                  transition: isMorphing
                    ? {
                        delay: 0.12 + mapping.order * 0.08,
                        duration: 0.6,
                        ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
                      }
                    : undefined,
                }
              : {
                  opacity: 0,
                  x: exit.x,
                  y: exit.y,
                  rotate: exit.x > 0 ? 10 : -12,
                  scale: 0.82,
                  transition: isMorphing
                    ? {
                        duration: 0.65,
                        delay: 0.15 + letter.index * 0.03,
                        ease: [0.22, 0.61, 0.36, 1] as [number, number, number, number],
                      }
                    : undefined,
                };

          const initialState = shouldAnimate
            ? { opacity: 0, y: 26 }
            : {
                opacity: mapping ? 1 : 0,
                y: 0,
              };

          return (
            <motion.span
              key={`origin-${letter.index}-${letter.char}`}
              ref={(node) => {
                initialRefs.current[letter.index] = node;
              }}
              className={`relative inline-flex ${letter.isSpace ? "w-1.5 sm:w-3" : "text-white"}`}
              initial={initialState}
              animate={animateProps}
            >
              {letter.isSpace ? "\u00A0" : letter.char}
            </motion.span>
          );
        })}
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 flex gap-[0.2em] whitespace-nowrap tracking-[0.4em] opacity-0"
      >
        {MORPH_LETTERS.map(({ char }) => (
          <span
            key={`ghost-${char}`}
            ref={(node) => {
              finalRefs.current[char] = node;
            }}
            className="inline-block"
          >
            {char}
          </span>
        ))}
      </div>
    </div>
  );
};

interface HeroSectionProps {
  metrics: {
    label: string;
    value: string;
    detail: string;
  }[];
  hero: HomeHeroDictionary;
}

export function HeroSection({ metrics, hero }: HeroSectionProps) {
  const [glow, setGlow] = useState({ x: 45, y: 50 });

  const handleGlow = (event: PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setGlow({ x, y });
  };

  return (
    <section
      id="hero"
      className="relative overflow-hidden rounded-[32px] border-4 border-white/15 bg-[#08080d] px-6 py-12 shadow-[0_25px_80px_rgba(0,0,0,0.6)] sm:px-10"
      onPointerMove={handleGlow}
    >
      <div
        className="absolute inset-0 opacity-80 transition-all duration-300"
        style={{
          background: `radial-gradient(circle at ${glow.x}% ${glow.y}%, rgba(213,255,10,0.3), transparent 45%), radial-gradient(circle at 90% 10%, rgba(255,75,162,0.25), transparent 45%)`,
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.05),transparent_65%)]" />
      <div className="absolute -left-32 top-6 h-64 w-64 rounded-full bg-fuchsia-500/30 blur-[140px]" />
      <div className="absolute bottom-0 right-10 h-40 w-40 rounded-full bg-lime-300/30 blur-[120px]" />

      <div className="relative z-10 grid gap-12 lg:grid-cols-[1.2fr,0.8fr]">
        <div className="space-y-8 min-w-0">
          {hero.eyebrow.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.5em] text-white/70">
              <span className="h-2 w-2 rounded-full bg-lime-300 shadow-[0_0_12px_rgba(213,255,10,0.9)]" />
              {hero.eyebrow.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
          )}
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.6em] text-white/50">{hero.role}</p>
            <h1 className="text-5xl font-black text-white sm:text-6xl lg:text-7xl">
              <NameMorphLine />
            </h1>
            <p className="max-w-2xl text-lg text-white/80">{hero.description}</p>
          </div>
          <div className="flex flex-wrap gap-4 text-[0.75rem] font-semibold uppercase tracking-[0.35em]">
            <Button asChild size="lg" className="rounded-full">
              <a href="#projects">{hero.ctas.projets}</a>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full">
              <a href="#contact">{hero.ctas.contact}</a>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full">
              <a href="/cv-caroline-senyk.pdf" download>
                {hero.ctas.downloadCv}
              </a>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {metrics.map((metric) => (
              <MetricCard key={metric.label} {...metric} />
            ))}
          </div>
        </div>

        <div className="relative flex flex-col gap-6 rounded-[28px] border-2 border-white/20 bg-white/5 p-6 text-sm backdrop-blur min-w-0">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.4em] text-white/50">
            <span>{hero.status.title}</span>
            <span>{hero.status.year}</span>
          </div>
          <p className="text-3xl font-semibold text-white">{hero.status.headline}</p>
          <div className="space-y-3 text-xs uppercase tracking-[0.35em] text-white/60">
            <div>
              <span className="block text-white/50">{hero.status.expertiseLabel}</span>
              <span className="block text-white pt-1">{hero.status.expertiseValue}</span>
            </div>
            <div className="border-t border-white/10 pt-3">
              <span className="block text-white/50">{hero.status.organizationsLabel}</span>
              <span className="block text-white pt-1">{hero.status.organizationsValue}</span>
            </div>
            <div className="border-t border-white/10 pt-3">
              <span className="block text-white/50">{hero.status.availabilityLabel}</span>
              <span className="block text-lime-200 pt-1">{hero.status.availabilityValue}</span>
            </div>
          </div>
          <div className="rounded-2xl border border-white/15 bg-black/40 p-4 text-xs uppercase tracking-[0.35em] text-white/70 leading-relaxed">
            <span className="block text-white/50">{hero.status.servicesLabel}</span>
            <span className="block font-bold text-white pt-2">{hero.status.servicesValue}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
