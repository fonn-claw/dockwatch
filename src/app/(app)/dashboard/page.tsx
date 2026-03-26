import { requireRole } from "@/lib/auth/guards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard } from "lucide-react";

export default async function DashboardPage() {
  await requireRole(["manager"]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          At-a-glance maintenance health for Sunset Harbor Marina
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5" />
            Coming in Phase 4
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            At-a-glance maintenance health, upcoming calendar, activity feed, and cost summary.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
