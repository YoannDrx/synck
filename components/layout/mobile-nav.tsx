'use client'

type NavSection = {
  id: string
  label: string
}

type MobileNavProps = {
  sections: readonly NavSection[]
  activeSection: string
}

export function MobileNav({ sections, activeSection }: MobileNavProps) {
  return (
    <div className="mb-6 flex flex-wrap gap-3 text-xs tracking-[0.3em] text-white/55 uppercase lg:hidden">
      {sections.map((link) => (
        <a
          key={link.id}
          href={`#${link.id}`}
          className={`rounded-full border px-4 py-2 transition-all ${
            activeSection === link.id
              ? 'border-[var(--brand-neon)] text-[var(--neon-200)]'
              : 'border-white/20 text-white/60'
          }`}
        >
          {link.label}
        </a>
      ))}
    </div>
  )
}
