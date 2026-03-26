"use client";

import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Clock, CheckCircle } from "lucide-react";

interface StatusCardsProps {
  stats: {
    overdueCount: number;
    dueSoonCount: number;
    onTrackCount: number;
  };
}

export function StatusCards({ stats }: StatusCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {/* Overdue */}
      <Card className="border-red-200 bg-red-50 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-5xl font-bold text-red-600">
                {stats.overdueCount}
              </p>
              <p className="mt-1 text-sm font-medium text-red-800">Overdue</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </CardContent>
      </Card>

      {/* Due Soon */}
      <Card className="border-yellow-200 bg-yellow-50 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-5xl font-bold text-yellow-600">
                {stats.dueSoonCount}
              </p>
              <p className="mt-1 text-sm font-medium text-yellow-800">
                Due Soon
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </CardContent>
      </Card>

      {/* On Track */}
      <Card className="border-green-200 bg-green-50 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-5xl font-bold text-green-600">
                {stats.onTrackCount}
              </p>
              <p className="mt-1 text-sm font-medium text-green-800">
                On Track
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
