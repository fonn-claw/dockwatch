import { db } from "@/lib/db";
import { assets, docks, workOrders } from "@/lib/db/schema";
import { and, asc, desc, eq, gte, isNull } from "drizzle-orm";

interface AssetFilters {
  dockId?: number;
  assetType?: string;
  minCondition?: number;
}

export async function getAssets(filters: AssetFilters = {}) {
  const conditions = [isNull(assets.deletedAt)];

  if (filters.dockId) {
    conditions.push(eq(assets.dockId, filters.dockId));
  }

  if (filters.assetType) {
    conditions.push(eq(assets.assetType, filters.assetType as typeof assets.assetType.enumValues[number]));
  }

  if (filters.minCondition) {
    conditions.push(gte(assets.conditionRating, filters.minCondition));
  }

  return db.query.assets.findMany({
    where: and(...conditions),
    with: { dock: true },
    orderBy: [asc(assets.name)],
  });
}

export async function getAssetDetail(id: number) {
  return db.query.assets.findFirst({
    where: eq(assets.id, id),
    with: {
      dock: true,
      workOrders: {
        limit: 5,
        orderBy: [desc(workOrders.createdAt)],
        with: {
          assignee: true,
        },
      },
    },
  });
}

export async function getDocks() {
  return db.query.docks.findMany({
    orderBy: [asc(docks.name)],
  });
}
