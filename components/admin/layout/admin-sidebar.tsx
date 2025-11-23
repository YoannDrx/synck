"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  HomeIcon,
  MusicIcon,
  UsersIcon,
  FolderIcon,
  TagIcon,
  BookOpenIcon,
  ImageIcon,
  LogOutIcon,
  SettingsIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminDictionary } from "@/types/dictionary";

type AdminSidebarProps = {
  locale: string;
  dict: AdminDictionary;
  userEmail: string;
  userName?: string | null;
  avatarUrl?: string | null;
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
};

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  group?: "content" | "system";
};

export function AdminSidebar({
  locale,
  dict,
  userEmail,
  userName,
  avatarUrl,
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      href: `/${locale}/admin`,
      label: dict.nav.dashboard,
      icon: HomeIcon,
    },
    {
      href: `/${locale}/admin/projets`,
      label: dict.nav.albums,
      icon: MusicIcon,
      group: "content",
    },
    {
      href: `/${locale}/admin/compositeurs`,
      label: dict.nav.composers,
      icon: UsersIcon,
      group: "content",
    },
    {
      href: `/${locale}/admin/categories`,
      label: dict.nav.categories,
      icon: FolderIcon,
      group: "content",
    },
    {
      href: `/${locale}/admin/labels`,
      label: dict.nav.labels,
      icon: TagIcon,
      group: "content",
    },
    {
      href: `/${locale}/admin/expertises`,
      label: dict.nav.expertises,
      icon: BookOpenIcon,
      group: "content",
    },
    {
      href: `/${locale}/admin/medias`,
      label: "Médias",
      icon: ImageIcon,
      group: "system",
    },
    {
      href: `/${locale}/admin/settings`,
      label: "Paramètres",
      icon: SettingsIcon,
      group: "system",
    },
  ];

  const contentItems = navItems.filter((item) => item.group === "content");
  const systemItems = navItems.filter((item) => item.group === "system");
  const dashboardItem = navItems.find((item) => !item.group);

  const isActive = (href: string) => {
    if (href === `/${locale}/admin`) {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <>
      {/* Backdrop mobile */}
      <div
        className={cn(
          "fixed inset-0 z-30 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onCloseMobile}
      />

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen border-r border-lime-300/10 bg-black transition-all duration-200",
          collapsed ? "w-16" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-lime-300/10 px-4 py-4">
          <div className="flex items-center gap-3 overflow-hidden">
            {!collapsed && (
              <>
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={userName ?? userEmail}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-white">
                      {userEmail?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="transition-all">
                  <h1 className="text-sm font-semibold text-white">
                    {userName ?? "Admin"}
                  </h1>
                  <p className="text-xs text-white/50 truncate max-w-[140px]">
                    {userEmail}
                  </p>
                </div>
              </>
            )}
          </div>
            <button
              type="button"
              onClick={onToggleCollapse}
              className="rounded border border-white/10 px-2 py-1 text-xs text-white/60 hover:border-white/30 hover:text-white"
              aria-label={collapsed ? "Ouvrir le menu" : "Réduire le menu"}
            >
              {collapsed ? "›" : "‹"}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-6 overflow-y-auto p-2">
            {/* Dashboard */}
            {dashboardItem && (
              <Link
                href={dashboardItem.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive(dashboardItem.href)
                    ? "border-l-2 border-lime-300 bg-lime-300/10 text-lime-300"
                    : "text-white/70 hover:bg-white/5 hover:text-white",
                )}
                onClick={onCloseMobile}
              >
                <dashboardItem.icon className="h-5 w-5" />
                {!collapsed && dashboardItem.label}
              </Link>
            )}

            {/* Content Section */}
            {contentItems.length > 0 && (
              <div>
                {!collapsed && (
                  <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-white/30">
                    Contenu
                  </div>
                )}
                <div className="space-y-1">
                  {contentItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive(item.href)
                          ? "border-l-2 border-lime-300 bg-lime-300/10 text-lime-300"
                          : "text-white/70 hover:bg-white/5 hover:text-white",
                      )}
                      onClick={onCloseMobile}
                    >
                      <item.icon className="h-5 w-5" />
                      {!collapsed && item.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* System Section */}
            {systemItems.length > 0 && (
              <div>
                {!collapsed && (
                  <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-white/30">
                    Système
                  </div>
                )}
                <div className="space-y-1">
                  {systemItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive(item.href)
                          ? "border-l-2 border-lime-300 bg-lime-300/10 text-lime-300"
                          : "text-white/70 hover:bg-white/5 hover:text-white",
                      )}
                      onClick={onCloseMobile}
                    >
                      <item.icon className="h-5 w-5" />
                      {!collapsed && item.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </nav>

          {/* Footer - Logout */}
          <div className="border-t border-lime-300/10 p-2">
            <form action="/api/auth/sign-out" method="POST">
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                onClick={onCloseMobile}
              >
                <LogOutIcon className="h-5 w-5" />
                {!collapsed && dict.nav.logout}
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
