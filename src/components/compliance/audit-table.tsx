"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface AuditEntry {
  id: number;
  action: string;
  entityType: string;
  entityId: number | null;
  userId: number | null;
  userName: string;
  metadata: Record<string, unknown> | null;
  createdAt: Date | string;
}

interface AuditUser {
  id: number;
  name: string;
  role: string;
}

interface AuditTableProps {
  auditData: {
    results: AuditEntry[];
    total: number;
    page: number;
    pageSize: number;
  };
  users: AuditUser[];
  entityType?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
}

const ACTION_LABELS: Record<string, string> = {
  create: "Created",
  transition: "Status Change",
  add_part: "Added Part",
  remove_part: "Removed Part",
  update_time: "Updated Time",
  update_notes: "Updated Notes",
  update_condition: "Condition Updated",
  auto_generate: "Auto-Generated",
  update: "Updated",
  delete: "Deleted",
  advance_schedule: "Schedule Advanced",
};

const ENTITY_TYPES = [
  { value: "", label: "All Entity Types" },
  { value: "asset", label: "Asset" },
  { value: "work_order", label: "Work Order" },
  { value: "schedule", label: "Schedule" },
];

function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function summarizeMetadata(metadata: Record<string, unknown> | null): string {
  if (!metadata) return "-";
  const str = JSON.stringify(metadata);
  return str.length > 100 ? str.slice(0, 97) + "..." : str;
}

export function AuditTable({
  auditData,
  users,
  entityType,
  userId,
  dateFrom,
  dateTo,
}: AuditTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(auditData.total / auditData.pageSize);

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Reset to page 1 on filter change
    params.delete("page");
    router.push(`/compliance/audit?${params.toString()}`);
  }

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (page > 1) {
      params.set("page", String(page));
    } else {
      params.delete("page");
    }
    router.push(`/compliance/audit?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-end">
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">
            Entity Type
          </label>
          <select
            className="h-9 min-h-[44px] sm:min-h-0 rounded-md border border-input bg-background px-3 text-sm"
            value={entityType ?? ""}
            onChange={(e) => updateFilter("entityType", e.target.value)}
          >
            {ENTITY_TYPES.map((et) => (
              <option key={et.value} value={et.value}>
                {et.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">
            User
          </label>
          <select
            className="h-9 min-h-[44px] sm:min-h-0 rounded-md border border-input bg-background px-3 text-sm"
            value={userId ?? ""}
            onChange={(e) => updateFilter("userId", e.target.value)}
          >
            <option value="">All Users</option>
            {users.map((u) => (
              <option key={u.id} value={String(u.id)}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">
            From
          </label>
          <input
            type="date"
            className="h-9 min-h-[44px] sm:min-h-0 rounded-md border border-input bg-background px-3 text-sm"
            value={dateFrom ?? ""}
            onChange={(e) => updateFilter("dateFrom", e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">
            To
          </label>
          <input
            type="date"
            className="h-9 min-h-[44px] sm:min-h-0 rounded-md border border-input bg-background px-3 text-sm"
            value={dateTo ?? ""}
            onChange={(e) => updateFilter("dateTo", e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Entity Type</TableHead>
            <TableHead>Entity ID</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {auditData.results.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center text-muted-foreground py-8"
              >
                No audit records found
              </TableCell>
            </TableRow>
          ) : (
            auditData.results.map((entry) => (
              <TableRow key={entry.id} className="hover:bg-muted/50">
                <TableCell className="text-muted-foreground text-xs">
                  {formatDateTime(entry.createdAt)}
                </TableCell>
                <TableCell>{entry.userName}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                    {ACTION_LABELS[entry.action] ?? entry.action}
                  </span>
                </TableCell>
                <TableCell className="capitalize">
                  {entry.entityType.replace(/_/g, " ")}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {entry.entityId !== null ? `#${entry.entityId}` : "-"}
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                  {summarizeMetadata(entry.metadata)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(auditData.page - 1) * auditData.pageSize + 1} to{" "}
            {Math.min(auditData.page * auditData.pageSize, auditData.total)} of{" "}
            {auditData.total} records
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(auditData.page - 1)}
              disabled={auditData.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {auditData.page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(auditData.page + 1)}
              disabled={auditData.page >= totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
