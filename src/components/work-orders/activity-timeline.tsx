import { formatDistanceToNow } from "date-fns";
import { STATUS_LABELS } from "@/lib/work-order-transitions";
import type { WorkOrderStatus } from "@/types";

interface ActivityEntry {
  id: number;
  action: string;
  metadata: Record<string, unknown> | null;
  userName: string;
  createdAt: Date | string;
}

const ACTION_LABELS: Record<string, string> = {
  create: "Created",
  transition: "Status changed",
  add_part: "Part added",
  remove_part: "Part removed",
  update_time: "Time updated",
  update_notes: "Notes updated",
  update_condition: "Condition updated",
};

const ACTION_COLORS: Record<string, string> = {
  create: "bg-blue-500",
  transition: "bg-yellow-500",
  add_part: "bg-green-500",
  remove_part: "bg-red-500",
  update_time: "bg-purple-500",
  update_notes: "bg-gray-500",
  update_condition: "bg-orange-500",
};

function getActionDetail(action: string, metadata: Record<string, unknown> | null): string | null {
  if (!metadata) return null;

  switch (action) {
    case "transition": {
      const from = STATUS_LABELS[metadata.from as WorkOrderStatus] ?? metadata.from;
      const to = STATUS_LABELS[metadata.to as WorkOrderStatus] ?? metadata.to;
      const detail = `from ${from} to ${to}`;
      return metadata.notes ? `${detail} - "${metadata.notes}"` : detail;
    }
    case "add_part":
      return `${metadata.partName} (qty: ${metadata.quantity})`;
    case "remove_part":
      return `Part #${metadata.partId} removed`;
    case "update_time":
      return `Set to ${metadata.minutes} minutes`;
    case "create":
      return metadata.title as string ?? null;
    default:
      return null;
  }
}

interface ActivityTimelineProps {
  activity: ActivityEntry[];
}

export function ActivityTimeline({ activity }: ActivityTimelineProps) {
  if (activity.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        No activity yet
      </div>
    );
  }

  return (
    <div className="relative space-y-0">
      {/* Vertical line */}
      <div className="absolute left-3 top-2 bottom-2 w-px bg-border" />

      {activity.map((entry) => {
        const dotColor = ACTION_COLORS[entry.action] ?? "bg-gray-400";
        const label = ACTION_LABELS[entry.action] ?? entry.action;
        const detail = getActionDetail(entry.action, entry.metadata);
        const timeAgo = formatDistanceToNow(new Date(entry.createdAt), {
          addSuffix: true,
        });

        return (
          <div key={entry.id} className="relative flex gap-4 pb-6 pl-8">
            {/* Dot */}
            <div
              className={`absolute left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-background ${dotColor}`}
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="font-medium text-sm">{label}</span>
                <span className="text-xs text-muted-foreground">
                  by {entry.userName}
                </span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {timeAgo}
                </span>
              </div>
              {detail && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {detail}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
