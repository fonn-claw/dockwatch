"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, Shield, Package, ClipboardList, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActivityEntry {
  id: number;
  action: string;
  entityType: string;
  entityId: number | null;
  userName: string;
  createdAt: Date;
}

interface ActivityFeedProps {
  entries: ActivityEntry[];
}

function getIcon(entityType: string) {
  switch (entityType) {
    case "work_order":
      return <Wrench className="h-4 w-4 text-blue-500" />;
    case "schedule":
      return <Shield className="h-4 w-4 text-purple-500" />;
    case "asset":
      return <Package className="h-4 w-4 text-orange-500" />;
    case "inspection":
      return <ClipboardList className="h-4 w-4 text-teal-500" />;
    default:
      return <Activity className="h-4 w-4 text-muted-foreground" />;
  }
}

function formatAction(action: string): string {
  return action
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatEntityType(entityType: string): string {
  return entityType.replace(/_/g, " ");
}

export function ActivityFeed({ entries }: ActivityFeedProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent activity</p>
        ) : (
          <ul className="space-y-3">
            {entries.map((entry) => (
              <li key={entry.id} className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">{getIcon(entry.entityType)}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{entry.userName}</span>{" "}
                    <span className="text-muted-foreground">
                      {formatAction(entry.action)}{" "}
                      {formatEntityType(entry.entityType)}
                      {entry.entityId ? ` #${entry.entityId}` : ""}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(entry.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
