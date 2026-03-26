"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BudgetItem {
  category: string;
  budgetCents: number;
  actualCents: number;
  percentUsed: number;
  isOverBudget: boolean;
}

interface BudgetComparisonProps {
  budgetData: BudgetItem[];
  periodLabel: string;
}

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function getBarColor(percentUsed: number): string {
  if (percentUsed > 100) return "bg-red-500";
  if (percentUsed >= 75) return "bg-yellow-500";
  return "bg-green-500";
}

function getTextColor(percentUsed: number): string {
  if (percentUsed > 100) return "text-red-600";
  if (percentUsed >= 75) return "text-yellow-600";
  return "text-green-600";
}

export function BudgetComparison({ budgetData, periodLabel }: BudgetComparisonProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Budget vs Actual ({periodLabel})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {budgetData.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No budget data available
          </p>
        ) : (
          budgetData.map((item) => {
            const barWidth = Math.min(item.percentUsed, 100);
            const overAmount = item.actualCents - item.budgetCents;

            return (
              <div key={item.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{capitalize(item.category)}</span>
                  <span className={getTextColor(item.percentUsed)}>
                    {formatCurrency(item.actualCents)} / {formatCurrency(item.budgetCents)}
                    <span className="ml-2 text-xs">({item.percentUsed}%)</span>
                  </span>
                </div>
                <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${getBarColor(item.percentUsed)}`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                {item.isOverBudget && (
                  <p className="text-xs text-red-600 font-medium">
                    Over budget by {formatCurrency(overAmount)}
                  </p>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
