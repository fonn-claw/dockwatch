"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ASSET_TYPE_LABELS: Record<string, string> = {
  piling: "Piling",
  electrical_pedestal: "Electrical Pedestal",
  water_connection: "Water Connection",
  dock_light: "Dock Light",
  fire_extinguisher: "Fire Extinguisher",
  fuel_pump: "Fuel Pump",
  cleat: "Cleat",
  bumper: "Bumper",
  gangway: "Gangway",
  other: "Other",
};

const ASSET_TYPES = Object.keys(ASSET_TYPE_LABELS);

const CONDITION_OPTIONS = [
  { label: "Any condition", value: "" },
  { label: "1+ (Poor)", value: "1" },
  { label: "2+ (Fair)", value: "2" },
  { label: "3+ (Good)", value: "3" },
  { label: "4+ (Very Good)", value: "4" },
  { label: "5 (Excellent)", value: "5" },
];

interface Dock {
  id: number;
  name: string;
}

interface AssetFiltersProps {
  docks: Dock[];
  currentDockId?: string;
  currentAssetType?: string;
  currentMinCondition?: string;
}

export { ASSET_TYPE_LABELS };

export function AssetFilters({
  docks,
  currentDockId,
  currentAssetType,
  currentMinCondition,
}: AssetFiltersProps) {
  const router = useRouter();

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams();
    const current: Record<string, string | undefined> = {
      dockId: currentDockId,
      assetType: currentAssetType,
      minCondition: currentMinCondition,
    };
    current[key] = value;

    for (const [k, v] of Object.entries(current)) {
      if (v) params.set(k, v);
    }

    const qs = params.toString();
    router.push(qs ? `/assets?${qs}` : "/assets");
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Select
        value={currentDockId ?? ""}
        onValueChange={(val) => updateFilter("dockId", val as string)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="All docks" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All docks</SelectItem>
          {docks.map((dock) => (
            <SelectItem key={dock.id} value={String(dock.id)}>
              {dock.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentAssetType ?? ""}
        onValueChange={(val) => updateFilter("assetType", val as string)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="All types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All types</SelectItem>
          {ASSET_TYPES.map((type) => (
            <SelectItem key={type} value={type}>
              {ASSET_TYPE_LABELS[type]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentMinCondition ?? ""}
        onValueChange={(val) => updateFilter("minCondition", val as string)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Any condition" />
        </SelectTrigger>
        <SelectContent>
          {CONDITION_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
