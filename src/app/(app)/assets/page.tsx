import { requireRole } from "@/lib/auth/guards";
import { getAssets, getDocks } from "@/lib/queries/assets";
import { AssetFilters } from "@/components/assets/asset-filters";
import { AssetTable } from "@/components/assets/asset-table";
import { Anchor } from "lucide-react";

interface AssetsPageProps {
  searchParams: Promise<{
    dockId?: string;
    assetType?: string;
    minCondition?: string;
  }>;
}

export default async function AssetsPage({ searchParams }: AssetsPageProps) {
  const session = await requireRole(["manager", "crew", "inspector"]);
  const params = await searchParams;

  const filters = {
    dockId: params.dockId ? Number(params.dockId) : undefined,
    assetType: params.assetType || undefined,
    minCondition: params.minCondition ? Number(params.minCondition) : undefined,
  };

  const [assets, docks] = await Promise.all([getAssets(filters), getDocks()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Assets</h1>
        <p className="text-muted-foreground">
          Marina infrastructure catalog with condition tracking
        </p>
      </div>

      <AssetFilters
        docks={docks}
        currentDockId={params.dockId}
        currentAssetType={params.assetType}
        currentMinCondition={params.minCondition}
      />

      <AssetTable
        assets={JSON.parse(JSON.stringify(assets))}
        docks={JSON.parse(JSON.stringify(docks))}
        session={session}
      />
    </div>
  );
}
