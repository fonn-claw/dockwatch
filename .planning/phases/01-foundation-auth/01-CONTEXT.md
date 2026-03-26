# Phase 1: Foundation & Auth - Context

**Gathered:** 2026-03-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Set up the Next.js project with Neon Postgres database, Drizzle ORM schema for all entities, iron-session auth with role-based access control, and the app shell (sidebar navigation, layout). Users can log in with demo credentials and see role-appropriate navigation. This phase creates the foundation everything else builds on.

</domain>

<decisions>
## Implementation Decisions

### App Shell Layout
- Collapsible sidebar navigation (not top nav) — operational tools need many nav items
- Slate blue industrial color palette with safety status colors (green/yellow/orange/red)
- Logo + "DockWatch" text in sidebar header
- Light mode only — no dark mode toggle for single-session build
- Main content area with breadcrumbs and page header pattern

### Auth Flow
- Centered login card with marina-themed branding on the login page
- iron-session with 7-day session duration (demo-friendly)
- Generic error messages on failed login (no account enumeration)
- Role-based post-login redirect: manager → dashboard, crew → work orders, inspector → compliance
- requireRole() utility enforced on every server action and route (not just middleware)

### Role-Based Navigation
- Only show nav items the logged-in role can access (no disabled/grayed items)
- Server-side redirect for unauthorized route access (no flash of forbidden content)
- Role badge displayed in sidebar user section
- Manager sees: Dashboard, Work Orders, Assets, Schedules, Compliance, Cost Reports
- Crew sees: My Work Orders, Assets (read-only)
- Inspector sees: Compliance, Audit Trail, Assets (read-only)

### Database Schema
- drizzle-kit push for schema migrations (speed over control for single-session build)
- Separate audit_logs table: action, entityType, entityId, userId, metadata (JSON), timestamp
- Serial integer IDs for demo readability
- Soft delete (deletedAt column) on assets, work orders, schedules
- All core tables defined upfront: users, docks, slips, assets, work_orders, maintenance_schedules, audit_logs, work_order_parts, cost_entries

### Claude's Discretion
- Exact Tailwind theme configuration values
- shadcn/ui component variant choices
- Middleware implementation details
- Database index strategy
- Loading skeleton design for app shell

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

No external specs — requirements are fully captured in decisions above and in:

### Project Context
- `BRIEF.md` — Full project brief with tech stack, design requirements, demo data specs
- `.planning/PROJECT.md` — Project context, constraints, key decisions
- `.planning/REQUIREMENTS.md` — AUTH-01 through AUTH-07 requirements for this phase
- `.planning/research/STACK.md` — Verified library versions and rationale
- `.planning/research/ARCHITECTURE.md` — Component boundaries and build order
- `.planning/research/PITFALLS.md` — Critical pitfalls including RBAC and audit trail guidance

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project, Phase 1

### Established Patterns
- None yet — this phase establishes all patterns

### Integration Points
- Database schema defined here will be used by all subsequent phases
- Auth utilities (requireRole, getSession) will be imported everywhere
- App shell layout wraps all authenticated pages

</code_context>

<specifics>
## Specific Ideas

- Industrial/operational feel — think marine operations control panel, not consumer SaaS
- Status colors are critical UX: green (good), yellow (due soon), orange (overdue), red (critical/urgent)
- Demo accounts: manager@dockwatch.app, crew@dockwatch.app, inspector@dockwatch.app — all with password "demo1234"
- Marina name in demo: "Sunset Harbor Marina" (shared universe with SlipSync)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation-auth*
*Context gathered: 2026-03-26*
