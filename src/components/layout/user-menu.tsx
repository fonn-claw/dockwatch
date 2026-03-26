"use client";

import { LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/lib/actions/auth";
import type { Role } from "@/types";
import { cn } from "@/lib/utils";

interface UserMenuProps {
  name: string;
  email: string;
  role: Role;
  collapsed: boolean;
}

const ROLE_COLORS: Record<Role, string> = {
  manager: "bg-blue-600 text-white hover:bg-blue-700",
  crew: "bg-green-600 text-white hover:bg-green-700",
  inspector: "bg-amber-500 text-white hover:bg-amber-600",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function UserMenu({ name, email, role, collapsed }: UserMenuProps) {
  if (collapsed) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger className="flex w-full justify-center p-2 rounded-md hover:bg-slate-800/50 transition-colors cursor-pointer">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-slate-700 text-slate-200 text-xs">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col gap-1">
              <span className="font-medium">{name}</span>
              <span className="text-xs text-muted-foreground">{email}</span>
              <Badge className={cn("w-fit text-xs", ROLE_COLORS[role])}>{role}</Badge>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => {
              const form = document.createElement("form");
              form.action = "";
              form.method = "post";
              document.body.appendChild(form);
              // Use server action via fetch
              logout();
            }}
          >
            <LogOut className="h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="px-2 py-3 border-t border-slate-700/50">
      <div className="flex items-center gap-3 px-2">
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarFallback className="bg-slate-700 text-slate-200 text-xs">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{name}</p>
          <Badge className={cn("text-[10px] px-1.5 py-0", ROLE_COLORS[role])}>{role}</Badge>
        </div>
      </div>
      <form action={logout} className="mt-2">
        <button
          type="submit"
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </form>
    </div>
  );
}
