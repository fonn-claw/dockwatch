"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DockCost {
  dockId: number;
  dockName: string;
  partsCents: number;
  laborCents: number;
  totalCents: number;
  woCount: number;
}

interface CategoryCost {
  category: string;
  partsCents: number;
  laborCents: number;
  totalCents: number;
  woCount: number;
}

interface CostBreakdownTableProps {
  byDock: DockCost[];
  byCategory: CategoryCost[];
}

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

type SortKey = "name" | "parts" | "labor" | "total" | "count";
type SortDir = "asc" | "desc";

function useSortable<T>(
  data: T[],
  getters: Record<SortKey, (item: T) => number | string>
) {
  const [sortKey, setSortKey] = useState<SortKey>("total");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function toggle(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const sorted = [...data].sort((a, b) => {
    const aVal = getters[sortKey](a);
    const bVal = getters[sortKey](b);
    const cmp = typeof aVal === "string"
      ? aVal.localeCompare(bVal as string)
      : (aVal as number) - (bVal as number);
    return sortDir === "asc" ? cmp : -cmp;
  });

  return { sorted, sortKey, sortDir, toggle };
}

function SortHeader({
  label,
  field,
  current,
  dir,
  onToggle,
}: {
  label: string;
  field: SortKey;
  current: SortKey;
  dir: SortDir;
  onToggle: (k: SortKey) => void;
}) {
  return (
    <TableHead
      className="cursor-pointer select-none hover:text-foreground"
      onClick={() => onToggle(field)}
    >
      {label}
      {current === field && (
        <span className="ml-1">{dir === "asc" ? "\u2191" : "\u2193"}</span>
      )}
    </TableHead>
  );
}

export function CostBreakdownTable({ byDock, byCategory }: CostBreakdownTableProps) {
  const dockSort = useSortable(byDock, {
    name: (d) => d.dockName,
    parts: (d) => d.partsCents,
    labor: (d) => d.laborCents,
    total: (d) => d.totalCents,
    count: (d) => d.woCount,
  });

  const catSort = useSortable(byCategory, {
    name: (c) => c.category,
    parts: (c) => c.partsCents,
    labor: (c) => c.laborCents,
    total: (c) => c.totalCents,
    count: (c) => c.woCount,
  });

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">By Dock</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <SortHeader label="Dock" field="name" current={dockSort.sortKey} dir={dockSort.sortDir} onToggle={dockSort.toggle} />
                <SortHeader label="Parts" field="parts" current={dockSort.sortKey} dir={dockSort.sortDir} onToggle={dockSort.toggle} />
                <SortHeader label="Labor" field="labor" current={dockSort.sortKey} dir={dockSort.sortDir} onToggle={dockSort.toggle} />
                <SortHeader label="Total" field="total" current={dockSort.sortKey} dir={dockSort.sortDir} onToggle={dockSort.toggle} />
                <SortHeader label="WOs" field="count" current={dockSort.sortKey} dir={dockSort.sortDir} onToggle={dockSort.toggle} />
              </TableRow>
            </TableHeader>
            <TableBody>
              {dockSort.sorted.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No cost data for this period
                  </TableCell>
                </TableRow>
              ) : (
                dockSort.sorted.map((d) => (
                  <TableRow key={d.dockId}>
                    <TableCell className="font-medium">{d.dockName}</TableCell>
                    <TableCell>{formatCurrency(d.partsCents)}</TableCell>
                    <TableCell>{formatCurrency(d.laborCents)}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(d.totalCents)}</TableCell>
                    <TableCell>{d.woCount}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">By Category</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <SortHeader label="Category" field="name" current={catSort.sortKey} dir={catSort.sortDir} onToggle={catSort.toggle} />
                <SortHeader label="Parts" field="parts" current={catSort.sortKey} dir={catSort.sortDir} onToggle={catSort.toggle} />
                <SortHeader label="Labor" field="labor" current={catSort.sortKey} dir={catSort.sortDir} onToggle={catSort.toggle} />
                <SortHeader label="Total" field="total" current={catSort.sortKey} dir={catSort.sortDir} onToggle={catSort.toggle} />
                <SortHeader label="WOs" field="count" current={catSort.sortKey} dir={catSort.sortDir} onToggle={catSort.toggle} />
              </TableRow>
            </TableHeader>
            <TableBody>
              {catSort.sorted.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No cost data for this period
                  </TableCell>
                </TableRow>
              ) : (
                catSort.sorted.map((c) => (
                  <TableRow key={c.category}>
                    <TableCell className="font-medium">{capitalize(c.category)}</TableCell>
                    <TableCell>{formatCurrency(c.partsCents)}</TableCell>
                    <TableCell>{formatCurrency(c.laborCents)}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(c.totalCents)}</TableCell>
                    <TableCell>{c.woCount}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
