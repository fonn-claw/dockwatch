"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getNavForRole, type NavItemConfig } from "@/lib/nav-config";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Role } from "@/types";
import { cn } from "@/lib/utils";

interface SidebarNavProps {
  role: Role;
  collapsed: boolean;
}

export function SidebarNav({ role, collapsed }: SidebarNavProps) {
  const pathname = usePathname();
  const items = getNavForRole(role);

  return (
    <TooltipProvider delay={0}>
      <nav className="flex flex-col gap-1 px-2">
        {items.map((item) => (
          <NavLink
            key={item.label}
            item={item}
            active={isActive(pathname, item.href)}
            collapsed={collapsed}
          />
        ))}
      </nav>
    </TooltipProvider>
  );
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(href + "/");
}

function NavLink({
  item,
  active,
  collapsed,
}: {
  item: NavItemConfig;
  active: boolean;
  collapsed: boolean;
}) {
  const Icon = item.icon;

  const link = (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-slate-800 text-white border-l-2 border-blue-500"
          : "text-slate-300 hover:bg-slate-800/50 hover:text-white",
        collapsed && "justify-center px-2"
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger render={<span />}>{link}</TooltipTrigger>
        <TooltipContent side="right" className="font-medium">
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return link;
}
