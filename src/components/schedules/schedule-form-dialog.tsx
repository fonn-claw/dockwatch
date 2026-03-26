"use client";

import { useActionState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createSchedule, updateSchedule } from "@/lib/actions/schedules";
import { ASSET_TYPE_LABELS } from "@/components/assets/asset-filters";

const FREQUENCY_OPTIONS = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annual", label: "Annual" },
];

const SEASON_OPTIONS = [
  { value: "year_round", label: "Year Round" },
  { value: "spring", label: "Spring" },
  { value: "summer", label: "Summer" },
  { value: "fall", label: "Fall" },
  { value: "winter", label: "Winter" },
];

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
}

interface ScheduleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assets: Asset[];
  schedule?: Schedule | null;
}

export function ScheduleFormDialog({
  open,
  onOpenChange,
  assets,
  schedule,
}: ScheduleFormDialogProps) {
  const isEdit = !!schedule;

  const boundAction = isEdit
    ? updateSchedule.bind(null, schedule!.id)
    : createSchedule;

  const [state, formAction, isPending] = useActionState(boundAction, null);

  useEffect(() => {
    if (state?.success) {
      onOpenChange(false);
    }
  }, [state, onOpenChange]);

  function formatDateForInput(date: Date | null): string {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  }

  const selectClassName =
    "flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Schedule" : "New Maintenance Schedule"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the maintenance schedule details."
              : "Create a recurring preventive maintenance schedule."}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={schedule?.name ?? ""}
                placeholder="e.g., Inspect Dock A pilings"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assetType">Asset Type</Label>
              <select
                id="assetType"
                name="assetType"
                defaultValue={schedule?.assetType ?? ""}
                className={selectClassName}
              >
                <option value="">Any type</option>
                {Object.entries(ASSET_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assetId">Specific Asset</Label>
              <select
                id="assetId"
                name="assetId"
                defaultValue={schedule?.assetId ? String(schedule.assetId) : ""}
                className={selectClassName}
              >
                <option value="">None (type-wide)</option>
                {assets.map((a) => (
                  <option key={a.id} value={String(a.id)}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <select
                id="frequency"
                name="frequency"
                required
                defaultValue={schedule?.frequency ?? "monthly"}
                className={selectClassName}
              >
                {FREQUENCY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="season">Season</Label>
              <select
                id="season"
                name="season"
                required
                defaultValue={schedule?.season ?? "year_round"}
                className={selectClassName}
              >
                {SEASON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nextDueAt">Next Due Date</Label>
              <Input
                id="nextDueAt"
                name="nextDueAt"
                type="date"
                required
                defaultValue={formatDateForInput(schedule?.nextDueAt ?? null)}
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                id="isSafetyCritical"
                name="isSafetyCritical"
                type="checkbox"
                defaultChecked={schedule?.isSafetyCritical ?? false}
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="isSafetyCritical" className="text-sm font-normal">
                Safety Critical
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={schedule?.description ?? ""}
              placeholder="Optional details about this maintenance task..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? isEdit
                  ? "Saving..."
                  : "Creating..."
                : isEdit
                  ? "Save Changes"
                  : "Create Schedule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
