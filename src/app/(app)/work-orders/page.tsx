import { requireRole } from "@/lib/auth/guards";
import { getWorkOrders, getCrewUsers } from "@/lib/queries/work-orders";
import { getDocks } from "@/lib/queries/assets";
import { WorkOrderFilters } from "@/components/work-orders/work-order-filters";
import { WorkOrderList } from "@/components/work-orders/work-order-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

interface WorkOrdersPageProps {
  searchParams: Promise<{
    dockId?: string;
    status?: string;
    priority?: string;
    assigneeId?: string;
    dueDateFrom?: string;
    dueDateTo?: string;
  }>;
}

export default async function WorkOrdersPage({ searchParams }: WorkOrdersPageProps) {
  const session = await requireRole(["manager", "crew"]);
  const params = await searchParams;

  const filters = {
    dockId: params.dockId ? Number(params.dockId) : undefined,
    status: params.status || undefined,
    priority: params.priority || undefined,
    assigneeId: params.assigneeId ? Number(params.assigneeId) : undefined,
    dueDateFrom: params.dueDateFrom || undefined,
    dueDateTo: params.dueDateTo || undefined,
  };

  const [workOrders, docks, users] = await Promise.all([
    getWorkOrders(filters, session.role, session.userId),
    getDocks(),
    getCrewUsers(),
  ]);

  const isManager = session.role === "manager";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isManager ? "Work Orders" : "My Work Orders"}
          </h1>
          <p className="text-muted-foreground">
            {isManager
              ? "Create, assign, and track maintenance work orders"
              : "View and update your assigned work orders"}
          </p>
        </div>
        {isManager && (
          <Button render={<Link href="/work-orders/new" />} className="min-h-[44px]">
            <Plus className="h-4 w-4 mr-1.5" />
            New Work Order
          </Button>
        )}
      </div>

      <WorkOrderFilters
        docks={JSON.parse(JSON.stringify(docks))}
        users={JSON.parse(JSON.stringify(users))}
        currentDockId={params.dockId}
        currentStatus={params.status}
        currentPriority={params.priority}
        currentAssigneeId={params.assigneeId}
        currentDueDateFrom={params.dueDateFrom}
        currentDueDateTo={params.dueDateTo}
        showAllFilters={isManager}
      />

      <WorkOrderList
        workOrders={JSON.parse(JSON.stringify(workOrders))}
      />
    </div>
  );
}
