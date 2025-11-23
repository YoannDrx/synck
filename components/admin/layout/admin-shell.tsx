"use client";

import { useState, useEffect } from "react";
import type { AdminDictionary } from "@/types/dictionary";
import { AdminSidebar } from "@/components/admin/layout/admin-sidebar";
import { AdminTopBar } from "@/components/admin/layout/admin-topbar";
import { GlobalSearch } from "@/components/admin/global-search";
import { Toaster } from "@/components/ui/sonner";

type AdminShellProps = {
  locale: string;
  dict: AdminDictionary;
  userEmail: string;
  userName?: string | null;
  avatarUrl?: string | null;
  children: React.ReactNode;
};

export function AdminShell({
  locale,
  dict,
  userEmail,
  userName,
  avatarUrl,
  children,
}: AdminShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <AdminSidebar
        locale={locale}
        dict={dict}
        userEmail={userEmail}
        userName={userName}
        avatarUrl={avatarUrl}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={() => {
          setCollapsed((prev) => !prev);
        }}
        onCloseMobile={() => {
          setMobileOpen(false);
        }}
      />

      <div className="lg:ml-64">
        <AdminTopBar
          locale={locale}
          onToggleSidebar={() => {
            setMobileOpen((prev) => !prev);
          }}
        />
        <main className="p-4 md:p-6">{children}</main>
      </div>

      <GlobalSearch locale={locale} />
      <Toaster />
    </div>
  );
}
