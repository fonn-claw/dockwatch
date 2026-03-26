# Requirements: DockWatch

**Defined:** 2026-03-26
**Core Value:** Marina operators can see at a glance what maintenance is overdue, due soon, and on track -- replacing reactive repairs with proactive preventive maintenance

## v1 Requirements

### Authentication & Roles

- [x] **AUTH-01**: User can log in with email and password
- [x] **AUTH-02**: User session persists across browser refresh
- [x] **AUTH-03**: User can log out from any page
- [x] **AUTH-04**: Role-based access control enforced on every server action (manager, crew, inspector)
- [x] **AUTH-05**: Manager sees all features including schedules, reports, and cost tracking
- [x] **AUTH-06**: Crew sees assigned work orders and can log completions
- [x] **AUTH-07**: Inspector sees compliance dashboards and audit trails

### Asset Registry

- [x] **ASSET-01**: User can view catalog of marina assets (docks, slips, pedestals, lights, fire equipment, fuel pumps)
- [x] **ASSET-02**: Each asset displays location, install date, warranty info, and maintenance history
- [x] **ASSET-03**: Asset condition rating (1-5) updated after each inspection
- [x] **ASSET-04**: Manager can create, edit, and deactivate assets
- [x] **ASSET-05**: User can filter/search assets by dock, type, and condition

### Work Orders

- [x] **WO-01**: Manager can create work orders with assignee, priority (urgent/high/normal/low), due date, and type (preventive/corrective/inspection/emergency)
- [x] **WO-02**: Work order status workflow: created → assigned → in-progress → completed → verified
- [x] **WO-03**: Status transitions enforced server-side (no impossible state jumps)
- [x] **WO-04**: Crew can update work order status and log notes, parts used, and time spent
- [x] **WO-05**: Work orders display placeholder photos (before/after simulation)
- [x] **WO-06**: User can filter/search work orders by dock, status, priority, assignee, and date range
- [x] **WO-07**: Work order list is mobile-friendly for field crew use

### Preventive Maintenance Schedules

- [x] **SCHED-01**: Manager can create recurring maintenance tasks with frequency (weekly/monthly/quarterly/annual)
- [x] **SCHED-02**: Schedule templates available by asset type
- [x] **SCHED-03**: System auto-generates work orders when a scheduled task comes due
- [x] **SCHED-04**: Next due date anchored to schedule (not completion date) to prevent drift
- [x] **SCHED-05**: Compliance tracking: percentage of scheduled tasks completed on time
- [x] **SCHED-06**: Seasonal awareness: tasks can be flagged as seasonal (spring-only, summer-only, year-round)

### Dashboard

- [ ] **DASH-01**: At-a-glance status indicators: overdue (red), due soon (yellow), on track (green)
- [ ] **DASH-02**: Maintenance health score per dock and marina-wide, weighted by asset criticality
- [ ] **DASH-03**: Upcoming maintenance calendar view (week/month)
- [ ] **DASH-04**: Recent activity feed showing completed work orders and new issues
- [ ] **DASH-05**: Cost summary cards showing monthly/quarterly spend
- [ ] **DASH-06**: Dashboard is the landing page for manager role
- [ ] **DASH-07**: Big status cards with clear visual hierarchy -- hero feature quality

### Compliance & Reporting

- [ ] **COMP-01**: Compliance dashboard showing required vs completed vs overdue maintenance
- [ ] **COMP-02**: Audit trail logging every action with who/what/when
- [ ] **COMP-03**: Generate PDF compliance reports suitable for insurance/regulatory review
- [ ] **COMP-04**: Safety-critical items (electrical, fire, environmental) flagged with stricter tracking
- [ ] **COMP-05**: Exportable maintenance history per asset

### Cost Tracking

- [x] **COST-01**: Log parts and labor costs per work order
- [x] **COST-02**: Track costs by dock and by category (electrical, structural, plumbing, cosmetic)
- [x] **COST-03**: Monthly/quarterly/annual cost report views
- [x] **COST-04**: Budget vs actual comparison per category
- [x] **COST-05**: Identify high-cost assets as replacement candidates

### Demo Data & Polish

- [ ] **DEMO-01**: Seed script creates Sunset Harbor Marina with 4 docks (A-D) and 60 slips
- [ ] **DEMO-02**: 120+ seeded assets across all types
- [ ] **DEMO-03**: 30+ maintenance schedules with mixed frequencies
- [ ] **DEMO-04**: 80+ historical work orders going back 6 months with realistic narrative
- [ ] **DEMO-05**: 10 currently open work orders in various states
- [ ] **DEMO-06**: 5 overdue items showing compliance gaps
- [ ] **DEMO-07**: 3 demo accounts (manager, crew, inspector) with correct roles
- [ ] **DEMO-08**: Mobile-responsive design across all views
- [ ] **DEMO-09**: Professional industrial/operational UI with safety status colors

## v2 Requirements

### Notifications
- **NOTF-01**: Email notifications for overdue maintenance items
- **NOTF-02**: In-app notification bell for assigned work orders

### Advanced Features
- **ADV-01**: Photo upload with actual file storage
- **ADV-02**: Multi-marina support
- **ADV-03**: IoT sensor integration for predictive maintenance
- **ADV-04**: Barcode/QR scanning for asset identification

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real-time push notifications | Demo showcase -- not needed for LinkedIn demo |
| Actual file upload storage | Using placeholder images to avoid complexity |
| Email sending | Fixed demo accounts, no signup flow needed |
| Multi-marina/tenant support | Single marina for v1 demo |
| Billing/subscription | Showcase demo, not a SaaS product |
| Slip management | That's SlipSync's domain (separate app) |
| IoT/predictive maintenance | Hardware integration out of scope for web demo |
| Native mobile app | Web responsive is sufficient |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Complete |
| AUTH-02 | Phase 1 | Complete |
| AUTH-03 | Phase 1 | Complete |
| AUTH-04 | Phase 1 | Complete |
| AUTH-05 | Phase 1 | Complete |
| AUTH-06 | Phase 1 | Complete |
| AUTH-07 | Phase 1 | Complete |
| ASSET-01 | Phase 2 | Complete |
| ASSET-02 | Phase 2 | Complete |
| ASSET-03 | Phase 2 | Complete |
| ASSET-04 | Phase 2 | Complete |
| ASSET-05 | Phase 2 | Complete |
| WO-01 | Phase 2 | Complete |
| WO-02 | Phase 2 | Complete |
| WO-03 | Phase 2 | Complete |
| WO-04 | Phase 2 | Complete |
| WO-05 | Phase 2 | Complete |
| WO-06 | Phase 2 | Complete |
| WO-07 | Phase 2 | Complete |
| SCHED-01 | Phase 3 | Complete |
| SCHED-02 | Phase 3 | Complete |
| SCHED-03 | Phase 3 | Complete |
| SCHED-04 | Phase 3 | Complete |
| SCHED-05 | Phase 3 | Complete |
| SCHED-06 | Phase 3 | Complete |
| COMP-01 | Phase 3 | Pending |
| COMP-02 | Phase 3 | Pending |
| COMP-03 | Phase 3 | Pending |
| COMP-04 | Phase 3 | Pending |
| COMP-05 | Phase 3 | Pending |
| COST-01 | Phase 3 | Complete |
| COST-02 | Phase 3 | Complete |
| COST-03 | Phase 3 | Complete |
| COST-04 | Phase 3 | Complete |
| COST-05 | Phase 3 | Complete |
| DASH-01 | Phase 4 | Pending |
| DASH-02 | Phase 4 | Pending |
| DASH-03 | Phase 4 | Pending |
| DASH-04 | Phase 4 | Pending |
| DASH-05 | Phase 4 | Pending |
| DASH-06 | Phase 4 | Pending |
| DASH-07 | Phase 4 | Pending |
| DEMO-01 | Phase 4 | Pending |
| DEMO-02 | Phase 4 | Pending |
| DEMO-03 | Phase 4 | Pending |
| DEMO-04 | Phase 4 | Pending |
| DEMO-05 | Phase 4 | Pending |
| DEMO-06 | Phase 4 | Pending |
| DEMO-07 | Phase 4 | Pending |
| DEMO-08 | Phase 4 | Pending |
| DEMO-09 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 44 total
- Mapped to phases: 44
- Unmapped: 0

---
*Requirements defined: 2026-03-26*
*Last updated: 2026-03-26 after roadmap creation (coarse 4-phase structure)*
