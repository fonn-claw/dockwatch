"use client";

import { useState, useEffect, useTransition } from "react";
import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ConditionBadge } from "./condition-badge";
import { AssetFormDialog } from "./asset-form-dialog";
import { ASSET_TYPE_LABELS } from "./asset-filters";
import { deactivateAsset, updateConditionRating } from "@/lib/actions/assets";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/work-order-transitions";
import { cn } from "@/lib/utils";
import {
  MapPin,
  Calendar,
  Shield,
  FileText,
  Pencil,
  Trash2,
  Star,
  ExternalLink,
} from "lucide-react";
import type { SessionData } from "@/types";
import type { WorkOrderStatus } from "@/types";
import Link from "next/link";

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
  isActive: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  dock: Dock | null;
}

interface AssetDetailPanelProps {
  asset: Asset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: SessionData;
  docks: Dock[];
}

export function AssetDetailPanel({
  asset,
  open,
  onOpenChange,
  session,
  docks,
}: AssetDetailPanelProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const canEdit = session.role === "manager";
  const canRate = session.role === "manager" || session.role === "crew";

  // Reset state when asset changes
  useEffect(() => {
    setConfirmDeactivate(false);
  }, [asset?.id]);

  if (!asset) return null;

  function handleDeactivate() {
    if (!confirmDeactivate) {
      setConfirmDeactivate(true);
      return;
    }
    startTransition(async () => {
      await deactivateAsset(asset!.id);
      onOpenChange(false);
    });
  }

  function handleRatingChange(newRating: number) {
    startTransition(async () => {
      await updateConditionRating(asset!.id, newRating);
    });
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{asset.name}</SheetTitle>
            <SheetDescription>
              {ASSET_TYPE_LABELS[asset.assetType] ?? asset.assetType}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 px-4 pb-4">
            {/* Location info */}
            <div className="space-y-3">
              <DetailRow
                icon={<MapPin className="h-4 w-4" />}
                label="Location"
                value={asset.location}
              />
              <DetailRow
                icon={<MapPin className="h-4 w-4" />}
                label="Dock"
                value={asset.dock?.name ?? "Unassigned"}
              />
              <DetailRow
                icon={<Calendar className="h-4 w-4" />}
                label="Install Date"
                value={
                  asset.installDate
                    ? format(new Date(asset.installDate), "MMM d, yyyy")
                    : "Not recorded"
                }
              />
              <DetailRow
                icon={<Shield className="h-4 w-4" />}
                label="Warranty Expiry"
                value={
                  asset.warrantyExpiry
                    ? format(new Date(asset.warrantyExpiry), "MMM d, yyyy")
                    : "No warranty"
                }
              />
            </div>

            <Separator />

            {/* Condition rating */}
            <div>
              <p className="mb-2 text-sm font-medium text-muted-foreground">
                Condition Rating
              </p>
              <div className="flex items-center gap-2">
                <ConditionBadge rating={asset.conditionRating} />
                {canRate && (
                  <div className="ml-2 flex gap-1">
                    {[1, 2, 3, 4, 5].map((r) => (
                      <button
                        key={r}
                        onClick={() => handleRatingChange(r)}
                        disabled={isPending}
                        className={cn(
                          "flex h-7 w-7 items-center justify-center rounded-md text-xs font-medium transition-colors hover:bg-muted",
                          r === asset.conditionRating
                            ? "bg-muted ring-1 ring-ring"
                            : "bg-transparent"
                        )}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {asset.notes && (
              <>
                <Separator />
                <div>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    Notes
                  </div>
                  <p className="mt-1 text-sm">{asset.notes}</p>
                </div>
              </>
            )}

            <Separator />

            {/* Recent work orders placeholder */}
            <div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  Recent Work Orders
                </p>
                <Link
                  href={`/work-orders?assetId=${asset.id}`}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  View all <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Work order history will appear here once work orders are created.
              </p>
            </div>

            {/* Manager actions */}
            {canEdit && (
              <>
                <Separator />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowEditDialog(true)}
                  >
                    <Pencil className="mr-1.5 h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant={confirmDeactivate ? "destructive" : "outline"}
                    size="sm"
                    onClick={handleDeactivate}
                    disabled={isPending}
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    {confirmDeactivate ? "Confirm Deactivate" : "Deactivate"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {canEdit && (
        <AssetFormDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          docks={docks}
          asset={asset}
        />
      )}
    </>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm">{value}</p>
      </div>
    </div>
  );
}
