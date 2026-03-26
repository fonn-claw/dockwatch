# DockWatch — Marina Preventive Maintenance & Compliance Platform

## What This Is

A web application for marina operators to manage preventive maintenance schedules, work orders, compliance tracking, and cost reporting across docks, slips, and shared infrastructure. Built for marina managers, dock crew, and compliance inspectors who currently rely on spreadsheets, paper logs, or nothing to track maintenance. Part of FonnIT's marina tech week showcase.

## Core Value

Marina operators can see at a glance what maintenance is overdue, what's due soon, and what's on track — replacing reactive "fix it when it breaks" with proactive preventive maintenance that saves money and ensures compliance.

## Requirements

### Validated

- ✓ Role-based auth (manager, crew, inspector) with appropriate access controls — Phase 1

### Active

- [ ] Maintenance dashboard with health scores, status indicators, calendar, activity feed, and cost summary
- [ ] Work order management with creation, assignment, status workflow, photo attachments, and filtering
- [ ] Preventive maintenance schedules with recurring tasks, auto-generated work orders, and compliance tracking
- [ ] Asset registry with condition ratings, lifecycle tracking, and maintenance history
- [ ] Compliance reporting with audit trail, PDF generation, and safety-critical item flagging
- [ ] Cost tracking with per-work-order costs, category breakdowns, and budget vs actual
- [ ] Demo data: Sunset Harbor Marina with 4 docks, 60 slips, 120+ assets, 80+ historical work orders
- [ ] Mobile-responsive design for field crew use
- [ ] Professional industrial/operational UI suitable for LinkedIn showcase

### Out of Scope

- Real-time notifications/push — not needed for demo showcase
- Actual photo upload storage — will use placeholder images
- Email sending — auth uses password-based login only
- Multi-marina support — single marina for v1
- Tenant/billing — this is a showcase demo, not a SaaS product

## Context

- Part of FonnIT daily build series, marina tech week alongside SlipSync
- Demo marina is "Sunset Harbor Marina" (shared universe with SlipSync)
- No existing modern tool for marina-specific maintenance tracking — operators use spreadsheets or nothing
- Reactive repairs cost 3× more than preventive maintenance
- Maintenance failures can cost $50K+ per incident (dock collapse, electrical fires, environmental violations)
- Spring peak season approaching — operators clearing maintenance backlogs NOW
- Three demo accounts: manager, crew, inspector — each with role-appropriate views

## Constraints

- **Tech Stack**: Next.js App Router, Neon Postgres, Drizzle ORM, Tailwind + shadcn/ui — specified in brief
- **Database**: Must use Neon Postgres (NOT SQLite) — Vercel serverless compatibility required
- **Auth**: iron-session or NextAuth for session management
- **Deploy**: Vercel with custom domain dockwatch.demos.fonnit.com
- **Timeline**: Single-session build — complete in one sitting
- **Design**: Industrial color palette with safety status colors (green/yellow/orange/red)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Neon Postgres over SQLite | Vercel serverless requires external DB | ✓ Good |
| iron-session for auth | Simpler than NextAuth for role-based demo with fixed accounts | ✓ Good |
| Placeholder images for photos | Avoids file upload complexity for demo | — Pending |
| Coarse phase granularity | Fewer broader phases for single-session build efficiency | ✓ Good |

---
*Last updated: 2026-03-26 after Phase 1 completion*
