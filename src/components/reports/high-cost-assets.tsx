"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface HighCostAsset {
  assetId: number;
  assetName: string;
  assetType: string;
  dockName: string;
  partsCents: number;
  laborCents: number;
  totalCents: number;
  woCount: number;
}

interface HighCostAssetsProps {
  assets: HighCostAsset[];
}

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatAssetType(type: string): string {
  return type
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function HighCostAssets({ assets }: HighCostAssetsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">High-Cost Assets</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Asset</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Dock</TableHead>
              <TableHead>Parts</TableHead>
              <TableHead>Labor</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>WOs</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  No cost data for this period
                </TableCell>
              </TableRow>
            ) : (
              assets.map((asset, idx) => (
                <TableRow
                  key={asset.assetId}
                  className={idx < 3 ? "bg-amber-50 dark:bg-amber-950/20" : ""}
                >
                  <TableCell className="font-medium text-muted-foreground">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="font-medium">{asset.assetName}</TableCell>
                  <TableCell>{formatAssetType(asset.assetType)}</TableCell>
                  <TableCell>{asset.dockName}</TableCell>
                  <TableCell>{formatCurrency(asset.partsCents)}</TableCell>
                  <TableCell>{formatCurrency(asset.laborCents)}</TableCell>
                  <TableCell className="font-semibold">{formatCurrency(asset.totalCents)}</TableCell>
                  <TableCell>{asset.woCount}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {assets.length > 0 && (
          <p className="text-xs text-muted-foreground mt-3 italic">
            Assets with highest maintenance costs may be candidates for replacement
          </p>
        )}
      </CardContent>
    </Card>
  );
}
