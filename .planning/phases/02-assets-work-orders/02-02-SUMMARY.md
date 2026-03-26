---
phase: 02-assets-work-orders
plan: 02
subsystem: work-orders
tags: [drizzle, zod, server-actions, next.js, work-orders, status-transitions]

requires:
  - phase: 02-assets-work-orders/01
    provides: "Work order transition engine (canTransition, isForwardTransition), audit logging, asset queries, DB schema"
provides:
  - "createWorkOrder server action with Zod validation and auto-assign"
  - "transitionWorkOrder server action with canTransition() enforcement and backward timestamp clearing"
  - "getWorkOrders query with role-based filtering (crew sees only assigned)"
  - "getWorkOrderDetail query with full relations"
  - "getCrewUsers query for assignee dropdowns"
  - "Card-based work order list page with URL-based filters"
  - "Work order creation form (manager only)"
affects: [03-schedules-compliance-cost, 04-dashboard-seed-polish]

tech-stack:
  added: [date-fns]
  patterns: [card-based-list, url-searchparam-filters, status-transition-buttons, backward-transition-confirm]

key-files:
  created:
    - src/lib/actions/work-orders.ts
    - src/lib/queries/work-orders.ts
    - src/components/work-orders/priority-badge.tsx
    - src/components/work-orders/status-badge.tsx
    - src/components/work-orders/work-order-card.tsx
    - src/components/work-orders/work-order-filters.tsx
    - src/components/work-orders/work-order-list.tsx
    - src/components/work-orders/work-order-form.tsx
    - src/app/(app)/work-orders/new/page.tsx
  modified:
    - src/app/(app)/work-orders/page.tsx

key-decisions:
  - "Used native HTML selects in work order form for reliable formData (consistent with 02-01 pattern)"
  - "Status transition buttons instead of dropdown for clearer action affordance"
  - "Backward transitions require window.confirm dialog before execution"
  - "Priority sorting done in JS after DB query for simpler Drizzle query"

patterns-established:
  - "Card-based entity list with priority left-border color coding"
  - "Status transition buttons with forward/backward visual distinction"
  - "Role-based page heading (manager vs crew)"

requirements-completed: [WO-01, WO-02, WO-03, WO-06, WO-07]

duration: 5min
completed: 2026-03-26
---

# Phase 02 Plan 02: Work Order CRUD Summary

**Work order server actions with enforced status transitions, card-based list page with URL filters, and creation form with dock-filtered asset picker**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-26T01:11:08Z
- **Completed:** 2026-03-26T01:15:50Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments
- Server actions enforce status transitions via canTransition() with backward timestamp clearing
- Card-based work order list with priority border colors, status/priority badges, overdue highlighting
- URL-based filter bar with dock, status, priority, assignee, and date range
- Crew role sees only their assigned work orders with "My Work Orders" heading
- Creation form with dock-filtered asset dropdown and auto-assign on assignee selection

## Task Commits

Each task was committed atomically:

1. **Task 1: Create work order server actions and query functions** - `dc0937e` (feat)
2. **Task 2: Build work order list page with card layout, filters, and creation form** - `e842f7f` (feat)

## Files Created/Modified
- `src/lib/actions/work-orders.ts` - createWorkOrder and transitionWorkOrder server actions with Zod validation
- `src/lib/queries/work-orders.ts` - getWorkOrders (filtered, role-based), getWorkOrderDetail, getCrewUsers
- `src/components/work-orders/priority-badge.tsx` - Color-coded priority badge (urgent=red, high=orange, normal=blue, low=gray)
- `src/components/work-orders/status-badge.tsx` - Status badge using STATUS_LABELS/STATUS_COLORS from transitions module
- `src/components/work-orders/work-order-card.tsx` - Card with priority border, badges, transition buttons, overdue highlighting
- `src/components/work-orders/work-order-filters.tsx` - URL-based filter bar (collapsible on mobile)
- `src/components/work-orders/work-order-list.tsx` - Responsive grid (1/2/3 cols) with empty state
- `src/components/work-orders/work-order-form.tsx` - Creation form with dock-filtered asset picker
- `src/app/(app)/work-orders/page.tsx` - Server component with role-based heading and filter rendering
- `src/app/(app)/work-orders/new/page.tsx` - Manager-only creation page

## Decisions Made
- Used native HTML selects in form (consistent with 02-01 pattern for reliable formData)
- Status transition rendered as buttons (not dropdown) for clearer action affordance
- Backward transitions require window.confirm before executing
- Priority sorting done in JS after DB query (simpler than custom SQL ordering)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Work order CRUD complete, ready for Phase 3 schedules/compliance to reference work orders
- Audit logging in place for compliance reporting
- Cost tracking can attach to work orders via workOrderParts relation

---
*Phase: 02-assets-work-orders*
*Completed: 2026-03-26*
