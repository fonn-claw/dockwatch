"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScheduleFormDialog } from "./schedule-form-dialog";
import { deleteSchedule } from "@/lib/actions/schedules";
import { ASSET_TYPE_LABELS } from "@/components/assets/asset-filters";
import { ShieldAlert, Pencil, Trash2 } from "lucide-react";
import type { SessionData } from "@/types";

interface Asset {
  id: number;
  name: string;
  assetType: string;
}

interface Schedule {
  id: number;
  name: string;
  description: string | null;
  assetType: string | null;
  assetId: number | null;
  frequency: string;
  season: string;
  isSafetyCritical: boolean;
  nextDueAt: Date;
  lastCompletedAt: Date | null;
  compliancePercent: number;
  statusColor: "green" | "yellow" | "red";
  assetName: string | null;
  dockName: string | null;
}

interface ScheduleTableProps {
  schedules: Schedule[];
  assets: Asset[];
  session: SessionData;
}

const FREQUENCY_LABELS: Record<string, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  annual: "Annual",
};

const SEASON_LABELS: Record<string, string> = {
  year_round: "Year Round",
  spring: "Spring",
  summer: "Summer",
  fall: "Fall",
  winter: "Winter",
};

function complianceColor(percent: number): string {
  if (percent >= 90) return "text-emerald-600";
  if (percent >= 70) return "text-yellow-600";
  return "text-red-600";
}

function statusBadgeVariant(
  color: "green" | "yellow" | "red"
): "default" | "secondary" | "destructive" | "outline" {
  if (color === "red") return "destructive";
  if (color === "yellow") return "outline";
  return "secondary";
}

function statusLabel(color: "green" | "yellow" | "red"): string {
  if (color === "red") return "Overdue";
  if (color === "yellow") return "Due Soon";
  return "On Track";
}

export function ScheduleTable({
  schedules,
  assets,
  session,
}: ScheduleTableProps) {
  const [editSchedule, setEditSchedule] = useState<Schedule | null>(null);
  const isManager = session.role === "manager";

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this schedule?")) return;
    await deleteSchedule(id);
  }

  return (
    <div>
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          {schedules.length} schedule{schedules.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Asset / Type</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Season</TableHead>
              <TableHead>Next Due</TableHead>
              <TableHead>Last Completed</TableHead>
              <TableHead>Compliance</TableHead>
              <TableHead>Safety</TableHead>
              {isManager && <TableHead className="w-20">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedules.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isManager ? 9 : 8}
                  className="h-24 text-center text-muted-foreground"
                >
                  No schedules found.
                </TableCell>
              </TableRow>
            ) : (
              schedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell className="font-medium">
                    {schedule.name}
                  </TableCell>
                  <TableCell>
                    {schedule.assetName ?? (
                      <span className="text-muted-foreground">
                        {schedule.assetType
                          ? ASSET_TYPE_LABELS[schedule.assetType] ?? schedule.assetType
                          : "---"}
                      </span>
                    )}
                    {schedule.dockName && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({schedule.dockName})
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {FREQUENCY_LABELS[schedule.frequency] ?? schedule.frequency}
                  </TableCell>
                  <TableCell>
                    {SEASON_LABELS[schedule.season] ?? schedule.season}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant(schedule.statusColor)}>
                      {format(new Date(schedule.nextDueAt), "MMM d, yyyy")}
                    </Badge>
                    <span className="ml-1.5 text-xs text-muted-foreground">
                      {statusLabel(schedule.statusColor)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {schedule.lastCompletedAt
                      ? format(
                          new Date(schedule.lastCompletedAt),
                          "MMM d, yyyy"
                        )
                      : "---"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`font-semibold ${complianceColor(schedule.compliancePercent)}`}
                    >
                      {schedule.compliancePercent}%
                    </span>
                  </TableCell>
                  <TableCell>
                    {schedule.isSafetyCritical && (
                      <ShieldAlert className="h-4 w-4 text-red-500" />
                    )}
                  </TableCell>
                  {isManager && (
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
                          onClick={() => setEditSchedule(schedule)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(schedule.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {isManager && (
        <ScheduleFormDialog
          open={editSchedule !== null}
          onOpenChange={(open) => {
            if (!open) setEditSchedule(null);
          }}
          assets={assets}
          schedule={editSchedule}
        />
      )}
    </div>
  );
}
