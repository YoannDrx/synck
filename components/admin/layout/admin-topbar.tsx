"use client";

import { ChevronRightIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import type { AuthenticatedUser } from "@/lib/api/with-auth";

type AdminTopBarProps = {
  locale: string;
  onToggleSidebar?: () => void;
};

export function AdminTopBar({
  locale,
  onToggleSidebar,
}: AdminTopBarProps) {
  const pathname = usePathname();

  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = () => {
    if (!pathname) return [];

    const segments = pathname.split("/").filter(Boolean);
    // Remove locale from segments
    const pathSegments = segments.slice(1); // Skip locale

    const breadcrumbs = [
      {
        label: "Admin",
        href: `/${locale}/admin`,
      },
    ];

    let currentPath = `/${locale}/admin`;

    for (const segment of pathSegments) {
      // Skip "admin" as it's already in the first breadcrumb
      if (segment === "admin") continue;

      currentPath += `/${segment}`;

      // Capitalize and format segment
      const label = segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      breadcrumbs.push({
        label,
        href: currentPath,
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-black/80 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="lg:hidden rounded border border-white/15 px-2 py-1 text-white/70 hover:border-white/40 hover:text-white"
              aria-label="Ouvrir le menu"
            >
              ☰
            </button>
          )}
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;

            return (
              <div key={crumb.href} className="flex items-center gap-2">
                {index > 0 && (
                  <ChevronRightIcon className="h-4 w-4 text-white/30" />
                )}
                {isLast ? (
                  <span className="font-medium text-white">{crumb.label}</span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="text-white/60 hover:text-white"
                  >
                    {crumb.label}
                  </Link>
                )}
              </div>
            );
          })}
          </nav>
      </div>

        <div className="w-10" />
      </div>
    </header>
  );
}
