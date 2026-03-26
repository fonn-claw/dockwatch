# Phase 4: Dashboard, Seed Data & Polish - Context

**Gathered:** 2026-03-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the hero maintenance dashboard with at-a-glance health scores, status indicators, calendar, activity feed, and cost summary. Create comprehensive seed data script that populates Sunset Harbor Marina with realistic narrative data (4 docks, 60 slips, 120+ assets, 80+ historical work orders, 30+ schedules). Polish the entire app for LinkedIn showcase quality with mobile responsiveness and professional UI throughout.

</domain>

<decisions>
## Implementation Decisions

### Dashboard Hero Layout
- Three big status cards at top: Overdue (red, count), Due Soon (yellow, count), On Track (green, count) — largest visual element
- Cards use large numbers (48px+ font), status color backgrounds, and subtle shadows
- Marina-wide health score displayed as a large circular progress indicator or prominent percentage badge
- Per-dock health scores in a row of smaller cards below (Dock A through D with individual scores)
- Health score weighted by asset criticality: safety-critical 3x, structural 2x, cosmetic 1x (from PITFALLS.md research)
- Upcoming maintenance calendar: month view with colored dots on dates indicating scheduled work
- Calendar dots color-coded: red=overdue, yellow=due-this-week, green=scheduled-future
- Recent activity feed: compact list of 10 most recent audit log entries with action icon, description, and relative time
- Cost summary section: two cards showing current month and current quarter spend totals
- Dashboard is the landing page for manager role (DASH-06)
- Layout: status cards top row, health scores + calendar middle row, activity + cost summary bottom row

### Seed Data Narrative
- Marina: "Sunset Harbor Marina" — 4 docks (A, B, C, D), 60 slips (15 per dock)
- Story: Spring maintenance push — winter damage being addressed, preventive schedules ramping up
- 120+ assets distributed across all types: dock pilings, electrical pedestals, water connections, dock lights, fire extinguishers, fuel pumps, cleats, dock boxes
- Asset conditions: most at 3-4 (good), some at 1-2 (needs attention), few at 5 (excellent/new)
- 30+ maintenance schedules: mix of weekly (safety checks), monthly (electrical), quarterly (structural), annual (full inspection)
- 80+ historical work orders going back 6 months with realistic completion patterns
- Work order distribution: bell curve with more activity in recent 2 months (spring prep), seasonal patterns visible
- 10 currently open work orders in various states: 2 created, 3 assigned, 3 in-progress, 2 completed (awaiting verification)
- 5 overdue items creating compliance gaps: 2 electrical inspections, 1 fire extinguisher check, 1 piling inspection, 1 fuel system check
- Parts and labor logged on completed work orders with realistic costs (electrical parts $50-200, structural $200-500, etc.)
- 3 crew members: "Mike Torres" (Dock A/B specialist), "Sarah Chen" (Dock C/D specialist), "Jake Williams" (general)
- 1 manager: "Maria Santos" — creates schedules and work orders
- 1 inspector: "Robert Kim" — reviews compliance
- All demo accounts use password "demo1234"
- Cost data shows electrical category over budget (creates realistic budget vs actual gap)

### Mobile Responsiveness
- Dashboard: status cards stack to single column on mobile, calendar switches to compact week view
- All existing tables (assets, schedules, compliance, audit) gain horizontal scroll on mobile
- Work order cards already stack vertically (Phase 2) — verify and polish
- Touch-friendly tap targets: minimum 44px for all interactive elements
- Filter panels collapse into a single "Filters" button that expands on mobile
- Sidebar already collapses to hamburger menu (Phase 1) — verify working

### UI Polish
- Consistent spacing throughout: 24px page padding, 16px card gaps, 8px inner spacing
- Typography: clear hierarchy with page titles (24px bold), section headers (18px semibold), body (14px)
- Industrial color palette: slate-700 backgrounds, safety status colors for all indicators
- Loading states: skeleton placeholders on data-heavy pages (dashboard, tables)
- Empty states: friendly messaging when no data (e.g., "No overdue items — great job!")
- Subtle transitions on interactive elements (hover states, dropdown animations)
- Consistent card styling across all pages (same border-radius, shadow, padding)

### Claude's Discretion
- Exact health score calculation algorithm details
- Calendar library choice (custom vs date-fns grid)
- Skeleton component design
- Seed script execution strategy (single transaction vs batched)
- Exact mobile breakpoints beyond standard Tailwind defaults
- Animation timing and easing
- Empty state illustration approach

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

No external specs — requirements fully captured in decisions above and in:

### Project Context
- `BRIEF.md` — Full project brief with dashboard specs, seed data requirements, demo accounts
- `.planning/PROJECT.md` — Project context, constraints, validated requirements
- `.planning/REQUIREMENTS.md` — DASH-01 through DASH-07, DEMO-01 through DEMO-09 requirements
- `.planning/research/STACK.md` — Library versions
- `.planning/research/ARCHITECTURE.md` — Component boundaries, data flow
- `.planning/research/PITFALLS.md` — Health score weighting guidance, Neon cold start

### Prior Phase Code
- `src/lib/db/schema.ts` — All database tables (users, docks, slips, assets, work_orders, maintenance_schedules, audit_logs, work_order_parts, cost_entries)
- `src/lib/db/seed.ts` — Existing seed script (demo users only — needs major expansion)
- `src/lib/queries/schedules.ts` — getSchedules, getScheduleStats (compliance data)
- `src/lib/queries/compliance.ts` — getComplianceStats, getComplianceSchedules (dashboard data source)
- `src/lib/queries/costs.ts` — getCostSummary (dashboard cost cards)
- `src/lib/queries/work-orders.ts` — getWorkOrders (activity feed data source)
- `src/lib/queries/assets.ts` — getAssets (health score calculation)
- `src/lib/constants/budgets.ts` — CATEGORY_BUDGETS, LABOR_RATE_PER_MINUTE
- `src/components/layout/` — App shell, sidebar, header (verify mobile)
- `src/app/globals.css` — Industrial color palette CSS variables

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/work-orders/status-badge.tsx`: Status color mapping — reuse for dashboard status indicators
- `src/components/work-orders/priority-badge.tsx`: Priority badge — reuse pattern for health score badges
- `src/components/assets/condition-badge.tsx`: Condition rating colors — reuse for asset health in dashboard
- `src/components/compliance/compliance-cards.tsx`: Status cards pattern — adapt for dashboard hero cards
- `src/lib/queries/compliance.ts`: getComplianceStats returns required/completed/overdue counts — direct feed to dashboard
- `src/lib/queries/costs.ts`: getCostSummary with period filtering — direct feed to dashboard cost cards

### Established Patterns
- Server actions in `src/lib/actions/` with "use server" directive and requireRole() guard
- URL searchParams for filter state (shareable, bookmarkable)
- shadcn/ui components: Card, Table, Tabs, Select, Input, Button, Dialog, Sheet
- Industrial slate-blue palette with safety status colors (green/yellow/orange/red)
- Data tables with sortable columns (asset-table, schedule-table, audit-table)

### Integration Points
- Dashboard page replaces placeholder at /dashboard (or /)
- Seed script at `src/lib/db/seed.ts` needs expansion from demo-users-only to full narrative data
- `drizzle-kit push` for any schema adjustments
- Nav config already routes manager to dashboard as landing page
- All query functions ready to be consumed by dashboard components

</code_context>

<specifics>
## Specific Ideas

- The dashboard IS the hero feature — it should be visually impressive, the page you screenshot for LinkedIn
- Health scores create a "game-like" feeling of progress and accountability for marina operators
- The 5 overdue items in seed data should tell a story: winter neglect catching up in spring
- Seed data should feel like a real marina's records, not random generated noise
- Cost data should reveal an actionable insight: electrical maintenance is trending over budget
- The app should look like a real SaaS product, not a demo/prototype

</specifics>

<deferred>
## Deferred Ideas

None — this is the final phase. All remaining work is captured here.

</deferred>

---

*Phase: 04-dashboard-seed-data-polish*
*Context gathered: 2026-03-26*
