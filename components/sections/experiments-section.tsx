import { ExperimentCard } from "@/components/cards/experiment-card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Experiment {
  title: string;
  descriptor: string;
  status: string;
  palette: string;
}

interface ExperimentsSectionProps {
  experiments: Experiment[];
}

export function ExperimentsSection({ experiments }: ExperimentsSectionProps) {
  return (
    <section
      id="experiments"
      className="rounded-[32px] border-4 border-white/15 bg-[#08080f] p-6 sm:p-10"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.5em] text-white/55">
            Playground
          </p>
          <h2 className="text-3xl font-black">Research Lab</h2>
        </div>
        <p className="max-w-lg text-sm text-white/70">
          Scroll horizontally to explore ongoing experiments crafted at SYNCK
          Lab—each tile loops subtle motion and light algorithms on site.
        </p>
      </div>

      <div className="mt-8 w-full overflow-hidden">
        <div className="flex gap-6 overflow-x-auto pb-4 text-white/90 snap-x snap-mandatory">
          {experiments.map((experiment) => (
            <ExperimentCard key={experiment.title} {...experiment} />
          ))}
        </div>
      </div>
    </section>
  );
}
