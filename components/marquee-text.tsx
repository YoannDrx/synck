interface MarqueeTextProps {
  items: string[];
}

export function MarqueeText({ items }: MarqueeTextProps) {
  return (
    <div className="overflow-hidden rounded-full border-2 border-white/20 bg-white/5 py-4">
      <div
        className="flex w-max items-center gap-8 px-6 text-xs font-black uppercase tracking-[0.6em]"
        style={{ animation: "marquee 28s linear infinite" }}
      >
        {[0, 1].map((loop) =>
          items.map((item) => (
            <span key={`${loop}-${item}`} className="flex items-center gap-4">
              <span className="h-2 w-2 rounded-full bg-lime-300" />
              <span>{item}</span>
            </span>
          ))
        )}
      </div>
    </div>
  );
}
