import { requireRole } from "@/lib/auth/guards";
import { getSchedules, getScheduleStats } from "@/lib/queries/schedules";
import { getAssets } from "@/lib/queries/assets";
import { generateDueWorkOrders } from "@/lib/actions/schedules";
import { ScheduleFilters } from "@/components/schedules/schedule-filters";
import { Badge } from "@/components/ui/badge";
import { SchedulePageClient } from "./schedule-page-client";

interface SchedulesPageProps {
  searchParams: Promise<{
    assetType?: string;
    frequency?: string;
    season?: string;
    safetyCritical?: string;
    status?: string;
  }>;
}

export default async function SchedulesPage({
  searchParams,
}: SchedulesPageProps) {
  const session = await requireRole(["manager", "crew", "inspector"]);
  const params = await searchParams;

  // Auto-generate work orders for due schedules
  await generateDueWorkOrders();

  const filters = {
    assetType: params.assetType || undefined,
    frequency: params.frequency || undefined,
    season: params.season || undefined,
    safetyCritical: params.safetyCritical || undefined,
    status: params.status || undefined,
  };

  const [schedules, stats, allAssets] = await Promise.all([
    getSchedules(filters),
    getScheduleStats(),
    getAssets(),
  ]);

  const assetOptions = allAssets.map((a) => ({
    id: a.id,
    name: a.name,
    assetType: a.assetType,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Maintenance Schedules
          </h1>
          <p className="text-muted-foreground">
            Recurring preventive maintenance tasks and compliance tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            {stats.activeCount} Active
          </Badge>
          {stats.overdueCount > 0 && (
            <Badge variant="destructive">{stats.overdueCount} Overdue</Badge>
          )}
          {stats.dueSoonCount > 0 && (
            <Badge
              variant="outline"
              className="border-yellow-300 bg-yellow-50 text-yellow-700"
            >
              {stats.dueSoonCount} Due Soon
            </Badge>
          )}
        </div>
      </div>

      <ScheduleFilters
        currentAssetType={params.assetType}
        currentFrequency={params.frequency}
        currentSeason={params.season}
        currentSafetyCritical={params.safetyCritical}
        currentStatus={params.status}
      />

      <SchedulePageClient
        schedules={JSON.parse(JSON.stringify(schedules))}
        assets={assetOptions}
        session={session}
      />
    </div>
  );
}
