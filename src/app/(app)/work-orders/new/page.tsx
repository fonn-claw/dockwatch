import { requireRole } from "@/lib/auth/guards";
import { getDocks } from "@/lib/queries/assets";
import { getAssets } from "@/lib/queries/assets";
import { getCrewUsers } from "@/lib/queries/work-orders";
import { WorkOrderForm } from "@/components/work-orders/work-order-form";

export default async function NewWorkOrderPage() {
  await requireRole(["manager"]);

  const [docks, assets, users] = await Promise.all([
    getDocks(),
    getAssets({}),
    getCrewUsers(),
  ]);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Work Order</h1>
        <p className="text-muted-foreground">
          Create a new maintenance work order
        </p>
      </div>

      <WorkOrderForm
        docks={JSON.parse(JSON.stringify(docks))}
        assets={JSON.parse(JSON.stringify(assets))}
        users={JSON.parse(JSON.stringify(users))}
      />
    </div>
  );
}
