"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Wrench, Clock } from "lucide-react";

interface CostSummaryProps {
  summary: {
    totalPartsCents: number;
    totalLaborCents: number;
    totalCostCents: number;
    workOrderCount: number;
  };
  totalBudgetCents: number;
}

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getBudgetColor(actual: number, budget: number): string {
  if (budget <= 0) return "text-muted-foreground";
  const pct = actual / budget;
  if (pct > 1) return "text-red-600";
  if (pct >= 0.75) return "text-yellow-600";
  return "text-green-600";
}

export function CostSummaryCards({ summary, totalBudgetCents }: CostSummaryProps) {
  const budgetColor = getBudgetColor(summary.totalCostCents, totalBudgetCents);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Spend
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${budgetColor}`}>
            {formatCurrency(summary.totalCostCents)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {summary.workOrderCount} work order{summary.workOrderCount !== 1 ? "s" : ""}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Parts Cost
          </CardTitle>
          <Wrench className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(summary.totalPartsCents)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Materials and replacement parts
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Labor Estimate
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(summary.totalLaborCents)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Based on $45/hr rate
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
