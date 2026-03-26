import { requireRole } from "@/lib/auth/guards";
import { getScheduleStats } from "@/lib/queries/schedules";
import {
  getDashboardHealthScores,
  getUpcomingMaintenance,
  getRecentActivity,
} from "@/lib/queries/dashboard";
import { getCostSummary } from "@/lib/queries/costs";
import { StatusCards } from "@/components/dashboard/status-cards";
import { HealthScores } from "@/components/dashboard/health-scores";
import { MaintenanceCalendar } from "@/components/dashboard/maintenance-calendar";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { CostSummary } from "@/components/dashboard/cost-summary";

export { default as DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";

export default async function DashboardPage() {
  await requireRole(["manager"]);

  const [stats, healthScores, calendarData, recentActivity, costMonth, costQuarter] =
    await Promise.all([
      getScheduleStats(),
      getDashboardHealthScores(),
      getUpcomingMaintenance(),
      getRecentActivity(10),
      getCostSummary("month"),
      getCostSummary("quarter"),
    ]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          At-a-glance maintenance health for Sunset Harbor Marina
        </p>
      </div>

      {/* Row 1: Hero status cards */}
      <StatusCards stats={stats} />

      {/* Row 2: Health scores + Calendar */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <HealthScores
          marinaWide={healthScores.marinaWide}
          byDock={healthScores.byDock}
        />
        <MaintenanceCalendar data={calendarData} />
      </div>

      {/* Row 3: Activity feed + Cost summary */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ActivityFeed entries={recentActivity} />
        <CostSummary month={costMonth} quarter={costQuarter} />
      </div>
    </div>
  );
}
