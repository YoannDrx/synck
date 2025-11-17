interface RitualCardProps {
  focus: string;
  headline: string;
  copy: string;
}

export function RitualCard({ focus, headline, copy }: RitualCardProps) {
  return (
    <div className="rounded-3xl border-2 border-white/15 bg-gradient-to-br from-[#101018] via-[#0a0a12] to-[#050508] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)] transition-all hover:border-white/25 hover:shadow-[0_25px_70px_rgba(0,0,0,0.55)]">
      <p className="text-xs uppercase tracking-[0.4em] text-lime-200">{focus}</p>
      <p className="py-3 text-2xl font-semibold">{headline}</p>
      <p className="text-sm text-white/70">{copy}</p>
    </div>
  );
}
