---
phase: 03-schedules-compliance-cost
plan: 03
subsystem: reporting
tags: [cost-tracking, budget-comparison, drizzle, date-fns, shadcn]

requires:
  - phase: 03-01
    provides: "Budget constants (CATEGORY_BUDGETS, ASSET_TYPE_TO_CATEGORY, LABOR_RATE_PER_MINUTE)"
  - phase: 02-03
    provides: "Work order parts with unitCost in cents, timeSpentMinutes on work orders"
provides:
  - "Cost aggregation queries with period filtering (month/quarter/year)"
  - "Cost reports page with summary cards, budget comparison, breakdown tables, and high-cost assets"
  - "Manager-only reports access control"
affects: [04-dashboard-seed-polish]

tech-stack:
  added: []
  patterns: ["Period-filtered cost aggregation with cents-based storage", "CSS progress bars for budget visualization", "Client-side sortable tables"]

key-files:
  created:
    - src/lib/queries/costs.ts
    - src/components/reports/cost-summary-cards.tsx
    - src/components/reports/cost-breakdown-table.tsx
    - src/components/reports/budget-comparison.tsx
    - src/components/reports/high-cost-assets.tsx
  modified:
    - src/app/(app)/reports/page.tsx

key-decisions:
  - "CSS-based progress bars instead of shadcn Progress component for simpler budget visualization"
  - "Client-side sortable columns in breakdown tables using React state"
  - "Total budget coloring on summary card based on aggregate spend vs total budget"

patterns-established:
  - "Cost queries return cents, display layer converts to dollars with formatCurrency helper"
  - "Period selector as Link-based tabs using searchParams for server-side data fetching"

requirements-completed: [COST-01, COST-02, COST-03, COST-04, COST-05]

duration: 7min
completed: 2026-03-26
---

# Phase 03 Plan 03: Cost Tracking Reports Summary

**Cost reports page with summary cards, budget vs actual progress bars, dock/category breakdowns, and high-cost asset identification with period selector**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-26T01:49:03Z
- **Completed:** 2026-03-26T01:55:38Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Five cost aggregation queries with period filtering (month/quarter/year) returning values in cents
- Budget vs actual comparison with scaled annual budgets and green/yellow/red progress bars
- Sortable cost breakdown tables by dock and by category
- High-cost assets table identifying top 20 replacement candidates with amber highlighting

## Task Commits

Each task was committed atomically:

1. **Task 1: Cost aggregation queries** - `aab457b` (feat)
2. **Task 2: Cost reports page with summary cards, breakdown table, budget comparison, and high-cost assets** - `2f83912` (feat)

## Files Created/Modified
- `src/lib/queries/costs.ts` - Five cost aggregation queries with period filtering
- `src/components/reports/cost-summary-cards.tsx` - Total spend, parts cost, labor estimate cards
- `src/components/reports/cost-breakdown-table.tsx` - Sortable tables by dock and category
- `src/components/reports/budget-comparison.tsx` - Progress bars with budget vs actual comparison
- `src/components/reports/high-cost-assets.tsx` - Top 20 highest-cost assets table
- `src/app/(app)/reports/page.tsx` - Manager-only reports page with period selector and parallel queries

## Decisions Made
- Used CSS div-based progress bars rather than shadcn Progress for simpler customization of colors
- Client-side sorting with React state for breakdown tables (data is small enough)
- Summary card total spend colored based on aggregate budget comparison

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed pre-existing type error in asset history PDF route**
- **Found during:** Task 2 (build verification)
- **Issue:** `React.createElement` return type incompatible with `@react-pdf/renderer` `renderToBuffer` expected type
- **Fix:** Used `as any` cast to bypass react-pdf type mismatch
- **Files modified:** src/app/api/assets/[id]/history/route.ts
- **Verification:** npm run build passes
- **Committed in:** 2f83912 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Pre-existing type error in unrelated file blocked build verification. Minimal fix applied.

## Issues Encountered
- Stale `.next` cache caused ENOENT error on pages-manifest.json -- resolved by cleaning build cache

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All Phase 03 plans complete (schedules, compliance, cost tracking)
- Ready for Phase 04: dashboard, seed data, and polish

---
*Phase: 03-schedules-compliance-cost*
*Completed: 2026-03-26*
