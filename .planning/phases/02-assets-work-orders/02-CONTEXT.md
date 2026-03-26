# Phase 2: Assets & Work Orders - Context

**Gathered:** 2026-03-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the asset registry (browse, CRUD, condition ratings, filtering) and work order management (create, assign, status workflow, parts/labor logging, filtering). Users can manage marina infrastructure assets and work through the full work order lifecycle from creation through verification. Audit trail entries logged for all mutations.

</domain>

<decisions>
## Implementation Decisions

### Asset Catalog Layout
- Data table with sortable columns for asset list (operational tools need dense data views)
- Columns: name, type, dock/location, condition rating, install date, status
- Asset detail via slide-over panel from table row click (keeps list context visible)
- Condition rating displayed as color-coded numeric badge (1=red, 2=orange, 3=yellow, 4=green, 5=green-bold)
- Manager creates/edits assets via modal dialog with form fields
- Filter bar above table: by dock, asset type, condition range
- Soft-deleted assets hidden by default, not shown to non-managers

### Work Order List & Detail Views
- Card-based list for work orders with prominent status badges (more scannable than table for mixed-status items)
- Each card shows: title, asset, assignee, priority badge, due date, status badge
- Priority colors: urgent=red, high=orange, normal=blue, low=gray
- Work order detail is a dedicated page (not panel — too much content)
- Detail page has tabbed sections: Overview, Activity, Parts & Labor, Photos
- Placeholder photos displayed as side-by-side thumbnails (stock marina/dock images)
- Parts and labor logged via inline editable rows in the detail view (fast entry for field crew)

### Status Workflow UX
- Status transitions shown as dropdown with only valid next states (server-enforced)
- Valid transitions: created→assigned, assigned→in-progress, in-progress→completed, completed→verified
- No confirmation needed for forward moves (speed for crew), confirm required for backward moves
- Vertical activity timeline on work order detail showing all status changes with who/when/notes
- Manager can mark completed orders as "verified" (final workflow step)
- Each status change creates an audit_log entry automatically

### Mobile Field Crew Experience
- Cards stack vertically full-width on mobile screens
- Filter panel collapses above list on mobile (accessible but saves space)
- Touch-friendly tap targets (min 44px) for status changes and actions
- No offline support (demo app, always-connected assumption)

### Claude's Discretion
- Exact table component choice (shadcn DataTable vs custom)
- Slide-over panel animation and width
- Form field validation UX details
- Pagination strategy for large lists
- Loading states and skeleton designs
- Exact mobile breakpoint behaviors

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

No external specs — requirements fully captured in decisions above and in:

### Project Context
- `BRIEF.md` — Full project brief with work order and asset registry specs
- `.planning/PROJECT.md` — Project context, constraints
- `.planning/REQUIREMENTS.md` — ASSET-01 through ASSET-05, WO-01 through WO-07 requirements
- `.planning/research/STACK.md` — Library versions (shadcn/ui, Drizzle, etc.)
- `.planning/research/ARCHITECTURE.md` — Component boundaries, data flow
- `.planning/research/PITFALLS.md` — Work order state machine must be server-enforced, audit trail guidance

### Phase 1 Foundation
- `src/lib/db/schema.ts` — Database schema with assets, work_orders, audit_logs tables
- `src/lib/auth/guards.ts` — requireAuth(), requireRole() utilities
- `src/lib/actions/auth.ts` — Server action pattern to follow
- `src/components/layout/` — App shell, sidebar, header patterns

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/auth/guards.ts`: requireAuth() and requireRole() — use on all server actions and pages
- `src/lib/db/schema.ts`: Full schema with assets, work_orders, work_order_parts tables already defined
- `src/lib/db/index.ts`: Drizzle client ready to use
- `src/components/ui/`: shadcn/ui components installed (button, card, input, etc.)
- `src/components/layout/`: App shell with sidebar, header, breadcrumbs

### Established Patterns
- Server actions in `src/lib/actions/` with "use server" directive
- requireRole() guard at start of every server action
- iron-session for user context in server components
- Tailwind + shadcn/ui for all UI components
- Industrial slate-blue color palette with safety status colors

### Integration Points
- Asset and work order pages replace placeholder pages from Phase 1
- Nav config already has entries for Assets and Work Orders
- Audit log table ready for insert on every mutation
- User roles determine which actions are available (manager=CRUD, crew=read+update status)

</code_context>

<specifics>
## Specific Ideas

- Work orders are the primary daily interface for crew — must be fast and clear
- Status badges should be immediately recognizable (consistent color system across the app)
- Asset condition ratings tie into the dashboard health scores in Phase 4
- The audit trail entries created here feed the compliance reports in Phase 3/5

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-assets-work-orders*
*Context gathered: 2026-03-26*
