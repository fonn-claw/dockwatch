---
phase: 01-foundation-auth
plan: 01
subsystem: auth
tags: [next.js, drizzle, iron-session, bcryptjs, neon-postgres, shadcn-ui, zod]

requires: []
provides:
  - Full database schema (9 tables, 7 enums) pushed to Neon Postgres
  - Drizzle ORM client singleton with Neon HTTP driver
  - iron-session auth with encrypted cookie (dockwatch-session)
  - Login/logout server actions with Zod validation and bcryptjs
  - requireAuth() and requireRole() guard utilities
  - 3 seeded demo users (manager, crew, inspector)
  - Middleware route protection
  - Login page with marina branding
affects: [02-core-features, 03-schedules-compliance, 04-dashboard-polish]

tech-stack:
  added: [next.js 16.2.1, drizzle-orm 0.45.1, iron-session 8.0.4, bcryptjs 3.0.3, zod 4.3.6, date-fns, shadcn/ui, lucide-react]
  patterns: [server-actions-with-use-server, iron-session-cookie-auth, drizzle-neon-http-client, role-guard-defense-in-depth]

key-files:
  created:
    - src/lib/db/schema.ts
    - src/lib/db/index.ts
    - src/lib/db/seed.ts
    - src/lib/auth/session.ts
    - src/lib/auth/guards.ts
    - src/lib/actions/auth.ts
    - src/middleware.ts
    - src/app/(auth)/login/page.tsx
    - src/types/index.ts
    - drizzle.config.ts
    - .env.example
  modified:
    - src/app/layout.tsx
    - src/app/page.tsx
    - package.json
    - .gitignore

key-decisions:
  - "Used Zod v4 import path (zod/v4) for server action validation"
  - "Middleware uses cookie presence check only, actual auth in server actions"
  - "Login action uses useActionState (React 19) for form state management"
  - "Root page reads session to redirect by role, falls back to /login"

patterns-established:
  - "getSession(): async dynamic import of cookies + iron-session for App Router compatibility"
  - "requireAuth/requireRole: defense-in-depth guards for every server action"
  - "Server actions with 'use server' directive for form handling"
  - "Drizzle schema: single file with all tables, enums, and relations"

requirements-completed: [AUTH-01, AUTH-02, AUTH-03, AUTH-04]

duration: 8min
completed: 2026-03-26
---

# Phase 1 Plan 1: Foundation & Auth Summary

**Full Drizzle schema (9 tables, 7 enums) on Neon Postgres with iron-session auth, login/logout actions, role guards, and 3 seeded demo users**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-26T00:27:48Z
- **Completed:** 2026-03-26T00:36:03Z
- **Tasks:** 2
- **Files modified:** 24

## Accomplishments
- 9 database tables with foreign keys, relations, and 7 pgEnums pushed to Neon Postgres
- iron-session encrypted cookie auth with login/logout server actions and Zod validation
- requireAuth/requireRole guard utilities for defense-in-depth RBAC
- Login page with centered card, marina branding, and demo account hints
- 3 demo users seeded: manager, crew, inspector (all with password demo1234)

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold Next.js project with full database schema** - `0735cba` (feat)
2. **Task 2: Implement auth system with login/logout and guards** - `18ea08d` (feat)

## Files Created/Modified
- `src/lib/db/schema.ts` - All 9 tables with enums and Drizzle relations
- `src/lib/db/index.ts` - Drizzle client singleton with Neon HTTP driver
- `src/lib/db/seed.ts` - Seeds 3 demo users with hashed passwords
- `src/lib/auth/session.ts` - iron-session config, getSession helper
- `src/lib/auth/guards.ts` - requireAuth and requireRole utilities
- `src/lib/actions/auth.ts` - Login and logout server actions
- `src/middleware.ts` - Cookie presence check for route protection
- `src/app/(auth)/login/page.tsx` - Login page with branding and demo hints
- `src/app/layout.tsx` - Root layout with Inter font and DockWatch metadata
- `src/app/page.tsx` - Root redirect based on session role
- `src/types/index.ts` - Core TypeScript types (Role, SessionData, etc.)
- `drizzle.config.ts` - Drizzle Kit config for Neon Postgres
- `.env.example` - Template for required env vars

## Decisions Made
- Used Zod v4 import path (`zod/v4`) since project has Zod 4.x installed
- Middleware uses cookie presence check only (not decryption) -- actual auth validated in server actions per defense-in-depth pattern
- Login form uses React 19 `useActionState` for pending/error state management
- Root page (/) reads session to redirect by role rather than always going to /login

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Next.js 16 shows deprecation warning for middleware.ts (recommends "proxy" convention) but middleware still works correctly

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Database schema complete with all tables needed for phases 2-4
- Auth system ready: login/logout works, guards importable from any server action
- shadcn/ui initialized with button, card, badge, input, label, separator, sheet, avatar, dropdown-menu, tooltip components
- Ready for Plan 01-02 (app shell with sidebar navigation)

---
*Phase: 01-foundation-auth*
*Completed: 2026-03-26*
