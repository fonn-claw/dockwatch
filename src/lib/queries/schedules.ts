import { db } from "@/lib/db";
import {
  maintenanceSchedules,
  assets,
  docks,
  workOrders,
} from "@/lib/db/schema";
import {
  and,
  asc,
  count,
  eq,
  gt,
  gte,
  isNull,
  lt,
  lte,
  sql,
} from "drizzle-orm";

interface ScheduleFilters {
  assetType?: string;
  frequency?: string;
  season?: string;
  safetyCritical?: string; // "true" | "false"
  status?: string; // "on_track" | "due_soon" | "overdue"
}

export async function getSchedules(filters: ScheduleFilters = {}) {
  const conditions = [
    isNull(maintenanceSchedules.deletedAt),
    eq(maintenanceSchedules.isActive, true),
  ];

  if (filters.assetType) {
    conditions.push(
      eq(
        maintenanceSchedules.assetType,
        filters.assetType as (typeof maintenanceSchedules.assetType.enumValues)[number]
      )
    );
  }

  if (filters.frequency) {
    conditions.push(
      eq(
        maintenanceSchedules.frequency,
        filters.frequency as (typeof maintenanceSchedules.frequency.enumValues)[number]
      )
    );
  }

  if (filters.season) {
    conditions.push(
      eq(
        maintenanceSchedules.season,
        filters.season as (typeof maintenanceSchedules.season.enumValues)[number]
      )
    );
  }

  if (filters.safetyCritical === "true") {
    conditions.push(eq(maintenanceSchedules.isSafetyCritical, true));
  } else if (filters.safetyCritical === "false") {
    conditions.push(eq(maintenanceSchedules.isSafetyCritical, false));
  }

  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  if (filters.status === "overdue") {
    conditions.push(lt(maintenanceSchedules.nextDueAt, now));
  } else if (filters.status === "due_soon") {
    conditions.push(gte(maintenanceSchedules.nextDueAt, now));
    conditions.push(lte(maintenanceSchedules.nextDueAt, sevenDaysFromNow));
  } else if (filters.status === "on_track") {
    conditions.push(gt(maintenanceSchedules.nextDueAt, sevenDaysFromNow));
  }

  const results = await db.query.maintenanceSchedules.findMany({
    where: and(...conditions),
    with: {
      asset: {
        with: {
          dock: true,
        },
      },
    },
    orderBy: [asc(maintenanceSchedules.nextDueAt)],
  });

  // Compute compliance percent and status color for each schedule
  const scheduleIds = results.map((s) => s.id);

  // Get work order counts per schedule for compliance calculation
  let woCountsBySchedule: Record<
    number,
    { total: number; onTime: number }
  > = {};

  if (scheduleIds.length > 0) {
    // Total WOs per schedule
    const totalWoCounts = await db
      .select({
        scheduleId: workOrders.scheduleId,
        total: count(),
      })
      .from(workOrders)
      .where(
        and(
          sql`${workOrders.scheduleId} IN (${sql.join(
            scheduleIds.map((id) => sql`${id}`),
            sql`, `
          )})`,
          isNull(workOrders.deletedAt)
        )
      )
      .groupBy(workOrders.scheduleId);

    // On-time completed WOs (completed or verified, completed before or on due date)
    const onTimeWoCounts = await db
      .select({
        scheduleId: workOrders.scheduleId,
        onTime: count(),
      })
      .from(workOrders)
      .where(
        and(
          sql`${workOrders.scheduleId} IN (${sql.join(
            scheduleIds.map((id) => sql`${id}`),
            sql`, `
          )})`,
          isNull(workOrders.deletedAt),
          sql`${workOrders.status} IN ('completed', 'verified')`,
          sql`${workOrders.completedAt} <= ${workOrders.dueDate} OR ${workOrders.dueDate} IS NULL`
        )
      )
      .groupBy(workOrders.scheduleId);

    for (const row of totalWoCounts) {
      if (row.scheduleId) {
        woCountsBySchedule[row.scheduleId] = {
          total: Number(row.total),
          onTime: 0,
        };
      }
    }
    for (const row of onTimeWoCounts) {
      if (row.scheduleId && woCountsBySchedule[row.scheduleId]) {
        woCountsBySchedule[row.scheduleId].onTime = Number(row.onTime);
      }
    }
  }

  return results.map((schedule) => {
    const woCounts = woCountsBySchedule[schedule.id];
    const compliancePercent =
      woCounts && woCounts.total > 0
        ? Math.round((woCounts.onTime / woCounts.total) * 100)
        : 100; // No WOs yet means 100% (nothing missed)

    const nextDue = new Date(schedule.nextDueAt);
    let statusColor: "green" | "yellow" | "red";
    if (nextDue < now) {
      statusColor = "red";
    } else if (nextDue <= sevenDaysFromNow) {
      statusColor = "yellow";
    } else {
      statusColor = "green";
    }

    return {
      ...schedule,
      compliancePercent,
      statusColor,
      assetName: schedule.asset?.name ?? null,
      dockName: schedule.asset?.dock?.name ?? null,
    };
  });
}

export async function getScheduleStats() {
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const baseConditions = [
    isNull(maintenanceSchedules.deletedAt),
    eq(maintenanceSchedules.isActive, true),
  ];

  const [allSchedules, overdueSchedules, dueSoonSchedules] = await Promise.all([
    db
      .select({ count: count() })
      .from(maintenanceSchedules)
      .where(and(...baseConditions)),
    db
      .select({ count: count() })
      .from(maintenanceSchedules)
      .where(and(...baseConditions, lt(maintenanceSchedules.nextDueAt, now))),
    db
      .select({ count: count() })
      .from(maintenanceSchedules)
      .where(
        and(
          ...baseConditions,
          gte(maintenanceSchedules.nextDueAt, now),
          lte(maintenanceSchedules.nextDueAt, sevenDaysFromNow)
        )
      ),
  ]);

  const activeCount = Number(allSchedules[0]?.count ?? 0);
  const overdueCount = Number(overdueSchedules[0]?.count ?? 0);
  const dueSoonCount = Number(dueSoonSchedules[0]?.count ?? 0);
  const onTrackCount = activeCount - overdueCount - dueSoonCount;

  return {
    activeCount,
    overdueCount,
    dueSoonCount,
    onTrackCount,
  };
}
