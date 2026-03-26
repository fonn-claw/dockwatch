"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

interface HealthScoresProps {
  marinaWide: number;
  byDock: Array<{
    dockId: number;
    dockName: string;
    dockCode: string;
    score: number;
  }>;
}

function scoreColor(score: number) {
  if (score >= 80) return { text: "text-green-600", ring: "#22c55e", bg: "bg-green-100" };
  if (score >= 60) return { text: "text-yellow-600", ring: "#eab308", bg: "bg-yellow-100" };
  return { text: "text-red-600", ring: "#ef4444", bg: "bg-red-100" };
}

export function HealthScores({ marinaWide, byDock }: HealthScoresProps) {
  const marinaColor = scoreColor(marinaWide);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Health Scores
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Marina-wide score with conic gradient ring */}
        <div className="flex flex-col items-center gap-2">
          <div
            className="flex h-28 w-28 items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(${marinaColor.ring} ${marinaWide}%, #e5e7eb ${marinaWide}%)`,
            }}
          >
            <div className="flex h-22 w-22 items-center justify-center rounded-full bg-card">
              <span className={`text-4xl font-bold ${marinaColor.text}`}>
                {marinaWide}
              </span>
            </div>
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            Marina Health Score
          </p>
        </div>

        {/* Per-dock scores */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {byDock.map((dock) => {
            const color = scoreColor(dock.score);
            return (
              <div
                key={dock.dockId}
                className="flex flex-col items-center rounded-lg border p-3"
              >
                <p className="text-xs font-medium text-muted-foreground">
                  {dock.dockName}
                </p>
                <p className={`text-2xl font-bold ${color.text}`}>
                  {dock.score}%
                </p>
                <div className="mt-1 h-1.5 w-full rounded-full bg-muted">
                  <div
                    className={`h-1.5 rounded-full ${color.bg}`}
                    style={{
                      width: `${dock.score}%`,
                      backgroundColor: color.ring,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
