import type { WorkOrderStatus } from "@/types";

export const VALID_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  created: ["assigned"],
  assigned: ["in_progress", "created"],
  in_progress: ["completed", "assigned"],
  completed: ["verified", "in_progress"],
  verified: [],
};

export const FORWARD_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  created: ["assigned"],
  assigned: ["in_progress"],
  in_progress: ["completed"],
  completed: ["verified"],
  verified: [],
};

export function canTransition(from: WorkOrderStatus, to: WorkOrderStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function isForwardTransition(from: WorkOrderStatus, to: WorkOrderStatus): boolean {
  return FORWARD_TRANSITIONS[from]?.includes(to) ?? false;
}

export const STATUS_LABELS: Record<WorkOrderStatus, string> = {
  created: "Created",
  assigned: "Assigned",
  in_progress: "In Progress",
  completed: "Completed",
  verified: "Verified",
};

export const STATUS_COLORS: Record<WorkOrderStatus, string> = {
  created: "bg-gray-100 text-gray-800",
  assigned: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  verified: "bg-emerald-100 text-emerald-800",
};
