import { requireRole } from "@/lib/auth/guards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";

export default async function WorkOrdersPage() {
  await requireRole(["manager", "crew"]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Work Orders</h1>
        <p className="text-muted-foreground">
          Create, assign, and track maintenance work orders
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Coming in Phase 2
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Create, assign, and track maintenance work orders with photos, parts, and time tracking.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
