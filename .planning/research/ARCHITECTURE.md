# Architecture Research

**Domain:** Marina preventive maintenance & compliance management (CMMS-lite)
**Researched:** 2026-03-26
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Presentation Layer                           │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐    │
│  │ Dashboard  │  │Work Orders│  │  Assets   │  │ Compliance│    │
│  │  (Hero)   │  │  CRUD +   │  │ Registry  │  │ Reports + │    │
│  │  Widgets  │  │  Workflow  │  │ + History │  │ Audit Log │    │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘    │
│        │              │              │              │            │
├────────┴──────────────┴──────────────┴──────────────┴────────────┤
│                     API Layer (Server Actions + Route Handlers)   │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  Auth Middleware (iron-session) ── Role Guards            │    │
│  ├──────────────────────────────────────────────────────────┤    │
│  │  Server Actions: mutations   │  Route Handlers: PDF, API  │    │
│  └──────────────────────────────────────────────────────────┘    │
├──────────────────────────────────────────────────────────────────┤
│                     Data Layer (Drizzle ORM + Neon Postgres)      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │  Assets  │  │  Work    │  │Schedules │  │  Audit   │        │
│  │  + Docks │  │  Orders  │  │ + Tasks  │  │   Log    │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
└──────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Implementation |
|-----------|----------------|----------------|
| Dashboard | Aggregated health scores, status counts, calendar, activity feed, cost summary | Server component with parallel data fetches, client widgets for calendar/charts |
| Work Orders | CRUD, status workflow transitions, assignment, filtering, photo attachments | Server actions for mutations, RSC for lists, client components for forms/filters |
| Asset Registry | Asset catalog, condition tracking, maintenance history per asset, lifecycle | Mostly server-rendered lists/detail pages, inline edit for condition ratings |
| Schedules | Recurring task definitions, auto-generation of work orders, compliance % | Server actions for CRUD, cron-like check on dashboard load to generate due WOs |
| Compliance/Reports | Audit trail viewing, PDF generation, compliance dashboard | Server component for data, route handler for PDF stream |
| Auth & Roles | Session management, role-based page/action guards | iron-session middleware, role check wrapper for server actions |
| Cost Tracking | Cost aggregation per WO, dock, category; budget vs actual | Embedded in work order forms + dedicated reporting views |

## Recommended Project Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── (auth)/                 # Auth group: login page
│   │   └── login/
│   ├── (app)/                  # Authenticated app group (shared layout with sidebar)
│   │   ├── layout.tsx          # App shell: sidebar nav, header, role context
│   │   ├── dashboard/          # Hero dashboard page
│   │   ├── work-orders/        # List + [id] detail + new
│   │   ├── assets/             # List + [id] detail
│   │   ├── schedules/          # List + [id] detail + new
│   │   ├── compliance/         # Compliance dashboard + audit log
│   │   └── reports/            # Cost reports, PDF generation
│   └── api/                    # Route handlers (PDF export, etc.)
├── components/                 # Shared UI components
│   ├── ui/                     # shadcn/ui primitives (installed via CLI)
│   ├── dashboard/              # Dashboard-specific widgets
│   ├── work-orders/            # Work order forms, cards, status badges
│   ├── assets/                 # Asset cards, condition indicators
│   └── layout/                 # Sidebar, header, nav components
├── lib/                        # Core utilities and business logic
│   ├── db/                     # Database layer
│   │   ├── schema.ts           # Drizzle schema (all tables)
│   │   ├── index.ts            # Drizzle client instance
│   │   └── seed.ts             # Demo data seeding script
│   ├── auth/                   # iron-session config, helpers
│   │   ├── session.ts          # Session options, getSession helper
│   │   └── guards.ts           # requireRole(), requireAuth() wrappers
│   ├── actions/                # Server actions grouped by domain
│   │   ├── work-orders.ts
│   │   ├── assets.ts
│   │   ├── schedules.ts
│   │   └── auth.ts
│   ├── queries/                # Read-only data fetching functions
│   │   ├── dashboard.ts        # Aggregation queries for dashboard
│   │   ├── work-orders.ts
│   │   ├── assets.ts
│   │   ├── schedules.ts
│   │   └── compliance.ts
│   └── utils.ts                # Date formatting, status helpers, constants
└── types/                      # Shared TypeScript types
    └── index.ts                # Domain types, enums
```

### Structure Rationale

- **`app/(app)/` route group:** All authenticated pages share a layout with sidebar navigation. The parenthetical group avoids a `/app` URL prefix while keeping layout boundaries clean.
- **`lib/actions/` and `lib/queries/` split:** Server actions handle mutations (create, update, transition). Queries are pure read functions called from server components. This separation prevents accidental mutation from RSC renders and keeps data fetching cacheable.
- **`components/` by domain:** Dashboard widgets, work order cards, and asset components are distinct enough to warrant domain folders. Prevents a flat pile of 50+ components.
- **`lib/db/schema.ts` single file:** For a project of this size (~10 tables), a single schema file is simpler than splitting per-table. Drizzle relations are easier to define when all tables are co-located.

## Architectural Patterns

### Pattern 1: Server Components as Data Layer

**What:** Pages are server components that fetch data directly via query functions. No API routes needed for reads. Client components receive pre-fetched data as props.
**When to use:** Every page that displays data (dashboard, lists, detail views).
**Trade-offs:** Eliminates client-side fetch waterfalls and loading states for initial page load. Requires clear server/client boundary discipline ("use client" only where interactivity is needed).

**Example:**
```typescript
// app/(app)/work-orders/page.tsx — Server Component
import { getWorkOrders } from "@/lib/queries/work-orders";
import { WorkOrderList } from "@/components/work-orders/list";

export default async function WorkOrdersPage({ searchParams }) {
  const filters = parseFilters(searchParams);
  const workOrders = await getWorkOrders(filters);
  return <WorkOrderList workOrders={workOrders} filters={filters} />;
}
```

### Pattern 2: Server Actions for Mutations with Role Guards

**What:** All write operations go through server actions decorated with role-checking wrappers. The role guard reads the session, checks permissions, and throws before the mutation executes.
**When to use:** Every create, update, delete, and status transition.
**Trade-offs:** Simple and secure. No separate API layer to maintain. The guard pattern centralizes authorization logic.

**Example:**
```typescript
// lib/actions/work-orders.ts
"use server";
import { requireRole } from "@/lib/auth/guards";

export async function transitionWorkOrder(id: string, newStatus: string) {
  const session = await requireRole(["manager", "crew"]);
  // Validate status transition is legal
  // Update work order
  // Write audit log entry
  // Revalidate relevant paths
}
```

### Pattern 3: Audit Log as Cross-Cutting Concern

**What:** Every mutation writes to an `audit_log` table with user, action, entity type, entity ID, old/new values, and timestamp. This is not optional -- compliance requires it.
**When to use:** Every server action that modifies data.
**Trade-offs:** Adds a DB write to every mutation. Worth it because audit trail is a core product feature, not a nice-to-have. Keep it simple: one table, JSON diff column.

**Example:**
```typescript
// lib/db/audit.ts
export async function logAudit(params: {
  userId: string;
  action: "create" | "update" | "delete" | "transition";
  entityType: "work_order" | "asset" | "schedule";
  entityId: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
}) {
  await db.insert(auditLog).values({
    ...params,
    changes: params.changes ? JSON.stringify(params.changes) : null,
    createdAt: new Date(),
  });
}
```

### Pattern 4: Dashboard Aggregation Queries

**What:** The dashboard page runs multiple parallel aggregation queries (overdue count, due-soon count, health scores, recent activity, cost totals) and renders them as independent widgets. Each query is a focused SQL aggregation, not a full table scan.
**When to use:** The dashboard page only.
**Trade-offs:** Multiple small queries are better than one mega-query for this use case. They can be parallelized with `Promise.all()` and each widget can be independently understood.

## Data Flow

### Request Flow (Read)

```
Browser Request
    |
Next.js Router (App Router)
    |
Middleware (check session cookie exists, redirect to /login if not)
    |
Server Component (page.tsx)
    |
Query Function (lib/queries/*.ts)
    |
Drizzle ORM -> Neon Postgres (over HTTP/WebSocket)
    |
Data returned -> RSC renders -> HTML streamed to client
```

### Mutation Flow (Write)

```
User Action (form submit, button click)
    |
Client Component calls Server Action
    |
Server Action: requireRole() guard
    |  (unauthorized? -> throw, client shows error)
    |
Server Action: validate input (zod)
    |
Server Action: execute DB mutation via Drizzle
    |
Server Action: write audit log entry
    |
Server Action: revalidatePath() to refresh affected pages
    |
Client receives result, UI updates
```

### Key Data Flows

1. **Schedule -> Work Order generation:** When the dashboard loads (or a dedicated check runs), query all active schedules. For any schedule where `lastGeneratedDate + interval <= today` and no open WO exists for that schedule, auto-create a new work order with status "created". This is a synchronous check on page load, not a background cron -- appropriate for a demo with low traffic.

2. **Work order status transitions:** `created -> assigned -> in-progress -> completed -> verified`. Each transition is a server action that validates the transition is legal (e.g., only manager can verify), updates the status, writes the audit log, and revalidates the work order list and dashboard pages.

3. **Health score calculation:** Per-dock and marina-wide. Formula: `(completed_on_time / total_due) * 100` over a rolling window (e.g., 90 days). Calculated as a query aggregation, not stored. Simple, accurate, no stale data risk.

4. **Cost aggregation:** Work orders have `partsCost` and `laborCost` fields. Cost reports aggregate these by dock (via asset -> dock relationship), by category (via asset type), and by time period. Pure SQL aggregations.

## Database Schema (Core Tables)

```
users
  id, name, email, passwordHash, role (manager|crew|inspector), createdAt

docks
  id, name, code (A/B/C/D), slipCount, description

assets
  id, name, type (piling|pedestal|waterLine|light|fireExtinguisher|fuelPump|...)
  dockId -> docks, slipNumber (nullable), installDate, warrantyExpiry
  conditionRating (1-5), lastInspectedAt, expectedLifespan, notes

maintenance_schedules
  id, name, description, assetType (or specific assetId)
  intervalDays, seasonalStart (nullable), seasonalEnd (nullable)
  priority, estimatedDuration, isSafetyCritical
  lastGeneratedAt, isActive, createdBy -> users

work_orders
  id, title, description, type (preventive|corrective|inspection|emergency)
  status (created|assigned|in_progress|completed|verified)
  priority (urgent|high|normal|low)
  assetId -> assets, scheduleId -> maintenance_schedules (nullable)
  assignedTo -> users (nullable), createdBy -> users
  dueDate, completedAt, verifiedAt, verifiedBy -> users (nullable)
  partsCost, laborCost, timeSpentMinutes
  photosBefore (JSON array of URLs), photosAfter (JSON array of URLs)
  notes, createdAt, updatedAt

audit_log
  id, userId -> users, action, entityType, entityId
  changes (JSONB), createdAt
```

**Key relationships:**
- Asset belongs to Dock (dockId)
- Work Order belongs to Asset (assetId) and optionally to Schedule (scheduleId)
- Work Order assigned to User, created by User
- Audit Log references User who performed the action

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| Demo (5 users) | Current architecture is perfect. No optimization needed. |
| Small marina (20 users) | Add indexes on work_orders(status, dueDate, assignedTo). Still fine. |
| Multi-marina SaaS (500+ users) | Add marina_id tenant column to all tables, connection pooling via Neon's built-in pooler, consider background job for schedule generation instead of on-page-load. |

### Scaling Priorities

1. **First bottleneck (won't hit in demo):** Dashboard aggregation queries as work order count grows past 10K. Solution: materialized views or cached aggregations.
2. **Second bottleneck:** Audit log table growth. Solution: partition by month, archive old entries.

These are irrelevant for this project but documented for completeness.

## Anti-Patterns

### Anti-Pattern 1: Client-Side Data Fetching for Everything

**What people do:** Create API routes for every data need, fetch from client components with useEffect/SWR/React Query.
**Why it's wrong:** Doubles the work (API route + client fetch), adds loading spinners everywhere, loses the streaming benefits of RSC.
**Do this instead:** Server components fetch directly. Only use client-side fetching for real-time updates (which this demo doesn't need).

### Anti-Pattern 2: Storing Computed Values in the Database

**What people do:** Store health scores, compliance percentages, cost totals as columns that need to be kept in sync.
**Why it's wrong:** Creates stale data bugs. Every work order update must recalculate and update the score.
**Do this instead:** Compute aggregations at query time. For this data volume, SQL aggregations are instant. Keep the source of truth clean.

### Anti-Pattern 3: Over-Engineered Status Machine

**What people do:** Build a full state machine library (xstate, etc.) for work order status transitions.
**Why it's wrong:** For 5 linear states with simple rules, a state machine library adds complexity without value.
**Do this instead:** A simple `VALID_TRANSITIONS` map and a validation function. ~20 lines of code.

```typescript
const VALID_TRANSITIONS: Record<string, string[]> = {
  created: ["assigned"],
  assigned: ["in_progress"],
  in_progress: ["completed"],
  completed: ["verified"],
};

function canTransition(from: string, to: string): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}
```

### Anti-Pattern 4: Separate Microservices for Each Domain

**What people do:** Split assets, work orders, schedules into separate services "for modularity."
**Why it's wrong:** Massive over-engineering for a single-user-type application. Adds deployment complexity, data consistency headaches, and latency.
**Do this instead:** Monolith with clear folder boundaries. The `lib/actions/` and `lib/queries/` folders provide logical separation without physical separation.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Neon Postgres | Drizzle ORM over serverless HTTP driver (`@neondatabase/serverless`) | Use connection pooling. One `db` instance in `lib/db/index.ts`. |
| Vercel | Deploy target, serverless functions | Each page/action runs as a serverless function. Cold starts are minimal with Neon's serverless driver. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Pages <-> Queries | Direct function call (server-side) | Pages import query functions, no network hop |
| Client Components <-> Server Actions | `useFormAction` / direct invocation | Next.js handles serialization |
| Server Actions <-> Audit Log | Direct function call after mutation | Always pair mutation + audit write in the same action |
| Schedules <-> Work Orders | Schedule check generates WO records | Triggered on dashboard load, not a background process |

## Build Order (Dependencies)

The architecture implies this build sequence:

1. **Database schema + Auth** -- Everything depends on the data model and session management. Must be first.
2. **Asset Registry + Docks** -- Assets are referenced by work orders and schedules. Need the entity structure before workflows.
3. **Work Order Management** -- Core operational feature. Depends on assets and users.
4. **Maintenance Schedules** -- Depends on assets and work orders (generates WOs). Build after WO system exists.
5. **Dashboard** -- Aggregation layer over all other data. Build last because it reads from everything.
6. **Compliance & Reports** -- Reads from audit log (which accumulates from steps 2-4) and work order data. Can parallel with dashboard.
7. **Seed Data** -- Should be buildable incrementally but the full seed runs after all tables exist.

**Critical path:** Schema -> Auth -> Assets -> Work Orders -> Schedules -> Dashboard

## Sources

- Next.js App Router patterns: established conventions from Next.js 13-15 App Router architecture
- Drizzle ORM + Neon: standard serverless Postgres integration pattern
- CMMS (Computerized Maintenance Management System) domain: well-established software category with known entity relationships (assets, work orders, schedules, audit trails)
- iron-session: lightweight cookie-based session management for Next.js

---
*Architecture research for: DockWatch -- Marina Preventive Maintenance & Compliance Platform*
*Researched: 2026-03-26*
