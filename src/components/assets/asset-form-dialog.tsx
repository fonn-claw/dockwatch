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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createAsset, updateAsset } from "@/lib/actions/assets";
import { ASSET_TYPE_LABELS } from "./asset-filters";

interface Dock {
  id: number;
  name: string;
  code: string;
  slipCount: number;
  description: string | null;
}

interface Asset {
  id: number;
  name: string;
  assetType: string;
  dockId: number | null;
  location: string;
  installDate: Date | null;
  warrantyExpiry: Date | null;
  conditionRating: number;
  notes: string | null;
}

interface AssetFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  docks: Dock[];
  asset?: Asset | null;
}

export function AssetFormDialog({
  open,
  onOpenChange,
  docks,
  asset,
}: AssetFormDialogProps) {
  const isEdit = !!asset;

  const boundAction = isEdit
    ? updateAsset.bind(null, asset!.id)
    : createAsset;

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Asset" : "New Asset"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update asset information."
              : "Add a new asset to the marina infrastructure catalog."}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={asset?.name ?? ""}
                placeholder="e.g., Dock A Piling #1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assetType">Type</Label>
              <select
                id="assetType"
                name="assetType"
                required
                defaultValue={asset?.assetType ?? ""}
                className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="" disabled>
                  Select type...
                </option>
                {Object.entries(ASSET_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dockId">Dock</Label>
              <select
                id="dockId"
                name="dockId"
                required
                defaultValue={asset?.dockId ? String(asset.dockId) : ""}
                className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="" disabled>
                  Select dock...
                </option>
                {docks.map((dock) => (
                  <option key={dock.id} value={String(dock.id)}>
                    {dock.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                required
                defaultValue={asset?.location ?? ""}
                placeholder="e.g., North side, slip 12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="installDate">Install Date</Label>
              <Input
                id="installDate"
                name="installDate"
                type="date"
                defaultValue={formatDateForInput(asset?.installDate ?? null)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="warrantyExpiry">Warranty Expiry</Label>
              <Input
                id="warrantyExpiry"
                name="warrantyExpiry"
                type="date"
                defaultValue={formatDateForInput(asset?.warrantyExpiry ?? null)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="conditionRating">Condition Rating</Label>
              <select
                id="conditionRating"
                name="conditionRating"
                defaultValue={String(asset?.conditionRating ?? 3)}
                className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="1">1 - Poor</option>
                <option value="2">2 - Fair</option>
                <option value="3">3 - Good</option>
                <option value="4">4 - Very Good</option>
                <option value="5">5 - Excellent</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={asset?.notes ?? ""}
              placeholder="Optional notes about this asset..."
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
                  : "Create Asset"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
