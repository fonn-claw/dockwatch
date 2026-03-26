import { getSession } from "@/lib/auth/session";
import { getComplianceReportData } from "@/lib/queries/compliance";
import { renderToBuffer } from "@react-pdf/renderer";
import { ComplianceReportDocument } from "@/lib/pdf/compliance-report";
import React from "react";

export async function GET(request: Request) {
  const session = await getSession();

  if (!session.isLoggedIn || !["manager", "inspector"].includes(session.role)) {
    return new Response("Forbidden", { status: 403 });
  }

  const url = new URL(request.url);
  const period = (url.searchParams.get("period") ?? "quarter") as
    | "month"
    | "quarter"
    | "year";

  if (!["month", "quarter", "year"].includes(period)) {
    return new Response("Invalid period", { status: 400 });
  }

  const data = await getComplianceReportData(period);
  const buffer = await renderToBuffer(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    React.createElement(ComplianceReportDocument, { data }) as any
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="compliance-report-${period}.pdf"`,
    },
  });
}
