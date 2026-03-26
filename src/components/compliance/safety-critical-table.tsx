"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle } from "lucide-react";

interface SafetySchedule {
  id: number;
  name: string;
  assetName: string | null;
  nextDueAt: Date | string;
  isSafetyCritical: boolean;
  compliancePercent: number | null;
  status: "overdue" | "due_soon" | "on_track";
}

interface SafetyCriticalTableProps {
  schedules: SafetySchedule[];
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const STATUS_LABELS: Record<string, string> = {
  overdue: "Overdue",
  due_soon: "Due Soon",
  on_track: "On Track",
};

export function SafetyCriticalTable({ schedules }: SafetyCriticalTableProps) {
  if (schedules.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
        <AlertTriangle className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Safety-Critical Items</h2>
        <span className="text-sm text-muted-foreground font-normal">
          ({schedules.length} items)
        </span>
      </div>
      <div className="rounded-lg border border-red-200 dark:border-red-900/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-red-50/50 dark:bg-red-950/20">
              <TableHead>Name</TableHead>
              <TableHead>Asset</TableHead>
              <TableHead>Next Due</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Compliance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedules.map((s) => {
              const isOverdue = s.status === "overdue";
              const statusColor =
                s.status === "overdue"
                  ? "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400"
                  : s.status === "due_soon"
                  ? "text-yellow-700 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400"
                  : "text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400";
              const compColor =
                s.compliancePercent === null
                  ? "text-muted-foreground"
                  : s.compliancePercent >= 90
                  ? "text-green-600"
                  : s.compliancePercent >= 70
                  ? "text-yellow-600"
                  : "text-red-600";

              return (
                <TableRow
                  key={s.id}
                  className={`border-l-4 border-l-red-500 ${
                    isOverdue ? "bg-red-50/30 dark:bg-red-950/10" : ""
                  }`}
                >
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {s.assetName ?? "N/A"}
                  </TableCell>
                  <TableCell>{formatDate(s.nextDueAt)}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColor}`}
                    >
                      {STATUS_LABELS[s.status]}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`font-medium ${compColor}`}>
                      {s.compliancePercent !== null
                        ? `${s.compliancePercent}%`
                        : "N/A"}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
