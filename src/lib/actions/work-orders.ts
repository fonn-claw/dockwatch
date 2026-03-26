"use server";

import { z } from "zod/v4";
import { db } from "@/lib/db";
import { workOrders, workOrderParts } from "@/lib/db/schema";
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

const addPartSchema = z.object({
  name: z.string().min(1).max(255),
  quantity: z.coerce.number().int().positive().default(1),
  unitCost: z.coerce.number().positive(),
  notes: z.string().optional().default(""),
});

export async function addPart(workOrderId: number, formData: FormData) {
  const session = await requireRole(["manager", "crew"]);

  const raw = {
    name: formData.get("name"),
    quantity: formData.get("quantity"),
    unitCost: formData.get("unitCost"),
    notes: formData.get("notes"),
  };

  const parsed = addPartSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Invalid part data. Check all fields." };
  }

  const wo = await db.query.workOrders.findFirst({
    where: eq(workOrders.id, workOrderId),
    columns: { id: true, deletedAt: true },
  });

  if (!wo || wo.deletedAt) {
    return { error: "Work order not found" };
  }

  await db.insert(workOrderParts).values({
    workOrderId,
    name: parsed.data.name,
    quantity: parsed.data.quantity,
    unitCost: Math.round(parsed.data.unitCost * 100),
    notes: parsed.data.notes || null,
  });

  await logAudit({
    userId: session.userId,
    action: "add_part",
    entityType: "work_order",
    entityId: workOrderId,
    metadata: {
      partName: parsed.data.name,
      quantity: parsed.data.quantity,
      unitCost: parsed.data.unitCost,
    },
  });

  revalidatePath(`/work-orders/${workOrderId}`);
  return { success: true };
}

export async function removePart(partId: number, workOrderId: number) {
  const session = await requireRole(["manager", "crew"]);

  await db.delete(workOrderParts).where(eq(workOrderParts.id, partId));

  await logAudit({
    userId: session.userId,
    action: "remove_part",
    entityType: "work_order",
    entityId: workOrderId,
    metadata: { partId },
  });

  revalidatePath(`/work-orders/${workOrderId}`);
  return { success: true };
}

export async function updateTimeSpent(workOrderId: number, minutes: number) {
  const session = await requireRole(["manager", "crew"]);

  if (!Number.isInteger(minutes) || minutes < 0) {
    return { error: "Minutes must be a positive integer" };
  }

  await db
    .update(workOrders)
    .set({ timeSpentMinutes: minutes, updatedAt: new Date() })
    .where(eq(workOrders.id, workOrderId));

  await logAudit({
    userId: session.userId,
    action: "update_time",
    entityType: "work_order",
    entityId: workOrderId,
    metadata: { minutes },
  });

  revalidatePath(`/work-orders/${workOrderId}`);
  return { success: true };
}

export async function updateWorkOrderNotes(
  workOrderId: number,
  notes: string
) {
  const session = await requireRole(["manager", "crew"]);

  await db
    .update(workOrders)
    .set({ notes, updatedAt: new Date() })
    .where(eq(workOrders.id, workOrderId));

  await logAudit({
    userId: session.userId,
    action: "update_notes",
    entityType: "work_order",
    entityId: workOrderId,
  });

  revalidatePath(`/work-orders/${workOrderId}`);
  return { success: true };
}
