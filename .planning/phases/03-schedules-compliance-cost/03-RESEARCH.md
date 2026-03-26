# Phase 3: Schedules, Compliance & Cost - Research

**Researched:** 2026-03-26
**Domain:** Recurring maintenance schedules, compliance reporting, audit trail, PDF export, cost tracking
**Confidence:** HIGH

## Summary

Phase 3 builds three interconnected features on top of the Phase 2 foundation: (1) preventive maintenance schedule CRUD with auto-generation of work orders, (2) compliance dashboard with audit trail browser and PDF report export, and (3) cost tracking views with budget vs actual comparison. The database schema already has all necessary tables (`maintenance_schedules`, `cost_entries`, `audit_logs`, `work_order_parts`) and the audit logging utility (`logAudit()`) is already in use by Phase 1-2 mutations.

The critical technical challenge is schedule drift prevention -- `nextDueAt` must be recalculated from the schedule's anchor date plus interval multiples, never from work order completion date. The auto-generation trigger runs as a server action called on schedule page load (no cron needed for demo). PDF generation uses `@react-pdf/renderer` in a Next.js route handler. Cost views aggregate from `workOrderParts.unitCost` (stored in cents) and estimated labor from `workOrders.timeSpentMinutes`.

**Primary recommendation:** Build in three waves: (1) schedule CRUD + auto-generation engine, (2) compliance dashboard + audit trail + PDF export, (3) cost tracking views. Each wave produces a verifiable deliverable.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Data table with sortable columns for schedule list (consistent with asset registry pattern)
- Schedule creation via modal dialog form (consistent with asset CRUD pattern from Phase 2)
- Manager-only CRUD operations; crew and inspector can view schedules
- Frequency options: weekly, monthly, quarterly, annual (matching frequencyEnum in schema)
- Season options: year_round, spring, summer, fall, winter (matching seasonEnum)
- Safety-critical toggle on schedule form
- Schedule can target a specific asset OR an asset type (for template-style schedules)
- Filter bar: by asset type, frequency, season, safety-critical, compliance status
- Server action `generateDueWorkOrders()` checks all active schedules where nextDueAt <= now
- nextDueAt recalculated from schedule interval (not completion date) to prevent drift per SCHED-04
- Called on schedule list page load as a side effect (no cron needed for demo)
- Generated work orders inherit the schedule's asset, dock, and safety-critical flag
- Title format: "[Schedule Name] -- [Due Date]"
- Compliance dashboard: three big status cards (Required, Completed On Time %, Overdue count)
- Safety-critical items section: separate table with stricter visual treatment
- Compliance percentage = (completed on time / total due in period) x 100
- Period selector: current month, current quarter, trailing 12 months
- Audit trail browser: paginated table of audit_logs entries
- Columns: timestamp, user, action, entity type, entity ID, metadata summary
- Filters: entity type, user, date range
- Inspector and manager access; crew cannot
- PDF compliance report: server-side generation
- Cost tracking: summary cards, breakdown by dock and category, budget vs actual progress bars
- Category derived from work order's asset type mapping
- Budget constants in config file (not DB)
- High-cost assets table sorted by total maintenance cost
- Period selector: monthly, quarterly, annual
- Manager-only access for cost views

### Claude's Discretion
- Exact PDF library choice (react-pdf vs puppeteer vs jspdf) -- DECIDED: @react-pdf/renderer per STACK.md
- Loading states and skeleton designs for compliance/cost pages
- Exact pagination strategy for audit trail
- Chart library for budget vs actual visualization (or use pure CSS progress bars)
- Compliance percentage calculation edge cases (no schedules due = 100% or N/A)
- Mobile layout adaptations for tables

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SCHED-01 | Manager can create recurring maintenance tasks with frequency | Schedule form dialog pattern from asset-form-dialog.tsx; frequencyEnum and seasonEnum already in schema |
| SCHED-02 | Schedule templates available by asset type | assetType field on maintenance_schedules table; filter by asset type in schedule list |
| SCHED-03 | System auto-generates work orders when a scheduled task comes due | generateDueWorkOrders() server action pattern; createWorkOrder pattern from Phase 2 |
| SCHED-04 | Next due date anchored to schedule (not completion date) to prevent drift | Interval-based recalculation using date-fns addWeeks/addMonths/addYears; anchor date arithmetic |
| SCHED-05 | Compliance tracking: percentage of scheduled tasks completed on time | SQL aggregation query comparing completed work orders to schedule due dates |
| SCHED-06 | Seasonal awareness: tasks can be flagged as seasonal | season column already in schema; filter out-of-season schedules from auto-generation |
| COMP-01 | Compliance dashboard showing required vs completed vs overdue | Aggregation queries with period selector; status cards pattern |
| COMP-02 | Audit trail logging every action with who/what/when | Already implemented via logAudit() utility; Phase 3 adds browse UI |
| COMP-03 | Generate PDF compliance reports | @react-pdf/renderer in API route handler; JSX-based PDF layout |
| COMP-04 | Safety-critical items flagged with stricter tracking | isSafetyCritical boolean on schedules; separate compliance section with red visual treatment |
| COMP-05 | Exportable maintenance history per asset | Filtered audit trail + work order history query per asset; PDF download |
| COST-01 | Log parts and labor costs per work order | Already implemented via workOrderParts table + addPart action; Phase 3 adds reporting views |
| COST-02 | Track costs by dock and by category | SQL GROUP BY with dock join and asset type mapping to category |
| COST-03 | Monthly/quarterly/annual cost report views | Date-range filtered aggregation queries with period selector |
| COST-04 | Budget vs actual comparison per category | Budget constants config file + actual cost aggregation; progress bar visualization |
| COST-05 | Identify high-cost assets as replacement candidates | SUM(parts cost) + estimated labor per asset, sorted descending |
</phase_requirements>

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.1 | App Router, server actions, route handlers | Already in project |
| Drizzle ORM | 0.45.1 | Database queries and aggregations | Already in project |
| date-fns | 4.1.0 | Schedule date arithmetic (addWeeks, addMonths, etc.) | Already in project |
| Zod | 4.3.6 | Server action input validation | Already in project, import from zod/v4 |
| shadcn/ui | CLI v4 | UI components (table, card, badge, dialog, select, tabs) | Already in project |
| Lucide React | 1.7.0 | Icons | Already in project |

### New Dependencies (install for Phase 3)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @react-pdf/renderer | 4.3.2 | Server-side PDF generation for compliance reports | COMP-03, COMP-05: PDF compliance reports and asset history export |
| recharts | 3.8.1 | Budget vs actual bar charts, cost breakdown visualization | COST-04: Budget comparison charts. Optional -- can use CSS progress bars for simpler approach |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @react-pdf/renderer | jsPDF | Imperative API is harder to maintain for complex report templates |
| @react-pdf/renderer | Puppeteer | Cannot run in Vercel serverless (binary size limits) |
| recharts | Pure CSS progress bars | Simpler, no extra dependency, but less visual polish for LinkedIn showcase |
| recharts | Chart.js | Canvas-based, less React-native; recharts uses SVG with React component model |

**Installation:**
```bash
npm install @react-pdf/renderer recharts
```

## Architecture Patterns

### Recommended File Structure for Phase 3
```
src/
├── app/(app)/
│   ├── schedules/
│   │   └── page.tsx              # Schedule list with auto-generation trigger
│   ├── compliance/
│   │   ├── page.tsx              # Compliance dashboard
│   │   └── audit/
│   │       └── page.tsx          # Audit trail browser
│   └── reports/
│       └── page.tsx              # Cost tracking views
├── app/api/
│   ├── compliance/report/
│   │   └── route.ts              # PDF compliance report generation
│   └── assets/[id]/history/
│       └── route.ts              # PDF asset history export
├── components/
│   ├── schedules/
│   │   ├── schedule-table.tsx    # Data table (reuse asset-table pattern)
│   │   ├── schedule-filters.tsx  # Filter bar (reuse asset-filters pattern)
│   │   └── schedule-form-dialog.tsx  # CRUD modal (reuse asset-form-dialog pattern)
│   ├── compliance/
│   │   ├── compliance-cards.tsx  # Big status cards (Required/Completed/Overdue)
│   │   ├── compliance-table.tsx  # All schedules with compliance status
│   │   ├── safety-critical-table.tsx  # Safety-critical items separate section
│   │   └── audit-table.tsx       # Paginated audit log browser
│   └── reports/
│       ├── cost-summary-cards.tsx  # Total spend, parts, labor cards
│       ├── cost-breakdown-table.tsx  # By dock and category
│       ├── budget-comparison.tsx  # Budget vs actual progress bars/charts
│       └── high-cost-assets.tsx  # Replacement candidate table
├── lib/
│   ├── actions/
│   │   └── schedules.ts         # createSchedule, updateSchedule, deleteSchedule, generateDueWorkOrders
│   ├── queries/
│   │   ├── schedules.ts         # getSchedules, getScheduleDetail
│   │   ├── compliance.ts        # getComplianceStats, getAuditTrail, getComplianceReport
│   │   └── costs.ts             # getCostSummary, getCostByDock, getCostByCategory, getHighCostAssets
│   ├── pdf/
│   │   ├── compliance-report.tsx  # @react-pdf/renderer document component
│   │   └── asset-history.tsx      # Asset maintenance history PDF
│   └── constants/
│       └── budgets.ts            # Budget constants per category
```

### Pattern 1: Schedule Auto-Generation on Page Load
**What:** The schedule list page calls `generateDueWorkOrders()` as a side effect when it loads. This server action checks all active schedules where `nextDueAt <= now` and creates work orders for each.
**When to use:** Schedule list page only.
**Why not cron:** Demo app with low traffic. On-page-load generation is simpler and sufficient.

```typescript
// src/lib/actions/schedules.ts
"use server";
import { addWeeks, addMonths, addYears } from "date-fns";

function getNextDueDate(currentDue: Date, frequency: string): Date {
  switch (frequency) {
    case "weekly": return addWeeks(currentDue, 1);
    case "monthly": return addMonths(currentDue, 1);
    case "quarterly": return addMonths(currentDue, 3);
    case "annual": return addYears(currentDue, 1);
    default: return addMonths(currentDue, 1);
  }
}

export async function generateDueWorkOrders() {
  const session = await requireRole(["manager", "crew", "inspector"]);
  const now = new Date();

  // Find schedules where nextDueAt <= now and no open WO exists for that schedule
  const dueSchedules = await db.query.maintenanceSchedules.findMany({
    where: and(
      eq(maintenanceSchedules.isActive, true),
      isNull(maintenanceSchedules.deletedAt),
      lte(maintenanceSchedules.nextDueAt, now)
    ),
    with: { asset: true },
  });

  for (const schedule of dueSchedules) {
    // Check if an open WO already exists for this schedule
    const existingWO = await db.query.workOrders.findFirst({
      where: and(
        eq(workOrders.scheduleId, schedule.id),
        inArray(workOrders.status, ["created", "assigned", "in_progress"]),
        isNull(workOrders.deletedAt)
      ),
    });
    if (existingWO) continue;

    // Check seasonal applicability
    if (!isInSeason(schedule.season, now)) {
      // Advance nextDueAt past current period but don't generate WO
      await advanceNextDue(schedule);
      continue;
    }

    // Create the work order
    const dueDate = schedule.nextDueAt;
    await db.insert(workOrders).values({
      title: `${schedule.name} — ${format(dueDate, "MMM d, yyyy")}`,
      type: "preventive",
      priority: schedule.isSafetyCritical ? "high" : "normal",
      status: "created",
      assetId: schedule.assetId,
      dockId: schedule.asset?.dockId ?? null,
      scheduleId: schedule.id,
      dueDate,
      createdById: session.userId, // System-generated, attributed to current user
    });

    // Advance nextDueAt anchored to schedule, NOT to now
    const nextDue = getNextDueDate(dueDate, schedule.frequency);
    await db.update(maintenanceSchedules)
      .set({ nextDueAt: nextDue })
      .where(eq(maintenanceSchedules.id, schedule.id));
  }

  revalidatePath("/schedules");
  revalidatePath("/work-orders");
}
```

### Pattern 2: PDF Generation via Route Handler
**What:** PDF reports are generated server-side using @react-pdf/renderer in a Next.js API route handler. The route handler renders the React PDF document to a buffer and returns it as a file download.
**When to use:** COMP-03 and COMP-05 (compliance report and asset history export).

```typescript
// src/app/api/compliance/report/route.ts
import { renderToBuffer } from "@react-pdf/renderer";
import { ComplianceReportDocument } from "@/lib/pdf/compliance-report";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session?.isLoggedIn || !["manager", "inspector"].includes(session.role)) {
    return new Response("Unauthorized", { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") ?? "quarter";

  const data = await getComplianceReportData(period);
  const buffer = await renderToBuffer(
    <ComplianceReportDocument data={data} period={period} />
  );

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="compliance-report-${period}.pdf"`,
    },
  });
}
```

### Pattern 3: Cost Aggregation Queries
**What:** Cost data is aggregated from `workOrderParts.unitCost` (stored in cents) and estimated labor from `workOrders.timeSpentMinutes` with a constant rate ($0.75/min as established in Phase 2). Aggregation uses SQL GROUP BY with joins to assets and docks.
**When to use:** Cost tracking views (COST-01 through COST-05).

```typescript
// Asset type to cost category mapping
const ASSET_TYPE_TO_CATEGORY: Record<string, string> = {
  piling: "structural",
  electrical_pedestal: "electrical",
  water_connection: "plumbing",
  dock_light: "electrical",
  fire_extinguisher: "safety",
  fuel_pump: "mechanical",
  cleat: "structural",
  bumper: "structural",
  gangway: "structural",
  other: "general",
};
```

### Pattern 4: Compliance Percentage Calculation
**What:** Compliance % = (work orders completed on or before their due date / total work orders due in period) x 100. Query counts completed preventive WOs linked to schedules within the selected period.
**Edge case:** If no schedules are due in the period, display "N/A" rather than 100% to avoid misleading stats.

### Anti-Patterns to Avoid
- **Anchoring nextDueAt to completion date:** Creates permanent schedule drift. Always recalculate from the current nextDueAt + interval.
- **Client-side PDF generation:** @react-pdf/renderer must run server-side. Don't try to render PDFs in the browser -- use an API route handler.
- **Storing compliance percentages in the database:** Compute at query time. Storing creates stale data that must be kept in sync.
- **Using costEntries table for parts costs:** Parts costs are already in workOrderParts. The costEntries table is for additional cost entries not tied to parts (e.g., contractor fees). Don't double-count.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| PDF generation | Custom HTML-to-canvas-to-PDF pipeline | @react-pdf/renderer with JSX templates | Handles page breaks, fonts, table layouts. 860K+ weekly downloads. |
| Date interval arithmetic | Manual day counting for weekly/monthly/quarterly/annual | date-fns addWeeks/addMonths/addYears | Handles month length differences, DST, leap years correctly |
| Paginated tables | Custom pagination state management | URL searchParams `?page=N&limit=20` pattern | Consistent with existing filter pattern, shareable URLs, server-rendered |
| Progress bars for budget vs actual | Custom SVG drawing code | CSS width percentages or shadcn Progress component | Simple, responsive, no extra dependency |

**Key insight:** The schedule engine and compliance aggregation are the custom logic that must be built. Everything else (PDF rendering, date math, UI components) should use existing libraries.

## Common Pitfalls

### Pitfall 1: Schedule Drift from Completion-Based Recalculation
**What goes wrong:** nextDueAt is calculated from when the work order was completed instead of the original schedule interval. A task completed 5 days late permanently shifts all future occurrences.
**Why it happens:** Natural instinct is to set nextDueAt = completedAt + interval.
**How to avoid:** Always recalculate: `nextDueAt = currentNextDueAt + interval`. The anchor is the schedule, not the work order.
**Warning signs:** Work orders cluster around certain dates instead of distributing evenly.

### Pitfall 2: Double-Generation of Work Orders
**What goes wrong:** The auto-generation trigger runs on every page load. If a user refreshes the schedule page, it creates duplicate work orders for the same schedule period.
**Why it happens:** No check for existing open work orders before generating.
**How to avoid:** Before creating a WO, check if an open WO (status in created/assigned/in_progress) already exists for that scheduleId. Skip if it does.
**Warning signs:** Multiple identical work orders appearing in the list.

### Pitfall 3: @react-pdf/renderer Server-Side Only
**What goes wrong:** Importing @react-pdf/renderer in a client component causes build errors because it uses Node.js APIs (Buffer, fs).
**Why it happens:** Developer puts the PDF generation in a "use client" component.
**How to avoid:** PDF generation must live in API route handlers (src/app/api/) or server actions only. The download button on the client triggers a fetch to the API route.
**Warning signs:** Build errors mentioning "Module not found: Can't resolve 'fs'" or "Buffer is not defined".

### Pitfall 4: Cost Aggregation Off-by-One with Cents
**What goes wrong:** Parts costs are stored in cents (unitCost in workOrderParts). Forgetting to divide by 100 shows costs 100x too high, or mixing cents and dollars in aggregations produces wrong totals.
**Why it happens:** Phase 2 stores unitCost as cents (`Math.round(parsed.data.unitCost * 100)`), but display code may not consistently convert.
**How to avoid:** All aggregation queries should return cents. Convert to dollars only at the display layer: `(totalCents / 100).toFixed(2)`.
**Warning signs:** Cost totals showing $8,500 instead of $85.00.

### Pitfall 5: Seasonal Schedule Mishandling
**What goes wrong:** A spring-only schedule generates work orders in winter, or worse, accumulates missed periods and generates 4 months of backlog when spring starts.
**Why it happens:** Season check is forgotten in the auto-generation logic, or season boundaries are wrong.
**How to avoid:** Define season boundaries (spring: Mar-May, summer: Jun-Aug, fall: Sep-Nov, winter: Dec-Feb). During auto-generation, skip schedules outside their season but still advance nextDueAt past the current period.
**Warning signs:** Out-of-season work orders appearing in the list.

## Code Examples

### Schedule Form Dialog (Reusing Asset Form Pattern)
```typescript
// Key fields for schedule creation form
const scheduleFormFields = {
  name: { type: "text", required: true },
  description: { type: "textarea", required: false },
  assetType: { type: "select", options: Object.keys(ASSET_TYPE_LABELS) },
  assetId: { type: "select", options: "dynamic from assets query" },
  frequency: { type: "select", options: ["weekly", "monthly", "quarterly", "annual"] },
  season: { type: "select", options: ["year_round", "spring", "summer", "fall", "winter"] },
  isSafetyCritical: { type: "checkbox" },
  nextDueAt: { type: "date", required: true },
};
```

### Compliance Aggregation Query Pattern
```typescript
// Get compliance stats for a given period
async function getComplianceStats(periodStart: Date, periodEnd: Date) {
  const totalDue = await db
    .select({ count: sql<number>`count(*)` })
    .from(workOrders)
    .where(and(
      eq(workOrders.type, "preventive"),
      isNotNull(workOrders.scheduleId),
      gte(workOrders.dueDate, periodStart),
      lte(workOrders.dueDate, periodEnd),
      isNull(workOrders.deletedAt),
    ));

  const completedOnTime = await db
    .select({ count: sql<number>`count(*)` })
    .from(workOrders)
    .where(and(
      eq(workOrders.type, "preventive"),
      isNotNull(workOrders.scheduleId),
      gte(workOrders.dueDate, periodStart),
      lte(workOrders.dueDate, periodEnd),
      inArray(workOrders.status, ["completed", "verified"]),
      sql`${workOrders.completedAt} <= ${workOrders.dueDate}`,
      isNull(workOrders.deletedAt),
    ));

  const overdue = await db
    .select({ count: sql<number>`count(*)` })
    .from(workOrders)
    .where(and(
      eq(workOrders.type, "preventive"),
      isNotNull(workOrders.scheduleId),
      lte(workOrders.dueDate, new Date()),
      not(inArray(workOrders.status, ["completed", "verified"])),
      isNull(workOrders.deletedAt),
    ));

  return { totalDue, completedOnTime, overdue };
}
```

### Audit Trail Pagination Pattern
```typescript
// URL params: /compliance/audit?page=1&entityType=work_order&userId=3
async function getAuditTrail(filters: AuditFilters) {
  const pageSize = 25;
  const offset = ((filters.page ?? 1) - 1) * pageSize;
  const conditions = [];

  if (filters.entityType) conditions.push(eq(auditLogs.entityType, filters.entityType));
  if (filters.userId) conditions.push(eq(auditLogs.userId, filters.userId));
  if (filters.dateFrom) conditions.push(gte(auditLogs.createdAt, new Date(filters.dateFrom)));
  if (filters.dateTo) conditions.push(lte(auditLogs.createdAt, new Date(filters.dateTo)));

  const [results, totalCount] = await Promise.all([
    db.query.auditLogs.findMany({
      where: conditions.length ? and(...conditions) : undefined,
      with: { user: { columns: { name: true } } },
      orderBy: [desc(auditLogs.createdAt)],
      limit: pageSize,
      offset,
    }),
    db.select({ count: sql<number>`count(*)` }).from(auditLogs)
      .where(conditions.length ? and(...conditions) : undefined),
  ]);

  return { results, total: totalCount[0].count, page: filters.page ?? 1, pageSize };
}
```

### Budget Constants Config
```typescript
// src/lib/constants/budgets.ts
export const CATEGORY_BUDGETS: Record<string, number> = {
  electrical: 15000,  // $15,000 annual budget
  structural: 25000,
  plumbing: 8000,
  safety: 5000,
  mechanical: 12000,
  general: 5000,
};

export const LABOR_RATE_PER_MINUTE = 75; // $0.75/min = $45/hr, stored in cents
```

### @react-pdf/renderer Document Component
```typescript
// src/lib/pdf/compliance-report.tsx
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10 },
  title: { fontSize: 20, marginBottom: 20 },
  section: { marginBottom: 15 },
  table: { display: "flex", flexDirection: "column" },
  tableRow: { flexDirection: "row", borderBottom: "1px solid #ddd", padding: 4 },
  tableHeader: { fontWeight: "bold", backgroundColor: "#f5f5f5" },
});

export function ComplianceReportDocument({ data, period }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Compliance Report - Sunset Harbor Marina</Text>
        <Text>Period: {period}</Text>
        <Text>Generated: {new Date().toLocaleDateString()}</Text>
        {/* Summary stats, overdue items, schedule completion rates, etc. */}
      </Page>
    </Document>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Puppeteer for PDF in serverless | @react-pdf/renderer (pure JS) | 2024+ | No Chrome binary needed; works in Vercel serverless |
| cron jobs for schedule generation | On-demand generation on page load | N/A (demo pattern) | Simpler for demo; no external scheduler needed |
| Separate cost tracking tables | Derive costs from workOrderParts + timeSpentMinutes | Schema design | Single source of truth; no sync issues |

## Open Questions

1. **@react-pdf/renderer + React 19 compatibility**
   - What we know: v4.3.2 is current, widely used. Stack research says 860K+ weekly downloads.
   - What's unclear: Exact React 19 compatibility may have edge cases with server component imports.
   - Recommendation: Keep PDF rendering strictly in API route handlers (not server components). If any React 19 issues arise, fall back to generating PDF as a simple streamed response with manual PDF construction.

2. **Recharts necessity for cost views**
   - What we know: shadcn/ui chart components are built on Recharts v3. Budget vs actual could use simple CSS progress bars.
   - What's unclear: Whether the LinkedIn showcase quality demands charts or if progress bars are sufficient.
   - Recommendation: Install Recharts for professional visual polish. Use shadcn/ui chart wrapper for consistency. If time is tight, CSS progress bars work as a fallback.

3. **Compliance percentage edge case: no due schedules**
   - What we know: Dividing by zero produces NaN/Infinity.
   - Recommendation: When totalDue = 0, display "N/A" with a muted badge. This is more honest than 100%.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Manual verification (no test framework installed) |
| Config file | none |
| Quick run command | `npm run build` (type checking) |
| Full suite command | `npm run build && npm run lint` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SCHED-01 | Manager creates recurring schedule | manual | Build + visual verification | N/A |
| SCHED-02 | Schedule templates by asset type | manual | Visual verification of filter | N/A |
| SCHED-03 | Auto-generates work orders when due | manual | Load schedules page, verify WO created | N/A |
| SCHED-04 | nextDueAt anchored to schedule not completion | manual | Complete WO late, verify next due date | N/A |
| SCHED-05 | Compliance % of on-time completions | manual | Check compliance dashboard numbers | N/A |
| SCHED-06 | Seasonal awareness flags | manual | Verify out-of-season schedules skipped | N/A |
| COMP-01 | Compliance dashboard: required vs completed vs overdue | manual | Visual verification of status cards | N/A |
| COMP-02 | Audit trail with who/what/when | manual | Browse audit trail after mutations | N/A |
| COMP-03 | PDF compliance report generation | manual | Click download, verify PDF opens | N/A |
| COMP-04 | Safety-critical items flagged | manual | Verify separate section with red treatment | N/A |
| COMP-05 | Exportable maintenance history per asset | manual | Download asset history PDF | N/A |
| COST-01 | Parts and labor costs per work order | manual | Verify cost totals on reports page | N/A |
| COST-02 | Costs by dock and category | manual | Verify breakdown table groupings | N/A |
| COST-03 | Monthly/quarterly/annual views | manual | Toggle period selector, verify data changes | N/A |
| COST-04 | Budget vs actual comparison | manual | Verify progress bars show correct ratios | N/A |
| COST-05 | High-cost assets identified | manual | Verify table sorted by total cost descending | N/A |

### Sampling Rate
- **Per task commit:** `npm run build` (catches type errors, import issues)
- **Per wave merge:** `npm run build && npm run lint`
- **Phase gate:** Full build + visual verification of all 16 requirements

### Wave 0 Gaps
None -- no test framework to configure. Build verification via `npm run build` is sufficient for this demo project.

## Sources

### Primary (HIGH confidence)
- Existing codebase: `src/lib/db/schema.ts` -- all tables verified, enums confirmed
- Existing codebase: `src/lib/actions/work-orders.ts` -- createWorkOrder pattern verified
- Existing codebase: `src/lib/actions/audit.ts` -- logAudit utility verified
- Existing codebase: `src/components/assets/asset-form-dialog.tsx` -- dialog form pattern verified
- Existing codebase: `src/components/assets/asset-filters.tsx` -- URL params filter pattern verified
- npm registry: @react-pdf/renderer 4.3.2 confirmed, recharts 3.8.1 confirmed
- `.planning/research/STACK.md` -- full stack decisions with versions
- `.planning/research/PITFALLS.md` -- schedule drift prevention strategy

### Secondary (MEDIUM confidence)
- @react-pdf/renderer JSX API pattern -- based on documented API, widely used
- date-fns interval functions -- well-established API, verified in project dependencies

### Tertiary (LOW confidence)
- @react-pdf/renderer + React 19 + Next.js 16 edge cases -- no specific issues reported but untested in this exact combo

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all core libs already installed and patterns established; only 2 new deps needed
- Architecture: HIGH -- follows exact patterns from Phase 2 (data table, filter bar, dialog form, server actions)
- Pitfalls: HIGH -- schedule drift and double-generation are well-documented CMMS risks; PDF server-only constraint is well-known
- Cost tracking: HIGH -- data model already supports it (workOrderParts, timeSpentMinutes); just needs aggregation views

**Research date:** 2026-03-26
**Valid until:** 2026-04-26 (stable stack, no fast-moving dependencies)
