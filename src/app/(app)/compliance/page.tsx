import { requireRole } from "@/lib/auth/guards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

export default async function CompliancePage() {
  await requireRole(["manager", "inspector"]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Compliance</h1>
        <p className="text-muted-foreground">
          Compliance dashboard with required vs completed maintenance
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Coming in Phase 3
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Compliance dashboard showing what is required, what is done, and what is overdue with exportable reports.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
