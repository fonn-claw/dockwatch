"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, CheckCircle, AlertTriangle } from "lucide-react";

interface ComplianceCardsProps {
  stats: {
    totalDue: number;
    completedOnTime: number;
    overdue: number;
    compliancePercent: number | null;
  };
}

export function ComplianceCards({ stats }: ComplianceCardsProps) {
  const complianceColor =
    stats.compliancePercent === null
      ? "text-muted-foreground"
      : stats.compliancePercent >= 90
      ? "text-green-600"
      : stats.compliancePercent >= 70
      ? "text-yellow-600"
      : "text-red-600";

  const complianceBg =
    stats.compliancePercent === null
      ? "bg-muted/30"
      : stats.compliancePercent >= 90
      ? "bg-green-50 dark:bg-green-950/20"
      : stats.compliancePercent >= 70
      ? "bg-yellow-50 dark:bg-yellow-950/20"
      : "bg-red-50 dark:bg-red-950/20";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Required */}
      <Card className="bg-slate-50 dark:bg-slate-900/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-slate-500" />
            Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-700 dark:text-slate-200">
            {stats.totalDue}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Scheduled tasks in period
          </p>
        </CardContent>
      </Card>

      {/* Completed On Time */}
      <Card className={complianceBg}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <CheckCircle className={`h-4 w-4 ${complianceColor}`} />
            Completed On Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${complianceColor}`}>
            {stats.compliancePercent !== null
              ? `${stats.compliancePercent}%`
              : "N/A"}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.completedOnTime} of {stats.totalDue} tasks
          </p>
        </CardContent>
      </Card>

      {/* Overdue */}
      <Card
        className={
          stats.overdue > 0
            ? "bg-red-50 dark:bg-red-950/20"
            : "bg-muted/30"
        }
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <AlertTriangle
              className={`h-4 w-4 ${
                stats.overdue > 0 ? "text-red-600" : "text-muted-foreground"
              }`}
            />
            Overdue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`text-3xl font-bold ${
              stats.overdue > 0
                ? "text-red-600"
                : "text-muted-foreground"
            }`}
          >
            {stats.overdue}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Past due date, not completed
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
