import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const PRIORITY_STYLES: Record<string, string> = {
  urgent: "border-red-300 bg-red-100 text-red-800",
  high: "border-orange-300 bg-orange-100 text-orange-800",
  normal: "border-blue-300 bg-blue-100 text-blue-800",
  low: "border-gray-300 bg-gray-100 text-gray-600",
};

const PRIORITY_LABELS: Record<string, string> = {
  urgent: "Urgent",
  high: "High",
  normal: "Normal",
  low: "Low",
};

interface PriorityBadgeProps {
  priority: string;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const style = PRIORITY_STYLES[priority] ?? PRIORITY_STYLES.normal;

  return (
    <Badge variant="outline" className={cn(style, className)}>
      {PRIORITY_LABELS[priority] ?? priority}
    </Badge>
  );
}
