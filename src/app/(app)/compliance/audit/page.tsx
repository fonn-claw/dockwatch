import { requireRole } from "@/lib/auth/guards";
import { getAuditTrail, getAllUsers } from "@/lib/queries/compliance";
import { AuditTable } from "@/components/compliance/audit-table";
import { FileText } from "lucide-react";
import Link from "next/link";

interface AuditTrailPageProps {
  searchParams: Promise<{
    entityType?: string;
    userId?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: string;
  }>;
}

export default async function AuditTrailPage({
  searchParams,
}: AuditTrailPageProps) {
  await requireRole(["manager", "inspector"]);
  const params = await searchParams;

  const filters = {
    entityType: params.entityType || undefined,
    userId: params.userId ? Number(params.userId) : undefined,
    dateFrom: params.dateFrom || undefined,
    dateTo: params.dateTo || undefined,
    page: params.page ? Number(params.page) : 1,
  };

  const [auditData, users] = await Promise.all([
    getAuditTrail(filters),
    getAllUsers(),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-7 w-7 text-slate-600" />
            Audit Trail
          </h1>
          <p className="text-muted-foreground">
            Complete log of all system actions with who, what, and when
          </p>
        </div>
        <Link
          href="/compliance"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Back to Compliance Dashboard
        </Link>
      </div>

      {/* Audit Table */}
      <AuditTable
        auditData={JSON.parse(JSON.stringify(auditData))}
        users={JSON.parse(JSON.stringify(users))}
        entityType={params.entityType}
        userId={params.userId}
        dateFrom={params.dateFrom}
        dateTo={params.dateTo}
      />
    </div>
  );
}
