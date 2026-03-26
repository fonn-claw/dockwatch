import { requireRole } from "@/lib/auth/guards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Anchor } from "lucide-react";

export default async function AssetsPage() {
  await requireRole(["manager", "crew", "inspector"]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Assets</h1>
        <p className="text-muted-foreground">
          Marina infrastructure catalog with condition tracking
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Anchor className="h-5 w-5" />
            Coming in Phase 2
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Marina infrastructure catalog with condition ratings, warranty info, and maintenance history.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
