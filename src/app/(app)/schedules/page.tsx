import { requireRole } from "@/lib/auth/guards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export default async function SchedulesPage() {
  await requireRole(["manager"]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Schedules</h1>
        <p className="text-muted-foreground">
          Recurring preventive maintenance schedules
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Coming in Phase 3
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Recurring preventive maintenance schedules with auto-generated work orders and seasonal awareness.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
