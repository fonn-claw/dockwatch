import { requireRole } from "@/lib/auth/guards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default async function AuditTrailPage() {
  await requireRole(["inspector"]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Trail</h1>
        <p className="text-muted-foreground">
          Complete audit trail of all system actions
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Coming in Phase 3
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Complete audit trail with who, what, and when for every action logged in the system.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
