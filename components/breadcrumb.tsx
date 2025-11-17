import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="mb-8" aria-label="Breadcrumb">
      <ol className="flex items-center gap-2 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-2">
              {!isLast && item.href ? (
                <>
                  <Link
                    href={item.href}
                    className="text-white/60 hover:text-lime-300 transition-colors font-medium uppercase"
                  >
                    {item.label}
                  </Link>
                  <span className="text-white/40">/</span>
                </>
              ) : (
                <span className="text-lime-300 font-bold uppercase">
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
