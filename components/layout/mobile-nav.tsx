"use client";

type NavSection = {
  id: string;
  label: string;
}

type MobileNavProps = {
  sections: readonly NavSection[];
  activeSection: string;
}

export function MobileNav({ sections, activeSection }: MobileNavProps) {
  return (
    <div className="mb-6 flex flex-wrap gap-3 text-xs uppercase tracking-[0.3em] text-white/55 lg:hidden">
      {sections.map((link) => (
        <a
          key={link.id}
          href={`#${link.id}`}
          className={`rounded-full border px-4 py-2 transition-all ${
            activeSection === link.id
              ? "border-lime-300 text-lime-200"
              : "border-white/20 text-white/60"
          }`}
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}
