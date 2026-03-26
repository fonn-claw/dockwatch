# Phase 3: Schedules, Compliance & Cost - Context

**Gathered:** 2026-03-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Build preventive maintenance schedules (CRUD, recurring frequencies, seasonal flags, auto-generation of work orders), compliance reporting (compliance dashboard, audit trail browser, PDF export, safety-critical flagging), and cost tracking (per-work-order costs, category breakdowns, budget vs actual, high-cost asset identification). The system proactively generates work orders when scheduled tasks come due, tracks compliance percentages, and reports costs across docks and categories.

</domain>

<decisions>
## Implementation Decisions

### Schedule Management
- Data table with sortable columns for schedule list (consistent with asset registry pattern)
- Columns: name, asset/asset type, frequency, season, next due date, last completed, compliance %, safety-critical flag
- Schedule creation via modal dialog form (consistent with asset CRUD pattern from Phase 2)
- Manager-only CRUD operations; crew and inspector can view schedules
- Frequency options: weekly, monthly, quarterly, annual (matching frequencyEnum in schema)
- Season options: year_round, spring, summer, fall, winter (matching seasonEnum)
- Safety-critical toggle on schedule form — flags items for stricter compliance tracking
- Schedule can target a specific asset OR an asset type (for template-style schedules)
- Filter bar: by asset type, frequency, season, safety-critical, compliance status (on-track/due-soon/overdue)

### Auto-Generation of Work Orders
- Server action `generateDueWorkOrders()` checks all active schedules where nextDueAt <= now
- Generates work orders with type="preventive", linked to the schedule via scheduleId
- nextDueAt recalculated from schedule interval (not completion date) to prevent drift per SCHED-04
- Called on schedule list page load as a side effect (no cron needed for demo)
- Generated work orders inherit the schedule's asset, dock, and safety-critical flag
- Title format: "[Schedule Name] — [Due Date]"

### Compliance Dashboard
- Top section: three big status cards — Required (total active schedules), Completed On Time (%), Overdue (count, red)
- Safety-critical items section: separate table showing only safety-critical schedules with stricter visual treatment (red borders/badges for overdue)
- Compliance table below: all schedules with columns for name, frequency, last completed, next due, compliance status (on-track green, due-soon yellow, overdue red)
- Compliance percentage = (completed on time / total due in period) × 100
- Period selector: current month, current quarter, trailing 12 months
- Inspector role sees this as their primary view

### Audit Trail Browser
- Paginated table of audit_logs entries (already being written by Phase 1-2 actions)
- Columns: timestamp, user, action, entity type, entity ID, metadata summary
- Filters: entity type (asset, work_order, schedule), user, date range
- Inspector and manager can access; crew cannot
- Human-readable action labels (reuse mapping from activity-timeline component)
- Page: /compliance/audit (replaces Phase 1 placeholder)

### PDF Compliance Report
- Server-side PDF generation using a lightweight approach (html-to-pdf via puppeteer-core or @react-pdf/renderer)
- Report includes: compliance summary stats, overdue items list, schedule completion rates by category, safety-critical item status, audit trail excerpt for the reporting period
- Manager and inspector can generate reports
- Download as PDF button on compliance dashboard
- Exportable maintenance history per asset: filtered audit trail + work order history for a specific asset, downloadable as PDF

### Cost Tracking Views
- Reports page with summary cards: total spend (month/quarter/year), parts cost, labor cost estimate
- Breakdown table: costs grouped by dock, then by category (electrical, structural, plumbing, cosmetic)
- Category derived from work order's asset type mapping (dock_piling→structural, electrical_pedestal→electrical, etc.)
- Budget vs actual: progress bars per category showing actual spend against predefined budget constants (demo values)
- Budget constants defined in a config file (not DB) — reasonable demo defaults per category
- High-cost assets: table sorted by total maintenance cost (sum of parts + estimated labor from all work orders)
- Period selector: monthly, quarterly, annual
- Manager-only access

### Claude's Discretion
- Exact PDF library choice (react-pdf vs puppeteer vs jspdf)
- Loading states and skeleton designs for compliance/cost pages
- Exact pagination strategy for audit trail
- Chart library for budget vs actual visualization (or use pure CSS progress bars)
- Compliance percentage calculation edge cases (no schedules due = 100% or N/A)
- Mobile layout adaptations for tables

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

No external specs — requirements fully captured in decisions above and in:

### Project Context
- `BRIEF.md` — Full project brief with schedule, compliance, and cost specs
- `.planning/PROJECT.md` — Project context, constraints
- `.planning/REQUIREMENTS.md` — SCHED-01 through SCHED-06, COMP-01 through COMP-05, COST-01 through COST-05 requirements
- `.planning/research/STACK.md` — Library versions (shadcn/ui, Drizzle, etc.)
- `.planning/research/ARCHITECTURE.md` — Component boundaries, data flow
- `.planning/research/PITFALLS.md` — Schedule drift risk, audit trail guidance

### Prior Phase Foundation
- `src/lib/db/schema.ts` — Database schema with maintenance_schedules, cost_entries, audit_logs tables already defined
- `src/lib/auth/guards.ts` — requireAuth(), requireRole() utilities
- `src/lib/actions/audit.ts` — logAudit() shared utility for audit trail entries
- `src/lib/actions/work-orders.ts` — createWorkOrder pattern to follow for auto-generation
- `src/lib/work-order-transitions.ts` — Status constants and transition map
- `src/components/work-orders/activity-timeline.tsx` — Action label mapping pattern to reuse for audit trail
- `src/components/assets/asset-table.tsx` — Data table pattern to reuse for schedules
- `src/components/assets/asset-filters.tsx` — Filter bar pattern to reuse

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/assets/asset-table.tsx`: Data table with sortable columns — reuse pattern for schedule list and audit trail
- `src/components/assets/asset-filters.tsx`: URL searchParams-based filter bar — reuse for schedule/compliance/audit filters
- `src/components/assets/asset-form-dialog.tsx`: Modal dialog CRUD form — reuse pattern for schedule create/edit
- `src/components/work-orders/activity-timeline.tsx`: Action label mapping (create, transition, add_part, etc.) — extend for schedule actions
- `src/components/work-orders/status-badge.tsx` and `priority-badge.tsx`: Badge components — create similar for compliance status
- `src/lib/actions/audit.ts`: logAudit() utility — already in use, just call it for schedule mutations
- `src/lib/queries/work-orders.ts`: getWorkOrderActivity() pattern — reuse for audit trail browser query

### Established Patterns
- Server actions in `src/lib/actions/` with "use server" directive and requireRole() guard
- URL searchParams for filter state (shareable, bookmarkable)
- Zod validation on all server action inputs
- iron-session for user context in server components
- Tailwind + shadcn/ui for all UI components
- Industrial slate-blue palette with safety status colors (green/yellow/orange/red)

### Integration Points
- Schedule pages replace placeholder at /schedules
- Compliance pages replace placeholders at /compliance and /compliance/audit
- Reports/cost page replaces placeholder at /reports
- Nav config already has entries for Schedules, Compliance, and Reports
- Work order creation from schedule links via scheduleId foreign key
- Audit log table already being populated by Phase 1-2 mutations
- Cost data derives from workOrderParts (already logged in Phase 2) plus costEntries table

</code_context>

<specifics>
## Specific Ideas

- Schedule drift prevention is critical — nextDueAt must be recalculated from the schedule interval, not from when the work order was completed (per PITFALLS.md research)
- Compliance dashboard is the inspector's primary view — make it clear and data-dense
- PDF reports must look professional enough for insurance/regulatory review — clean layout, marina branding
- Cost tracking should surface actionable insights: which assets cost the most, which categories are over budget
- Safety-critical items (electrical, fire, environmental) need visual differentiation — red accents, separate sections

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-schedules-compliance-cost*
*Context gathered: 2026-03-26*
