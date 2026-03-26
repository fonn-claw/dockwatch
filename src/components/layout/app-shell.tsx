"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { Sidebar } from "./sidebar";
import type { Role } from "@/types";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "dockwatch-sidebar-collapsed";

interface SidebarContextValue {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

const SidebarContext = createContext<SidebarContextValue>({
  collapsed: false,
  setCollapsed: () => {},
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

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "true") setCollapsedState(true);
  }, []);

  function setCollapsed(v: boolean) {
    setCollapsedState(v);
    localStorage.setItem(STORAGE_KEY, String(v));
  }

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      <div className="min-h-screen bg-slate-50">
        <Sidebar name={name} email={email} role={role} />
        <div
          className={cn(
            "min-h-screen flex flex-col transition-all duration-200",
            collapsed ? "lg:pl-16" : "lg:pl-64"
          )}
        >
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
