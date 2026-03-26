import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";
import { getWorkOrderDetail, getWorkOrderActivity } from "@/lib/queries/work-orders";
import { WorkOrderDetail } from "@/components/work-orders/work-order-detail";

interface WorkOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function WorkOrderDetailPage({
  params,
}: WorkOrderDetailPageProps) {
  const session = await requireRole(["manager", "crew", "inspector"]);
  const { id } = await params;

  const workOrderId = parseInt(id, 10);
  if (isNaN(workOrderId)) {
    redirect("/work-orders");
  }

  const [workOrder, activity] = await Promise.all([
    getWorkOrderDetail(workOrderId),
    getWorkOrderActivity(workOrderId),
  ]);

  if (!workOrder) {
    redirect("/work-orders");
  }

  return (
    <WorkOrderDetail
      workOrder={JSON.parse(JSON.stringify(workOrder))}
      activity={JSON.parse(JSON.stringify(activity))}
      session={{
        userId: session.userId,
        email: session.email,
        name: session.name,
        role: session.role,
        isLoggedIn: session.isLoggedIn,
      }}
    />
  );
}
