"use server";

import { z } from "zod/v4";
import { db } from "@/lib/db";
import { workOrders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/guards";
import { logAudit } from "./audit";
import { canTransition, isForwardTransition } from "@/lib/work-order-transitions";
import type { WorkOrderStatus } from "@/types";

const createWorkOrderSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional().default(""),
  type: z.enum(["preventive", "corrective", "inspection", "emergency"]),
  priority: z.enum(["urgent", "high", "normal", "low"]),
  dockId: z.coerce.number().int().positive(),
  assetId: z.coerce.number().int().positive().optional(),
  assigneeId: z.coerce.number().int().positive().optional(),
  dueDate: z.string().optional().default(""),
  notes: z.string().optional().default(""),
});

export async function createWorkOrder(
  _prevState: { error?: string; success?: boolean; id?: number } | null,
  formData: FormData
) {
  const session = await requireRole(["manager"]);

  const raw = {
    title: formData.get("title"),
    description: formData.get("description"),
    type: formData.get("type"),
    priority: formData.get("priority"),
    dockId: formData.get("dockId"),
    assetId: formData.get("assetId") || undefined,
    assigneeId: formData.get("assigneeId") || undefined,
    dueDate: formData.get("dueDate"),
    notes: formData.get("notes"),
  };

  const parsed = createWorkOrderSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Invalid input. Please check all fields." };
  }

  const data = parsed.data;
  const status: WorkOrderStatus = data.assigneeId ? "assigned" : "created";

  const [inserted] = await db
    .insert(workOrders)
    .values({
      title: data.title,
      description: data.description || null,
      type: data.type,
      priority: data.priority,
      status,
      dockId: data.dockId,
      assetId: data.assetId ?? null,
      assigneeId: data.assigneeId ?? null,
      createdById: session.userId,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      notes: data.notes || null,
    })
    .returning({ id: workOrders.id });

  await logAudit({
    userId: session.userId,
    action: "create",
    entityType: "work_order",
    entityId: inserted.id,
    metadata: { title: data.title, type: data.type, priority: data.priority },
  });

  revalidatePath("/work-orders");
  return { success: true, id: inserted.id };
}

export async function transitionWorkOrder(
  id: number,
  newStatus: string,
  notes?: string
) {
  const session = await requireRole(["manager", "crew"]);

  const wo = await db.query.workOrders.findFirst({
    where: eq(workOrders.id, id),
  });

  if (!wo) {
    return { error: "Work order not found" };
  }

  const fromStatus = wo.status as WorkOrderStatus;
  const toStatus = newStatus as WorkOrderStatus;

  if (!canTransition(fromStatus, toStatus)) {
    return { error: `Cannot transition from ${fromStatus} to ${toStatus}` };
  }

  if (toStatus === "verified" && session.role !== "manager") {
    return { error: "Only managers can verify work orders" };
  }

  const updates: Record<string, unknown> = {
    status: toStatus,
    updatedAt: new Date(),
  };

  // Forward transition timestamps
  if (toStatus === "in_progress") {
    updates.startedAt = new Date();
  }
  if (toStatus === "completed") {
    updates.completedAt = new Date();
  }
  if (toStatus === "verified") {
    updates.verifiedAt = new Date();
    updates.verifiedById = session.userId;
  }

  // Backward transitions: clear downstream timestamps
  if (!isForwardTransition(fromStatus, toStatus)) {
    if (fromStatus === "completed" && toStatus === "in_progress") {
      updates.completedAt = null;
    }
    if (fromStatus === "in_progress" && toStatus === "assigned") {
      updates.startedAt = null;
    }
    if (fromStatus === "assigned" && toStatus === "created") {
      updates.assigneeId = null;
    }
  }

  if (notes) {
    updates.notes = notes;
  }

  await db
    .update(workOrders)
    .set(updates)
    .where(eq(workOrders.id, id));

  await logAudit({
    userId: session.userId,
    action: "transition",
    entityType: "work_order",
    entityId: id,
    metadata: { from: fromStatus, to: toStatus, notes },
  });

  revalidatePath("/work-orders");
  revalidatePath(`/work-orders/${id}`);
  return { success: true };
}
