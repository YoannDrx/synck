import { Badge } from "@/components/ui/badge";

interface ProjectCardProps {
  name: string;
  subtitle: string;
  description: string;
  cycle: string;
  accent: string;
  tags: string[];
}

export function ProjectCard({
  name,
  subtitle,
  description,
  cycle,
  accent,
  tags,
}: ProjectCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-[28px] border-4 border-white/10 bg-[#0a0a0e] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.65)] transition duration-300 hover:-translate-y-2 hover:border-lime-300/70 hover:shadow-[0_30px_90px_rgba(213,255,10,0.15)]">
      <div
        className={`absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-70 bg-gradient-to-br ${accent}`}
      />
      <div className="relative z-10 flex h-full flex-col gap-6">
        <div className="flex items-center justify-between text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-white/60">
          <span>{subtitle}</span>
          <span>{cycle}</span>
        </div>
        <h3 className="text-3xl font-bold">{name}</h3>
        <p className="text-sm text-white/75">{description}</p>
        <div className="mt-auto flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="text-[0.6rem] uppercase tracking-[0.3em]"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
