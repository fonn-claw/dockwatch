import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const CONDITION_STYLES: Record<number, string> = {
  1: "border-red-300 bg-red-100 text-red-800",
  2: "border-orange-300 bg-orange-100 text-orange-800",
  3: "border-yellow-300 bg-yellow-100 text-yellow-800",
  4: "border-green-300 bg-green-100 text-green-800",
  5: "border-green-400 bg-green-200 text-green-900 font-bold",
};

interface ConditionBadgeProps {
  rating: number;
  className?: string;
}

export function ConditionBadge({ rating, className }: ConditionBadgeProps) {
  const style = CONDITION_STYLES[rating] ?? CONDITION_STYLES[3];

  return (
    <Badge
      variant="outline"
      className={cn(style, className)}
    >
      {rating}/5
    </Badge>
  );
}
