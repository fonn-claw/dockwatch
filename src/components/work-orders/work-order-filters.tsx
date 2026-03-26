"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, X } from "lucide-react";

interface Dock {
  id: number;
  name: string;
}

interface CrewUser {
  id: number;
  name: string;
  role: string;
}

interface WorkOrderFiltersProps {
  docks: Dock[];
  users: CrewUser[];
  currentDockId?: string;
  currentStatus?: string;
  currentPriority?: string;
  currentAssigneeId?: string;
  currentDueDateFrom?: string;
  currentDueDateTo?: string;
  showAllFilters: boolean;
}

const STATUS_OPTIONS = [
  { value: "created", label: "Created" },
  { value: "assigned", label: "Assigned" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "verified", label: "Verified" },
];

const PRIORITY_OPTIONS = [
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "High" },
  { value: "normal", label: "Normal" },
  { value: "low", label: "Low" },
];

export function WorkOrderFilters({
  docks,
  users,
  currentDockId,
  currentStatus,
  currentPriority,
  currentAssigneeId,
  currentDueDateFrom,
  currentDueDateTo,
  showAllFilters,
}: WorkOrderFiltersProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const hasActiveFilters =
    currentDockId || currentStatus || currentPriority || currentAssigneeId || currentDueDateFrom || currentDueDateTo;

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams();
    const current: Record<string, string | undefined> = {
      dockId: currentDockId,
      status: currentStatus,
      priority: currentPriority,
      assigneeId: currentAssigneeId,
      dueDateFrom: currentDueDateFrom,
      dueDateTo: currentDueDateTo,
    };
    current[key] = value || undefined;

    for (const [k, v] of Object.entries(current)) {
      if (v) params.set(k, v);
    }

    const qs = params.toString();
    router.push(qs ? `/work-orders?${qs}` : "/work-orders");
  }

  function clearFilters() {
    router.push("/work-orders");
  }

  return (
    <div className="space-y-3">
      {/* Mobile toggle */}
      <div className="flex items-center gap-2 sm:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="min-h-[44px]"
        >
          <Filter className="h-4 w-4 mr-1.5" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1.5 h-2 w-2 rounded-full bg-primary" />
          )}
        </Button>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="min-h-[44px]"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Filter grid -- always visible on desktop, toggled on mobile */}
      <div className={`${isOpen ? "block" : "hidden"} sm:block`}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {/* Status */}
          <Select
            value={currentStatus ?? ""}
            onValueChange={(val) => updateFilter("status", val as string)}
          >
            <SelectTrigger className="w-full min-h-[44px] sm:min-h-0">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All statuses</SelectItem>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Priority */}
          <Select
            value={currentPriority ?? ""}
            onValueChange={(val) => updateFilter("priority", val as string)}
          >
            <SelectTrigger className="w-full min-h-[44px] sm:min-h-0">
              <SelectValue placeholder="All priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All priorities</SelectItem>
              {PRIORITY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Dock -- manager only */}
          {showAllFilters && (
            <Select
              value={currentDockId ?? ""}
              onValueChange={(val) => updateFilter("dockId", val as string)}
            >
              <SelectTrigger className="w-full min-h-[44px] sm:min-h-0">
                <SelectValue placeholder="All docks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All docks</SelectItem>
                {docks.map((dock) => (
                  <SelectItem key={dock.id} value={String(dock.id)}>
                    {dock.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Assignee -- manager only */}
          {showAllFilters && (
            <Select
              value={currentAssigneeId ?? ""}
              onValueChange={(val) => updateFilter("assigneeId", val as string)}
            >
              <SelectTrigger className="w-full min-h-[44px] sm:min-h-0">
                <SelectValue placeholder="All assignees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All assignees</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={String(user.id)}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Date range -- manager only */}
          {showAllFilters && (
            <>
              <div>
                <Input
                  type="date"
                  value={currentDueDateFrom ?? ""}
                  onChange={(e) => updateFilter("dueDateFrom", e.target.value)}
                  placeholder="Due from"
                  className="min-h-[44px] sm:min-h-0"
                />
              </div>
              <div>
                <Input
                  type="date"
                  value={currentDueDateTo ?? ""}
                  onChange={(e) => updateFilter("dueDateTo", e.target.value)}
                  placeholder="Due to"
                  className="min-h-[44px] sm:min-h-0"
                />
              </div>
            </>
          )}
        </div>

        {/* Clear filters -- desktop */}
        {hasActiveFilters && (
          <div className="hidden sm:flex mt-2">
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
