"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { VALID_TRANSITIONS, STATUS_LABELS, isForwardTransition } from "@/lib/work-order-transitions";
import { transitionWorkOrder } from "@/lib/actions/work-orders";
import type { WorkOrderStatus } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface StatusTransitionProps {
  workOrderId: number;
  currentStatus: string;
  userRole: string;
}

export function StatusTransition({
  workOrderId,
  currentStatus,
  userRole,
}: StatusTransitionProps) {
  const [selectedStatus, setSelectedStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const validTargets = (
    VALID_TRANSITIONS[currentStatus as WorkOrderStatus] ?? []
  ).filter((target) => {
    if (target === "verified" && userRole !== "manager") return false;
    return true;
  });

  if (validTargets.length === 0) {
    return null;
  }

  function handleSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    if (!value) return;
    setSelectedStatus(value);
    setError(null);

    const forward = isForwardTransition(
      currentStatus as WorkOrderStatus,
      value as WorkOrderStatus
    );

    if (forward) {
      setShowNotes(true);
    } else {
      setShowConfirm(true);
    }
  }

  function executeTransition() {
    startTransition(async () => {
      const result = await transitionWorkOrder(
        workOrderId,
        selectedStatus,
        notes || undefined
      );
      if ("error" in result) {
        setError(result.error ?? "Unknown error");
      }
      setShowConfirm(false);
      setShowNotes(false);
      setSelectedStatus("");
      setNotes("");
    });
  }

  function handleCancel() {
    setShowConfirm(false);
    setShowNotes(false);
    setSelectedStatus("");
    setNotes("");
    setError(null);
  }

  return (
    <div className="flex items-center gap-2">
      <select
        className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm"
        value=""
        onChange={handleSelect}
        disabled={isPending}
      >
        <option value="">Move to...</option>
        {validTargets.map((target) => (
          <option key={target} value={target}>
            {STATUS_LABELS[target as WorkOrderStatus] ?? target}
          </option>
        ))}
      </select>

      {error && (
        <span className="text-sm text-red-600">{error}</span>
      )}

      {/* Forward transition: optional notes then execute */}
      <Dialog open={showNotes} onOpenChange={(open) => !open && handleCancel()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Transition to {STATUS_LABELS[selectedStatus as WorkOrderStatus]}
            </DialogTitle>
            <DialogDescription>
              Add optional notes for this status change.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={executeTransition} disabled={isPending}>
              {isPending ? "Updating..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Backward transition: confirm dialog */}
      <Dialog open={showConfirm} onOpenChange={(open) => !open && handleCancel()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Status Change</DialogTitle>
            <DialogDescription>
              Are you sure you want to move this work order back to{" "}
              <strong>
                {STATUS_LABELS[selectedStatus as WorkOrderStatus]}
              </strong>
              ?
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for moving back (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={executeTransition}
              disabled={isPending}
            >
              {isPending ? "Updating..." : "Move Back"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
