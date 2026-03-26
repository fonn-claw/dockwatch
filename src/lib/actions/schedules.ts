"use server";

import { z } from "zod/v4";
import { db } from "@/lib/db";
import { maintenanceSchedules, workOrders, assets } from "@/lib/db/schema";
import { and, eq, inArray, isNull, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/guards";
import { logAudit } from "./audit";
import { SEASON_MONTHS } from "@/lib/constants/budgets";
import {
  addWeeks,
  addMonths,
  addYears,
  format,
} from "date-fns";

// ── Schemas ──────────────────────────────────────────────────────────────

const scheduleSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional().default(""),
  assetType: z.enum([
    "piling",
    "electrical_pedestal",
    "water_connection",
    "dock_light",
    "fire_extinguisher",
    "fuel_pump",
    "cleat",
    "bumper",
    "gangway",
    "other",
  ]).optional(),
  assetId: z.coerce.number().int().positive().optional(),
  frequency: z.enum(["weekly", "monthly", "quarterly", "annual"]),
  season: z.enum(["spring", "summer", "fall", "winter", "year_round"]),
  isSafetyCritical: z.string().optional(),
  nextDueAt: z.string().min(1),
});

// ── Helpers ──────────────────────────────────────────────────────────────

function getNextDueDate(
  currentDueAt: Date,
  frequency: "weekly" | "monthly" | "quarterly" | "annual"
): Date {
  switch (frequency) {
    case "weekly":
      return addWeeks(currentDueAt, 1);
    case "monthly":
      return addMonths(currentDueAt, 1);
    case "quarterly":
      return addMonths(currentDueAt, 3);
    case "annual":
      return addYears(currentDueAt, 1);
  }
}

function isInSeason(season: string, date: Date): boolean {
  const months = SEASON_MONTHS[season];
  if (months === null || months === undefined) return true; // year_round
  return months.includes(date.getMonth());
}

// ── Server Actions ───────────────────────────────────────────────────────

export async function createSchedule(
  _prevState: { error?: string; success?: boolean; id?: number } | null,
  formData: FormData
) {
  const session = await requireRole(["manager"]);

  const raw = {
    name: formData.get("name"),
    description: formData.get("description"),
    assetType: formData.get("assetType") || undefined,
    assetId: formData.get("assetId") || undefined,
    frequency: formData.get("frequency"),
    season: formData.get("season"),
    isSafetyCritical: formData.get("isSafetyCritical"),
    nextDueAt: formData.get("nextDueAt"),
  };

  const parsed = scheduleSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Invalid input. Please check all fields." };
  }

  const data = parsed.data;

  const [inserted] = await db
    .insert(maintenanceSchedules)
    .values({
      name: data.name,
      description: data.description || null,
      assetType: data.assetType ?? null,
      assetId: data.assetId ?? null,
      frequency: data.frequency,
      season: data.season,
      isSafetyCritical: data.isSafetyCritical === "on",
      nextDueAt: new Date(data.nextDueAt),
      createdById: session.userId,
    })
    .returning({ id: maintenanceSchedules.id });

  await logAudit({
    userId: session.userId,
    action: "create",
    entityType: "schedule",
    entityId: inserted.id,
    metadata: { name: data.name, frequency: data.frequency },
  });

  revalidatePath("/schedules");
  return { success: true, id: inserted.id };
}

export async function updateSchedule(
  id: number,
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const session = await requireRole(["manager"]);

  const raw = {
    name: formData.get("name"),
    description: formData.get("description"),
    assetType: formData.get("assetType") || undefined,
    assetId: formData.get("assetId") || undefined,
    frequency: formData.get("frequency"),
    season: formData.get("season"),
    isSafetyCritical: formData.get("isSafetyCritical"),
    nextDueAt: formData.get("nextDueAt"),
  };

  const parsed = scheduleSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Invalid input. Please check all fields." };
  }

  const data = parsed.data;

  await db
    .update(maintenanceSchedules)
    .set({
      name: data.name,
      description: data.description || null,
      assetType: data.assetType ?? null,
      assetId: data.assetId ?? null,
      frequency: data.frequency,
      season: data.season,
      isSafetyCritical: data.isSafetyCritical === "on",
      nextDueAt: new Date(data.nextDueAt),
    })
    .where(eq(maintenanceSchedules.id, id));

  await logAudit({
    userId: session.userId,
    action: "update",
    entityType: "schedule",
    entityId: id,
    metadata: { name: data.name },
  });

  revalidatePath("/schedules");
  return { success: true };
}

export async function deleteSchedule(id: number) {
  const session = await requireRole(["manager"]);

  await db
    .update(maintenanceSchedules)
    .set({
      deletedAt: new Date(),
      isActive: false,
    })
    .where(eq(maintenanceSchedules.id, id));

  await logAudit({
    userId: session.userId,
    action: "delete",
    entityType: "schedule",
    entityId: id,
  });

  revalidatePath("/schedules");
  return { success: true };
}

export async function generateDueWorkOrders() {
  const session = await requireRole(["manager", "crew", "inspector"]);
  const now = new Date();

  // Find all active schedules that are due
  const dueSchedules = await db.query.maintenanceSchedules.findMany({
    where: and(
      eq(maintenanceSchedules.isActive, true),
      isNull(maintenanceSchedules.deletedAt),
      lte(maintenanceSchedules.nextDueAt, now)
    ),
    with: {
      asset: true,
    },
  });

  let generatedCount = 0;

  for (const schedule of dueSchedules) {
    // Check if there is already an open WO for this schedule
    const existingOpenWo = await db.query.workOrders.findFirst({
      where: and(
        eq(workOrders.scheduleId, schedule.id),
        inArray(workOrders.status, ["created", "assigned", "in_progress"]),
        isNull(workOrders.deletedAt)
      ),
    });

    if (existingOpenWo) {
      continue; // Skip if open WO already exists
    }

    let nextDue = new Date(schedule.nextDueAt);

    // Advance past any missed periods
    // But only create a WO for the current period if in season
    while (nextDue <= now) {
      const shouldCreateWo = isInSeason(schedule.season, nextDue);

      if (shouldCreateWo) {
        // Only create WO for the most recent due period (avoid creating many)
        const nextAfterThis = getNextDueDate(nextDue, schedule.frequency);
        if (nextAfterThis > now) {
          // This is the current due period -- create WO
          const dockId = schedule.asset?.dockId ?? null;

          const [newWo] = await db
            .insert(workOrders)
            .values({
              title: `${schedule.name} -- ${format(nextDue, "MMM d, yyyy")}`,
              type: "preventive",
              priority: schedule.isSafetyCritical ? "high" : "normal",
              status: "created",
              assetId: schedule.assetId,
              dockId,
              scheduleId: schedule.id,
              dueDate: nextDue,
              createdById: session.userId,
            })
            .returning({ id: workOrders.id });

          await logAudit({
            userId: session.userId,
            action: "auto_generate",
            entityType: "work_order",
            entityId: newWo.id,
            metadata: {
              scheduleId: schedule.id,
              scheduleName: schedule.name,
            },
          });

          generatedCount++;
        }
      }

      // Advance nextDueAt regardless of season
      nextDue = getNextDueDate(nextDue, schedule.frequency);
    }

    // Update the schedule's nextDueAt
    await db
      .update(maintenanceSchedules)
      .set({ nextDueAt: nextDue })
      .where(eq(maintenanceSchedules.id, schedule.id));
  }

  if (generatedCount > 0) {
    revalidatePath("/schedules");
    revalidatePath("/work-orders");
  }

  return { generated: generatedCount };
}
