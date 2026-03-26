"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { Sidebar } from "./sidebar";
import { Anchor, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Role } from "@/types";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "dockwatch-sidebar-collapsed";

interface SidebarContextValue {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

const SidebarContext = createContext<SidebarContextValue>({
  collapsed: false,
  setCollapsed: () => {},
  mobileOpen: false,
  setMobileOpen: () => {},
});

export function useSidebarState() {
  return useContext(SidebarContext);
}

interface AppShellProps {
  name: string;
  email: string;
  role: Role;
  children: React.ReactNode;
}

export function AppShell({ name, email, role, children }: AppShellProps) {
  const [collapsed, setCollapsedState] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "true") setCollapsedState(true);
  }, []);

  function setCollapsed(v: boolean) {
    setCollapsedState(v);
    localStorage.setItem(STORAGE_KEY, String(v));
  }

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed, mobileOpen, setMobileOpen }}>
      <div className="min-h-screen bg-slate-50">
        <Sidebar name={name} email={email} role={role} />
        <div
          className={cn(
            "min-h-screen flex flex-col transition-all duration-200",
            collapsed ? "lg:pl-16" : "lg:pl-64"
          )}
        >
          {/* Mobile header bar */}
          <header className="sticky top-0 z-30 flex items-center gap-3 h-14 px-4 bg-white border-b border-slate-200 lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 min-h-[44px] min-w-[44px]"
              aria-label="Open navigation menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Anchor className="h-5 w-5 text-blue-400" />
            <span className="font-semibold text-slate-900 tracking-tight">DockWatch</span>
          </header>
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
