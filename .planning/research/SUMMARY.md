# Project Research Summary

**Project:** DockWatch -- Marina Preventive Maintenance & Compliance Platform
**Domain:** CMMS (Computerized Maintenance Management System), marina-specific
**Researched:** 2026-03-26
**Confidence:** HIGH

## Executive Summary

DockWatch is a marina-specific CMMS that fills a clear market gap: no modern standalone tool exists for marina infrastructure maintenance tracking. The market has all-in-one marina suites (DockMaster, Marina Master) where maintenance is a secondary module, and generic CMMS tools (MaintainX, Limble) that know nothing about docks, pilings, or maritime compliance. DockWatch targets this gap with purpose-built features -- health scores per dock, safety-critical item flagging aligned with NFPA 303 / NEC Article 555, and compliance-grade audit trails for insurance and regulatory proof.

The recommended approach uses a Next.js 16 App Router monolith with Neon Postgres via Drizzle ORM, deployed to Vercel. The stack is entirely prescribed by the brief and validated by research -- no decisions are ambiguous. iron-session handles auth for three fixed demo roles (simpler than NextAuth), shadcn/ui provides professional component quality, and @react-pdf/renderer generates compliance PDFs server-side. The architecture follows a Server Components-first pattern: pages fetch data directly via query functions, mutations go through role-guarded server actions, and every mutation writes to an append-only audit log.

The top risks are: (1) recurring schedule logic that silently drifts if due dates anchor to completion rather than the original schedule, (2) a health score that lies by treating all assets equally instead of weighting safety-critical items, and (3) Neon cold starts killing the first impression for LinkedIn viewers. All three are preventable with correct design decisions in their respective phases. The seed data is also a hidden risk -- generic test data will make the demo feel like a prototype instead of a real tool. The seed must tell a story: spring season prep, a problem dock, a compliance gap the inspector catches.

## Key Findings

### Recommended Stack

The stack is fully prescribed and version-verified via npm. No version conflicts or compatibility issues were found. All libraries are current stable releases with active maintenance.

**Core technologies:**
- **Next.js 16.2.1 + React 19**: App Router with RSC for server-rendered dashboards. Turbopack for fast dev.
- **Neon Postgres + @neondatabase/serverless 1.0.2**: Serverless-compatible Postgres with HTTP/WebSocket driver. Avoids TCP connection issues on Vercel.
- **Drizzle ORM 0.45.1**: SQL-like API, zero runtime overhead, end-to-end TypeScript inference. Use stable 0.45.x, not the v1 beta.
- **iron-session 8.0.4**: Encrypted cookie sessions for 3 fixed demo accounts. 20 lines of config vs NextAuth's adapter complexity.
- **shadcn/ui CLI v4 + Recharts 3.8.1**: Professional components with built-in chart support. No Tremor needed -- shadcn already wraps Recharts.
- **@react-pdf/renderer 4.3.2**: JSX-based PDF generation that runs in Vercel serverless functions. Puppeteer cannot.
- **Zod 4.3.6 + date-fns 4.1.0**: Validation and date arithmetic. Both tree-shakeable and TypeScript-native.

### Expected Features

**Must have (table stakes):**
- Work order CRUD with 5-stage status workflow (created > assigned > in-progress > completed > verified)
- Priority levels (urgent/high/normal/low) with color coding
- Crew assignment on work orders
- Overdue/due-soon/on-track traffic light indicators -- this IS the product
- Asset registry with dock/slip location hierarchy and maintenance history
- Recurring maintenance schedules with auto-generated work orders
- Role-based access (manager, crew, inspector)
- Mobile-responsive layout for field crew
- Filter/search on work orders
- Activity feed of recent completions

**Should have (differentiators):**
- Marina-wide and per-dock health scores (weighted by criticality)
- Compliance dashboard with audit trail and PDF export
- Safety-critical item flagging (electrical, fire, environmental)
- Asset condition ratings (1-5) updated after inspections
- Cost tracking by dock and category with rollup reports
- Maintenance calendar (week/month views)
- Work order type classification (preventive/corrective/inspection/emergency)
- Seasonal schedule awareness (spring-only, winter-only, year-round)

**Defer (v2+):**
- Budget vs actual comparison (needs budget input UI)
- Real photo upload infrastructure (placeholder images sufficient)
- Push notifications, email notifications
- Multi-marina tenancy
- IoT sensor integration, predictive maintenance
- Inventory/parts management beyond logging costs

### Architecture Approach

A Next.js App Router monolith with clear folder boundaries. Server Components handle all data fetching (no client-side fetch waterfalls). Server Actions handle all mutations with role guards and mandatory audit logging. The dashboard runs parallel aggregation queries via `Promise.all()`. Work order status transitions are enforced by a simple `VALID_TRANSITIONS` map -- no state machine library needed. Health scores and cost totals are computed at query time, never stored.

**Major components:**
1. **Dashboard** -- Aggregated health scores, status counts, calendar, activity feed, cost summary (server component with client chart widgets)
2. **Work Orders** -- CRUD, status workflow, assignment, filtering, cost/time logging (server actions + RSC lists + client forms)
3. **Asset Registry** -- Asset catalog, condition tracking, maintenance history, lifecycle (mostly server-rendered)
4. **Maintenance Schedules** -- Recurring task definitions, auto-generation of work orders on dashboard load (server actions)
5. **Compliance & Reports** -- Audit trail viewer, PDF generation via route handler, compliance dashboard (server components)
6. **Auth & Roles** -- iron-session middleware, `requireRole()` guard on every server action and route handler

**Database: 6 core tables** -- users, docks, assets, maintenance_schedules, work_orders, audit_log. Single schema file. Relationships: Asset belongs to Dock, Work Order belongs to Asset (and optionally Schedule), Audit Log references User.

### Critical Pitfalls

1. **Recurring schedule drift** -- Anchor `nextDueAt` to the original schedule interval, not to completion date. Store schedules as interval + anchor date. Generate next WO when current is completed. This must be right in the schema before any generation code is written.
2. **Health score that lies** -- Weight by criticality (safety-critical 3x, operational 2x, cosmetic 1x). Show separate safety-critical score. Color overall score by its worst component, not its average.
3. **Neon cold start on first impression** -- Use `@neondatabase/serverless` driver (HTTP, not TCP), pooled connection string, `connect_timeout=15`, and loading skeleton UI. Consider keep-alive ping for active demo periods.
4. **Work order status machine without guards** -- Define `VALID_TRANSITIONS` map server-side. Enforce per-transition requirements (assigned needs assignee, completed needs time/notes, verified needs different user from completer on safety items). Every transition writes audit log.
5. **RBAC that only protects routes** -- Check roles in every server action and route handler, not just middleware/layout. The `requireRole()` utility must exist before any protected feature is built.
6. **Seed data that doesn't tell a story** -- Craft a narrative: spring prep, Dock C aging infrastructure, marina-wide fire extinguisher compliance gap, one high-cost asset. Realistic costs, names, and time spans.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation (Schema, Auth, App Shell)
**Rationale:** Everything depends on the data model and auth. The database schema encodes the schedule-anchoring logic that prevents the #1 pitfall. Auth guards must exist before any protected feature.
**Delivers:** Database schema (all 6 tables), Drizzle config with Neon serverless driver, iron-session auth with role guards, app shell with sidebar navigation, login page with demo accounts.
**Addresses:** Auth & roles (table stakes), mobile-responsive layout shell.
**Avoids:** Neon cold start pitfall (serverless driver configured from start), RBAC bypass pitfall (guards built before features).

### Phase 2: Asset Registry and Work Order Management
**Rationale:** Assets must exist before they can be maintained. Work orders are the core interaction -- every other feature reads from or writes to them. Building these together enables the status workflow and audit trail from the start.
**Delivers:** Asset CRUD with dock/slip hierarchy, condition ratings. Work order CRUD with status workflow, priority, assignment, cost/time logging. Audit log writes on every mutation.
**Addresses:** Asset registry, work order management, filter/search, activity feed (all table stakes).
**Avoids:** Status machine pitfall (transitions enforced from day one), audit trail gaps.

### Phase 3: Preventive Maintenance Schedules
**Rationale:** This is what transforms DockWatch from a reactive ticket system into a preventive maintenance platform. Depends on both assets (schedules attach to asset types) and work orders (schedules generate WOs).
**Delivers:** Schedule CRUD, recurring task definitions with interval + anchor date, auto-generation of work orders when due, seasonal awareness, compliance % calculation.
**Addresses:** Recurring schedules, auto-generated work orders, seasonal awareness (differentiators).
**Avoids:** Schedule drift pitfall (anchor-based generation, not completion-based).

### Phase 4: Dashboard (Hero Feature)
**Rationale:** The dashboard aggregates everything from phases 1-3. Building it last means real data structures exist to query against. This is the LinkedIn showcase centerpiece.
**Delivers:** Health scores (marina-wide + per-dock, weighted by criticality), status cards (overdue/due-soon/on-track), maintenance calendar, activity feed, cost summary charts.
**Addresses:** Dashboard (hero feature), health scores, calendar view, cost summary (differentiators).
**Avoids:** Health score lies pitfall (weighted scoring from the start).

### Phase 5: Compliance, Reports, and PDF Export
**Rationale:** Compliance reads from the audit log accumulated in phases 2-4. PDF generation is a standalone route handler. Can be built in parallel with dashboard polish.
**Delivers:** Compliance dashboard with safety-critical flagging, audit trail viewer, PDF compliance report generation, exportable maintenance history.
**Addresses:** Compliance dashboard, audit trail, PDF reports, safety-critical flagging (differentiators).
**Avoids:** None specific -- this phase consumes data built correctly in earlier phases.

### Phase 6: Seed Data and Polish
**Rationale:** Seed data quality determines demo quality. Must be its own phase with dedicated attention. Polish pass ensures mobile responsiveness, empty states, and visual consistency.
**Delivers:** Narrative-driven seed data (6 months history, 120+ assets, 80+ work orders, compliance gaps, cost patterns), loading skeletons, empty states, mobile UX pass.
**Addresses:** Demo data (brief requirement), mobile responsiveness, professional polish.
**Avoids:** Weak seed data pitfall, mobile UX failure.

### Phase Ordering Rationale

- **Schema first** because the schedule anchoring pattern and audit log structure prevent the two most damaging pitfalls (schedule drift, audit gaps). Getting these wrong in the schema means rebuilding later.
- **Assets before work orders** because work orders reference assets. Building them in the same phase is efficient since they share UI patterns (lists, detail views, forms).
- **Schedules after work orders** because schedules generate work orders. The generation logic needs the WO creation infrastructure to exist.
- **Dashboard after data layers** because it is purely an aggregation view. Building it before the data exists means dummy queries that get rewritten.
- **Compliance parallel with dashboard** because both are read-heavy views over existing data. Could be combined into one phase if time is tight.
- **Seed data last** because all tables must exist. However, incremental seeding during earlier phases (a few test records) is expected for development.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3 (Schedules):** The schedule generation logic is the trickiest part of the app. Needs careful design of the anchor-based recurrence algorithm and edge cases (seasonal windows, overlapping schedules).
- **Phase 5 (PDF Reports):** @react-pdf/renderer API for complex table layouts in compliance reports may need experimentation.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation):** Well-documented Next.js App Router + Drizzle + iron-session setup. Standard patterns.
- **Phase 2 (Assets + Work Orders):** Standard CRUD with status workflow. Established CMMS patterns.
- **Phase 4 (Dashboard):** shadcn/ui + Recharts charts are well-documented. Aggregation queries are straightforward SQL.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions verified via npm. Prescribed stack with no ambiguity. |
| Features | MEDIUM-HIGH | Strong CMMS domain research. Marina-specific features inferred from domain knowledge and operator pain points. No direct marina maintenance software to benchmark against (that is the gap). |
| Architecture | HIGH | Standard Next.js App Router patterns. CMMS entity relationships are well-established. Server Components + Server Actions is the canonical Next.js 16 approach. |
| Pitfalls | HIGH | Pitfalls sourced from CMMS implementation failure literature, Neon/Vercel deployment guides, and Next.js security advisories. All are concrete and preventable. |

**Overall confidence:** HIGH

### Gaps to Address

- **Health score weighting formula:** The 3x/2x/1x criticality weights are a reasonable starting point but may need tuning after seeing real seed data distributions. Validate during Phase 4 that the score reflects operational reality.
- **Schedule generation edge cases:** What happens when a seasonal schedule's window expires with an incomplete work order? Research suggests closing it as "deferred" but this needs a design decision during Phase 3 planning.
- **PDF layout complexity:** @react-pdf/renderer handles tables and structured content well, but complex compliance report layouts (multi-page, conditional sections) may need prototyping. Flag for Phase 5.
- **Photo attachment strategy:** Brief says placeholder images are fine for demo. The schema should store URLs (JSON array) to support real uploads later, but the upload infrastructure itself is deferred.

## Sources

### Primary (HIGH confidence)
- npm registry (direct version verification for all packages)
- [Next.js Blog](https://nextjs.org/blog/next-16-1) -- v16.x line confirmed
- [Drizzle ORM docs](https://orm.drizzle.team/docs/latest-releases) -- stable 0.45.x, v1 beta not production-ready
- [Neon Serverless Driver docs](https://neon.com/docs/serverless/serverless-driver) -- HTTP + WebSocket modes
- [iron-session GitHub](https://github.com/vvo/iron-session) -- v8 App Router support
- [shadcn/ui Changelog](https://ui.shadcn.com/docs/changelog/2026-03-cli-v4) -- CLI v4, Recharts v3 integration

### Secondary (MEDIUM-HIGH confidence)
- [CMMS implementation failure literature](https://tractian.com/en/blog/why-cmms-implementations-fail-how-to-prevent-it) -- pitfall patterns
- [Marina management software features](https://www.marinamatch.org/blog-detail/marina-management-software-top-features) -- feature landscape
- [NFPA 303 / NEC Article 555](https://obfire.com/wp-content/uploads/2022/06/ARTICLE-555-Marinas-and-Boatyards.pdf) -- marina compliance requirements
- [CVE-2025-29927](https://workos.com/blog/nextjs-app-router-authentication-guide-2026) -- Next.js middleware bypass, mitigated on Vercel

### Tertiary (needs validation during implementation)
- Health score weighting formula (3x/2x/1x) -- reasonable default, validate with seed data
- Seasonal schedule edge cases -- design decision needed during Phase 3

---
*Research completed: 2026-03-26*
*Ready for roadmap: yes*
