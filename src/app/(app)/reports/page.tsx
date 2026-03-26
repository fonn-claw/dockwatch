import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import {
  getCostSummary,
  getCostByDock,
  getCostByCategory,
  getBudgetComparison,
  getHighCostAssets,
} from "@/lib/queries/costs";
import type { CostPeriod } from "@/lib/queries/costs";
import { CostSummaryCards } from "@/components/reports/cost-summary-cards";
import { CostBreakdownTable } from "@/components/reports/cost-breakdown-table";
import { BudgetComparison } from "@/components/reports/budget-comparison";
import { HighCostAssets } from "@/components/reports/high-cost-assets";
import { CATEGORY_BUDGETS } from "@/lib/constants/budgets";
import { DollarSign } from "lucide-react";

const VALID_PERIODS: CostPeriod[] = ["month", "quarter", "year"];
const PERIOD_LABELS: Record<CostPeriod, string> = {
  month: "Monthly",
  quarter: "Quarterly",
  year: "Annual",
};

interface ReportsPageProps {
  searchParams: Promise<{ period?: string }>;
}

export default async function CostReportsPage({ searchParams }: ReportsPageProps) {
  await requireRole(["manager"]);

  const params = await searchParams;
  const period: CostPeriod = VALID_PERIODS.includes(params.period as CostPeriod)
    ? (params.period as CostPeriod)
    : "quarter";

  const [summary, byDock, byCategory, budgetComparison, highCostAssets] =
    await Promise.all([
      getCostSummary(period),
      getCostByDock(period),
      getCostByCategory(period),
      getBudgetComparison(period),
      getHighCostAssets(period),
    ]);

  // Calculate total budget for the period (for summary card coloring)
  const periodDivisor = period === "month" ? 12 : period === "quarter" ? 4 : 1;
  const totalBudgetCents = Math.round(
    Object.values(CATEGORY_BUDGETS).reduce((sum, b) => sum + b, 0) * 100 / periodDivisor
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <DollarSign className="h-8 w-8" />
            Cost Reports
          </h1>
          <p className="text-muted-foreground">
            Parts and labor cost tracking with budget comparison
          </p>
        </div>

        <div className="flex rounded-lg border bg-muted p-1">
          {VALID_PERIODS.map((p) => (
            <Link
              key={p}
              href={`/reports?period=${p}`}
              className={`px-3 py-1.5 min-h-[44px] sm:min-h-0 flex items-center text-sm font-medium rounded-md transition-colors ${
                period === p
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {PERIOD_LABELS[p]}
            </Link>
          ))}
        </div>
      </div>

      <CostSummaryCards summary={summary} totalBudgetCents={totalBudgetCents} />

      <div>
        <h2 className="text-xl font-semibold mb-4">Budget vs Actual</h2>
        <BudgetComparison
          budgetData={budgetComparison}
          periodLabel={PERIOD_LABELS[period]}
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Cost Breakdown</h2>
        <CostBreakdownTable byDock={byDock} byCategory={byCategory} />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">High-Cost Assets</h2>
        <HighCostAssets assets={highCostAssets} />
      </div>
    </div>
  );
}
