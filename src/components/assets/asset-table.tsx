"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConditionBadge } from "./condition-badge";
import { AssetDetailPanel } from "./asset-detail-panel";
import { AssetFormDialog } from "./asset-form-dialog";
import { ASSET_TYPE_LABELS } from "./asset-filters";
import { Anchor, Plus } from "lucide-react";
import type { SessionData } from "@/types";

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

interface AssetTableProps {
  assets: Asset[];
  docks: Dock[];
  session: SessionData;
}

export function AssetTable({ assets, docks, session }: AssetTableProps) {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const isManager = session.role === "manager";

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {assets.length} asset{assets.length !== 1 ? "s" : ""}
        </p>
        {isManager && (
          <Button size="sm" onClick={() => setShowCreateDialog(true)} className="min-h-[44px]">
            <Plus className="mr-1.5 h-4 w-4" />
            New Asset
          </Button>
        )}
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Dock</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Install Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Anchor className="h-8 w-8 text-muted-foreground/50" />
                    <p className="font-medium text-foreground">No assets found</p>
                    <p className="text-sm text-muted-foreground">Create your first asset to get started.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              assets.map((asset) => (
                <TableRow
                  key={asset.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedAsset(asset)}
                >
                  <TableCell className="font-medium">{asset.name}</TableCell>
                  <TableCell>
                    {ASSET_TYPE_LABELS[asset.assetType] ?? asset.assetType}
                  </TableCell>
                  <TableCell>{asset.dock?.name ?? "---"}</TableCell>
                  <TableCell>
                    <ConditionBadge rating={asset.conditionRating} />
                  </TableCell>
                  <TableCell>
                    {asset.installDate
                      ? format(new Date(asset.installDate), "MMM d, yyyy")
                      : "---"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={asset.isActive ? "secondary" : "destructive"}>
                      {asset.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AssetDetailPanel
        asset={selectedAsset}
        open={selectedAsset !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedAsset(null);
        }}
        session={session}
        docks={docks}
      />

      {isManager && (
        <AssetFormDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          docks={docks}
        />
      )}
    </div>
  );
}
