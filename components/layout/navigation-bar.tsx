"use client";

interface NavSection {
  id: string;
  label: string;
}

interface NavigationBarProps {
  sections: readonly NavSection[];
  activeSection: string;
}

export function NavigationBar({ sections, activeSection }: NavigationBarProps) {
  return (
    <nav className="sticky top-28 hidden flex-col gap-4 lg:flex">
      <div className="text-xs uppercase tracking-[0.4em] text-white/45">
        Navigate SYNCK
      </div>
      {sections.map((link, index) => (
        <a
          key={link.id}
          href={`#${link.id}`}
          className={`relative flex items-center gap-3 rounded-2xl border border-white/15 px-5 py-4 text-[0.65rem] font-semibold uppercase tracking-[0.35em] transition-all ${
            activeSection === link.id
              ? "border-lime-300 text-white"
              : "text-white/45"
          }`}
        >
          <span className="text-white/35">{`0${index + 1}`}</span>
          <span>{link.label}</span>
          <span
            className={`ml-auto h-[2px] w-8 origin-left bg-lime-300 transition ${
              activeSection === link.id
                ? "scale-x-100 opacity-100"
                : "scale-x-0 opacity-0"
            }`}
          />
        </a>
      ))}
    </nav>
  );
}
