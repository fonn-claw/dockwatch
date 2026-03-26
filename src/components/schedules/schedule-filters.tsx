"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ASSET_TYPE_LABELS } from "@/components/assets/asset-filters";

const FREQUENCY_LABELS: Record<string, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  annual: "Annual",
};

const SEASON_LABELS: Record<string, string> = {
  year_round: "Year Round",
  spring: "Spring",
  summer: "Summer",
  fall: "Fall",
  winter: "Winter",
};

const STATUS_OPTIONS = [
  { label: "All statuses", value: "" },
  { label: "On Track", value: "on_track" },
  { label: "Due Soon", value: "due_soon" },
  { label: "Overdue", value: "overdue" },
];

const SAFETY_OPTIONS = [
  { label: "All", value: "" },
  { label: "Safety Critical", value: "true" },
  { label: "Non-Critical", value: "false" },
];

interface ScheduleFiltersProps {
  currentAssetType?: string;
  currentFrequency?: string;
  currentSeason?: string;
  currentSafetyCritical?: string;
  currentStatus?: string;
}

export function ScheduleFilters({
  currentAssetType,
  currentFrequency,
  currentSeason,
  currentSafetyCritical,
  currentStatus,
}: ScheduleFiltersProps) {
  const router = useRouter();

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams();
    const current: Record<string, string | undefined> = {
      assetType: currentAssetType,
      frequency: currentFrequency,
      season: currentSeason,
      safetyCritical: currentSafetyCritical,
      status: currentStatus,
    };
    current[key] = value;

    for (const [k, v] of Object.entries(current)) {
      if (v) params.set(k, v);
    }

    const qs = params.toString();
    router.push(qs ? `/schedules?${qs}` : "/schedules");
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <Select
        value={currentAssetType ?? ""}
        onValueChange={(val) => updateFilter("assetType", val as string)}
      >
        <SelectTrigger className="w-full min-h-[44px] sm:min-h-0">
          <SelectValue placeholder="All types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All types</SelectItem>
          {Object.entries(ASSET_TYPE_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentFrequency ?? ""}
        onValueChange={(val) => updateFilter("frequency", val as string)}
      >
        <SelectTrigger className="w-full min-h-[44px] sm:min-h-0">
          <SelectValue placeholder="All frequencies" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All frequencies</SelectItem>
          {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentSeason ?? ""}
        onValueChange={(val) => updateFilter("season", val as string)}
      >
        <SelectTrigger className="w-full min-h-[44px] sm:min-h-0">
          <SelectValue placeholder="All seasons" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All seasons</SelectItem>
          {Object.entries(SEASON_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentSafetyCritical ?? ""}
        onValueChange={(val) => updateFilter("safetyCritical", val as string)}
      >
        <SelectTrigger className="w-full min-h-[44px] sm:min-h-0">
          <SelectValue placeholder="All" />
        </SelectTrigger>
        <SelectContent>
          {SAFETY_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentStatus ?? ""}
        onValueChange={(val) => updateFilter("status", val as string)}
      >
        <SelectTrigger className="w-full min-h-[44px] sm:min-h-0">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
