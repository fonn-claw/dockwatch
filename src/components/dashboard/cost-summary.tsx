"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

interface CostData {
  totalCostCents: number;
  workOrderCount: number;
}

interface CostSummaryProps {
  month: CostData;
  quarter: CostData;
}

function formatDollars(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function CostSummary({ month, quarter }: CostSummaryProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4" />
            This Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{formatDollars(month.totalCostCents)}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {month.workOrderCount} work order{month.workOrderCount !== 1 ? "s" : ""}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4" />
            This Quarter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{formatDollars(quarter.totalCostCents)}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {quarter.workOrderCount} work order{quarter.workOrderCount !== 1 ? "s" : ""}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
