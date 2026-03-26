"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScheduleTable } from "@/components/schedules/schedule-table";
import { ScheduleFormDialog } from "@/components/schedules/schedule-form-dialog";
import { Plus } from "lucide-react";
import type { SessionData } from "@/types";

interface Asset {
  id: number;
  name: string;
  assetType: string;
}

interface Schedule {
  id: number;
  name: string;
  description: string | null;
  assetType: string | null;
  assetId: number | null;
  frequency: string;
  season: string;
  isSafetyCritical: boolean;
  nextDueAt: Date;
  lastCompletedAt: Date | null;
  compliancePercent: number;
  statusColor: "green" | "yellow" | "red";
  assetName: string | null;
  dockName: string | null;
}

interface SchedulePageClientProps {
  schedules: Schedule[];
  assets: Asset[];
  session: SessionData;
}

export function SchedulePageClient({
  schedules,
  assets,
  session,
}: SchedulePageClientProps) {
  const [showCreate, setShowCreate] = useState(false);
  const isManager = session.role === "manager";

  return (
    <>
      {isManager && (
        <div className="flex justify-end">
          <Button size="sm" onClick={() => setShowCreate(true)} className="min-h-[44px]">
            <Plus className="mr-1.5 h-4 w-4" />
            New Schedule
          </Button>
        </div>
      )}

      <ScheduleTable schedules={schedules} assets={assets} session={session} />

      {isManager && (
        <ScheduleFormDialog
          open={showCreate}
          onOpenChange={setShowCreate}
          assets={assets}
        />
      )}
    </>
  );
}
