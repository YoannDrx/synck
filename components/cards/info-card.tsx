import { Card } from "@/components/ui/card";

interface InfoCardProps {
  label: string;
  content: string;
}

export function InfoCard({ label, content }: InfoCardProps) {
  return (
    <Card className="rounded-2xl border border-white/20 bg-black/30 p-4">
      <p className="text-xs uppercase tracking-[0.4em] text-white/60">{label}</p>
      <p className="text-lg font-semibold text-white">{content}</p>
    </Card>
  );
}
