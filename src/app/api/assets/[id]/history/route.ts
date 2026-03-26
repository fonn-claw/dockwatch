import { getSession } from "@/lib/auth/session";
import { getAssetHistoryData } from "@/lib/queries/compliance";
import { renderToBuffer } from "@react-pdf/renderer";
import { AssetHistoryDocument } from "@/lib/pdf/asset-history";
import React from "react";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session.isLoggedIn || !["manager", "inspector"].includes(session.role)) {
    return new Response("Forbidden", { status: 403 });
  }

  const { id } = await params;
  const assetId = parseInt(id, 10);

  if (isNaN(assetId)) {
    return new Response("Invalid asset ID", { status: 400 });
  }

  const data = await getAssetHistoryData(assetId);

  if (!data) {
    return new Response("Asset not found", { status: 404 });
  }

  const buffer = await renderToBuffer(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    React.createElement(AssetHistoryDocument, { data }) as any
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="asset-history-${assetId}.pdf"`,
    },
  });
}
