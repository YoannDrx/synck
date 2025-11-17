interface FooterProps {
  text: string;
}

export function Footer({ text }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="flex flex-col gap-4 text-xs uppercase tracking-[0.4em] text-white/50">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      <p>SYNCK © {year} — {text}</p>
    </footer>
  );
}
