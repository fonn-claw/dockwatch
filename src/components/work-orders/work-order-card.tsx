"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PriorityBadge } from "./priority-badge";
import { StatusBadge } from "./status-badge";
import { transitionWorkOrder } from "@/lib/actions/work-orders";
import { VALID_TRANSITIONS } from "@/lib/work-order-transitions";
import type { WorkOrderStatus } from "@/types";
import { MapPin, User, Calendar, Wrench } from "lucide-react";
import { format, isPast, isToday } from "date-fns";

interface WorkOrderData {
  id: number;
  title: string;
  description: string | null;
  status: string;
  type: string;
  priority: string;
  dueDate: string | null;
  notes: string | null;
  dock: { id: number; name: string } | null;
  asset: { id: number; name: string } | null;
  assignee: { id: number; name: string } | null;
  createdBy: { id: number; name: string } | null;
}

const PRIORITY_BORDER: Record<string, string> = {
  urgent: "border-l-red-500",
  high: "border-l-orange-500",
  normal: "border-l-blue-500",
  low: "border-l-gray-400",
};

export function WorkOrderCard({ workOrder }: { workOrder: WorkOrderData }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const validNext = VALID_TRANSITIONS[workOrder.status as WorkOrderStatus] ?? [];
  const isForward = (to: string) => {
    const order = ["created", "assigned", "in_progress", "completed", "verified"];
    return order.indexOf(to) > order.indexOf(workOrder.status);
  };

  function handleTransition(newStatus: string) {
    // Backward transitions need confirmation
    if (!isForward(newStatus)) {
      const confirmed = window.confirm(
        `Move this work order backward to "${newStatus.replace("_", " ")}"? This will clear some progress data.`
      );
      if (!confirmed) return;
    }

    setError(null);
    startTransition(async () => {
      const result = await transitionWorkOrder(workOrder.id, newStatus);
      if (result.error) {
        setError(result.error);
      }
    });
  }

  const dueDate = workOrder.dueDate ? new Date(workOrder.dueDate) : null;
  const isOverdue = dueDate && isPast(dueDate) && !isToday(dueDate) && workOrder.status !== "completed" && workOrder.status !== "verified";

  return (
    <Card className={`border-l-4 hover:shadow-md transition-shadow ${PRIORITY_BORDER[workOrder.priority] ?? "border-l-gray-400"}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/work-orders/${workOrder.id}`}
            className="min-h-[44px] flex items-center hover:underline"
          >
            <CardTitle className="text-base leading-tight">
              {workOrder.title}
            </CardTitle>
          </Link>
          <div className="flex items-center gap-1.5 shrink-0">
            <PriorityBadge priority={workOrder.priority} />
            <StatusBadge status={workOrder.status} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-1.5 text-sm text-muted-foreground">
          {workOrder.asset && (
            <div className="flex items-center gap-1.5">
              <Wrench className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{workOrder.asset.name}</span>
            </div>
          )}
          {workOrder.dock && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span>{workOrder.dock.name}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 shrink-0" />
            <span>{workOrder.assignee?.name ?? "Unassigned"}</span>
          </div>
          {dueDate && (
            <div className={`flex items-center gap-1.5 ${isOverdue ? "text-red-600 font-medium" : ""}`}>
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span>
                {isOverdue ? "Overdue: " : "Due: "}
                {format(dueDate, "MMM d, yyyy")}
              </span>
            </div>
          )}
        </div>

        {/* Status transition */}
        {validNext.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1 border-t">
            {validNext.map((nextStatus) => (
              <button
                key={nextStatus}
                onClick={() => handleTransition(nextStatus)}
                disabled={isPending}
                className={`min-h-[44px] px-3 py-2 text-xs font-medium rounded-md border transition-colors disabled:opacity-50 ${
                  isForward(nextStatus)
                    ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                    : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                }`}
              >
                {isPending ? "..." : `Move to ${nextStatus.replace(/_/g, " ")}`}
              </button>
            ))}
          </div>
        )}

        {error && (
          <p className="text-xs text-red-600 mt-1">{error}</p>
        )}
      </CardContent>
    </Card>
  );
}
