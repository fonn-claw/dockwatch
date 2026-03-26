import {
  LayoutDashboard,
  ClipboardList,
  Anchor,
  Calendar,
  ShieldCheck,
  FileText,
  DollarSign,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/types";

export interface NavItemConfig {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: Role[];
}

export const NAV_ITEMS: NavItemConfig[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["manager"] },
  { label: "Work Orders", href: "/work-orders", icon: ClipboardList, roles: ["manager"] },
  { label: "My Work Orders", href: "/work-orders", icon: ClipboardList, roles: ["crew"] },
  { label: "Assets", href: "/assets", icon: Anchor, roles: ["manager", "crew", "inspector"] },
  { label: "Schedules", href: "/schedules", icon: Calendar, roles: ["manager"] },
  { label: "Compliance", href: "/compliance", icon: ShieldCheck, roles: ["manager", "inspector"] },
  { label: "Audit Trail", href: "/compliance/audit", icon: FileText, roles: ["inspector"] },
  { label: "Cost Reports", href: "/reports", icon: DollarSign, roles: ["manager"] },
];

export function getNavForRole(role: Role): NavItemConfig[] {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}
