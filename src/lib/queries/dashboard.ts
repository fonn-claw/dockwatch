import { db } from "@/lib/db";
import {
  maintenanceSchedules,
  assets,
  docks,
  auditLogs,
  users,
} from "@/lib/db/schema";
import { and, asc, desc, eq, gte, isNull, lt, lte, sql } from "drizzle-orm";

// ── Criticality weights for health score calculation ────────────────────────
// Safety-critical: 3x, Structural/Operational: 2x, Cosmetic: 1x

const CRITICALITY_WEIGHTS: Record<string, number> = {
  electrical_pedestal: 3,
  fire_extinguisher: 3,
  fuel_pump: 3,
  piling: 2,
  cleat: 2,
  bumper: 2,
  gangway: 2,
  water_connection: 2,
  dock_light: 2,
  other: 1,
};

// ── Health Scores ───────────────────────────────────────────────────────────

export async function getDashboardHealthScores() {
  const now = new Date();

  const schedules = await db.query.maintenanceSchedules.findMany({
    where: and(
      isNull(maintenanceSchedules.deletedAt),
      eq(maintenanceSchedules.isActive, true)
    ),
    with: {
      asset: {
        with: {
          dock: true,
        },
      },
    },
  });

  // Marina-wide score
  let totalWeight = 0;
  let onTrackWeight = 0;

  // Per-dock accumulators
  const dockAccum: Record<
    number,
    { dockName: string; dockCode: string; totalWeight: number; onTrackWeight: number }
  > = {};

  for (const schedule of schedules) {
    const assetType = schedule.asset?.assetType ?? schedule.assetType ?? "other";
    const weight = CRITICALITY_WEIGHTS[assetType] ?? 1;
    const isOnTrack = schedule.nextDueAt > now ? 1 : 0;

    totalWeight += weight;
    onTrackWeight += weight * isOnTrack;

    const dock = schedule.asset?.dock;
    if (dock) {
      if (!dockAccum[dock.id]) {
        dockAccum[dock.id] = {
          dockName: dock.name,
          dockCode: dock.code,
          totalWeight: 0,
          onTrackWeight: 0,
        };
      }
      dockAccum[dock.id].totalWeight += weight;
      dockAccum[dock.id].onTrackWeight += weight * isOnTrack;
    }
  }

  const marinaWide = totalWeight > 0 ? Math.round((onTrackWeight / totalWeight) * 100) : 100;

  const byDock = Object.entries(dockAccum)
    .map(([dockIdStr, data]) => ({
      dockId: Number(dockIdStr),
      dockName: data.dockName,
      dockCode: data.dockCode,
      score: data.totalWeight > 0 ? Math.round((data.onTrackWeight / data.totalWeight) * 100) : 100,
    }))
    .sort((a, b) => a.dockCode.localeCompare(b.dockCode));

  return { marinaWide, byDock };
}

// ── Upcoming Maintenance (calendar data) ────────────────────────────────────

export async function getUpcomingMaintenance() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const schedules = await db.query.maintenanceSchedules.findMany({
    where: and(
      isNull(maintenanceSchedules.deletedAt),
      eq(maintenanceSchedules.isActive, true),
      gte(maintenanceSchedules.nextDueAt, thirtyDaysAgo),
      lte(maintenanceSchedules.nextDueAt, thirtyDaysFromNow)
    ),
    orderBy: [asc(maintenanceSchedules.nextDueAt)],
  });

  return schedules.map((schedule) => {
    const nextDue = new Date(schedule.nextDueAt);
    let status: "overdue" | "due_soon" | "on_track";
    if (nextDue < now) {
      status = "overdue";
    } else if (nextDue <= sevenDaysFromNow) {
      status = "due_soon";
    } else {
      status = "on_track";
    }

    return {
      date: schedule.nextDueAt,
      status,
      scheduleName: schedule.name,
    };
  });
}

// ── Recent Activity ─────────────────────────────────────────────────────────

export async function getRecentActivity(limit: number = 10) {
  const results = await db.query.auditLogs.findMany({
    with: {
      user: {
        columns: { id: true, name: true },
      },
    },
    orderBy: [desc(auditLogs.createdAt)],
    limit,
  });

  return results.map((row) => ({
    id: row.id,
    action: row.action,
    entityType: row.entityType,
    entityId: row.entityId,
    userName: row.user?.name ?? "System",
    createdAt: row.createdAt,
    metadata: row.metadata as Record<string, unknown> | null,
  }));
}
