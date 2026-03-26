# Feature Landscape

**Domain:** Marina Preventive Maintenance & Compliance Management
**Researched:** 2026-03-26
**Overall Confidence:** MEDIUM-HIGH

## Context

The marina management software market is dominated by all-in-one platforms (DockMaster, Marina Master, Molo, MARINAGO) that bundle slip reservations, billing, CRM, and maintenance into one suite. Maintenance is typically a secondary module in these platforms, not the primary focus. No standalone modern tool exists specifically for marina infrastructure maintenance tracking -- this is the gap DockWatch fills.

The closest analogs are general-purpose CMMS (Computerized Maintenance Management Systems) like MaintainX, Limble, and eMaint, which handle preventive maintenance well but know nothing about marina-specific assets, compliance requirements, or the operational reality of dock crews working on floating platforms with tablets.

## Table Stakes

Features users expect from any maintenance management tool. Missing any of these and the product feels broken or incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Work order CRUD with status workflow | Every CMMS has this. Without it there is no product. | Medium | Workflow: Created > Assigned > In Progress > Completed > Verified. Standard 5-stage is industry norm. |
| Priority levels on work orders | Crew need to know what to do first. Universal in CMMS. | Low | Urgent/High/Normal/Low is standard. Color-code them. |
| Assign work orders to crew | Basic dispatch. Cannot function without it. | Low | Simple user assignment, not complex scheduling. |
| Overdue/due-soon/on-track status indicators | The core value prop of any preventive maintenance tool. Traffic light pattern (red/yellow/green) is universal. | Low | This IS the product. Big, visible, unmissable. |
| Asset registry with maintenance history | You need to know what you are maintaining and what has been done. | Medium | Each asset links to its work orders. Location, install date, basic metadata. |
| Recurring maintenance schedules | Preventive maintenance means scheduled tasks. Without auto-generation of work orders from schedules, it is just a reactive ticket system. | Medium-High | Time-based triggers (every N days). Cron-like scheduling. Auto-creates work orders when due. |
| Role-based access control | Manager, crew, and inspector have fundamentally different needs. Crew should not see cost data or compliance reports. | Medium | Three roles is enough. Do not over-engineer permissions. |
| Mobile-responsive layout | Dock crew use phones and tablets in the field. Desktop-only is a dealbreaker. | Medium | Not a native app -- responsive web is sufficient. Touch-friendly buttons, readable in sunlight (high contrast). |
| Filter and search work orders | With 80+ work orders, finding what you need is critical. | Low-Medium | Filter by status, priority, assignee, dock, date range. |
| Activity feed / recent completions | Managers need to see what happened without digging through work orders. | Low | Reverse-chronological list of recent actions. |

## Differentiators

Features that set DockWatch apart from generic CMMS tools. Not strictly expected, but make the product feel purpose-built for marinas.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Marina-wide health score | Single number/grade that answers "how are we doing?" -- no generic CMMS offers this. Instantly communicates maintenance posture to owners and insurers. | Medium | Calculated from: % on-time completions, overdue count, asset condition ratings. Display as a big number on the dashboard. |
| Per-dock health breakdown | Managers need to know which dock is the problem child. Spatial awareness of maintenance state. | Low-Medium | Health score per dock (A, B, C, D). Enables targeted resource allocation. |
| Compliance dashboard with audit trail | Insurance companies and regulators want proof. Exportable compliance reports are a competitive moat against spreadsheets. | Medium-High | Every action logged (who/what/when). Generates PDF-ready compliance summaries. Safety-critical items flagged separately. |
| Safety-critical item flagging | Electrical, fire, and environmental items have stricter regulatory requirements (NFPA 303, NEC Article 555). Flagging these separately shows domain knowledge. | Low | Boolean flag on assets/schedules. Separate compliance view for safety items only. |
| Asset condition ratings (1-5 scale) | Updated after each inspection. Tracks degradation over time. Answers "when should we replace this?" | Low | Simple numeric rating updated on work order completion. Trend over time is the real value. |
| Cost tracking by dock and category | Generic CMMS tracks costs per work order but not by marina geography or infrastructure category. This enables "Dock B costs 3x more than Dock C" insights. | Medium | Parts + labor per work order. Rollup by dock, by category (electrical, structural, plumbing, cosmetic). |
| Budget vs actual comparison | Proves ROI of preventive maintenance program. "We budgeted $X, spent $Y, saved $Z vs reactive." | Medium | Requires budget input. Monthly/quarterly/annual views. |
| Seasonal schedule awareness | Marina maintenance is seasonal. Spring commissioning, winterization, hurricane prep are not generic CMMS concepts. | Low | Tag schedules as seasonal (spring-only, winter-only, year-round). Filter/activate by season. |
| Maintenance calendar (week/month) | Visual timeline of upcoming work. Better than a flat list for planning crew workloads. | Medium | Calendar component showing scheduled maintenance. Week and month views. |
| Work order types (preventive/corrective/inspection/emergency) | Categorization enables reporting on reactive vs preventive ratio -- a key maintenance maturity metric. | Low | Enum field on work orders. Enables "60% preventive, 40% reactive" reporting. |
| Photo attachments (before/after) | Proof of work for compliance. Visual documentation of asset condition. | Low-Medium | For demo, placeholder images are fine. Structure supports real uploads later. |

## Anti-Features

Features to explicitly NOT build. Either out of scope, poor ROI for a demo, or actively harmful.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Real-time push notifications | Adds complexity (WebSockets or push service) with minimal demo value. Marina crews check the app on their schedule, not reactively. | Show notification badges/counts in the UI. Unread indicator on work orders. |
| Slip reservation / berth management | This is SlipSync's domain (same universe). Duplicating it muddies the product story. | Link to SlipSync conceptually. DockWatch is maintenance-only. |
| Billing and invoicing | Maintenance cost tracking is not invoicing. Billing is a separate product concern. | Track costs for reporting, not for generating invoices to customers. |
| CRM / customer management | Boaters are not DockWatch users. DockWatch serves operators and crew, not marina tenants. | User management is internal staff only. |
| IoT sensor integration | Tempting (condition-based maintenance) but massively out of scope for a demo. No real sensors to connect. | Asset condition ratings are manually updated after inspections. Good enough. |
| Predictive maintenance / AI | 2026 CMMS trend but requires historical data, ML models, and sensor feeds. Inappropriate for a showcase demo. | Preventive (scheduled) maintenance is the right scope. Predictive is v3+. |
| Multi-marina / tenant support | Single marina demo. Multi-tenancy adds auth complexity, data isolation concerns, and zero demo value. | Hard-code to Sunset Harbor Marina. Can be extended later. |
| Inventory / parts management | Full parts inventory (stock levels, reorder points, vendors) is a rabbit hole. | Log parts used and their cost on work orders. That is sufficient. |
| Native mobile app | Responsive web works fine. React Native or similar would triple the build effort. | Mobile-first responsive design with touch-friendly UI. |
| Complex scheduling / resource optimization | Auto-assigning crew based on skills, availability, and location is enterprise CMMS territory. | Simple manual assignment by manager. One assignee per work order. |
| Email notifications | Requires email service setup (SendGrid, etc.) for zero demo payoff. | In-app indicators only. |
| Vessel maintenance tracking | DockWatch maintains marina infrastructure, not individual boats. Boat maintenance is the owner's problem. | Asset registry covers marina infrastructure only: docks, pilings, pedestals, pumps, fire equipment. |

## Feature Dependencies

```
Auth & Roles ─────────────────────────── (foundation for everything)
    │
    ├── Asset Registry ──────────────── (assets must exist before they can be maintained)
    │       │
    │       ├── Maintenance Schedules ── (schedules attach to assets)
    │       │       │
    │       │       └── Auto-generated Work Orders (schedules create work orders)
    │       │
    │       └── Asset Condition Ratings  (updated via work orders)
    │
    ├── Work Order Management ────────── (core CRUD, status workflow)
    │       │
    │       ├── Cost Tracking ────────── (costs attach to work orders)
    │       │       │
    │       │       └── Budget vs Actual (requires cost data + budget input)
    │       │
    │       ├── Photo Attachments ────── (attached to work orders)
    │       │
    │       └── Audit Trail ──────────── (logs all work order state changes)
    │               │
    │               └── Compliance Reports (reads from audit trail)
    │
    └── Dashboard ────────────────────── (aggregates everything above)
            │
            ├── Health Scores ─────────── (calculated from schedules + work orders)
            ├── Calendar View ─────────── (reads from schedules + work orders)
            ├── Activity Feed ─────────── (reads from audit trail)
            └── Cost Summary ──────────── (reads from cost tracking)
```

## MVP Recommendation

**Phase 1 -- Foundation (build first):**
1. Auth with role-based access (manager, crew, inspector)
2. Asset registry with dock/slip location hierarchy
3. Work order CRUD with status workflow and priority

**Phase 2 -- Preventive Maintenance Core (the product differentiator):**
4. Recurring maintenance schedules attached to assets
5. Auto-generation of work orders from schedules
6. Overdue/due-soon/on-track status calculation

**Phase 3 -- Dashboard and Reporting (the showcase):**
7. Maintenance dashboard with health scores, status cards, activity feed
8. Calendar view of upcoming maintenance
9. Cost tracking per work order with dock/category rollups

**Phase 4 -- Compliance and Polish (insurance-grade):**
10. Audit trail on all actions
11. Compliance dashboard with safety-critical flagging
12. PDF-ready compliance report view
13. Demo data seeding with realistic historical data

**Defer to post-MVP:**
- Budget vs actual comparison (needs budget input UI -- complexity for minimal demo impact)
- Photo upload infrastructure (placeholder images are sufficient for showcase)
- Advanced filtering (basic filters first, add date range and multi-select later)

**Rationale:** Auth and assets are foundational dependencies. Work orders are the core interaction. Schedules and auto-generation transform it from a ticket system into a preventive maintenance platform. The dashboard is the hero feature but needs data underneath it to be meaningful. Compliance is the final layer that makes it insurance/regulator-ready.

## Sources

- [Marina Management Software Features - MarinaMatch](https://www.marinamatch.org/blog-detail/marina-management-software-top-features)
- [Best CMMS Software for Facility Management 2026 - OxMaint](https://oxmaint.com/industries/facility-management/best-cmms-software-facility-management-2026)
- [How to Build a Work Order Dashboard - MaintainX](https://www.getmaintainx.com/blog/how-to-build-a-work-order-dashboard-for-maintenance)
- [Work Order Management Best Practices - FTMaintenance](https://ftmaintenance.com/maintenance-management/work-order-management-best-practices/)
- [Marina Fire Prevention - Marina Dock Age](https://www.marinadockage.com/fire-prevention-essentials-for-marinas/)
- [NEC Article 555 - Marinas and Boatyards](https://obfire.com/wp-content/uploads/2022/06/ARTICLE-555-Marinas-and-Boatyards.pdf)
- [DockMaster Marina Software](https://www.dockmaster.com/)
- [Field Eagle Marina Inspection Software](https://www.fieldeagle.com/marina-dock-shipyard-aquatic-vehicles-inspection-software/)
- [CMMS Guide - Limble](https://limble.com/learn/cmms)
- [Best Preventive Maintenance Software 2026 - AppIntent](https://www.appintent.com/software/maintenance/preventive/)
