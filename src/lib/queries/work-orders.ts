import { db } from "@/lib/db";
import { workOrders, users, auditLogs } from "@/lib/db/schema";
import { and, asc, eq, gte, isNull, lte, desc, or, inArray } from "drizzle-orm";
import type { WorkOrderStatus, Priority } from "@/types";

interface WorkOrderFilters {
  dockId?: number;
  status?: string;
  priority?: string;
  assigneeId?: number;
  dueDateFrom?: string;
  dueDateTo?: string;
  assetId?: number;
}

export async function getWorkOrders(
  filters: WorkOrderFilters = {},
  userRole: string,
  userId: number
) {
  const conditions = [isNull(workOrders.deletedAt)];

  // Crew sees only their assigned work orders
  if (userRole === "crew") {
    conditions.push(eq(workOrders.assigneeId, userId));
  }

  if (filters.dockId) {
    conditions.push(eq(workOrders.dockId, filters.dockId));
  }

  if (filters.status) {
    conditions.push(
      eq(workOrders.status, filters.status as WorkOrderStatus)
    );
  }

  if (filters.priority) {
    conditions.push(
      eq(workOrders.priority, filters.priority as Priority)
    );
  }

  if (filters.assigneeId) {
    conditions.push(eq(workOrders.assigneeId, filters.assigneeId));
  }

  if (filters.dueDateFrom) {
    conditions.push(gte(workOrders.dueDate, new Date(filters.dueDateFrom)));
  }

  if (filters.dueDateTo) {
    conditions.push(lte(workOrders.dueDate, new Date(filters.dueDateTo)));
  }

  if (filters.assetId) {
    conditions.push(eq(workOrders.assetId, filters.assetId));
  }

  // Custom priority ordering: urgent first, then high, normal, low
  const priorityOrder = ["urgent", "high", "normal", "low"];

  const results = await db.query.workOrders.findMany({
    where: and(...conditions),
    with: {
      dock: true,
      asset: true,
      assignee: true,
      createdBy: true,
    },
    orderBy: [asc(workOrders.dueDate)],
  });

  // Sort by priority then due date
  return results.sort((a, b) => {
    const aPri = priorityOrder.indexOf(a.priority);
    const bPri = priorityOrder.indexOf(b.priority);
    if (aPri !== bPri) return aPri - bPri;
    // Null due dates go last
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return a.dueDate.getTime() - b.dueDate.getTime();
  });
}

export async function getWorkOrderDetail(id: number) {
  return db.query.workOrders.findFirst({
    where: eq(workOrders.id, id),
    with: {
      dock: true,
      asset: true,
      assignee: true,
      createdBy: true,
      verifiedBy: true,
      parts: true,
    },
  });
}

export async function getWorkOrderActivity(workOrderId: number) {
  const results = await db.query.auditLogs.findMany({
    where: and(
      eq(auditLogs.entityType, "work_order"),
      eq(auditLogs.entityId, workOrderId)
    ),
    with: {
      user: {
        columns: { name: true },
      },
    },
    orderBy: [desc(auditLogs.createdAt)],
  });

  return results.map((row) => ({
    id: row.id,
    action: row.action,
    metadata: row.metadata as Record<string, unknown> | null,
    userName: row.user?.name ?? "System",
    createdAt: row.createdAt,
  }));
}

export async function getCrewUsers() {
  return db.query.users.findMany({
    where: or(eq(users.role, "crew"), eq(users.role, "manager")),
    columns: {
      id: true,
      name: true,
      role: true,
    },
    orderBy: [asc(users.name)],
  });
}
