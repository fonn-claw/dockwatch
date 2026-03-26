"use client";

import { Anchor, ChevronLeft, ChevronRight } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { SidebarNav } from "./sidebar-nav";
import { UserMenu } from "./user-menu";
import { useSidebarState } from "./app-shell";
import type { Role } from "@/types";
import { cn } from "@/lib/utils";

interface SidebarProps {
  name: string;
  email: string;
  role: Role;
}

export function Sidebar({ name, email, role }: SidebarProps) {
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen } = useSidebarState();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col fixed inset-y-0 left-0 z-40 bg-slate-900 transition-all duration-200",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "flex items-center h-16 border-b border-slate-700/50 shrink-0",
            collapsed ? "justify-center px-2" : "gap-3 px-4"
          )}
        >
          <Anchor className="h-7 w-7 text-blue-400 shrink-0" />
          {!collapsed && (
            <span className="text-lg font-bold text-white tracking-tight">DockWatch</span>
          )}
        </div>

        {/* Nav */}
        <div className="flex-1 py-4 overflow-y-auto">
          <SidebarNav role={role} collapsed={collapsed} />
        </div>

        {/* User Menu */}
        <UserMenu name={name} email={email} role={role} collapsed={collapsed} />

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center h-10 border-t border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </aside>

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 bg-slate-900 p-0 border-slate-700 [&>button]:text-white">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-3 h-16 px-4 border-b border-slate-700/50">
              <Anchor className="h-7 w-7 text-blue-400" />
              <span className="text-lg font-bold text-white tracking-tight">DockWatch</span>
            </div>

            {/* Nav */}
            <div className="flex-1 py-4 overflow-y-auto" onClick={() => setMobileOpen(false)}>
              <SidebarNav role={role} collapsed={false} />
            </div>

            {/* User Menu */}
            <UserMenu name={name} email={email} role={role} collapsed={false} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
