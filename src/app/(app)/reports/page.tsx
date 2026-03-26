import { requireRole } from "@/lib/auth/guards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

export default async function CostReportsPage() {
  await requireRole(["manager"]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cost Reports</h1>
        <p className="text-muted-foreground">
          Parts and labor cost tracking by dock and category
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Coming in Phase 3
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Parts and labor cost tracking by dock and category with budget vs actual comparison.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
