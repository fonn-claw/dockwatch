import { db } from "@/lib/db";
import { workOrders, workOrderParts, assets, docks } from "@/lib/db/schema";
import { and, eq, gte, lte, isNull, sql, sum, count } from "drizzle-orm";
import {
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
} from "date-fns";
import {
  ASSET_TYPE_TO_CATEGORY,
  CATEGORY_BUDGETS,
  LABOR_RATE_PER_MINUTE,
} from "@/lib/constants/budgets";

export type CostPeriod = "month" | "quarter" | "year";

function getPeriodRange(period: CostPeriod): { start: Date; end: Date } {
  const now = new Date();
  switch (period) {
    case "month":
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case "quarter":
      return { start: startOfQuarter(now), end: endOfQuarter(now) };
    case "year":
      return { start: startOfYear(now), end: endOfYear(now) };
  }
}

function getPeriodDivisor(period: CostPeriod): number {
  switch (period) {
    case "month":
      return 12;
    case "quarter":
      return 4;
    case "year":
      return 1;
  }
}

export async function getCostSummary(period: CostPeriod) {
  const { start, end } = getPeriodRange(period);

  // Get parts cost
  const partsResult = await db
    .select({
      totalPartsCents: sql<number>`coalesce(sum(${workOrderParts.unitCost} * ${workOrderParts.quantity}), 0)`,
    })
    .from(workOrderParts)
    .innerJoin(workOrders, eq(workOrderParts.workOrderId, workOrders.id))
    .where(
      and(
        isNull(workOrders.deletedAt),
        gte(workOrders.createdAt, start),
        lte(workOrders.createdAt, end)
      )
    );

  // Get labor cost and work order count
  const laborResult = await db
    .select({
      totalMinutes: sql<number>`coalesce(sum(${workOrders.timeSpentMinutes}), 0)`,
      workOrderCount: count(),
    })
    .from(workOrders)
    .where(
      and(
        isNull(workOrders.deletedAt),
        gte(workOrders.createdAt, start),
        lte(workOrders.createdAt, end)
      )
    );

  const totalPartsCents = Number(partsResult[0]?.totalPartsCents ?? 0);
  const totalMinutes = Number(laborResult[0]?.totalMinutes ?? 0);
  const totalLaborCents = totalMinutes * LABOR_RATE_PER_MINUTE;
  const workOrderCount = Number(laborResult[0]?.workOrderCount ?? 0);

  return {
    totalPartsCents,
    totalLaborCents,
    totalCostCents: totalPartsCents + totalLaborCents,
    workOrderCount,
  };
}

export async function getCostByDock(period: CostPeriod) {
  const { start, end } = getPeriodRange(period);

  const rows = await db
    .select({
      dockId: docks.id,
      dockName: docks.name,
      partsCents: sql<number>`coalesce(sum(${workOrderParts.unitCost} * ${workOrderParts.quantity}), 0)`,
      totalMinutes: sql<number>`coalesce(sum(${workOrders.timeSpentMinutes}), 0)`,
      woCount: sql<number>`count(distinct ${workOrders.id})`,
    })
    .from(workOrders)
    .innerJoin(docks, eq(workOrders.dockId, docks.id))
    .leftJoin(workOrderParts, eq(workOrderParts.workOrderId, workOrders.id))
    .where(
      and(
        isNull(workOrders.deletedAt),
        gte(workOrders.createdAt, start),
        lte(workOrders.createdAt, end)
      )
    )
    .groupBy(docks.id, docks.name);

  return rows
    .map((r) => {
      const partsCents = Number(r.partsCents);
      const laborCents = Number(r.totalMinutes) * LABOR_RATE_PER_MINUTE;
      return {
        dockId: r.dockId,
        dockName: r.dockName,
        partsCents,
        laborCents,
        totalCents: partsCents + laborCents,
        woCount: Number(r.woCount),
      };
    })
    .sort((a, b) => b.totalCents - a.totalCents);
}

export async function getCostByCategory(period: CostPeriod) {
  const { start, end } = getPeriodRange(period);

  const rows = await db
    .select({
      assetType: assets.assetType,
      partsCents: sql<number>`coalesce(sum(${workOrderParts.unitCost} * ${workOrderParts.quantity}), 0)`,
      totalMinutes: sql<number>`coalesce(sum(${workOrders.timeSpentMinutes}), 0)`,
      woCount: sql<number>`count(distinct ${workOrders.id})`,
    })
    .from(workOrders)
    .innerJoin(assets, eq(workOrders.assetId, assets.id))
    .leftJoin(workOrderParts, eq(workOrderParts.workOrderId, workOrders.id))
    .where(
      and(
        isNull(workOrders.deletedAt),
        gte(workOrders.createdAt, start),
        lte(workOrders.createdAt, end)
      )
    )
    .groupBy(assets.assetType);

  // Aggregate by category using ASSET_TYPE_TO_CATEGORY mapping
  const categoryMap = new Map<
    string,
    { partsCents: number; laborCents: number; totalCents: number; woCount: number }
  >();

  for (const row of rows) {
    const category = ASSET_TYPE_TO_CATEGORY[row.assetType] ?? "general";
    const existing = categoryMap.get(category) ?? {
      partsCents: 0,
      laborCents: 0,
      totalCents: 0,
      woCount: 0,
    };
    const partsCents = Number(row.partsCents);
    const laborCents = Number(row.totalMinutes) * LABOR_RATE_PER_MINUTE;
    existing.partsCents += partsCents;
    existing.laborCents += laborCents;
    existing.totalCents += partsCents + laborCents;
    existing.woCount += Number(row.woCount);
    categoryMap.set(category, existing);
  }

  return Array.from(categoryMap.entries())
    .map(([category, data]) => ({ category, ...data }))
    .sort((a, b) => b.totalCents - a.totalCents);
}

export async function getBudgetComparison(period: CostPeriod) {
  const categorySpend = await getCostByCategory(period);
  const divisor = getPeriodDivisor(period);

  const spendMap = new Map(categorySpend.map((c) => [c.category, c.totalCents]));

  return Object.entries(CATEGORY_BUDGETS)
    .map(([category, annualBudgetDollars]) => {
      const budgetCents = Math.round((annualBudgetDollars * 100) / divisor);
      const actualCents = spendMap.get(category) ?? 0;
      const percentUsed = budgetCents > 0 ? Math.round((actualCents / budgetCents) * 100) : 0;

      return {
        category,
        budgetCents,
        actualCents,
        percentUsed,
        isOverBudget: actualCents > budgetCents,
      };
    })
    .sort((a, b) => b.percentUsed - a.percentUsed);
}

export async function getHighCostAssets(period: CostPeriod) {
  const { start, end } = getPeriodRange(period);

  const rows = await db
    .select({
      assetId: assets.id,
      assetName: assets.name,
      assetType: assets.assetType,
      dockName: docks.name,
      partsCents: sql<number>`coalesce(sum(${workOrderParts.unitCost} * ${workOrderParts.quantity}), 0)`,
      totalMinutes: sql<number>`coalesce(sum(${workOrders.timeSpentMinutes}), 0)`,
      woCount: sql<number>`count(distinct ${workOrders.id})`,
    })
    .from(workOrders)
    .innerJoin(assets, eq(workOrders.assetId, assets.id))
    .leftJoin(docks, eq(assets.dockId, docks.id))
    .leftJoin(workOrderParts, eq(workOrderParts.workOrderId, workOrders.id))
    .where(
      and(
        isNull(workOrders.deletedAt),
        gte(workOrders.createdAt, start),
        lte(workOrders.createdAt, end)
      )
    )
    .groupBy(assets.id, assets.name, assets.assetType, docks.name)
    .limit(20);

  return rows
    .map((r) => {
      const partsCents = Number(r.partsCents);
      const laborCents = Number(r.totalMinutes) * LABOR_RATE_PER_MINUTE;
      return {
        assetId: r.assetId,
        assetName: r.assetName,
        assetType: r.assetType,
        dockName: r.dockName ?? "Unassigned",
        partsCents,
        laborCents,
        totalCents: partsCents + laborCents,
        woCount: Number(r.woCount),
      };
    })
    .sort((a, b) => b.totalCents - a.totalCents);
}
