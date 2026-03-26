# Phase 2: Assets & Work Orders - Research

**Researched:** 2026-03-26
**Domain:** Asset registry CRUD, work order lifecycle management, server-side state machine
**Confidence:** HIGH

## Summary

Phase 2 builds two core operational features on top of Phase 1's foundation: an asset registry with CRUD, condition tracking, and filtering; and a work order management system with a server-enforced status workflow, parts/labor logging, and mobile-friendly card views. The database schema, auth guards, session management, and app shell are all in place from Phase 1 -- this phase adds server actions, query functions, and UI components.

The primary technical challenges are: (1) building a valid-transitions-only state machine for work order status that is enforced server-side with audit logging on every transition, (2) creating a sortable/filterable data table for assets and card-based list for work orders with proper mobile responsiveness, and (3) ensuring every mutation writes to the audit_logs table for downstream compliance features in Phase 3.

**Primary recommendation:** Build the asset layer first (simpler CRUD), then work orders (depends on assets for the asset picker). Use shadcn's Table component for assets, card layout for work orders. Define the status transition map as a shared constant and validate in every server action. Use `revalidatePath` after mutations.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Data table with sortable columns for asset list (not cards)
- Asset detail via slide-over panel (Sheet component), not separate page
- Condition rating as color-coded numeric badge (1=red, 2=orange, 3=yellow, 4=green, 5=green-bold)
- Manager creates/edits assets via modal dialog
- Filter bar above table: by dock, asset type, condition range
- Soft-deleted assets hidden by default, not shown to non-managers
- Card-based list for work orders with prominent status badges
- Priority colors: urgent=red, high=orange, normal=blue, low=gray
- Work order detail is a dedicated page with tabbed sections: Overview, Activity, Parts & Labor, Photos
- Placeholder photos as side-by-side thumbnails
- Parts and labor logged via inline editable rows
- Status transitions as dropdown with only valid next states (server-enforced)
- Valid transitions: created->assigned, assigned->in-progress, in-progress->completed, completed->verified
- No confirmation for forward moves, confirm required for backward moves
- Vertical activity timeline on work order detail
- Each status change creates an audit_log entry
- Cards stack full-width on mobile, filter panel collapses, 44px touch targets
- No offline support

### Claude's Discretion
- Exact table component choice (shadcn DataTable vs custom)
- Slide-over panel animation and width
- Form field validation UX details
- Pagination strategy for large lists
- Loading states and skeleton designs
- Exact mobile breakpoint behaviors

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ASSET-01 | View catalog of marina assets | Data table component with sortable columns; query function with joins to docks |
| ASSET-02 | Each asset displays location, install date, warranty info, maintenance history | Slide-over panel with asset detail; query joining work_orders for history |
| ASSET-03 | Asset condition rating (1-5) updated after inspection | Color-coded badge component; server action to update conditionRating |
| ASSET-04 | Manager can create, edit, deactivate assets | Dialog form with Zod validation; requireRole(['manager']) guard; soft-delete via deletedAt |
| ASSET-05 | Filter/search by dock, type, condition | Filter bar with Select dropdowns; URL searchParams for server-side filtering |
| WO-01 | Manager creates work orders with assignee, priority, due date, type | Dialog/page form; Zod schema; server action with requireRole(['manager']) |
| WO-02 | Status workflow: created->assigned->in-progress->completed->verified | VALID_TRANSITIONS map; status dropdown showing only valid next states |
| WO-03 | Status transitions enforced server-side | Server action validates canTransition() before updating; rejects invalid jumps |
| WO-04 | Crew updates status, logs notes, parts, time | Server action with requireRole(['manager','crew']); workOrderParts insert; timeSpentMinutes update |
| WO-05 | Placeholder photos (before/after) | Static placeholder images in /public; side-by-side thumbnail display |
| WO-06 | Filter/search by dock, status, priority, assignee, date range | URL searchParams; filter bar with multiple Select components |
| WO-07 | Mobile-friendly work order list | Card layout stacks vertically; 44px touch targets; collapsible filter panel |
</phase_requirements>

## Standard Stack

### Core (already installed from Phase 1)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.1 | App Router, RSC, server actions | Already installed |
| Drizzle ORM | 0.45.1 | Database queries and mutations | Already installed, schema defined |
| iron-session | 8.0.4 | Session/auth guards | Already installed with requireRole() |
| shadcn/ui | CLI v4 | UI component library | Already initialized |
| Zod | 4.3.6 | Form/action input validation | Already installed, using zod/v4 import |
| date-fns | 4.1.0 | Date formatting and comparison | Already installed |
| Lucide React | latest | Icons | Already installed |

### Components to Add (via shadcn CLI)
| Component | Purpose | Command |
|-----------|---------|---------|
| table | Asset registry data table | `npx shadcn@latest add table` |
| dialog | Asset create/edit modal | `npx shadcn@latest add dialog` |
| select | Filter dropdowns (dock, type, status, priority) | `npx shadcn@latest add select` |
| tabs | Work order detail page sections | `npx shadcn@latest add tabs` |
| textarea | Notes fields in forms | `npx shadcn@latest add textarea` |
| calendar | Date picker for due dates | `npx shadcn@latest add calendar` |
| popover | Date picker wrapper | `npx shadcn@latest add popover` |

**Installation:**
```bash
npx shadcn@latest add table dialog select tabs textarea calendar popover
```

### Already Installed shadcn Components
badge, button, card, dropdown-menu, input, label, separator, sheet, tooltip, avatar

## Architecture Patterns

### Recommended File Structure for Phase 2
```
src/
├── app/(app)/
│   ├── assets/
│   │   └── page.tsx               # Server component: asset list with filters
│   ├── work-orders/
│   │   ├── page.tsx               # Server component: work order card list
│   │   ├── new/
│   │   │   └── page.tsx           # Create work order form page
│   │   └── [id]/
│   │       └── page.tsx           # Work order detail with tabs
├── components/
│   ├── assets/
│   │   ├── asset-table.tsx        # Client: sortable data table
│   │   ├── asset-filters.tsx      # Client: filter bar
│   │   ├── asset-detail-panel.tsx # Client: Sheet slide-over
│   │   ├── asset-form-dialog.tsx  # Client: create/edit dialog
│   │   └── condition-badge.tsx    # Shared: color-coded 1-5 badge
│   └── work-orders/
│       ├── work-order-card.tsx    # Client: single WO card
│       ├── work-order-list.tsx    # Client: card list with filters
│       ├── work-order-filters.tsx # Client: filter bar
│       ├── work-order-detail.tsx  # Client: tabbed detail view
│       ├── status-transition.tsx  # Client: status dropdown
│       ├── activity-timeline.tsx  # Shared: vertical timeline
│       ├── parts-labor-table.tsx  # Client: inline editable rows
│       ├── photo-gallery.tsx      # Shared: placeholder thumbnails
│       └── priority-badge.tsx     # Shared: priority color badge
├── lib/
│   ├── actions/
│   │   ├── assets.ts              # Server actions: CRUD + condition update
│   │   └── work-orders.ts         # Server actions: CRUD + transitions + parts
│   ├── queries/
│   │   ├── assets.ts              # Query functions: list, detail, history
│   │   └── work-orders.ts         # Query functions: list, detail, activity
│   └── work-order-transitions.ts  # Shared: VALID_TRANSITIONS map + validation
```

### Pattern 1: Server-Enforced Status Transitions
**What:** A shared transition map defines valid status moves. Every server action that changes status validates against this map before writing to the database. Invalid transitions return an error.
**When to use:** Every work order status change.
**Example:**
```typescript
// lib/work-order-transitions.ts
export const VALID_TRANSITIONS: Record<string, string[]> = {
  created: ["assigned"],
  assigned: ["in_progress", "created"],     // backward allowed with confirm
  in_progress: ["completed", "assigned"],   // backward allowed with confirm
  completed: ["verified", "in_progress"],   // backward allowed with confirm
  verified: [],                             // terminal state
};

export const FORWARD_TRANSITIONS: Record<string, string[]> = {
  created: ["assigned"],
  assigned: ["in_progress"],
  in_progress: ["completed"],
  completed: ["verified"],
};

export function canTransition(from: string, to: string): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function isForwardTransition(from: string, to: string): boolean {
  return FORWARD_TRANSITIONS[from]?.includes(to) ?? false;
}
```

### Pattern 2: Audit Log Helper
**What:** A reusable function that inserts an audit_log entry for any entity mutation. Called at the end of every server action.
**When to use:** Every create, update, delete, and status transition action.
**Example:**
```typescript
// lib/actions/audit.ts
"use server";
import { db } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema";

export async function logAudit(params: {
  userId: number;
  action: string;
  entityType: string;
  entityId: number;
  metadata?: Record<string, unknown>;
}) {
  await db.insert(auditLogs).values({
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId,
    userId: params.userId,
    metadata: params.metadata ?? null,
  });
}
```

### Pattern 3: URL-Based Filtering with searchParams
**What:** Filter state lives in URL search params, not in React state. Server component reads searchParams, passes them to query functions. Client filter components update the URL via `useRouter().push()`.
**When to use:** Asset list filters, work order list filters.
**Why:** Shareable URLs, back button works, SSR renders correct data, no hydration mismatch.
**Example:**
```typescript
// app/(app)/assets/page.tsx
export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<{ dock?: string; type?: string; condition?: string }>;
}) {
  const session = await requireRole(["manager", "crew", "inspector"]);
  const params = await searchParams;
  const assets = await getAssets({
    dockId: params.dock ? parseInt(params.dock) : undefined,
    assetType: params.type,
    minCondition: params.condition ? parseInt(params.condition) : undefined,
    showDeleted: session.role === "manager" ? false : false,
  });
  return <AssetTable assets={assets} filters={params} />;
}
```

### Pattern 4: Server Action with revalidatePath
**What:** After every mutation, call `revalidatePath` on affected routes so the UI reflects changes without manual refresh.
**Example:**
```typescript
// In server action after db mutation:
import { revalidatePath } from "next/cache";

revalidatePath("/assets");
revalidatePath("/work-orders");
revalidatePath(`/work-orders/${id}`);
```

### Anti-Patterns to Avoid
- **Client-side state machine:** Do NOT put transition validation in client components only. The server action MUST validate.
- **Separate API routes for CRUD:** Use server actions directly. No need for /api/assets or /api/work-orders routes.
- **Over-engineering with TanStack Table:** For this data volume (<200 assets), a simple shadcn Table with manual sort/filter logic is sufficient. TanStack Table adds bundle size and complexity for minimal benefit at this scale.
- **Storing audit changes as computed diffs:** Keep metadata simple -- log the action and relevant IDs. Do not build a generic object-diff system.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Data table with sorting | Custom table with sort state | shadcn Table + manual sort in query | shadcn handles styling, sort via ORDER BY in SQL |
| Modal dialogs | Custom overlay + portal | shadcn Dialog | Accessibility, focus trap, ESC to close |
| Slide-over panels | Custom fixed sidebar | shadcn Sheet (side="right") | Already installed, handles animation and overlay |
| Filter dropdowns | Custom select menus | shadcn Select | Keyboard navigation, accessibility |
| Date picker | Custom calendar input | shadcn Calendar + Popover | Complex date handling, localization |
| Status badge colors | Inline conditional classes | CVA variant map or utility function | Consistent across components |
| Form validation | Manual field checking | Zod schemas with safeParse | Type inference, consistent error messages |

## Common Pitfalls

### Pitfall 1: Work Order State Machine Not Server-Enforced
**What goes wrong:** Status dropdown on client allows any transition, server action blindly accepts the new status. Work orders end up in impossible states (created -> completed).
**Why it happens:** Developer focuses on UI and forgets to validate on server.
**How to avoid:** canTransition() check as FIRST thing in the transition server action, before any DB write.
**Warning signs:** Work order in "completed" status with no assignee.

### Pitfall 2: Missing Audit Log Entries
**What goes wrong:** Some mutations don't write audit entries. Compliance reports in Phase 3 have gaps.
**Why it happens:** Developer forgets to call logAudit() in a server action, or the audit write fails silently.
**How to avoid:** Every server action follows the pattern: validate -> mutate -> audit -> revalidate. Never skip audit.
**Warning signs:** Audit trail for a work order is missing status transitions.

### Pitfall 3: N+1 Queries on Asset/Work Order Lists
**What goes wrong:** List page queries each asset's dock name and each work order's assignee name individually.
**Why it happens:** Using Drizzle's relational queries without specifying joins, or fetching lists then looping to get related data.
**How to avoid:** Use Drizzle's `with` clause for relational queries, or explicit joins in the query function. Fetch all data in a single query per list view.
**Example:**
```typescript
const results = await db.query.assets.findMany({
  with: { dock: true },
  where: isNull(assets.deletedAt),
  orderBy: [asc(assets.name)],
});
```

### Pitfall 4: Forgetting to Filter Soft-Deleted Assets
**What goes wrong:** Deactivated assets appear in all lists and dropdowns, including the asset picker in work order creation.
**Why it happens:** Developer adds `deletedAt` column but doesn't filter by it in queries.
**How to avoid:** Every asset query MUST include `where: isNull(assets.deletedAt)` unless explicitly showing deleted items (manager-only admin view).

### Pitfall 5: searchParams Type Mismatch in Next.js 16
**What goes wrong:** searchParams is a Promise in Next.js 15+ App Router. Destructuring directly without await causes runtime errors.
**Why it happens:** Next.js changed searchParams to be async in v15+.
**How to avoid:** Always await searchParams: `const params = await searchParams;`

### Pitfall 6: Forgetting revalidatePath After Mutations
**What goes wrong:** User creates an asset or changes work order status, but the list page still shows stale data until manual refresh.
**Why it happens:** Server action mutates DB but doesn't tell Next.js to revalidate affected pages.
**How to avoid:** Call `revalidatePath()` for every affected route at the end of every server action.

## Code Examples

### Asset CRUD Server Action Pattern
```typescript
// lib/actions/assets.ts
"use server";
import { db } from "@/lib/db";
import { assets } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth/guards";
import { revalidatePath } from "next/cache";
import { z } from "zod/v4";
import { eq } from "drizzle-orm";

const createAssetSchema = z.object({
  name: z.string().min(1).max(255),
  assetType: z.enum(["piling", "electrical_pedestal", "water_connection", "dock_light", "fire_extinguisher", "fuel_pump", "cleat", "bumper", "gangway", "other"]),
  dockId: z.number().int().positive(),
  location: z.string().min(1),
  installDate: z.string().optional(),
  warrantyExpiry: z.string().optional(),
  conditionRating: z.number().int().min(1).max(5).default(3),
  notes: z.string().optional(),
});

export async function createAsset(formData: FormData) {
  const session = await requireRole(["manager"]);
  const parsed = createAssetSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid input" };

  const [asset] = await db.insert(assets).values({
    ...parsed.data,
    installDate: parsed.data.installDate ? new Date(parsed.data.installDate) : null,
    warrantyExpiry: parsed.data.warrantyExpiry ? new Date(parsed.data.warrantyExpiry) : null,
  }).returning();

  await logAudit({
    userId: session.userId,
    action: "create",
    entityType: "asset",
    entityId: asset.id,
    metadata: { name: asset.name, type: asset.assetType },
  });

  revalidatePath("/assets");
  return { success: true, id: asset.id };
}
```

### Work Order Status Transition
```typescript
// lib/actions/work-orders.ts
"use server";
import { canTransition } from "@/lib/work-order-transitions";

export async function transitionWorkOrder(id: number, newStatus: string) {
  const session = await requireRole(["manager", "crew"]);

  const [wo] = await db.select().from(workOrders).where(eq(workOrders.id, id)).limit(1);
  if (!wo) return { error: "Work order not found" };

  if (!canTransition(wo.status, newStatus)) {
    return { error: `Cannot transition from ${wo.status} to ${newStatus}` };
  }

  // Manager-only: verified status
  if (newStatus === "verified" && session.role !== "manager") {
    return { error: "Only managers can verify work orders" };
  }

  const updates: Record<string, unknown> = {
    status: newStatus,
    updatedAt: new Date(),
  };

  if (newStatus === "assigned" && !wo.assigneeId) {
    return { error: "Cannot assign without an assignee" };
  }
  if (newStatus === "in_progress") updates.startedAt = new Date();
  if (newStatus === "completed") updates.completedAt = new Date();
  if (newStatus === "verified") {
    updates.verifiedAt = new Date();
    updates.verifiedById = session.userId;
  }

  await db.update(workOrders).set(updates).where(eq(workOrders.id, id));

  await logAudit({
    userId: session.userId,
    action: "transition",
    entityType: "work_order",
    entityId: id,
    metadata: { from: wo.status, to: newStatus },
  });

  revalidatePath("/work-orders");
  revalidatePath(`/work-orders/${id}`);
  return { success: true };
}
```

### Condition Rating Badge
```typescript
// components/assets/condition-badge.tsx
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const CONDITION_STYLES: Record<number, string> = {
  1: "bg-red-100 text-red-800 border-red-300",
  2: "bg-orange-100 text-orange-800 border-orange-300",
  3: "bg-yellow-100 text-yellow-800 border-yellow-300",
  4: "bg-green-100 text-green-800 border-green-300",
  5: "bg-green-200 text-green-900 border-green-400 font-bold",
};

export function ConditionBadge({ rating }: { rating: number }) {
  return (
    <Badge variant="outline" className={cn(CONDITION_STYLES[rating])}>
      {rating}/5
    </Badge>
  );
}
```

### Priority Badge
```typescript
// components/work-orders/priority-badge.tsx
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const PRIORITY_STYLES: Record<string, string> = {
  urgent: "bg-red-100 text-red-800 border-red-300",
  high: "bg-orange-100 text-orange-800 border-orange-300",
  normal: "bg-blue-100 text-blue-800 border-blue-300",
  low: "bg-gray-100 text-gray-600 border-gray-300",
};

export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <Badge variant="outline" className={cn(PRIORITY_STYLES[priority])}>
      {priority}
    </Badge>
  );
}
```

### Drizzle Query with Filters
```typescript
// lib/queries/assets.ts
import { db } from "@/lib/db";
import { assets, docks } from "@/lib/db/schema";
import { eq, and, isNull, gte, asc } from "drizzle-orm";

export async function getAssets(filters: {
  dockId?: number;
  assetType?: string;
  minCondition?: number;
}) {
  const conditions = [isNull(assets.deletedAt)];

  if (filters.dockId) conditions.push(eq(assets.dockId, filters.dockId));
  if (filters.assetType) conditions.push(eq(assets.assetType, filters.assetType as any));
  if (filters.minCondition) conditions.push(gte(assets.conditionRating, filters.minCondition));

  return db.query.assets.findMany({
    where: and(...conditions),
    with: { dock: true },
    orderBy: [asc(assets.name)],
  });
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| searchParams as sync object | searchParams as Promise (must await) | Next.js 15 | Must `await searchParams` in page components |
| useFormState for actions | useActionState (React 19) | React 19 / Next.js 15+ | Use useActionState for form submission state |
| Zod v3 import | Zod v4 via `zod/v4` path | Zod 4.x | Import from `zod/v4` per Phase 1 established pattern |
| Client-side data fetching | Server Components with direct queries | Next.js 13+ | No useEffect/fetch for reads; RSC fetches directly |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Manual verification (no test framework installed) |
| Config file | none |
| Quick run command | `npm run build` (type checking + build) |
| Full suite command | `npm run build` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ASSET-01 | Asset catalog displays with columns | smoke | Manual: navigate to /assets | N/A |
| ASSET-02 | Asset detail shows all fields | smoke | Manual: click asset row | N/A |
| ASSET-03 | Condition rating updates | smoke | Manual: update rating in panel | N/A |
| ASSET-04 | Manager CRUD on assets | smoke | Manual: create/edit/deactivate as manager | N/A |
| ASSET-05 | Filters work on asset list | smoke | Manual: select dock/type/condition filter | N/A |
| WO-01 | Manager creates work order | smoke | Manual: create WO as manager | N/A |
| WO-02 | Status workflow progression | smoke | Manual: advance WO through all states | N/A |
| WO-03 | Invalid transitions rejected | manual-only | Manual: attempt invalid transition, verify error | N/A |
| WO-04 | Crew logs notes/parts/time | smoke | Manual: add parts and time as crew | N/A |
| WO-05 | Placeholder photos display | smoke | Manual: view photos tab on WO detail | N/A |
| WO-06 | Work order filters work | smoke | Manual: filter by status/priority/assignee | N/A |
| WO-07 | Mobile-friendly layout | manual-only | Manual: resize to 375px, verify card stacking | N/A |

### Sampling Rate
- **Per task commit:** `npm run build` (catches type errors and build failures)
- **Per wave merge:** `npm run build` + manual smoke test of asset list and work order flow
- **Phase gate:** Full lifecycle test: create asset -> create WO -> assign -> progress -> complete -> verify

### Wave 0 Gaps
None -- no test framework to configure. Build verification via `npm run build` is sufficient for this demo project. Manual smoke testing covers all requirements.

## Open Questions

1. **Backward transitions scope**
   - What we know: CONTEXT.md says forward moves need no confirmation, backward moves need confirmation
   - What's unclear: Should backward transitions reset timestamps (e.g., going from completed back to in_progress should clear completedAt)?
   - Recommendation: Yes, clear the timestamp when going backward. If completed->in_progress, set completedAt=null. This keeps data accurate.

2. **Crew work order visibility**
   - What we know: Nav config shows crew sees "My Work Orders" at /work-orders. AUTH-06 says crew sees assigned work orders.
   - What's unclear: Should crew see ALL work orders or only their assigned ones?
   - Recommendation: Crew sees only work orders assigned to them. Add `where: eq(workOrders.assigneeId, session.userId)` for crew role queries.

3. **Asset maintenance history on detail panel**
   - What we know: ASSET-02 requires "maintenance history" per asset.
   - What's unclear: How much history to show in the slide-over panel.
   - Recommendation: Show last 5 work orders for that asset in the panel, with a "View all" link that filters work orders page by asset.

## Sources

### Primary (HIGH confidence)
- Project schema: `src/lib/db/schema.ts` -- actual table definitions with all columns and relations
- Phase 1 patterns: `src/lib/actions/auth.ts` -- established server action pattern with Zod v4
- Phase 1 guards: `src/lib/auth/guards.ts` -- requireAuth() and requireRole() implementations
- STACK.md -- verified library versions (all npm-verified)
- ARCHITECTURE.md -- established patterns for server components, actions, queries
- PITFALLS.md -- work order state machine and audit trail guidance

### Secondary (MEDIUM confidence)
- shadcn/ui component API -- based on established patterns from v4 CLI components
- Drizzle relational query API -- `db.query.X.findMany({ with: {} })` syntax

### Tertiary (LOW confidence)
- None -- all findings verified against existing codebase and project research

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries already installed and verified in Phase 1
- Architecture: HIGH - extends established patterns from Phase 1 (server actions, guards, RSC)
- Pitfalls: HIGH - directly from project PITFALLS.md + codebase inspection
- State machine: HIGH - simple transition map, well-documented pattern

**Research date:** 2026-03-26
**Valid until:** 2026-04-25 (stable stack, no fast-moving dependencies)
