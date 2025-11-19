import { InfoCard } from "@/components/cards/info-card";
import { Button } from "@/components/ui/button";
import type { HomeDictionary } from "@/types/dictionary";

type ContactSectionProps = {
  copy: HomeDictionary["contactSection"];
}

export function ContactSection({ copy }: ContactSectionProps) {
  return (
    <section
      id="contact"
      className="relative overflow-hidden rounded-[32px] border-4 border-white/15 bg-gradient-to-br from-[#151515] via-[#0b0b0f] to-[#1a021d] p-6 sm:p-10"
    >
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-10 top-6 h-52 w-52 rounded-full bg-lime-300/30 blur-[120px]"
          style={{ animation: "glowOrbit 18s ease-in-out infinite" }}
        />
        <div
          className="absolute right-20 bottom-10 h-40 w-40 rounded-full bg-fuchsia-500/25 blur-[120px]"
          style={{ animation: "glowOrbit 22s ease-in-out infinite" }}
        />
      </div>

      <div className="relative z-10 grid gap-10 md:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.5em] text-white/55">{copy.eyebrow}</p>
          <h2 className="text-4xl font-black">{copy.title}</h2>
          <p className="max-w-2xl text-sm text-white/75">{copy.description}</p>
          <div className="flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-[0.4em]">
            <Button asChild size="lg" className="rounded-full">
              <a href={copy.primaryCta.href}>{copy.primaryCta.label}</a>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full hover:border-fuchsia-400 hover:text-fuchsia-200">
              <a href={copy.secondaryCta.href}>{copy.secondaryCta.label}</a>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 text-sm">
          {copy.infoCards.map((card) => (
            <InfoCard key={card.label} label={card.label} content={card.content} href={card.href} />
          ))}
        </div>
      </div>
    </section>
  );
}
