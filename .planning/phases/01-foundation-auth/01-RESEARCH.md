# Phase 1: Foundation & Auth - Research

**Researched:** 2026-03-26
**Domain:** Next.js App Router project setup, Neon Postgres with Drizzle ORM, iron-session auth with RBAC, app shell layout
**Confidence:** HIGH

## Summary

Phase 1 establishes the entire project foundation: Next.js project scaffolding, database schema for all core tables, iron-session authentication with three demo roles, and the app shell (collapsible sidebar, role-based navigation). This is a greenfield build -- no existing code.

The stack is fully prescribed by the brief and locked in CONTEXT.md decisions. All library versions have been verified against npm registry (2026-03-26). The core pattern is: iron-session encrypted cookies for stateless auth, Drizzle ORM with Neon HTTP driver for serverless-compatible database access, and shadcn/ui components for the app shell. The critical implementation detail is that role-based access must be enforced at the server action level (not just middleware/layout), as documented in the pitfalls research.

**Primary recommendation:** Build in order: project scaffolding + DB schema -> auth system (session, login, guards) -> app shell (layout, sidebar, role-based nav) -> seed demo users. Use `drizzle-kit push` for speed.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- Collapsible sidebar navigation (not top nav) -- operational tools need many nav items
- Slate blue industrial color palette with safety status colors (green/yellow/orange/red)
- Logo + "DockWatch" text in sidebar header
- Light mode only -- no dark mode toggle for single-session build
- Main content area with breadcrumbs and page header pattern
- Centered login card with marina-themed branding on the login page
- iron-session with 7-day session duration (demo-friendly)
- Generic error messages on failed login (no account enumeration)
- Role-based post-login redirect: manager -> dashboard, crew -> work orders, inspector -> compliance
- requireRole() utility enforced on every server action and route (not just middleware)
- Only show nav items the logged-in role can access (no disabled/grayed items)
- Server-side redirect for unauthorized route access (no flash of forbidden content)
- Role badge displayed in sidebar user section
- Manager sees: Dashboard, Work Orders, Assets, Schedules, Compliance, Cost Reports
- Crew sees: My Work Orders, Assets (read-only)
- Inspector sees: Compliance, Audit Trail, Assets (read-only)
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

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUTH-01 | User can log in with email and password | iron-session v8 with getIronSession(cookies(), opts) + bcryptjs for password verification |
| AUTH-02 | User session persists across browser refresh | iron-session encrypted cookie with 7-day TTL -- stateless, survives refresh by design |
| AUTH-03 | User can log out from any page | session.destroy() in a server action, redirect to /login |
| AUTH-04 | Role-based access control enforced on every server action | requireRole() guard utility wrapping getIronSession, checked in every server action |
| AUTH-05 | Manager sees all features including schedules, reports, and cost tracking | Role-based nav filtering in sidebar + role checks on route layouts |
| AUTH-06 | Crew sees assigned work orders and can log completions | Filtered nav (My Work Orders, Assets read-only) + role guard on server actions |
| AUTH-07 | Inspector sees compliance dashboards and audit trails | Filtered nav (Compliance, Audit Trail, Assets read-only) + role guard on server actions |

</phase_requirements>

## Standard Stack

### Core (Phase 1 Specific)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.1 | Full-stack framework | Prescribed. App Router with RSC. Verified npm 2026-03-26. |
| React | 19.x | UI library | Ships with Next.js 16. |
| TypeScript | 5.x | Type safety | Ships with create-next-app. |
| Drizzle ORM | 0.45.1 | Database access | Prescribed. SQL-like API, zero runtime overhead. Verified npm. |
| Drizzle Kit | 0.31.10 | Schema management | `drizzle-kit push` for rapid dev. Verified npm. |
| @neondatabase/serverless | 1.0.2 | Neon connection driver | HTTP mode for serverless. Verified npm. |
| iron-session | 8.0.4 | Encrypted cookie sessions | Stateless auth, native App Router support. Verified npm. |
| bcryptjs | 3.0.3 | Password hashing | Pure JS, no native deps. Verified npm. |
| Tailwind CSS | 4.x | Utility CSS | Prescribed. Ships with create-next-app --tailwind. |
| shadcn/ui | CLI v4 | Component library | Prescribed. Copy-paste components on Radix primitives. |
| Lucide React | 1.7.0 | Icons | Default shadcn/ui icon set. |
| Zod | 4.3.6 | Validation | Login form validation, schema validation. |

### Installation Sequence

```bash
# 1. Create Next.js project
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# 2. Database
npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit

# 3. Auth
npm install iron-session bcryptjs zod
npm install -D @types/bcryptjs

# 4. UI (shadcn init + components needed for Phase 1)
npx shadcn@latest init
npx shadcn@latest add button card badge input label separator sheet avatar dropdown-menu tooltip

# 5. Date utility (needed for schema timestamps and display)
npm install date-fns
```

## Architecture Patterns

### Recommended Project Structure (Phase 1 Scope)

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx              # Login page with centered card
│   ├── (app)/
│   │   ├── layout.tsx                # Authenticated layout: sidebar + main content
│   │   ├── dashboard/
│   │   │   └── page.tsx              # Placeholder for Phase 4
│   │   ├── work-orders/
│   │   │   └── page.tsx              # Placeholder for Phase 2
│   │   ├── assets/
│   │   │   └── page.tsx              # Placeholder for Phase 2
│   │   ├── schedules/
│   │   │   └── page.tsx              # Placeholder for Phase 3
│   │   ├── compliance/
│   │   │   └── page.tsx              # Placeholder for Phase 3
│   │   └── reports/
│   │       └── page.tsx              # Placeholder for Phase 3
│   ├── layout.tsx                    # Root layout (html, body, fonts)
│   └── page.tsx                      # Root redirect to /login or /dashboard
├── components/
│   ├── ui/                           # shadcn/ui primitives
│   └── layout/
│       ├── sidebar.tsx               # Collapsible sidebar with role-based nav
│       ├── sidebar-nav.tsx           # Navigation items component
│       ├── header.tsx                # Page header with breadcrumbs
│       └── user-menu.tsx             # User info + role badge + logout
├── lib/
│   ├── db/
│   │   ├── schema.ts                # ALL tables (full schema upfront)
│   │   ├── index.ts                 # Drizzle client singleton
│   │   └── seed.ts                  # Demo user seeding (Phase 1 subset)
│   ├── auth/
│   │   ├── session.ts               # iron-session config, getSession helper
│   │   └── guards.ts                # requireAuth(), requireRole() utilities
│   ├── actions/
│   │   └── auth.ts                  # login, logout server actions
│   └── utils.ts                     # cn() helper, constants
├── middleware.ts                     # Route protection (redirect unauthenticated)
└── types/
    └── index.ts                     # Session type, role enum, nav types
```

### Pattern 1: iron-session with App Router

**What:** Stateless encrypted cookie sessions using iron-session v8 with the `cookies()` API.
**When to use:** Every authenticated operation.

```typescript
// lib/auth/session.ts
import { SessionOptions } from "iron-session";

export interface SessionData {
  userId: number;
  email: string;
  name: string;
  role: "manager" | "crew" | "inspector";
  isLoggedIn: boolean;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: "dockwatch-session",
  ttl: 60 * 60 * 24 * 7, // 7 days
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
  },
};

export async function getSession() {
  const { cookies } = await import("next/headers");
  const { getIronSession } = await import("iron-session");
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}
```

### Pattern 2: Role Guard Utility (Defense in Depth)

**What:** `requireRole()` checks session and role in every server action. Not middleware-only.
**Why critical:** CVE-2025-29927 showed middleware can be bypassed. Server-action guards are the real security boundary.

```typescript
// lib/auth/guards.ts
import { getSession, SessionData } from "./session";
import { redirect } from "next/navigation";

export async function requireAuth(): Promise<SessionData> {
  const session = await getSession();
  if (!session.isLoggedIn) {
    redirect("/login");
  }
  return session as SessionData;
}

export async function requireRole(
  allowedRoles: SessionData["role"][]
): Promise<SessionData> {
  const session = await requireAuth();
  if (!allowedRoles.includes(session.role)) {
    redirect("/unauthorized"); // or throw
  }
  return session;
}
```

### Pattern 3: Drizzle + Neon HTTP Client

**What:** Single Drizzle instance using Neon HTTP driver for serverless compatibility.

```typescript
// lib/db/index.ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client: sql, schema });
```

### Pattern 4: Full Schema Upfront (Single File)

**What:** All tables defined in one `schema.ts` file. Drizzle relations co-located.
**Why:** ~10 tables is manageable in one file. Relations are easier when tables are co-located. Future phases add data, not new tables.

```typescript
// lib/db/schema.ts -- key tables
import { pgTable, serial, varchar, text, integer, timestamp, boolean, json, pgEnum } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["manager", "crew", "inspector"]);
export const workOrderStatusEnum = pgEnum("work_order_status", ["created", "assigned", "in_progress", "completed", "verified"]);
export const workOrderTypeEnum = pgEnum("work_order_type", ["preventive", "corrective", "inspection", "emergency"]);
export const priorityEnum = pgEnum("priority", ["urgent", "high", "normal", "low"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const docks = pgTable("docks", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 10 }).notNull().unique(),
  slipCount: integer("slip_count").notNull(),
  description: text("description"),
});

// ... remaining tables follow same pattern
// assets, slips, maintenance_schedules, work_orders, audit_logs, work_order_parts, cost_entries
// All with serial IDs, soft delete where specified, proper foreign keys
```

### Pattern 5: Role-Based Navigation Config

**What:** Declarative nav config filtered by role. No conditional rendering logic scattered across components.

```typescript
// types/index.ts or lib/nav-config.ts
type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: ("manager" | "crew" | "inspector")[];
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["manager"] },
  { label: "Work Orders", href: "/work-orders", icon: ClipboardList, roles: ["manager"] },
  { label: "My Work Orders", href: "/work-orders", icon: ClipboardList, roles: ["crew"] },
  { label: "Assets", href: "/assets", icon: Anchor, roles: ["manager", "crew", "inspector"] },
  { label: "Schedules", href: "/schedules", icon: Calendar, roles: ["manager"] },
  { label: "Compliance", href: "/compliance", icon: ShieldCheck, roles: ["manager", "inspector"] },
  { label: "Audit Trail", href: "/compliance/audit", icon: FileText, roles: ["inspector"] },
  { label: "Cost Reports", href: "/reports", icon: DollarSign, roles: ["manager"] },
];

function getNavForRole(role: string) {
  return NAV_ITEMS.filter(item => item.roles.includes(role));
}
```

### Anti-Patterns to Avoid

- **Middleware-only auth:** Middleware redirects are UX convenience, not security. Every server action MUST call requireRole().
- **Reading session in middleware and passing via headers:** Re-read session in each server component/action via `getSession()`. Session is request-scoped and cheap (cookie decryption only).
- **Storing role in a separate cookie or localStorage:** Role lives inside the encrypted iron-session cookie. Cannot be tampered with client-side.
- **Using `pg` (node-postgres) driver:** TCP connections fail in Vercel serverless. Use `@neondatabase/serverless` HTTP driver.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Session encryption | Custom JWT/cookie encryption | iron-session | Handles encryption, rotation, cookie management, TTL |
| Password hashing | Custom hash function | bcryptjs | Timing-safe comparison, configurable salt rounds |
| Accessible sidebar | Custom sidebar with manual ARIA | shadcn/ui Sheet + nav primitives | Keyboard nav, focus trap, screen reader support |
| Form validation | Manual input checking | Zod schemas | Type inference, composable, server-action compatible |
| Database migrations | Manual SQL files | drizzle-kit push | Schema diffing, safe pushes, rollback support |
| Responsive sidebar | CSS media query toggle | shadcn/ui Sheet (mobile) + fixed sidebar (desktop) | Handles animation, overlay, body scroll lock |

## Common Pitfalls

### Pitfall 1: RBAC Protects Routes But Not Data
**What goes wrong:** Sidebar hides nav items, middleware redirects, but server actions/API routes return data to any authenticated user.
**Why it happens:** Developers only check roles in middleware.ts and layout.tsx.
**How to avoid:** `requireRole()` in EVERY server action. Test by calling server actions with wrong role session.
**Warning signs:** Authorization checks only in middleware.ts or layout files.

### Pitfall 2: iron-session Cookie Not Saving
**What goes wrong:** Login appears to work but session is empty on next request.
**Why it happens:** Forgetting to call `await session.save()` after setting properties. Or using `cookies()` without `await` in Next.js 15+.
**How to avoid:** Always `await session.save()` after mutations. Always `await cookies()` (Next.js 15+ requires it).
**Warning signs:** Login redirects correctly but next page shows unauthenticated state.

### Pitfall 3: Neon Cold Start on First Demo Load
**What goes wrong:** First visitor to demo waits 3-5 seconds on a loading spinner.
**Why it happens:** Neon suspends compute after 5 min idle. Combined with Vercel cold start.
**How to avoid:** Use `@neondatabase/serverless` HTTP driver (reduces to ~1s). Add loading skeletons. Use pooled connection string.
**Warning signs:** First load > 2 seconds after idle period.

### Pitfall 4: Schema Push Fails Silently on Enum Changes
**What goes wrong:** `drizzle-kit push` doesn't properly handle pgEnum modifications after initial creation.
**Why it happens:** Postgres enums are immutable types -- adding values requires ALTER TYPE, not recreating.
**How to avoid:** Define all enum values upfront in Phase 1. If changes needed later, use raw SQL `ALTER TYPE ... ADD VALUE`.
**Warning signs:** Push succeeds but queries fail with "invalid input value for enum."

### Pitfall 5: Middleware Redirect Loop
**What goes wrong:** Login page redirects to login, creating infinite loop.
**Why it happens:** Middleware checks for session on ALL routes including /login.
**How to avoid:** Exclude auth routes from middleware matcher: `config = { matcher: ["/(app)(.*)"] }` or explicit path exclusion.
**Warning signs:** Browser shows "too many redirects" error.

## Code Examples

### Login Server Action

```typescript
// lib/actions/auth.ts
"use server";

import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { compare } from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const ROLE_REDIRECTS: Record<string, string> = {
  manager: "/dashboard",
  crew: "/work-orders",
  inspector: "/compliance",
};

export async function login(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Invalid email or password" };
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, parsed.data.email))
    .limit(1);

  if (!user || !(await compare(parsed.data.password, user.passwordHash))) {
    return { error: "Invalid email or password" }; // Generic message, no enumeration
  }

  const session = await getSession();
  session.userId = user.id;
  session.email = user.email;
  session.name = user.name;
  session.role = user.role;
  session.isLoggedIn = true;
  await session.save();

  redirect(ROLE_REDIRECTS[user.role] || "/dashboard");
}

export async function logout() {
  const session = await getSession();
  session.destroy();
  redirect("/login");
}
```

### Middleware (Route Protection Only)

```typescript
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("dockwatch-session");

  // No session cookie -> redirect to login
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Cookie exists -> let through (actual auth check happens in server components/actions)
  return NextResponse.next();
}

export const config = {
  matcher: ["/(app)(.*)"], // Only protect (app) route group
};
```

### Drizzle Config

```typescript
// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### Seed Script (Phase 1 -- Users Only)

```typescript
// lib/db/seed.ts
import { db } from "./index";
import { users } from "./schema";
import { hash } from "bcryptjs";

async function seed() {
  const passwordHash = await hash("demo1234", 10);

  await db.insert(users).values([
    { name: "Harbor Manager", email: "manager@dockwatch.app", passwordHash, role: "manager" },
    { name: "Mike Chen", email: "crew@dockwatch.app", passwordHash, role: "crew" },
    { name: "Sarah Torres", email: "inspector@dockwatch.app", passwordHash, role: "inspector" },
  ]).onConflictDoNothing();

  console.log("Seeded demo users");
}

seed().catch(console.error);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| NextAuth for all auth | iron-session for simple fixed-user auth | iron-session v8 (2024) | Simpler config, no adapter/provider overhead for demo accounts |
| `pg` driver for Postgres | `@neondatabase/serverless` HTTP driver | Neon 1.0 (2024) | Required for Vercel serverless -- TCP connections fail |
| Prisma for ORM | Drizzle ORM | Drizzle 0.28+ (2023) | Lighter serverless bundle, SQL-like API, better TS inference |
| Pages Router middleware | App Router with route groups | Next.js 13+ (2023) | Cleaner layout boundaries, server components for data fetching |
| `cookies()` synchronous | `await cookies()` required | Next.js 15 (2024) | Must await -- forgetting causes silent session failures |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected -- greenfield project |
| Config file | none -- see Wave 0 |
| Quick run command | `npx tsx src/lib/db/seed.ts` (seed validates schema + connection) |
| Full suite command | N/A until test framework installed |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | Login with email/password | smoke | Manual: visit /login, enter credentials | N/A -- Wave 0 |
| AUTH-02 | Session persists on refresh | smoke | Manual: login, refresh, verify still authenticated | N/A -- Wave 0 |
| AUTH-03 | Logout from any page | smoke | Manual: click logout from any authenticated page | N/A -- Wave 0 |
| AUTH-04 | Role guard on server actions | integration | Manual: attempt unauthorized server action call | N/A -- Wave 0 |
| AUTH-05 | Manager sees all nav items | smoke | Manual: login as manager, verify 6 nav items visible | N/A -- Wave 0 |
| AUTH-06 | Crew sees limited nav | smoke | Manual: login as crew, verify 2 nav items visible | N/A -- Wave 0 |
| AUTH-07 | Inspector sees limited nav | smoke | Manual: login as inspector, verify 3 nav items visible | N/A -- Wave 0 |

### Sampling Rate
- **Per task commit:** Build passes (`npm run build`)
- **Per wave merge:** Full build + manual login test with each role
- **Phase gate:** All 3 demo accounts can login, see correct nav, logout

### Wave 0 Gaps
- [ ] No test framework installed -- acceptable for single-session demo build
- [ ] Schema validation via `drizzle-kit push` success (implicit test)
- [ ] Seed script execution validates DB connection and schema correctness
- [ ] Manual smoke testing covers all AUTH requirements adequately for demo scope

*(Test framework installation deferred -- single-session build prioritizes working features over test infrastructure)*

## Open Questions

1. **Tailwind v4 CSS variables vs v3 config**
   - What we know: Tailwind v4 uses CSS-first configuration with `@theme` directive instead of tailwind.config.js
   - What's unclear: Exact syntax for custom color tokens (slate blue palette, safety colors)
   - Recommendation: Use CSS variables in globals.css with `@theme` -- shadcn/ui v4 CLI sets this up automatically

2. **shadcn/ui Sidebar component**
   - What we know: shadcn/ui has a dedicated Sidebar component added in late 2024
   - What's unclear: Whether it supports collapsible state out of the box vs needing custom implementation
   - Recommendation: Try `npx shadcn@latest add sidebar` first. If it exists and fits, use it. Otherwise build with Sheet (mobile) + fixed div (desktop).

## Sources

### Primary (HIGH confidence)
- npm registry -- all version numbers verified via `npm view` (2026-03-26)
- iron-session GitHub README -- v8 App Router API confirmed (getIronSession with cookies())
- Drizzle ORM + Neon docs (orm.drizzle.team/docs/connect-neon) -- HTTP driver pattern confirmed
- STACK.md, ARCHITECTURE.md, PITFALLS.md -- project-specific research already conducted

### Secondary (MEDIUM confidence)
- Next.js App Router middleware patterns -- established convention, verified against Next.js docs
- CVE-2025-29927 middleware bypass -- documented, informs defense-in-depth auth pattern

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all versions verified against npm, prescribed by brief
- Architecture: HIGH -- patterns from ARCHITECTURE.md validated against official docs
- Pitfalls: HIGH -- RBAC and session pitfalls confirmed against iron-session docs and Next.js security advisories
- Auth patterns: HIGH -- iron-session v8 API confirmed from official GitHub README

**Research date:** 2026-03-26
**Valid until:** 2026-04-26 (stable stack, no fast-moving dependencies)
