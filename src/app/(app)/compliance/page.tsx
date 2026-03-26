import { requireRole } from "@/lib/auth/guards";
import {
  getComplianceStats,
  getComplianceSchedules,
} from "@/lib/queries/compliance";
import { ComplianceCards } from "@/components/compliance/compliance-cards";
import { ComplianceTable } from "@/components/compliance/compliance-table";
import { SafetyCriticalTable } from "@/components/compliance/safety-critical-table";
import { Download, ShieldCheck } from "lucide-react";
import Link from "next/link";

type Period = "month" | "quarter" | "year";

const PERIOD_LABELS: Record<Period, string> = {
  month: "Month",
  quarter: "Quarter",
  year: "Year",
};

interface CompliancePageProps {
  searchParams: Promise<{ period?: string }>;
}

export default async function CompliancePage({
  searchParams,
}: CompliancePageProps) {
  await requireRole(["manager", "inspector"]);
  const params = await searchParams;

  const period: Period = ["month", "quarter", "year"].includes(
    params.period ?? ""
  )
    ? (params.period as Period)
    : "quarter";

  const [stats, schedules] = await Promise.all([
    getComplianceStats(period),
    getComplianceSchedules(period),
  ]);

  const safetyCritical = schedules.filter((s) => s.isSafetyCritical);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-slate-600" />
            Compliance Dashboard
          </h1>
          <p className="text-muted-foreground">
            Track maintenance compliance, safety items, and audit readiness
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Period Selector */}
          <div className="flex rounded-lg border bg-muted/30 p-0.5">
            {(["month", "quarter", "year"] as Period[]).map((p) => (
              <Link
                key={p}
                href={`/compliance?period=${p}`}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  period === p
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {PERIOD_LABELS[p]}
              </Link>
            ))}
          </div>

          {/* Download PDF */}
          <a
            href={`/api/compliance/report?period=${period}`}
            download
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Download className="h-4 w-4" />
            PDF Report
          </a>
        </div>
      </div>

      {/* Status Cards */}
      <ComplianceCards stats={JSON.parse(JSON.stringify(stats))} />

      {/* Safety-Critical Items */}
      <SafetyCriticalTable
        schedules={JSON.parse(JSON.stringify(safetyCritical))}
      />

      {/* All Schedules Compliance Table */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">All Schedules</h2>
        <ComplianceTable schedules={JSON.parse(JSON.stringify(schedules))} />
      </div>
    </div>
  );
}
