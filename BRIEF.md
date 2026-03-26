# DockWatch — Marina Preventive Maintenance & Compliance Platform

## Overview
A web application for marina operators to manage preventive maintenance schedules, work orders, compliance tracking, and cost reporting across docks, slips, and shared infrastructure. Built as a FonnIT daily showcase — part of our marina tech week.

## Business Context (from market research)
- No modern tool exists for marina-specific maintenance tracking — operators use spreadsheets, paper logs, or nothing
- Reactive repairs cost 3× more than preventive maintenance
- Marinas need audit trails for insurance and regulatory compliance — can't prove maintenance history without a system
- "No way to track what's been serviced or what's due" — real operator frustration
- B&B/hospitality operator: "maintenance requests without losing control" — same pain, different venue
- Maintenance failures at marinas can cost $50K+ per incident (dock collapse, electrical fires, environmental violations)
- Spring peak season is 4 weeks away — operators are clearing maintenance backlogs NOW

## Target Users
1. **Marina Manager** — Creates maintenance schedules, reviews compliance status, manages costs, generates reports
2. **Dock Staff / Maintenance Crew** — Receives work orders, logs completion with photos, reports issues found during rounds
3. **Inspector / Compliance Officer** — Reviews audit trail, generates compliance reports, flags overdue items

## Core Features

### 1. Maintenance Dashboard (HERO FEATURE)
- At-a-glance view: overdue items (red), due soon (yellow), on track (green)
- Maintenance health score per dock and marina-wide
- Upcoming maintenance calendar (week/month view)
- Recent activity feed: completed work orders, new issues reported
- Cost summary: monthly/quarterly spend on parts + labor
- Make this visually impressive — big status indicators, clean cards, clear priority

### 2. Work Order Management
- Create work orders: assign to crew member, set priority (urgent/high/normal/low), due date
- Work order types: preventive (scheduled), corrective (reactive), inspection, emergency
- Status workflow: created → assigned → in-progress → completed → verified
- Attach photos (before/after), notes, parts used, time spent
- Filter/search by dock, status, priority, assignee, date range
- Mobile-friendly for crew in the field

### 3. Preventive Maintenance Schedules
- Create recurring maintenance tasks: "Inspect dock A pilings every 90 days"
- Schedule templates by asset type: docks, electrical pedestals, water lines, dock lights, fire extinguishers, fuel systems
- Auto-generate work orders when a task comes due
- Track compliance: % of scheduled tasks completed on time
- Seasonal awareness: some tasks are spring-only, some year-round

### 4. Asset Registry
- Catalog of marina infrastructure: docks, slips, electrical pedestals, water connections, lights, fuel pumps, fire safety equipment
- Each asset has: location (dock/slip), install date, warranty info, maintenance history
- Asset condition ratings (1-5 scale) updated after each inspection
- Lifecycle tracking: when was it installed, when should it be replaced

### 5. Compliance & Reporting
- Compliance dashboard: what's required, what's done, what's overdue
- Audit trail: every action logged with who/what/when
- Generate PDF compliance reports (suitable for insurance or regulatory review)
- Flag safety-critical items (electrical, fire, environmental) with stricter tracking
- Exportable maintenance history per asset

### 6. Cost Tracking
- Log parts and labor costs per work order
- Track costs by dock, by category (electrical, structural, plumbing, cosmetic)
- Monthly/quarterly/annual cost reports
- Budget vs actual comparison
- Identify high-cost assets (candidates for replacement)

### 7. Auth & Roles
- Role-based access: manager, crew, inspector
- Manager sees everything + can create schedules and generate reports
- Crew sees assigned work orders + can log completions
- Inspector sees compliance dashboards + audit trails

## Demo Data
- Marina: "Sunset Harbor Marina" (same marina as SlipSync — shared universe)
- 4 docks (A-D) with 60 slips
- 120+ assets: dock pilings, electrical pedestals, water connections, lights, fire extinguishers, fuel pumps
- 30+ maintenance schedules (mix of frequencies: weekly, monthly, quarterly, annual)
- 80+ historical work orders going back 6 months (completed, some with photos)
- 10 currently open work orders in various states
- 5 overdue items (showing compliance gaps)
- 3 crew members, 1 manager, 1 inspector

### Demo Accounts
- manager@dockwatch.app / demo1234 — Full manager access (dashboard, schedules, reports)
- crew@dockwatch.app / demo1234 — Crew view (assigned work orders, log completions)
- inspector@dockwatch.app / demo1234 — Inspector view (compliance, audit trail)

## Design Requirements
- Industrial/operational color palette: slate blues, safety yellows/oranges/reds for status, clean whites
- Status colors are critical: green (good), yellow (due soon), orange (overdue), red (critical)
- The dashboard is the centerpiece — big status cards, clear visual hierarchy
- Mobile-responsive — crew uses tablets/phones in the field
- Professional enough to show marina operators on LinkedIn

## Tech Stack
- **Next.js** with App Router (proven on Vercel)
- **Neon Postgres** (NOT SQLite — must work on Vercel serverless)
- **Drizzle ORM** for database access
- **Tailwind + shadcn/ui** for polished UI
- **NextAuth or iron-session** for auth
- Deploy to Vercel with custom domain

## Technical Notes
- DATABASE_URL env var for Neon Postgres connection
- SESSION_SECRET env var for auth
- Seed script that populates all demo data on first run
- Photo upload can be simulated with placeholder images for the demo
