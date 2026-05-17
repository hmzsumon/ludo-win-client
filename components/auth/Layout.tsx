"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";

import BottomNav from "../dashboard/bottom-nav";
import AuthTopBar from "./AuthTopBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // single source of truth for mobile drawer open/close
  const [mobileOpen, setMobileOpen] = useState(false);

  // desktop sidebar width reacts to global collapse state
  const collapsed = useSelector((s: any) => s.ui.sidebarCollapsed) as boolean;

  return (
    <div className="min-h-screen w-full text-neutral-100 ">
      {/* pass open + toggle to header so icon swaps (Menu/X) */}
      {/* <Header open={mobileOpen} onToggle={() => setMobileOpen((v) => !v)} /> */}

      {/* push content below fixed header */}
      <div className="w-full">
        {/* desktop sidebar is a column, not overlay */}
        {/* <aside className="hidden md:block">
          <DesktopSidebar />
        </aside> */}

        <AuthTopBar />

        <main className="min-h-screen w-full md:flex md:items-start md:justify-center md:px-0 md:py-6 lg:px-10 lg:py-8">
          <div className="relative w-full md:w-[430px] md:max-w-[430px] pb-10">
            {children}
            <BottomNav />
          </div>
        </main>
      </div>

      {/* mobile drawer (starts just below header) */}
      {/* <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} /> */}
    </div>
  );
}
