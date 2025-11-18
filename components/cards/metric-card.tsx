import { Card } from "@/components/ui/card";

type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
}

export function MetricCard({ label, value, detail }: MetricCardProps) {
  return (
    <Card className="rounded-2xl border border-white/20 bg-black/30 p-4">
      <p className="text-xs uppercase tracking-[0.35em] text-white/60">
        {label}
      </p>
      <p className="pt-2 text-3xl font-black text-lime-200">{value}</p>
      <p className="text-xs uppercase tracking-[0.4em] text-white/50">
        {detail}
      </p>
    </Card>
  );
}
