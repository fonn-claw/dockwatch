"use server";

import { db } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema";

interface LogAuditParams {
  userId: number;
  action: string;
  entityType: string;
  entityId: number;
  metadata?: Record<string, unknown>;
}

export async function logAudit(params: LogAuditParams) {
  await db.insert(auditLogs).values({
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId,
    userId: params.userId,
    metadata: params.metadata ?? null,
  });
}
