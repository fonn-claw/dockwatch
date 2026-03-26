"use client";

import { WorkOrderCard } from "./work-order-card";
import { ClipboardList } from "lucide-react";

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

interface WorkOrderListProps {
  workOrders: WorkOrderData[];
}

export function WorkOrderList({ workOrders }: WorkOrderListProps) {
  if (workOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ClipboardList className="h-12 w-12 text-muted-foreground/50 mb-3" />
        <h3 className="text-lg font-medium text-foreground">No work orders found</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Try adjusting your filters or create a new work order.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {workOrders.length} work order{workOrders.length !== 1 ? "s" : ""}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workOrders.map((wo) => (
          <WorkOrderCard key={wo.id} workOrder={wo} />
        ))}
      </div>
    </div>
  );
}
