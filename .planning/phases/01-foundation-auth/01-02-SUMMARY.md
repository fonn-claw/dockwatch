---
phase: 01-foundation-auth
plan: 02
subsystem: ui
tags: [next.js, sidebar, role-based-nav, shadcn, tailwind, base-ui]

requires:
  - phase: 01-foundation-auth/01
    provides: "Auth guards (requireAuth, requireRole), session management, login/logout actions"
provides:
  - "Collapsible sidebar with DockWatch branding and role-filtered navigation"
  - "Authenticated app layout with session check"
  - "Placeholder pages for all 7 routes with per-page role guards"
  - "Industrial slate-blue color palette with status color CSS variables"
  - "User menu with role badge and logout"
affects: [02-core-data, 03-schedules-compliance, 04-dashboard-polish]

tech-stack:
  added: []
  patterns: [app-shell-with-context, role-filtered-nav, defense-in-depth-guards, base-ui-render-prop]

key-files:
  created:
    - src/lib/nav-config.ts
    - src/components/layout/sidebar.tsx
    - src/components/layout/sidebar-nav.tsx
    - src/components/layout/header.tsx
    - src/components/layout/user-menu.tsx
    - src/components/layout/app-shell.tsx
    - src/app/(app)/layout.tsx
    - src/app/(app)/dashboard/page.tsx
    - src/app/(app)/work-orders/page.tsx
    - src/app/(app)/assets/page.tsx
    - src/app/(app)/schedules/page.tsx
    - src/app/(app)/compliance/page.tsx
    - src/app/(app)/compliance/audit/page.tsx
    - src/app/(app)/reports/page.tsx
  modified:
    - src/app/globals.css

key-decisions:
  - "Used shared React context (AppShell) for sidebar collapse state to sync sidebar width with main content padding"
  - "base-ui render prop pattern instead of Radix asChild for Sheet/Tooltip/Dropdown components"
  - "Defense-in-depth: requireAuth() in layout plus requireRole() in every page"

patterns-established:
  - "AppShell context: sidebar collapse state shared between Sidebar and main content via React context"
  - "Nav config pattern: declarative NAV_ITEMS array filtered by getNavForRole(role)"
  - "Placeholder page pattern: server component with requireRole() + Card with phase indicator"
  - "base-ui integration: use render prop instead of asChild for composition"

requirements-completed: [AUTH-05, AUTH-06, AUTH-07]

duration: 5min
completed: 2026-03-26
---

# Phase 1 Plan 2: App Shell & Navigation Summary

**Collapsible sidebar with DockWatch branding, role-filtered nav (6/2/3 items for manager/crew/inspector), placeholder pages with per-route role guards, and industrial slate-blue color palette with status color variables**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-26T00:38:30Z
- **Completed:** 2026-03-26T00:43:35Z
- **Tasks:** 2
- **Files modified:** 15

## Accomplishments
- Collapsible sidebar with DockWatch anchor icon branding, dark slate-900 background, mobile Sheet drawer
- Role-filtered navigation: manager sees 6 items, crew sees 2, inspector sees 3
- All 7 route pages with server-side requireRole() enforcement (defense-in-depth)
- Industrial color palette with status colors (green/yellow/orange/red) as CSS custom properties
- User menu with avatar initials, role badge (blue/green/amber), and logout action

## Task Commits

Each task was committed atomically:

1. **Task 1: Create nav config, app shell layout with collapsible sidebar, user menu, and industrial color theme** - `7737eb8` (feat)
2. **Task 2: Create placeholder pages for all routes with role guards** - `a4c28ba` (feat)

## Files Created/Modified
- `src/lib/nav-config.ts` - Declarative nav items with role filtering via getNavForRole()
- `src/components/layout/app-shell.tsx` - Client wrapper with sidebar context for collapse state sync
- `src/components/layout/sidebar.tsx` - Collapsible desktop sidebar + mobile Sheet drawer
- `src/components/layout/sidebar-nav.tsx` - Role-filtered nav links with active state and tooltips
- `src/components/layout/header.tsx` - Page header with breadcrumbs support
- `src/components/layout/user-menu.tsx` - Avatar, role badge, and logout button
- `src/app/(app)/layout.tsx` - Server component calling requireAuth(), wraps with AppShell
- `src/app/(app)/dashboard/page.tsx` - Manager-only dashboard placeholder
- `src/app/(app)/work-orders/page.tsx` - Manager+crew work orders placeholder
- `src/app/(app)/assets/page.tsx` - All roles assets placeholder
- `src/app/(app)/schedules/page.tsx` - Manager-only schedules placeholder
- `src/app/(app)/compliance/page.tsx` - Manager+inspector compliance placeholder
- `src/app/(app)/compliance/audit/page.tsx` - Inspector-only audit trail placeholder
- `src/app/(app)/reports/page.tsx` - Manager-only cost reports placeholder
- `src/app/globals.css` - Added status color CSS variables and Tailwind theme inline

## Decisions Made
- Used shared React context (AppShell) for sidebar collapse state to keep sidebar width and main content padding in sync
- Adapted all component composition to base-ui render prop pattern (not Radix asChild) since shadcn/ui in this project uses @base-ui/react
- Defense-in-depth approach: requireAuth() in layout catches unauthenticated users, requireRole() in each page catches unauthorized role access

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TooltipProvider delayDuration prop**
- **Found during:** Task 1 (sidebar-nav.tsx)
- **Issue:** shadcn tooltip uses base-ui which expects `delay` not `delayDuration`
- **Fix:** Changed prop from `delayDuration={0}` to `delay={0}`
- **Files modified:** src/components/layout/sidebar-nav.tsx
- **Verification:** Build passes
- **Committed in:** 7737eb8

**2. [Rule 1 - Bug] Fixed asChild prop to render prop for base-ui components**
- **Found during:** Task 1 (sidebar.tsx, sidebar-nav.tsx, user-menu.tsx)
- **Issue:** base-ui uses `render` prop for composition instead of Radix `asChild`
- **Fix:** Replaced `asChild` with `render={<Component />}` pattern throughout
- **Files modified:** sidebar.tsx, sidebar-nav.tsx, user-menu.tsx
- **Verification:** Build passes
- **Committed in:** 7737eb8

---

**Total deviations:** 2 auto-fixed (2 bugs - base-ui API differences)
**Impact on plan:** Both fixes necessary for build to pass. No scope creep.

## Issues Encountered
None beyond the base-ui API differences noted in deviations.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- App shell complete with all navigation routes and role guards
- Phase 2 can build actual page content inside the existing placeholder pages
- Status color variables ready for dashboard health indicators in Phase 4

---
## Self-Check: PASSED

- All 15 files verified present on disk
- Commits 7737eb8 and a4c28ba verified in git log

---
*Phase: 01-foundation-auth*
*Completed: 2026-03-26*
