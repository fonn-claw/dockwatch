import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/work-order-transitions";
import type { WorkOrderStatus } from "@/types";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const label = STATUS_LABELS[status as WorkOrderStatus] ?? status;
  const color = STATUS_COLORS[status as WorkOrderStatus] ?? "bg-gray-100 text-gray-800";

  return (
    <Badge variant="outline" className={cn(color, className)}>
      {label}
    </Badge>
  );
}
