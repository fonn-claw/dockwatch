"use client";

import { useState, useTransition } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addPart, removePart, updateTimeSpent } from "@/lib/actions/work-orders";
import { Trash2, Plus, Clock, Save } from "lucide-react";

const LABOR_RATE_PER_MINUTE = 0.75;

interface Part {
  id: number;
  name: string;
  quantity: number;
  unitCost: number; // in cents
  notes: string | null;
}

interface PartsLaborTableProps {
  parts: Part[];
  workOrderId: number;
  timeSpentMinutes: number | null;
  userRole: string;
}

function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function formatDollars(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function PartsLaborTable({
  parts,
  workOrderId,
  timeSpentMinutes,
  userRole,
}: PartsLaborTableProps) {
  const canEdit = userRole === "manager" || userRole === "crew";
  const [isPending, startTransition] = useTransition();

  // Add part form state
  const [newName, setNewName] = useState("");
  const [newQty, setNewQty] = useState("1");
  const [newCost, setNewCost] = useState("");

  // Time editing state
  const [editingTime, setEditingTime] = useState(false);
  const [timeValue, setTimeValue] = useState(
    timeSpentMinutes?.toString() ?? "0"
  );

  const grandTotal = parts.reduce(
    (sum, p) => sum + p.quantity * p.unitCost,
    0
  );

  function handleAddPart() {
    if (!newName.trim() || !newCost) return;
    const formData = new FormData();
    formData.set("name", newName.trim());
    formData.set("quantity", newQty || "1");
    formData.set("unitCost", newCost);
    formData.set("notes", "");

    startTransition(async () => {
      await addPart(workOrderId, formData);
      setNewName("");
      setNewQty("1");
      setNewCost("");
    });
  }

  function handleRemovePart(partId: number) {
    if (!confirm("Remove this part?")) return;
    startTransition(async () => {
      await removePart(partId, workOrderId);
    });
  }

  function handleSaveTime() {
    const minutes = parseInt(timeValue, 10);
    if (isNaN(minutes) || minutes < 0) return;
    startTransition(async () => {
      await updateTimeSpent(workOrderId, minutes);
      setEditingTime(false);
    });
  }

  const laborCost = (timeSpentMinutes ?? 0) * LABOR_RATE_PER_MINUTE;

  return (
    <div className="space-y-6">
      {/* Parts Section */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Parts Used</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Part Name</TableHead>
              <TableHead className="w-20 text-right">Qty</TableHead>
              <TableHead className="w-28 text-right">Unit Cost</TableHead>
              <TableHead className="w-28 text-right">Total</TableHead>
              {canEdit && <TableHead className="w-12" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {parts.map((part) => (
              <TableRow key={part.id}>
                <TableCell>{part.name}</TableCell>
                <TableCell className="text-right">{part.quantity}</TableCell>
                <TableCell className="text-right">
                  {formatDollars(part.unitCost)}
                </TableCell>
                <TableCell className="text-right">
                  {formatDollars(part.quantity * part.unitCost)}
                </TableCell>
                {canEdit && (
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleRemovePart(part.id)}
                      disabled={isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}

            {parts.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={canEdit ? 5 : 4}
                  className="text-center text-muted-foreground py-4"
                >
                  No parts logged yet
                </TableCell>
              </TableRow>
            )}

            {/* Add Part Row */}
            {canEdit && (
              <TableRow className="bg-muted/30">
                <TableCell>
                  <Input
                    placeholder="Part name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="h-7 text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min={1}
                    value={newQty}
                    onChange={(e) => setNewQty(e.target.value)}
                    className="h-7 text-sm text-right w-16"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="$0.00"
                    value={newCost}
                    onChange={(e) => setNewCost(e.target.value)}
                    className="h-7 text-sm text-right w-24"
                  />
                </TableCell>
                <TableCell />
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={handleAddPart}
                    disabled={isPending || !newName.trim() || !newCost}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          {parts.length > 0 && (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3} className="font-semibold text-right">
                  Parts Total
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatDollars(grandTotal)}
                </TableCell>
                {canEdit && <TableCell />}
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>

      {/* Time Section */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Time Spent
        </h3>

        <div className="flex items-center gap-4">
          {editingTime && canEdit ? (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                value={timeValue}
                onChange={(e) => setTimeValue(e.target.value)}
                className="h-8 w-24 text-sm"
              />
              <span className="text-sm text-muted-foreground">minutes</span>
              <Button
                size="sm"
                onClick={handleSaveTime}
                disabled={isPending}
              >
                <Save className="h-3.5 w-3.5 mr-1" />
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingTime(false);
                  setTimeValue(timeSpentMinutes?.toString() ?? "0");
                }}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-2xl font-semibold tabular-nums">
                {timeSpentMinutes ? formatMinutes(timeSpentMinutes) : "0m"}
              </span>
              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingTime(true)}
                >
                  Edit
                </Button>
              )}
            </div>
          )}
        </div>

        {(timeSpentMinutes ?? 0) > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            Estimated labor cost: ${laborCost.toFixed(2)} (at $
            {LABOR_RATE_PER_MINUTE}/min)
          </p>
        )}
      </div>
    </div>
  );
}
