import { db } from "@/lib/db";
import {
  maintenanceSchedules,
  workOrders,
  auditLogs,
  users,
  assets,
  docks,
  workOrderParts,
} from "@/lib/db/schema";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  isNull,
  lt,
  lte,
  sql,
} from "drizzle-orm";
import { ASSET_TYPE_TO_CATEGORY } from "@/lib/constants/budgets";

type Period = "month" | "quarter" | "year";

function getPeriodRange(period: Period): { start: Date; end: Date } {
  const now = new Date();
  let start: Date;
  const end = now;

  switch (period) {
    case "month": {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    }
    case "quarter": {
      const quarterStart = Math.floor(now.getMonth() / 3) * 3;
      start = new Date(now.getFullYear(), quarterStart, 1);
      break;
    }
    case "year": {
      start = new Date(now.getFullYear(), 0, 1);
      break;
    }
  }

  return { start, end };
}

export async function getComplianceStats(period: Period) {
  const { start, end } = getPeriodRange(period);
  const now = new Date();

  // Count total preventive WOs with a schedule in the period
  const totalResult = await db
    .select({ value: count() })
    .from(workOrders)
    .where(
      and(
        eq(workOrders.type, "preventive"),
        sql`${workOrders.scheduleId} IS NOT NULL`,
        gte(workOrders.dueDate, start),
        lte(workOrders.dueDate, end),
        isNull(workOrders.deletedAt)
      )
    );

  // Count completed on time
  const onTimeResult = await db
    .select({ value: count() })
    .from(workOrders)
    .where(
      and(
        eq(workOrders.type, "preventive"),
        sql`${workOrders.scheduleId} IS NOT NULL`,
        gte(workOrders.dueDate, start),
        lte(workOrders.dueDate, end),
        isNull(workOrders.deletedAt),
        sql`${workOrders.status} IN ('completed', 'verified')`,
        sql`${workOrders.completedAt} <= ${workOrders.dueDate}`
      )
    );

  // Count overdue (due date passed, not completed/verified)
  const overdueResult = await db
    .select({ value: count() })
    .from(workOrders)
    .where(
      and(
        eq(workOrders.type, "preventive"),
        sql`${workOrders.scheduleId} IS NOT NULL`,
        gte(workOrders.dueDate, start),
        lte(workOrders.dueDate, end),
        isNull(workOrders.deletedAt),
        lt(workOrders.dueDate, now),
        sql`${workOrders.status} NOT IN ('completed', 'verified')`
      )
    );

  const totalDue = Number(totalResult[0]?.value ?? 0);
  const completedOnTime = Number(onTimeResult[0]?.value ?? 0);
  const overdue = Number(overdueResult[0]?.value ?? 0);
  const compliancePercent =
    totalDue === 0 ? null : Math.round((completedOnTime / totalDue) * 100);

  return { totalDue, completedOnTime, overdue, compliancePercent };
}

export async function getComplianceSchedules(period: Period) {
  const { start, end } = getPeriodRange(period);
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

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
    orderBy: [asc(maintenanceSchedules.nextDueAt)],
  });

  // Get per-schedule compliance for the period
  const scheduleIds = schedules.map((s) => s.id);
  let woCountsBySchedule: Record<number, { total: number; onTime: number }> =
    {};

  if (scheduleIds.length > 0) {
    const totalCounts = await db
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
          eq(workOrders.type, "preventive"),
          gte(workOrders.dueDate, start),
          lte(workOrders.dueDate, end),
          isNull(workOrders.deletedAt)
        )
      )
      .groupBy(workOrders.scheduleId);

    const onTimeCounts = await db
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
          eq(workOrders.type, "preventive"),
          gte(workOrders.dueDate, start),
          lte(workOrders.dueDate, end),
          isNull(workOrders.deletedAt),
          sql`${workOrders.status} IN ('completed', 'verified')`,
          sql`${workOrders.completedAt} <= ${workOrders.dueDate}`
        )
      )
      .groupBy(workOrders.scheduleId);

    for (const row of totalCounts) {
      if (row.scheduleId) {
        woCountsBySchedule[row.scheduleId] = {
          total: Number(row.total),
          onTime: 0,
        };
      }
    }
    for (const row of onTimeCounts) {
      if (row.scheduleId && woCountsBySchedule[row.scheduleId]) {
        woCountsBySchedule[row.scheduleId].onTime = Number(row.onTime);
      }
    }
  }

  return schedules.map((schedule) => {
    const woCounts = woCountsBySchedule[schedule.id];
    const compliancePercent =
      woCounts && woCounts.total > 0
        ? Math.round((woCounts.onTime / woCounts.total) * 100)
        : null;

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
      id: schedule.id,
      name: schedule.name,
      frequency: schedule.frequency,
      lastCompletedAt: schedule.lastCompletedAt,
      nextDueAt: schedule.nextDueAt,
      isSafetyCritical: schedule.isSafetyCritical,
      assetName: schedule.asset?.name ?? null,
      dockName: schedule.asset?.dock?.name ?? null,
      assetType: schedule.assetType,
      compliancePercent,
      status,
    };
  });
}

interface AuditFilters {
  entityType?: string;
  userId?: number;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
}

export async function getAuditTrail(filters: AuditFilters = {}) {
  const pageSize = 25;
  const page = filters.page ?? 1;
  const offset = (page - 1) * pageSize;

  const conditions: ReturnType<typeof eq>[] = [];

  if (filters.entityType) {
    conditions.push(eq(auditLogs.entityType, filters.entityType));
  }
  if (filters.userId) {
    conditions.push(eq(auditLogs.userId, filters.userId));
  }
  if (filters.dateFrom) {
    conditions.push(gte(auditLogs.createdAt, new Date(filters.dateFrom)));
  }
  if (filters.dateTo) {
    const toDate = new Date(filters.dateTo);
    toDate.setHours(23, 59, 59, 999);
    conditions.push(lte(auditLogs.createdAt, toDate));
  }

  const whereClause =
    conditions.length > 0 ? and(...conditions) : undefined;

  const [results, totalResult] = await Promise.all([
    db.query.auditLogs.findMany({
      where: whereClause,
      with: {
        user: {
          columns: { id: true, name: true },
        },
      },
      orderBy: [desc(auditLogs.createdAt)],
      limit: pageSize,
      offset,
    }),
    db
      .select({ value: count() })
      .from(auditLogs)
      .where(whereClause),
  ]);

  const total = Number(totalResult[0]?.value ?? 0);

  return {
    results: results.map((row) => ({
      id: row.id,
      action: row.action,
      entityType: row.entityType,
      entityId: row.entityId,
      userId: row.userId,
      userName: row.user?.name ?? "System",
      metadata: row.metadata as Record<string, unknown> | null,
      createdAt: row.createdAt,
    })),
    total,
    page,
    pageSize,
  };
}

export async function getComplianceReportData(period: Period) {
  const { start, end } = getPeriodRange(period);
  const now = new Date();

  const stats = await getComplianceStats(period);
  const schedules = await getComplianceSchedules(period);

  // Overdue items
  const overdueItems = schedules
    .filter((s) => s.status === "overdue")
    .map((s) => ({
      name: s.name,
      assetName: s.assetName,
      daysOverdue: Math.floor(
        (now.getTime() - new Date(s.nextDueAt).getTime()) / (1000 * 60 * 60 * 24)
      ),
    }));

  // Completion rates by category
  const categoryRates: Record<string, { total: number; onTime: number }> = {};
  for (const s of schedules) {
    const category =
      ASSET_TYPE_TO_CATEGORY[s.assetType ?? "other"] ?? "general";
    if (!categoryRates[category]) {
      categoryRates[category] = { total: 0, onTime: 0 };
    }
    categoryRates[category].total++;
    if (s.compliancePercent !== null && s.compliancePercent >= 100) {
      categoryRates[category].onTime++;
    }
  }

  const completionByCategory = Object.entries(categoryRates).map(
    ([category, data]) => ({
      category,
      total: data.total,
      onTime: data.onTime,
      percent:
        data.total > 0 ? Math.round((data.onTime / data.total) * 100) : 0,
    })
  );

  // Safety-critical items
  const safetyCriticalItems = schedules
    .filter((s) => s.isSafetyCritical)
    .map((s) => ({
      name: s.name,
      assetName: s.assetName,
      status: s.status,
      compliancePercent: s.compliancePercent,
    }));

  // Recent audit entries
  const recentAudit = await db.query.auditLogs.findMany({
    where: and(
      gte(auditLogs.createdAt, start),
      lte(auditLogs.createdAt, end)
    ),
    with: {
      user: { columns: { name: true } },
    },
    orderBy: [desc(auditLogs.createdAt)],
    limit: 50,
  });

  return {
    stats,
    overdueItems,
    completionByCategory,
    safetyCriticalItems,
    recentAudit: recentAudit.map((r) => ({
      action: r.action,
      entityType: r.entityType,
      entityId: r.entityId,
      userName: r.user?.name ?? "System",
      createdAt: r.createdAt,
    })),
    period,
    generatedAt: now,
  };
}

export async function getAssetHistoryData(assetId: number) {
  const asset = await db.query.assets.findFirst({
    where: eq(assets.id, assetId),
    with: {
      dock: true,
    },
  });

  if (!asset) return null;

  // Work orders for this asset
  const assetWorkOrders = await db.query.workOrders.findMany({
    where: and(
      eq(workOrders.assetId, assetId),
      isNull(workOrders.deletedAt)
    ),
    with: {
      parts: true,
      assignee: { columns: { name: true } },
    },
    orderBy: [desc(workOrders.createdAt)],
  });

  // Audit logs for the asset
  const assetAuditLogs = await db.query.auditLogs.findMany({
    where: and(
      eq(auditLogs.entityType, "asset"),
      eq(auditLogs.entityId, assetId)
    ),
    with: {
      user: { columns: { name: true } },
    },
    orderBy: [desc(auditLogs.createdAt)],
  });

  // Linked schedules
  const linkedSchedules = await db.query.maintenanceSchedules.findMany({
    where: and(
      eq(maintenanceSchedules.assetId, assetId),
      isNull(maintenanceSchedules.deletedAt)
    ),
  });

  return {
    asset: {
      id: asset.id,
      name: asset.name,
      assetType: asset.assetType,
      location: asset.location,
      dockName: asset.dock?.name ?? null,
      installDate: asset.installDate,
      conditionRating: asset.conditionRating,
    },
    workOrders: assetWorkOrders.map((wo) => ({
      id: wo.id,
      title: wo.title,
      status: wo.status,
      type: wo.type,
      dueDate: wo.dueDate,
      completedAt: wo.completedAt,
      timeSpentMinutes: wo.timeSpentMinutes,
      assigneeName: wo.assignee?.name ?? "Unassigned",
      partsCost: wo.parts.reduce(
        (sum, p) => sum + p.unitCost * p.quantity,
        0
      ),
    })),
    auditLogs: assetAuditLogs.map((a) => ({
      action: a.action,
      userName: a.user?.name ?? "System",
      createdAt: a.createdAt,
      metadata: a.metadata as Record<string, unknown> | null,
    })),
    linkedSchedules: linkedSchedules.map((s) => ({
      name: s.name,
      frequency: s.frequency,
      nextDueAt: s.nextDueAt,
      isSafetyCritical: s.isSafetyCritical,
      isActive: s.isActive,
    })),
    generatedAt: new Date(),
  };
}

export async function getAllUsers() {
  return db.query.users.findMany({
    columns: { id: true, name: true, role: true },
    orderBy: [asc(users.name)],
  });
}
