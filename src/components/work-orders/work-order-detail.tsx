"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, Calendar, MapPin, User, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusBadge } from "./status-badge";
import { PriorityBadge } from "./priority-badge";
import { StatusTransition } from "./status-transition";
import { ActivityTimeline } from "./activity-timeline";
import { PartsLaborTable } from "./parts-labor-table";
import { PhotoGallery } from "./photo-gallery";
import { updateWorkOrderNotes } from "@/lib/actions/work-orders";
import type { SessionData } from "@/types";

interface WorkOrderData {
  id: number;
  title: string;
  description: string | null;
  status: string;
  type: string;
  priority: string;
  dueDate: string | null;
  startedAt: string | null;
  completedAt: string | null;
  verifiedAt: string | null;
  notes: string | null;
  timeSpentMinutes: number | null;
  createdAt: string;
  dock: { id: number; name: string; code: string } | null;
  asset: { id: number; name: string; assetType: string } | null;
  assignee: { id: number; name: string } | null;
  createdBy: { id: number; name: string };
  verifiedBy: { id: number; name: string } | null;
  parts: Array<{
    id: number;
    name: string;
    quantity: number;
    unitCost: number;
    notes: string | null;
  }>;
}

interface ActivityEntry {
  id: number;
  action: string;
  metadata: Record<string, unknown> | null;
  userName: string;
  createdAt: string;
}

interface WorkOrderDetailProps {
  workOrder: WorkOrderData;
  activity: ActivityEntry[];
  session: SessionData;
}

function isOverdue(dueDate: string | null, status: string): boolean {
  if (!dueDate || status === "completed" || status === "verified") return false;
  return new Date(dueDate) < new Date();
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "--";
  return format(new Date(dateStr), "MMM d, yyyy h:mm a");
}

const TYPE_LABELS: Record<string, string> = {
  preventive: "Preventive",
  corrective: "Corrective",
  inspection: "Inspection",
  emergency: "Emergency",
};

export function WorkOrderDetail({
  workOrder,
  activity,
  session,
}: WorkOrderDetailProps) {
  const canEdit = session.role === "manager" || session.role === "crew";
  const [notesValue, setNotesValue] = useState(workOrder.notes ?? "");
  const [notesSaved, setNotesSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const overdue = isOverdue(workOrder.dueDate, workOrder.status);

  function handleSaveNotes() {
    startTransition(async () => {
      await updateWorkOrderNotes(workOrder.id, notesValue);
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    });
  }

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Button
        variant="ghost"
        size="sm"
        render={<Link href="/work-orders" />}
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Work Orders
      </Button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight">
              {workOrder.title}
            </h1>
            <span className="text-sm text-muted-foreground">
              #{workOrder.id}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={workOrder.status} />
            <PriorityBadge priority={workOrder.priority} />
            <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
              {TYPE_LABELS[workOrder.type] ?? workOrder.type}
            </span>
          </div>
        </div>

        <StatusTransition
          workOrderId={workOrder.id}
          currentStatus={workOrder.status}
          userRole={session.role}
        />
      </div>

      {/* Info Grid */}
      <Card className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <Wrench className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-muted-foreground text-xs">Asset</p>
              <p className="font-medium">
                {workOrder.asset ? workOrder.asset.name : "None"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-muted-foreground text-xs">Dock</p>
              <p className="font-medium">
                {workOrder.dock
                  ? `${workOrder.dock.name} (${workOrder.dock.code})`
                  : "None"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <User className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-muted-foreground text-xs">Assignee</p>
              <p className="font-medium">
                {workOrder.assignee?.name ?? "Unassigned"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <User className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-muted-foreground text-xs">Created By</p>
              <p className="font-medium">{workOrder.createdBy.name}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-muted-foreground text-xs">Due Date</p>
              <p
                className={`font-medium ${
                  overdue ? "text-red-600" : ""
                }`}
              >
                {workOrder.dueDate
                  ? format(new Date(workOrder.dueDate), "MMM d, yyyy")
                  : "No due date"}
                {overdue && (
                  <span className="ml-1 text-xs font-normal">(Overdue)</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-muted-foreground text-xs">Created</p>
              <p className="font-medium">
                {format(new Date(workOrder.createdAt), "MMM d, yyyy")}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="parts">Parts &amp; Labor</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          {/* Description */}
          {workOrder.description && (
            <Card className="p-4">
              <h3 className="text-sm font-semibold mb-2">Description</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {workOrder.description}
              </p>
            </Card>
          )}

          {/* Notes */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-2">Notes</h3>
            {canEdit ? (
              <div className="space-y-2">
                <Textarea
                  value={notesValue}
                  onChange={(e) => {
                    setNotesValue(e.target.value);
                    setNotesSaved(false);
                  }}
                  placeholder="Add notes..."
                  rows={3}
                />
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveNotes}
                    disabled={isPending}
                  >
                    {isPending ? "Saving..." : "Save Notes"}
                  </Button>
                  {notesSaved && (
                    <span className="text-xs text-green-600">Saved</span>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {workOrder.notes || "No notes"}
              </p>
            )}
          </Card>

          {/* Key Dates */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-3">Key Dates</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Started</p>
                <p className="font-medium">{formatDate(workOrder.startedAt)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Completed</p>
                <p className="font-medium">
                  {formatDate(workOrder.completedAt)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Verified</p>
                <p className="font-medium">
                  {formatDate(workOrder.verifiedAt)}
                  {workOrder.verifiedBy && (
                    <span className="text-xs text-muted-foreground ml-1">
                      by {workOrder.verifiedBy.name}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <Card className="p-4">
            <ActivityTimeline activity={activity} />
          </Card>
        </TabsContent>

        <TabsContent value="parts" className="mt-4">
          <Card className="p-4">
            <PartsLaborTable
              parts={workOrder.parts}
              workOrderId={workOrder.id}
              timeSpentMinutes={workOrder.timeSpentMinutes}
              userRole={session.role}
            />
          </Card>
        </TabsContent>

        <TabsContent value="photos" className="mt-4">
          <Card className="p-4">
            <PhotoGallery />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
