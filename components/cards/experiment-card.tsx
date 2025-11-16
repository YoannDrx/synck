interface ExperimentCardProps {
  title: string;
  descriptor: string;
  status: string;
  palette: string;
}

export function ExperimentCard({
  title,
  descriptor,
  status,
  palette,
}: ExperimentCardProps) {
  return (
    <div
      className={`relative min-w-[260px] snap-center overflow-hidden rounded-3xl border-2 border-white/25 bg-gradient-to-br ${palette} p-5 text-black shadow-[0_20px_60px_rgba(0,0,0,0.45)] transition-transform hover:scale-[1.02]`}
    >
      <div className="absolute inset-0 opacity-40 mix-blend-overlay">
        <div className="h-full w-full bg-[radial-gradient(circle,_rgba(255,255,255,0.5),_transparent_60%)]" />
      </div>
      <div className="relative z-10 flex h-full flex-col gap-4">
        <div className="text-xs uppercase tracking-[0.4em] text-black/70">
          {status}
        </div>
        <h3 className="text-2xl font-black uppercase tracking-tight">{title}</h3>
        <p className="text-sm uppercase tracking-[0.4em]">{descriptor}</p>
        <div className="mt-auto text-xs uppercase tracking-[0.4em] text-black/70">
          Scroll to engage
        </div>
      </div>
    </div>
  );
}
