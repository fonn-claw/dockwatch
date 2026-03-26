# Roadmap: DockWatch

## Overview

DockWatch delivers a marina preventive maintenance platform in four phases: foundation and auth, core operational data (assets + work orders), the preventive maintenance engine with compliance and cost tracking, and finally the hero dashboard with narrative seed data and polish. Each phase delivers a complete, verifiable capability that unblocks the next.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation & Auth** - Database schema, iron-session auth with role guards, app shell with navigation
- [x] **Phase 2: Assets & Work Orders** - Asset registry CRUD and work order management with status workflow (completed 2026-03-26)
- [ ] **Phase 3: Schedules, Compliance & Cost** - Recurring maintenance schedules, compliance reporting with audit trail and PDF export, cost tracking
- [ ] **Phase 4: Dashboard, Seed Data & Polish** - Hero dashboard with health scores and calendar, narrative seed data, mobile responsiveness, professional UI polish

## Phase Details

### Phase 1: Foundation & Auth
**Goal**: Users can log in with role-appropriate access and navigate the app shell
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-07
**Success Criteria** (what must be TRUE):
  1. User can log in with demo credentials (manager, crew, inspector) and sees a role-appropriate landing page
  2. User session survives a browser refresh without re-login
  3. User can log out from any page and is redirected to login
  4. Crew user cannot access manager-only routes (schedules, reports); inspector cannot access manager-only actions
  5. App shell displays sidebar navigation with links appropriate to the logged-in role
**Plans**: 2 plans

Plans:
- [ ] 01-01-PLAN.md — Project scaffolding, database schema, iron-session auth, login/logout, role guards, demo user seeding
- [ ] 01-02-PLAN.md — App shell with collapsible sidebar, role-based navigation, placeholder pages, industrial color theme

### Phase 2: Assets & Work Orders
**Goal**: Users can manage marina assets and work through the full work order lifecycle
**Depends on**: Phase 1
**Requirements**: ASSET-01, ASSET-02, ASSET-03, ASSET-04, ASSET-05, WO-01, WO-02, WO-03, WO-04, WO-05, WO-06, WO-07
**Success Criteria** (what must be TRUE):
  1. User can browse the asset catalog filtered by dock, type, and condition, and view each asset's location, install date, warranty, and maintenance history
  2. Manager can create, edit, and deactivate assets; condition ratings update after inspections
  3. Manager can create a work order with assignee, priority, due date, and type; work order appears in the list
  4. Crew member can advance a work order through created > assigned > in-progress > completed, logging notes, parts, and time spent; invalid status jumps are rejected
  5. Work order list supports filtering by dock, status, priority, assignee, and date range, and is usable on a mobile-width screen
**Plans**: 3 plans

Plans:
- [ ] 02-01-PLAN.md — Shared utilities (audit logger, transition map) and complete asset registry with data table, filters, detail panel, CRUD dialog
- [ ] 02-02-PLAN.md — Work order server actions with enforced transitions, card-based list page with filters, creation form
- [ ] 02-03-PLAN.md — Work order detail page with tabs (overview, activity timeline, parts/labor, photos)

### Phase 3: Schedules, Compliance & Cost
**Goal**: The system proactively generates maintenance work orders on schedule, tracks compliance with audit trails, and reports costs
**Depends on**: Phase 2
**Requirements**: SCHED-01, SCHED-02, SCHED-03, SCHED-04, SCHED-05, SCHED-06, COMP-01, COMP-02, COMP-03, COMP-04, COMP-05, COST-01, COST-02, COST-03, COST-04, COST-05
**Success Criteria** (what must be TRUE):
  1. Manager can create a recurring maintenance schedule with frequency and seasonal flags; the system auto-generates a work order when a task comes due, anchored to the schedule (not completion date)
  2. Compliance dashboard shows required vs completed vs overdue maintenance, with safety-critical items flagged separately
  3. Every mutation in the system is logged in an audit trail with who/what/when; inspector can browse the audit trail
  4. Manager can generate a PDF compliance report and export maintenance history per asset
  5. Work orders track parts and labor costs; manager can view cost breakdowns by dock and category, with monthly/quarterly/annual views and budget vs actual comparison
**Plans**: 3 plans

Plans:
- [ ] 03-01-PLAN.md — Schedule CRUD server actions, auto-generation engine, schedule list page with sortable table, filters, and form dialog
- [ ] 03-02-PLAN.md — Compliance dashboard with status cards and period selector, safety-critical section, audit trail browser, PDF compliance report and asset history export
- [ ] 03-03-PLAN.md — Cost tracking reports page with summary cards, breakdown by dock and category, budget vs actual comparison, high-cost asset identification

### Phase 4: Dashboard, Seed Data & Polish
**Goal**: The hero dashboard tells the marina's maintenance story at a glance, backed by realistic demo data and polished for LinkedIn showcase
**Depends on**: Phase 3
**Requirements**: DASH-01, DASH-02, DASH-03, DASH-04, DASH-05, DASH-06, DASH-07, DEMO-01, DEMO-02, DEMO-03, DEMO-04, DEMO-05, DEMO-06, DEMO-07, DEMO-08, DEMO-09
**Success Criteria** (what must be TRUE):
  1. Dashboard displays big status cards showing overdue (red), due soon (yellow), and on track (green) counts with clear visual hierarchy
  2. Marina-wide and per-dock health scores are visible, weighted by asset criticality; maintenance calendar shows week and month views
  3. Seed script populates Sunset Harbor Marina with 4 docks, 60 slips, 120+ assets, 80+ historical work orders, 30+ schedules, and 5 overdue items -- data tells a coherent story
  4. All three demo accounts (manager, crew, inspector) log in and see role-appropriate data with realistic content
  5. Every view is mobile-responsive and uses the industrial color palette with safety status colors; the app looks professional enough for a LinkedIn showcase
**Plans**: 3 plans

Plans:
- [ ] 04-01-PLAN.md — Comprehensive seed script with narrative data for Sunset Harbor Marina (docks, assets, schedules, work orders, costs, audit logs)
- [ ] 04-02-PLAN.md — Hero dashboard page with status cards, health scores, maintenance calendar, activity feed, and cost summary
- [ ] 04-03-PLAN.md — Mobile responsiveness and UI polish pass across all pages

## Progress

**Execution Order:**
Phases execute in numeric order: 1 > 2 > 3 > 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Auth | 2/2 | Complete | 2026-03-26 |
| 2. Assets & Work Orders | 3/3 | Complete   | 2026-03-26 |
| 3. Schedules, Compliance & Cost | 2/3 | In Progress|  |
| 4. Dashboard, Seed Data & Polish | 2/3 | In Progress|  |
