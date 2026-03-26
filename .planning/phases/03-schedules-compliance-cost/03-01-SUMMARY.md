---
phase: 03-schedules-compliance-cost
plan: 01
subsystem: schedules
tags: [drizzle, date-fns, server-actions, preventive-maintenance, compliance]

requires:
  - phase: 02-work-orders-assets-audit
    provides: work orders table, assets table, audit logging, asset filters
provides:
  - Recurring maintenance schedule CRUD (create, update, soft-delete)
  - Auto-generation engine for preventive work orders
  - Schedule queries with compliance percent computation
  - Schedule list page with filters and stats
  - Budget/cost constants for category mapping
affects: [03-02-compliance-reporting, 03-03-cost-tracking, 04-dashboard-seed-polish]

tech-stack:
  added: ["@react-pdf/renderer", "recharts"]
  patterns: [schedule-driven-work-order-generation, drift-safe-interval-advancement, seasonal-awareness]

key-files:
  created:
    - src/lib/actions/schedules.ts
    - src/lib/queries/schedules.ts
    - src/lib/constants/budgets.ts
    - src/components/schedules/schedule-filters.tsx
    - src/components/schedules/schedule-form-dialog.tsx
    - src/components/schedules/schedule-table.tsx
    - src/app/(app)/schedules/schedule-page-client.tsx
  modified:
    - src/app/(app)/schedules/page.tsx

key-decisions:
  - "Drift-safe nextDueAt advancement: always add interval to current nextDueAt, never to completion date or now()"
  - "Seasonal skip: out-of-season schedules advance nextDueAt without creating WOs"
  - "Compliance percent computed from on-time completed WOs vs total WOs per schedule"
  - "Only create WO for the most recent due period when catching up missed periods"

patterns-established:
  - "Schedule auto-generation on page load via server action"
  - "Native HTML selects in form dialogs for reliable formData (consistent with Phase 2)"
  - "Client wrapper component for page-level interactive state (New Schedule button)"

requirements-completed: [SCHED-01, SCHED-02, SCHED-03, SCHED-04, SCHED-05, SCHED-06]

duration: 4min
completed: 2026-03-26
---

# Phase 3 Plan 1: Preventive Maintenance Schedules Summary

**Recurring schedule CRUD with drift-safe auto-generation of preventive work orders, seasonal awareness, and compliance tracking**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-26T01:42:07Z
- **Completed:** 2026-03-26T01:46:18Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Schedule server actions with Zod validation, role-based access, and audit logging
- Auto-generation engine that creates preventive work orders for due schedules, with seasonal skipping and drift-safe interval advancement
- Schedule list page with stats badges, 5-dimension filter bar, sortable data table with compliance percentages and safety indicators
- Budget constants establishing asset-type-to-category mapping for cost tracking in Plan 03

## Task Commits

Each task was committed atomically:

1. **Task 1: Schedule server actions, queries, and constants** - `4ff4f46` (feat)
2. **Task 2: Schedule list page with table, filters, form dialog, and auto-generation trigger** - `ecd3cc9` (feat)

## Files Created/Modified
- `src/lib/actions/schedules.ts` - Server actions: createSchedule, updateSchedule, deleteSchedule, generateDueWorkOrders
- `src/lib/queries/schedules.ts` - getSchedules with compliance computation, getScheduleStats
- `src/lib/constants/budgets.ts` - Asset type to category mapping, budgets, labor rate, season months
- `src/components/schedules/schedule-filters.tsx` - 5-dimension URL-based filter bar
- `src/components/schedules/schedule-form-dialog.tsx` - Create/edit dialog with native selects and checkbox
- `src/components/schedules/schedule-table.tsx` - Data table with compliance %, safety icons, status badges
- `src/app/(app)/schedules/page.tsx` - Server component with auto-generation and stats
- `src/app/(app)/schedules/schedule-page-client.tsx` - Client wrapper for interactive elements

## Decisions Made
- Drift-safe nextDueAt advancement: always adds interval to current nextDueAt (not completion date or now)
- Out-of-season schedules advance nextDueAt without creating work orders
- Only creates WO for most recent due period when catching up missed periods (avoids flooding)
- Compliance percent = on-time completed WOs / total WOs per schedule (100% if no WOs yet)
- Client wrapper component pattern for page-level state (New Schedule button visibility)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Schedule engine complete and generating preventive work orders
- Compliance data now computable from schedule-to-work-order relationships
- Budget constants ready for cost tracking in Plan 03
- Ready for Plan 02 (compliance reporting) and Plan 03 (cost tracking)

---
*Phase: 03-schedules-compliance-cost*
*Completed: 2026-03-26*
