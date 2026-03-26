# Pitfalls Research

**Domain:** Marina Preventive Maintenance & Compliance Platform
**Researched:** 2026-03-26
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Recurring Schedule Logic That Silently Drifts

**What goes wrong:**
Preventive maintenance schedules (e.g., "inspect pilings every 90 days") generate work orders at wrong intervals, skip generations, or double-fire. The dashboard shows "on track" while actual maintenance gaps grow invisible. This is the single most damaging bug in a maintenance platform because the entire value proposition is catching overdue work.

**Why it happens:**
Developers store a `lastCompletedAt` timestamp and naively add the interval to compute `nextDueAt`. But if a task is completed late (day 95 instead of day 90), the next due date anchors to completion rather than the original schedule, causing permanent schedule drift. Alternatively, developers use calendar-based recurrence ("every 3 months on the 1st") but don't handle months with different lengths, DST transitions, or the case where a work order spans the generation boundary.

**How to avoid:**
- Anchor `nextDueAt` to the original schedule, not to completion date. If the schedule says every 90 days starting Jan 1, the next due date is always April 1 regardless of when the work was actually done.
- Store schedules as interval + anchor date, not as "days since last completion."
- Generate upcoming work orders in a batch (e.g., generate the next occurrence when current one is completed or when it becomes overdue), never rely on a cron job that might miss a tick.
- Use UTC for all date storage and only convert to local time for display.

**Warning signs:**
- Work orders cluster around certain days of the month instead of distributing evenly.
- "Due soon" items suddenly appear as "overdue" with no intermediate warning.
- Compliance percentage fluctuates without any actual work being done or missed.

**Phase to address:**
Database schema design and schedule engine (core data model phase). This must be right in the schema before any work order generation code is written.

---

### Pitfall 2: Dashboard Health Score That Lies

**What goes wrong:**
The maintenance health score (the hero metric) shows misleading results because it treats all assets equally. Five overdue light bulb replacements count the same as one overdue electrical pedestal inspection that could cause a dock fire. Marina managers lose trust in the system because the score doesn't match their operational intuition.

**Why it happens:**
Developers calculate health score as simple `completed / total` percentage without weighting by criticality. Safety-critical items (electrical, fire, structural) should dominate the score. A marina with 95% compliance but the 5% failure being all electrical inspections is in far worse shape than one with 85% compliance on cosmetic items.

**How to avoid:**
- Weight health scores by asset criticality: safety-critical items (electrical, fire, fuel, structural) get 3x weight; operational items (water, lighting) get 2x; cosmetic items get 1x.
- Show separate health scores: overall, safety-critical, and per-dock. The dashboard should surface the worst score prominently.
- Color the health score by its worst component, not its average. If safety compliance is red, the overall score should not show green.

**Warning signs:**
- Health score shows green/good while overdue items list contains safety-critical entries.
- Users report "the dashboard says we're fine but I know we're not."
- Compliance reports for insurance/regulatory purposes tell a different story than the dashboard.

**Phase to address:**
Dashboard implementation phase. Define the scoring algorithm during schema/seed phase so test data validates it correctly.

---

### Pitfall 3: Neon Postgres Cold Start Kills First Impression

**What goes wrong:**
On the free/hobby tier, Neon suspends compute after 5 minutes of inactivity. A LinkedIn viewer clicking the demo link waits 3-5 seconds staring at a loading spinner (or worse, a timeout error) on first page load. For a showcase demo, this is a deal-breaker -- the first impression is "this app is slow."

**Why it happens:**
Neon's serverless architecture suspends idle compute to save resources. The first query after suspension triggers a cold start. Combined with Vercel's serverless function cold start, you can get 5-8 seconds of latency on the first request.

**How to avoid:**
- Use Neon's serverless driver (`@neondatabase/serverless`) which uses HTTP/WebSocket connections instead of TCP, reducing cold start from ~5s to ~1s.
- Add `?connect_timeout=15` to DATABASE_URL to prevent premature timeout errors.
- Use connection pooling (pooled connection string from Neon dashboard, port 5432 with `-pooler` suffix).
- Add a loading skeleton/shimmer UI so the first load feels intentional rather than broken.
- Consider a keep-alive ping (a simple cron or Vercel cron that hits the app every 4 minutes) if the demo is actively being shown.

**Warning signs:**
- First page load takes more than 2 seconds.
- Intermittent "can't reach database" errors in production logs.
- Pages load fast on second visit but slow on first.

**Phase to address:**
Database setup / infrastructure phase (first phase). Must configure the serverless driver and pooling from the start.

---

### Pitfall 4: Work Order Status Machine Without Guard Rails

**What goes wrong:**
Work orders end up in impossible states: marked "completed" without an assignee, "verified" before "completed," or stuck in "in-progress" forever. The compliance audit trail becomes unreliable because status transitions weren't enforced, just displayed as a dropdown.

**Why it happens:**
Developers implement status as a simple string field with a dropdown selector instead of a proper state machine with transition rules. The UI allows any status change, and business rules aren't enforced server-side. In maintenance software, the status workflow is the audit trail -- every transition must be logged with who/when.

**How to avoid:**
- Define valid transitions explicitly: `created -> assigned -> in-progress -> completed -> verified`. No skipping steps.
- Enforce transitions server-side, not just in the UI. The API should reject invalid transitions.
- Each transition creates an audit log entry with userId, timestamp, and previous state.
- Required fields per transition: "assigned" requires assignee, "completed" requires time spent and notes, "verified" requires verifier (must be different from completer for safety-critical items).

**Warning signs:**
- Work orders in "completed" status with null assignee or zero time logged.
- Status history shows jumps (created -> completed with no intermediate steps).
- Audit trail has gaps where status changed without a corresponding log entry.

**Phase to address:**
Work order management phase. Define the state machine in a shared utility before building any work order UI or API.

---

### Pitfall 5: Role-Based Access That Only Protects Routes, Not Data

**What goes wrong:**
Crew members can't navigate to the reports page (route protection works), but the API endpoints that power reports return data to any authenticated user. An inspector can modify work orders through the API even though the UI hides the edit button. This is especially dangerous for compliance -- if an auditor discovers that crew members could theoretically alter maintenance records, the audit trail is worthless.

**Why it happens:**
Developers implement RBAC in the middleware/layout layer (hiding nav items, redirecting routes) but forget to check roles in API route handlers and server actions. The Next.js App Router middleware vulnerability (CVE-2025-29927) showed that middleware-only protection can be bypassed entirely.

**How to avoid:**
- Implement a Data Access Layer (DAL) pattern: every database query function checks the user's role before returning data. Not just at the route level.
- Create a `requireRole(session, 'manager')` utility used in every server action and API route.
- For Vercel deployments, the CVE-2025-29927 middleware bypass is mitigated by Vercel's edge platform, but defense-in-depth is still essential.
- Test with each role: can crew access manager endpoints via curl? Can inspector modify data?

**Warning signs:**
- Authorization checks only exist in middleware.ts or layout.tsx, not in individual route handlers.
- Server actions don't check session role before mutating data.
- No unit/integration tests for role-based access on API endpoints.

**Phase to address:**
Auth phase (should be early). The role-checking utility must exist before any protected feature is built.

---

### Pitfall 6: Seed Data That Doesn't Tell a Story

**What goes wrong:**
Demo data is technically correct but narratively meaningless. Random dates, generic descriptions ("Maintenance task 47"), uniform distribution of statuses. The demo looks like test data instead of a real marina. LinkedIn viewers see a tool, not a solution to a real problem.

**Why it happens:**
Developers write seed scripts that generate data programmatically with random values instead of crafting a realistic scenario. Maintenance software demos need to show patterns: the spring rush of deferred winter maintenance, the dock with chronic electrical issues, the crew member who consistently completes tasks early vs. the one who's always late.

**How to avoid:**
- Create a narrative: Sunset Harbor Marina is preparing for spring season. Dock C has aging infrastructure (more overdue items). Electrical pedestals on Dock A were recently upgraded (all green). Fire extinguisher inspections are overdue marina-wide (compliance gap the inspector would flag).
- Seed historical data going back 6 months with realistic patterns, not random distributions.
- Include 2-3 "stories" visible in the data: a high-cost asset that should be replaced, a seasonal maintenance backlog, a compliance gap that the inspector role would catch.
- Use realistic part names, costs, and time estimates (dock piling inspection: 2 hours, $0 parts; electrical pedestal repair: 1.5 hours, $85 parts).

**Warning signs:**
- All work orders have similar completion times and costs.
- No visible pattern when filtering by dock, category, or time period.
- The dashboard looks the same regardless of which filters are applied.

**Phase to address:**
Seed data phase (should be its own dedicated phase or significant portion of the data model phase). Seed quality directly determines demo quality.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Storing dates as strings instead of proper timestamp columns | Faster initial development | Timezone bugs, can't do date math in queries, sorting breaks | Never -- Drizzle makes proper timestamps easy |
| Inline SQL queries instead of Drizzle query builder | Quicker for complex joins | Loses type safety, SQL injection risk, harder to refactor | Never for this stack |
| Single DB query per dashboard widget | Simpler component code | N+1 problem: dashboard makes 8+ queries per load, compounding Neon cold start | Acceptable for demo if queries are fast; group into 2-3 queries max |
| Hardcoded role checks (`if role === 'manager'`) | Fast to implement | Brittle if roles change, scattered across codebase | Acceptable for 3 fixed demo roles; use a permissions map for real product |
| Skipping optimistic UI updates on work orders | Simpler state management | Crew in the field perceives lag on every action | Acceptable for demo; use Next.js revalidation instead |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Neon Postgres on Vercel | Using standard `pg` driver with TCP connections in serverless | Use `@neondatabase/serverless` driver or pooled connection string; configure `connect_timeout` |
| Drizzle migrations on Neon | Running `drizzle-kit push` in production without testing | Use `drizzle-kit generate` + `drizzle-kit migrate` workflow; test migrations against a branch database |
| iron-session with App Router | Reading session in middleware and assuming it's available in server components | Pass session through server component props or re-read in each server action; session is request-scoped |
| shadcn/ui data tables | Installing the table component and building complex filtering from scratch | Use TanStack Table integration that shadcn/ui provides; it handles sorting, filtering, pagination |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Unindexed queries on work order filters | Dashboard and list pages slow down as historical data grows | Add composite indexes: `(status, dueDate)`, `(assigneeId, status)`, `(assetId, createdAt)` | At 500+ work orders with multiple active filters |
| Loading all work order history for compliance reports | Report generation times out or returns huge payload | Paginate queries, use date range filters in SQL, consider server-side PDF generation with streaming | At 200+ historical work orders |
| Fetching full asset tree for every page | Every navigation triggers a heavy query joining assets, maintenance schedules, and recent work orders | Cache asset registry (it changes rarely); fetch work order data separately and join client-side or with targeted queries | At 100+ assets with 5+ schedules each |
| Re-rendering dashboard on every work order update | Dashboard flickers or feels sluggish when multiple crew members log completions | Use React Server Components for initial render; only use client components for interactive widgets. Revalidate on-demand, not on interval | When 3+ users are active simultaneously |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Crew can mark their own work as "verified" | Compliance audit trail is meaningless if self-verification is allowed | Enforce verifier !== completer for safety-critical work orders |
| Session secret in client-side code | Session can be forged, any user can impersonate any role | Keep SESSION_SECRET in server-only env vars; Next.js server actions and route handlers only |
| No rate limiting on login | Brute force attacks on demo accounts | For demo: acceptable risk. For production: add rate limiting middleware |
| Audit log entries can be deleted by managers | Destroys compliance integrity | Make audit log append-only: no UPDATE or DELETE permissions on audit table; use DB-level constraints if possible |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Dashboard shows counts instead of actionable items | Manager sees "5 overdue" but has to navigate elsewhere to act on them | Make overdue count clickable, expanding to show the actual items with quick-action buttons |
| Work order form requires too many fields upfront | Crew in the field abandons the form, goes back to paper | Require only: title, asset, priority. Make everything else optional or auto-filled. Add details after creation |
| Calendar view shows all 30+ scheduled tasks as equal | Visual noise makes it impossible to spot what matters | Color-code by priority/criticality; show only overdue and due-this-week by default; let users expand to see all |
| Compliance report is a data dump, not a narrative | Inspector can't quickly answer "are we compliant?" | Lead with pass/fail summary, then drill into details. Red/green section headers. Executive summary at top |
| Mobile layout is just a squished desktop | Crew can't use it one-handed on the dock | Design mobile as a task-focused flow: "My tasks today" -> tap to complete -> done. Not a shrunken dashboard |

## "Looks Done But Isn't" Checklist

- [ ] **Work order status flow:** Can a work order go from "created" directly to "completed"? If yes, the state machine is broken -- verify transitions are enforced server-side
- [ ] **Overdue calculation:** Does "overdue" update in real-time or only when the page loads? Verify that items crossing the due date threshold show as overdue without manual refresh
- [ ] **Role isolation:** Log in as crew, then manually hit `/api/reports` or `/compliance` -- if data returns, RBAC is UI-only
- [ ] **Audit trail completeness:** Create a work order, assign it, complete it, verify it. Check audit log -- every transition should have an entry with actor and timestamp
- [ ] **Schedule generation:** Set a maintenance schedule for "every 7 days." Complete the generated work order. Verify the next work order is auto-generated with the correct due date (7 days from anchor, not from completion)
- [ ] **Seed data dates:** Are historical work orders dated in the past with realistic gaps, or do they all have today's date? Check that the 6-month history actually spans 6 months
- [ ] **Cost totals:** Do work order costs roll up correctly to dock-level and category-level totals? Verify with manual addition of a few entries
- [ ] **Empty states:** What does the dashboard show for a dock with zero maintenance history? Verify it shows a meaningful empty state, not a broken layout

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Schedule drift in recurring tasks | MEDIUM | Recalculate all `nextDueAt` dates from anchor + interval; audit historical gaps; add migration to fix data |
| Dashboard health score inaccuracy | LOW | Refactor scoring function; no schema change needed; re-seed if test data was affected |
| Neon cold start in production | LOW | Switch to serverless driver; add connection pooling; add loading skeletons; 1-2 hour fix |
| Broken state machine (invalid work order states) | HIGH | Audit all existing work orders for invalid states; write migration to fix; add server-side validation; re-test all flows |
| RBAC bypass via API | MEDIUM | Add role checks to all server actions and route handlers; audit for data leaks; add integration tests |
| Bad seed data | MEDIUM | Rewrite seed script with narrative-driven data; drop and re-seed; 2-4 hours depending on data complexity |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Schedule drift | Schema / Data Model | Unit test: complete task late, verify next due date anchors to schedule not completion |
| Health score lies | Dashboard | Manual test: create scenario with green overall but red safety -- score should reflect danger |
| Neon cold start | Infrastructure / DB Setup | Measure first-load time after 10 min idle; must be under 2 seconds |
| Work order state machine | Work Order Management | Attempt invalid transitions via API; all should return 400 |
| RBAC data leakage | Auth / Roles | curl each API endpoint with each role's session cookie; verify appropriate 403s |
| Weak seed data | Seed Data | Visual inspection: does the demo tell a story? Can you spot the problem dock? The compliance gap? |
| Audit trail gaps | Work Order + Compliance | Walk through full work order lifecycle; every step must appear in audit log |
| Mobile UX failure | Every frontend phase | Test every page at 375px width; crew workflow must be completable without horizontal scrolling |

## Sources

- [Preventive Maintenance Pitfalls - IQnext](https://www.iqnext.io/blog-posts/preventive-maintenance-pitfalls-how-to-avoid-common-mistakes)
- [8 PM Planning Mistakes - WorkTrek](https://worktrek.com/blog/preventive-maintenance-planning-mistakes/)
- [Top PM Mistakes - eWorkOrders](https://eworkorders.com/cmms-industry-articles-eworkorders/pm-mistakes/)
- [Why CMMS Implementations Fail - Tractian](https://tractian.com/en/blog/why-cmms-implementations-fail-how-to-prevent-it)
- [Common CMMS Failures - UpKeep](https://upkeep.com/learning/most-common-failures-in-cmms-implementation/)
- [Most Common Reason CMMS Projects Fail - Accruent](https://www.accruent.com/resources/blog-posts/single-most-common-reason-cmms-projects-fail)
- [Neon Connection Methods for Vercel](https://neon.com/docs/guides/vercel-connection-methods)
- [Neon Connection Pooling Docs](https://neon.com/docs/connect/connection-pooling)
- [3 Biggest Drizzle ORM Mistakes](https://medium.com/@lior_amsalem/3-biggest-mistakes-with-drizzle-orm-1327e2531aff)
- [Drizzle Migration Failure Debugging - GitHub Issue #4639](https://github.com/drizzle-team/drizzle-orm/issues/4639)
- [Next.js Authentication Guide](https://nextjs.org/docs/app/guides/authentication)
- [CVE-2025-29927 Middleware Bypass](https://workos.com/blog/nextjs-app-router-authentication-guide-2026)
- [iron-session GitHub](https://github.com/vvo/iron-session)

---
*Pitfalls research for: Marina Preventive Maintenance & Compliance Platform*
*Researched: 2026-03-26*
