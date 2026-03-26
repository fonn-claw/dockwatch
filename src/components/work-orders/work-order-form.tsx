"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createWorkOrder } from "@/lib/actions/work-orders";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Dock {
  id: number;
  name: string;
}

interface Asset {
  id: number;
  name: string;
  dockId: number | null;
}

interface CrewUser {
  id: number;
  name: string;
  role: string;
}

interface WorkOrderFormProps {
  docks: Dock[];
  assets: Asset[];
  users: CrewUser[];
}

export function WorkOrderForm({ docks, assets, users }: WorkOrderFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createWorkOrder, null);
  const [selectedDockId, setSelectedDockId] = useState<string>("");

  const filteredAssets = selectedDockId
    ? assets.filter((a) => a.dockId === Number(selectedDockId))
    : assets;

  useEffect(() => {
    if (state?.success) {
      router.push("/work-orders");
    }
  }, [state, router]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Work Order</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-5">
          {state?.error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              name="title"
              required
              maxLength={255}
              placeholder="e.g., Inspect Dock A pilings"
              className="min-h-[44px] sm:min-h-0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Detailed description of the work to be done..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <select
                id="type"
                name="type"
                required
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[44px] sm:min-h-0"
              >
                <option value="preventive">Preventive</option>
                <option value="corrective">Corrective</option>
                <option value="inspection">Inspection</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <select
                id="priority"
                name="priority"
                required
                defaultValue="normal"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[44px] sm:min-h-0"
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dockId">Dock *</Label>
              <select
                id="dockId"
                name="dockId"
                required
                value={selectedDockId}
                onChange={(e) => setSelectedDockId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[44px] sm:min-h-0"
              >
                <option value="">Select dock...</option>
                {docks.map((dock) => (
                  <option key={dock.id} value={dock.id}>
                    {dock.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assetId">Asset</Label>
              <select
                id="assetId"
                name="assetId"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[44px] sm:min-h-0"
              >
                <option value="">None</option>
                {filteredAssets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assigneeId">Assignee</Label>
              <select
                id="assigneeId"
                name="assigneeId"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[44px] sm:min-h-0"
              >
                <option value="">Unassigned</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                className="min-h-[44px] sm:min-h-0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={2}
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={isPending} className="min-h-[44px]">
              {isPending ? "Creating..." : "Create Work Order"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/work-orders")}
              className="min-h-[44px]"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
