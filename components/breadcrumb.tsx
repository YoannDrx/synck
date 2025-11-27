import Link from 'next/link'

export type BreadcrumbItem = {
  label: string
  href?: string
}

type BreadcrumbProps = {
  items: BreadcrumbItem[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="mb-8" aria-label="Breadcrumb">
      <ol className="flex items-center gap-2 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={index} className="flex items-center gap-2">
              {!isLast && item.href ? (
                <>
                  <Link
                    href={item.href}
                    className="font-medium text-white/60 uppercase transition-colors hover:text-[var(--brand-neon)]"
                  >
                    {item.label}
                  </Link>
                  <span className="text-white/40">/</span>
                </>
              ) : (
                <span className="font-bold text-[var(--brand-neon)] uppercase">{item.label}</span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
