# Phase 4: Dashboard, Seed Data & Polish - Research

**Researched:** 2026-03-26
**Domain:** Dashboard UI composition, seed data engineering, responsive polish
**Confidence:** HIGH

## Summary

Phase 4 is the final phase of DockWatch. It has three distinct workstreams: (1) building the hero dashboard page with status cards, health scores, calendar, activity feed, and cost summary; (2) expanding the seed script from 3 demo users to a full narrative dataset with 120+ assets, 80+ work orders, and 30+ schedules; (3) polishing the entire app for LinkedIn showcase quality including mobile responsiveness, skeleton loading states, and consistent styling.

All query infrastructure already exists. `getComplianceStats`, `getScheduleStats`, `getCostSummary`, and `getWorkOrders` provide every data point the dashboard needs. The existing `compliance-cards.tsx` component establishes the card pattern to adapt. The shadcn Calendar component (react-day-picker v9) is already installed. Recharts 3.8.1 is installed but no chart components have been added via shadcn yet.

**Primary recommendation:** Build seed data FIRST (Plan 1) so the dashboard and polish work can be validated against realistic data. Then build the dashboard (Plan 2), then do the mobile/polish pass (Plan 3).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Three big status cards at top: Overdue (red, count), Due Soon (yellow, count), On Track (green, count) -- largest visual element
- Cards use large numbers (48px+ font), status color backgrounds, and subtle shadows
- Marina-wide health score displayed as a large circular progress indicator or prominent percentage badge
- Per-dock health scores in a row of smaller cards below (Dock A through D with individual scores)
- Health score weighted by asset criticality: safety-critical 3x, structural 2x, cosmetic 1x
- Upcoming maintenance calendar: month view with colored dots on dates indicating scheduled work
- Calendar dots color-coded: red=overdue, yellow=due-this-week, green=scheduled-future
- Recent activity feed: compact list of 10 most recent audit log entries with action icon, description, and relative time
- Cost summary section: two cards showing current month and current quarter spend totals
- Dashboard is the landing page for manager role (DASH-06)
- Layout: status cards top row, health scores + calendar middle row, activity + cost summary bottom row
- Seed data narrative: Sunset Harbor Marina, spring maintenance push, 5 named users, realistic cost patterns
- Electrical category over budget in seed data
- Mobile: dashboard cards stack single column, calendar switches to compact week view, 44px touch targets
- UI polish: 24px page padding, 16px card gaps, 8px inner spacing, skeleton loading states, empty states

### Claude's Discretion
- Exact health score calculation algorithm details
- Calendar library choice (custom vs date-fns grid)
- Skeleton component design
- Seed script execution strategy (single transaction vs batched)
- Exact mobile breakpoints beyond standard Tailwind defaults
- Animation timing and easing
- Empty state illustration approach

### Deferred Ideas (OUT OF SCOPE)
None -- this is the final phase.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DASH-01 | At-a-glance status indicators: overdue (red), due soon (yellow), on track (green) | `getScheduleStats()` already returns overdueCount, dueSoonCount, onTrackCount. Hero status cards with status color backgrounds. |
| DASH-02 | Maintenance health score per dock and marina-wide, weighted by asset criticality | New `getDashboardHealthScores()` query needed. Weight formula: safety-critical 3x, structural 2x, cosmetic 1x. Compute from schedule compliance per dock. |
| DASH-03 | Upcoming maintenance calendar view (week/month) | shadcn Calendar (react-day-picker v9) already installed. Custom DayButton renders colored dots. Query `maintenanceSchedules.nextDueAt` for date markers. |
| DASH-04 | Recent activity feed showing completed work orders and new issues | `getAuditTrail()` already exists. New lightweight query for 10 most recent entries with formatted descriptions. |
| DASH-05 | Cost summary cards showing monthly/quarterly spend | `getCostSummary("month")` and `getCostSummary("quarter")` already return totalCostCents. Display as dollar amounts. |
| DASH-06 | Dashboard is the landing page for manager role | Root page already redirects manager to /dashboard. Dashboard page already has `requireRole(["manager"])`. |
| DASH-07 | Big status cards with clear visual hierarchy -- hero feature quality | CSS: 48px+ font numbers, colored backgrounds (red/yellow/green-50), subtle shadow-sm, responsive grid. |
| DEMO-01 | Seed script creates Sunset Harbor Marina with 4 docks (A-D) and 60 slips | Expand seed.ts to insert docks and slips tables. 15 slips per dock. |
| DEMO-02 | 120+ seeded assets across all types | Insert into assets table with realistic names, install dates, condition ratings per dock. |
| DEMO-03 | 30+ maintenance schedules with mixed frequencies | Insert into maintenanceSchedules with weekly/monthly/quarterly/annual mix, seasonal flags, safety-critical markers. |
| DEMO-04 | 80+ historical work orders going back 6 months with realistic narrative | Insert into workOrders with dates spanning Oct 2025 - Mar 2026. Bell curve distribution. Parts and labor costs. |
| DEMO-05 | 10 currently open work orders in various states | Subset of work orders with status: 2 created, 3 assigned, 3 in-progress, 2 completed. |
| DEMO-06 | 5 overdue items showing compliance gaps | Schedules with nextDueAt in the past. 2 electrical, 1 fire extinguisher, 1 piling, 1 fuel system. |
| DEMO-07 | 3 demo accounts (manager, crew, inspector) with correct roles | Already seeded in current seed.ts. Update names to match CONTEXT: Maria Santos, Mike Torres, Sarah Chen, Jake Williams, Robert Kim. |
| DEMO-08 | Mobile-responsive design across all views | Tailwind responsive classes, horizontal scroll on tables, stacked cards, collapsed filter panels. |
| DEMO-09 | Professional industrial/operational UI with safety status colors | Industrial color palette already defined in globals.css. Consistent card styling pass across all pages. |
</phase_requirements>

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| react-day-picker | 9.14.0 | Calendar component (via shadcn Calendar) | Installed, shadcn Calendar wrapper exists |
| recharts | 3.8.1 | Charts for health score visualization | Installed, no shadcn chart components added yet |
| date-fns | 4.1.0 | Date arithmetic for seed data and relative time | Installed, used in costs.ts |
| lucide-react | 1.7.0 | Icons for dashboard widgets | Installed, used throughout |

### New Dependencies Needed
None. All required packages are already installed.

### shadcn Components to Add
| Component | Purpose |
|-----------|---------|
| `skeleton` | Loading state placeholders for dashboard |
| `progress` | Health score visualization (optional, CSS bars work too) |

**Installation:**
```bash
npx shadcn@latest add skeleton progress
```

## Architecture Patterns

### Recommended Project Structure (New Files)
```
src/
├── components/
│   └── dashboard/
│       ├── status-cards.tsx          # Hero status cards (overdue/due-soon/on-track)
│       ├── health-scores.tsx         # Marina-wide + per-dock health scores
│       ├── maintenance-calendar.tsx  # Month calendar with colored dots
│       ├── activity-feed.tsx         # Recent 10 audit log entries
│       ├── cost-summary.tsx          # Month + quarter cost cards
│       └── dashboard-skeleton.tsx    # Skeleton loading state
├── lib/
│   └── queries/
│       └── dashboard.ts             # Aggregation queries for all dashboard widgets
└── app/
    └── (app)/
        └── dashboard/
            └── page.tsx             # Server component orchestrating parallel queries
```

### Pattern 1: Parallel Data Fetching with Promise.all
**What:** The dashboard server component fetches all widget data in parallel using Promise.all, then renders each widget with pre-fetched data.
**When to use:** Dashboard page only.
**Example:**
```typescript
// app/(app)/dashboard/page.tsx
export default async function DashboardPage() {
  await requireRole(["manager"]);

  const [statusStats, healthScores, calendarData, recentActivity, costMonth, costQuarter] =
    await Promise.all([
      getScheduleStats(),
      getDashboardHealthScores(),
      getUpcomingMaintenance(),
      getRecentActivity(10),
      getCostSummary("month"),
      getCostSummary("quarter"),
    ]);

  return (
    <div className="space-y-6">
      <StatusCards stats={statusStats} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <HealthScores scores={healthScores} />
        <MaintenanceCalendar data={calendarData} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ActivityFeed entries={recentActivity} />
        <CostSummary month={costMonth} quarter={costQuarter} />
      </div>
    </div>
  );
}
```

### Pattern 2: Health Score Calculation
**What:** Weighted compliance score computed at query time from schedule/work order data.
**Algorithm:**
```typescript
// Weight map based on asset type -> criticality
const CRITICALITY_WEIGHTS: Record<string, number> = {
  electrical_pedestal: 3,  // safety-critical
  fire_extinguisher: 3,    // safety-critical
  fuel_pump: 3,            // safety-critical
  piling: 2,               // structural
  cleat: 2,                // structural
  bumper: 2,               // structural
  gangway: 2,              // structural
  water_connection: 2,     // operational
  dock_light: 2,           // operational
  other: 1,                // cosmetic
};

// Score = sum(weight * isOnTrack) / sum(weight) * 100
// Per dock: filter by dockId
// Marina-wide: all docks combined
```
**Data source:** Join maintenanceSchedules -> assets -> docks, check nextDueAt vs now to determine on-track/overdue status, apply weights.

### Pattern 3: Calendar with Colored Dots via react-day-picker
**What:** Use the existing shadcn Calendar component with custom `modifiers` and `modifiersClassNames` to render colored dots on dates that have scheduled maintenance.
**Implementation:**
```typescript
// Query returns: { date: string, status: "overdue" | "due_soon" | "on_track" }[]
// Map to react-day-picker modifiers:
const modifiers = {
  overdue: overdueDates,
  dueSoon: dueSoonDates,
  onTrack: onTrackDates,
};
const modifiersClassNames = {
  overdue: "[&>button]:after:content-[''] [&>button]:after:absolute [&>button]:after:bottom-1 [&>button]:after:w-1.5 [&>button]:after:h-1.5 [&>button]:after:rounded-full [&>button]:after:bg-red-500",
  dueSoon: "...",  // yellow dot
  onTrack: "...",  // green dot
};
```

### Pattern 4: Seed Script with Deterministic Dates
**What:** Seed data uses fixed date offsets from a reference date (today) to create reproducible historical data. Use `subDays`, `subMonths` from date-fns to compute past dates.
**Why:** Random dates create different data each run. Fixed offsets from `new Date()` ensure the narrative is consistent (overdue items are always overdue, recent items are always recent).

### Anti-Patterns to Avoid
- **Random seed data:** Never use `Math.random()` for dates or statuses. Each work order should have a deliberate story.
- **Health score stored in DB:** Compute at query time. The existing pattern (see compliance.ts) already does this.
- **Client-side data fetching for dashboard:** Use server components with parallel queries. No useEffect or SWR.
- **Single monolithic seed function:** Break seed into sections (docks, assets, schedules, work orders, audit logs) for readability.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Calendar with date markers | Custom date grid component | shadcn Calendar (react-day-picker v9) with modifiers | Already installed, handles keyboard nav, month navigation, localization |
| Relative time display | Custom "X minutes ago" function | `formatDistanceToNow` from date-fns | Handles all edge cases (seconds, minutes, hours, days, months) |
| Skeleton loading states | Custom animated divs | shadcn Skeleton component | Consistent with design system, pulse animation built in |
| Circular progress indicator | Custom SVG donut chart | CSS `conic-gradient` or simple Recharts RadialBarChart | SVG math is error-prone; Recharts radial bar is one component |

## Common Pitfalls

### Pitfall 1: Seed Script Ordering and Foreign Key Violations
**What goes wrong:** Inserting work orders before assets or schedules exist causes FK constraint errors.
**Why it happens:** Tables have foreign key relationships: workOrders references assets, docks, users, schedules.
**How to avoid:** Insert in dependency order: users -> docks -> slips -> assets -> schedules -> work orders -> work order parts -> cost entries -> audit logs. Use `onConflictDoNothing()` for idempotent re-runs.
**Warning signs:** "violates foreign key constraint" errors on seed.

### Pitfall 2: Health Score Color Mismatch with Compliance
**What goes wrong:** Dashboard health score shows green while compliance page shows overdue items in red.
**Why it happens:** Different calculation methods between dashboard and compliance pages.
**How to avoid:** Use the same data source. The `getScheduleStats()` function already computes overdue/due-soon/on-track counts. Health scores should use the same underlying schedule + work order data.

### Pitfall 3: Calendar Performance with Many Dates
**What goes wrong:** Calendar re-renders slowly when 30+ dates have markers.
**Why it happens:** react-day-picker modifiers trigger re-renders on every month change.
**How to avoid:** Pre-compute the modifier arrays once in the server component. Pass them as props to the client calendar component. Only query dates within a 2-month window around the current view.

### Pitfall 4: Seed Data Timestamps in Wrong Timezone
**What goes wrong:** Work orders created with `new Date("2025-10-15")` get midnight UTC, which may display as previous day in US timezones.
**How to avoid:** Use explicit UTC timestamps or use date-fns functions that operate on UTC. For seed data, always use `new Date(Date.UTC(year, month, day))` or date-fns `set` functions.

### Pitfall 5: Seed Script Timeout on Neon
**What goes wrong:** Inserting 300+ rows in individual statements exceeds Neon serverless connection timeout.
**How to avoid:** Use batch inserts with Drizzle's `.insert().values([...array])` syntax. Each table should be a single bulk insert. Keep total seed execution under 30 seconds.

### Pitfall 6: Demo User Names Don't Match CONTEXT
**What goes wrong:** Current seed has "Harbor Manager", "Mike Chen", "Sarah Torres" but CONTEXT specifies "Maria Santos", "Mike Torres", "Sarah Chen", "Jake Williams", "Robert Kim" (5 users, not 3).
**How to avoid:** Update user seed to match CONTEXT names exactly. Add 2 additional crew users (Jake Williams). Keep the same email addresses for the 3 login accounts.

## Code Examples

### Dashboard Status Cards
```typescript
// src/components/dashboard/status-cards.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Clock, CheckCircle } from "lucide-react";

interface StatusCardsProps {
  stats: {
    overdueCount: number;
    dueSoonCount: number;
    onTrackCount: number;
  };
}

export function StatusCards({ stats }: StatusCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card className="bg-red-50 border-red-200 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-sm font-medium text-red-800">Overdue</p>
              <p className="text-5xl font-bold text-red-600">{stats.overdueCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Similar for Due Soon (yellow) and On Track (green) */}
    </div>
  );
}
```

### Health Score Query
```typescript
// src/lib/queries/dashboard.ts
export async function getDashboardHealthScores() {
  const now = new Date();
  const schedules = await db.query.maintenanceSchedules.findMany({
    where: and(
      isNull(maintenanceSchedules.deletedAt),
      eq(maintenanceSchedules.isActive, true)
    ),
    with: {
      asset: { with: { dock: true } },
    },
  });

  // Group by dock, apply criticality weights
  const dockScores: Record<number, { weighted: number; total: number; name: string }> = {};
  // ... aggregate logic with CRITICALITY_WEIGHTS ...

  return {
    marinaWide: overallScore,
    byDock: Object.values(dockScores),
  };
}
```

### Seed Data Bulk Insert Pattern
```typescript
// Deterministic dates relative to "today"
const today = new Date();
const sixMonthsAgo = subMonths(today, 6);

// Bulk insert assets
await db.insert(assets).values(
  allAssets.map(a => ({
    name: a.name,
    assetType: a.type,
    dockId: a.dockId,
    location: a.location,
    installDate: a.installDate,
    conditionRating: a.condition,
    isActive: true,
  }))
).onConflictDoNothing();
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Client-side dashboard with useEffect | Server Components with parallel queries | Next.js 13+ (2023) | No loading spinners on initial render |
| Custom calendar from scratch | react-day-picker v9 with modifiers | 2024 | Accessible, keyboard navigable out of the box |
| Seed scripts with raw SQL | Drizzle ORM bulk insert with type safety | 2024 | Type-checked seed data, FK validation at compile time |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Manual + build verification |
| Config file | none |
| Quick run command | `npm run build` |
| Full suite command | `npm run build && npm run lint` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DASH-01 | Status cards render overdue/due-soon/on-track counts | manual | Visual check after seed | N/A |
| DASH-02 | Health scores weighted by criticality | manual | Verify score changes when safety item is overdue | N/A |
| DASH-03 | Calendar shows colored dots on maintenance dates | manual | Visual check month view | N/A |
| DASH-04 | Activity feed shows 10 recent entries | manual | Check feed after seed | N/A |
| DASH-05 | Cost cards show month/quarter totals | manual | Cross-check with costs page | N/A |
| DASH-06 | Manager redirected to dashboard | smoke | Login as manager, verify URL | N/A |
| DASH-07 | Hero-quality visual hierarchy | manual | LinkedIn screenshot test | N/A |
| DEMO-01 | 4 docks, 60 slips seeded | smoke | `npm run db:seed` then check DB counts | N/A |
| DEMO-02 | 120+ assets seeded | smoke | Count assets after seed | N/A |
| DEMO-03 | 30+ schedules seeded | smoke | Count schedules after seed | N/A |
| DEMO-04 | 80+ historical work orders | smoke | Count work orders after seed | N/A |
| DEMO-05 | 10 open work orders | smoke | Filter open WOs after seed | N/A |
| DEMO-06 | 5 overdue items | smoke | Check overdue count on dashboard | N/A |
| DEMO-07 | 3 demo login accounts | smoke | Login with each account | N/A |
| DEMO-08 | Mobile responsive | manual | Chrome DevTools 375px width test | N/A |
| DEMO-09 | Professional industrial UI | manual | Visual inspection | N/A |

### Sampling Rate
- **Per task commit:** `npm run build`
- **Per wave merge:** `npm run build && npm run lint`
- **Phase gate:** Full build green + visual inspection at 375px mobile width + login with all 3 accounts

### Wave 0 Gaps
- [ ] `npx shadcn@latest add skeleton progress` -- dashboard loading states

## Open Questions

1. **Health score: schedules only or work orders too?**
   - What we know: CONTEXT says "weighted by asset criticality" using maintenance compliance data
   - What's unclear: Should health score include corrective/emergency work orders or only scheduled preventive maintenance?
   - Recommendation: Use scheduled maintenance compliance only (matches the preventive focus). Corrective work orders indicate reactive problems, which the overdue count already captures.

2. **Calendar: month view only or week toggle?**
   - What we know: CONTEXT says "month view with colored dots" and mobile "switches to compact week view"
   - What's unclear: Should desktop also have a week/month toggle?
   - Recommendation: Month view only on desktop (simpler hero), week view on mobile via responsive CSS. No toggle needed.

## Sources

### Primary (HIGH confidence)
- Existing codebase: schema.ts, compliance.ts, costs.ts, schedules.ts (all query patterns verified)
- package.json: all dependencies confirmed installed with versions
- shadcn Calendar component: react-day-picker v9 with modifier support
- CONTEXT.md: locked decisions for layout, colors, seed data narrative

### Secondary (MEDIUM confidence)
- react-day-picker v9 modifier API: based on installed component code review
- Recharts RadialBarChart: for circular health score display (alternative to CSS conic-gradient)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries already installed, versions confirmed from package.json
- Architecture: HIGH - follows established patterns from phases 1-3, parallel query pattern documented in ARCHITECTURE.md
- Pitfalls: HIGH - seed ordering, health score calculation, and calendar performance are well-understood risks
- Seed data: MEDIUM - narrative quality depends on execution, but schema constraints are clear

**Research date:** 2026-03-26
**Valid until:** 2026-04-26 (stable - no moving parts, all dependencies locked)
