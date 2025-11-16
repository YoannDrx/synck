import { Card } from "@/components/ui/card";

interface InfoCardProps {
  label: string;
  content: string;
  href?: string;
}

export function InfoCard({ label, content, href }: InfoCardProps) {
  return (
    <Card className="rounded-2xl border border-white/20 bg-black/30 p-4">
      <p className="text-xs uppercase tracking-[0.4em] text-white/60">{label}</p>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-lg font-semibold text-lime-200 underline-offset-4 hover:underline"
        >
          {content}
        </a>
      ) : (
        <p className="text-lg font-semibold text-white">{content}</p>
      )}
    </Card>
  );
}
