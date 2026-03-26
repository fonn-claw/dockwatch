"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown } from "lucide-react";

interface ComplianceSchedule {
  id: number;
  name: string;
  frequency: string;
  lastCompletedAt: Date | string | null;
  nextDueAt: Date | string;
  isSafetyCritical: boolean;
  assetName: string | null;
  dockName: string | null;
  compliancePercent: number | null;
  status: "overdue" | "due_soon" | "on_track";
}

interface ComplianceTableProps {
  schedules: ComplianceSchedule[];
}

type SortKey = "name" | "frequency" | "nextDueAt" | "compliancePercent" | "status";

const STATUS_CONFIG = {
  overdue: { label: "Overdue", variant: "destructive" as const, className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
  due_soon: { label: "Due Soon", variant: "secondary" as const, className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  on_track: { label: "On Track", variant: "secondary" as const, className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
};

function formatDate(date: Date | string | null): string {
  if (!date) return "Never";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ComplianceTable({ schedules }: ComplianceTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("nextDueAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sorted = [...schedules].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    switch (sortKey) {
      case "name":
        return dir * a.name.localeCompare(b.name);
      case "frequency":
        return dir * a.frequency.localeCompare(b.frequency);
      case "nextDueAt":
        return dir * (new Date(a.nextDueAt).getTime() - new Date(b.nextDueAt).getTime());
      case "compliancePercent":
        return dir * ((a.compliancePercent ?? -1) - (b.compliancePercent ?? -1));
      case "status": {
        const order = { overdue: 0, due_soon: 1, on_track: 2 };
        return dir * (order[a.status] - order[b.status]);
      }
      default:
        return 0;
    }
  });

  const SortHeader = ({ label, field }: { label: string; field: SortKey }) => (
    <button
      className="flex items-center gap-1 hover:text-foreground"
      onClick={() => toggleSort(field)}
    >
      {label}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  );

  return (
    <div className="rounded-lg border overflow-x-auto">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead><SortHeader label="Name" field="name" /></TableHead>
          <TableHead>Asset</TableHead>
          <TableHead><SortHeader label="Frequency" field="frequency" /></TableHead>
          <TableHead>Last Completed</TableHead>
          <TableHead><SortHeader label="Next Due" field="nextDueAt" /></TableHead>
          <TableHead><SortHeader label="Compliance" field="compliancePercent" /></TableHead>
          <TableHead><SortHeader label="Status" field="status" /></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
              No schedules found for this period
            </TableCell>
          </TableRow>
        ) : (
          sorted.map((s) => {
            const config = STATUS_CONFIG[s.status];
            const compColor =
              s.compliancePercent === null
                ? "text-muted-foreground"
                : s.compliancePercent >= 90
                ? "text-green-600"
                : s.compliancePercent >= 70
                ? "text-yellow-600"
                : "text-red-600";

            return (
              <TableRow key={s.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  {s.name}
                  {s.isSafetyCritical && (
                    <span className="ml-2 inline-block w-2 h-2 rounded-full bg-red-500" title="Safety Critical" />
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {s.assetName ?? "N/A"}
                  {s.dockName && (
                    <span className="text-xs text-muted-foreground/70 ml-1">
                      ({s.dockName})
                    </span>
                  )}
                </TableCell>
                <TableCell className="capitalize">{s.frequency}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(s.lastCompletedAt)}
                </TableCell>
                <TableCell>{formatDate(s.nextDueAt)}</TableCell>
                <TableCell>
                  <span className={`font-medium ${compColor}`}>
                    {s.compliancePercent !== null
                      ? `${s.compliancePercent}%`
                      : "N/A"}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${config.className}`}>
                    {config.label}
                  </span>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
    </div>
  );
}
