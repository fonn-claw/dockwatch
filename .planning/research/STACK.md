# Technology Stack

**Project:** DockWatch -- Marina Preventive Maintenance & Compliance Platform
**Researched:** 2026-03-26
**Overall Confidence:** HIGH (stack is prescribed by brief; research validates versions and fills gaps)

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Next.js | 16.2.1 | Full-stack React framework | Prescribed by brief. App Router with RSC for server-rendered dashboards. Proven Vercel deployment. Turbopack stable for fast dev. |
| React | 19.x | UI library | Ships with Next.js 16. Server Components for data-heavy dashboard views. |
| TypeScript | 5.x | Type safety | Non-negotiable for a data model this complex (assets, work orders, schedules, roles). Drizzle schemas provide end-to-end type safety. |

### Database

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Neon Postgres | -- | Managed serverless Postgres | Prescribed by brief. Serverless-compatible, auto-scales to zero, branching for dev. Works with Vercel edge/serverless functions. |
| @neondatabase/serverless | 1.0.2 | Neon connection driver | HTTP-based driver optimized for serverless. Uses WebSocket for session/interactive queries. Required for Vercel serverless cold starts. |
| Drizzle ORM | 0.45.1 | Database access layer | Prescribed by brief. SQL-like API, zero runtime overhead, excellent TypeScript inference. Schema-as-code means the DB schema lives in the repo. |
| Drizzle Kit | 0.31.10 | Migrations & schema management | Companion CLI for Drizzle. Generates SQL migrations from schema changes. `drizzle-kit push` for rapid prototyping, `drizzle-kit generate` for production migrations. |

**Note on Drizzle v1 beta:** v1.0.0-beta.2 exists but is not production-ready. Stick with 0.45.x stable for a single-session build. The stable API is well-documented and covers everything DockWatch needs.

### Authentication

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| iron-session | 8.0.4 | Encrypted cookie sessions | Simpler than NextAuth for fixed demo accounts with role-based access. Stateless (no session table needed). Works natively with App Router via `cookies()`. Single `getIronSession()` API for route handlers, server components, and server actions. |
| bcryptjs | 3.0.3 | Password hashing | Pure JS bcrypt implementation. No native dependencies means clean Vercel deployment. Used to hash demo account passwords in seed script. |

**Why NOT NextAuth:** Overkill for 3 fixed demo accounts. NextAuth adds OAuth provider complexity, adapter configuration, and session table management that adds zero value here. iron-session gives us encrypted cookies with role data in ~20 lines of config.

### UI Layer

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Tailwind CSS | 4.x | Utility-first CSS | Prescribed by brief. Industrial color palette with safety status colors maps perfectly to Tailwind's design token system. |
| shadcn/ui | CLI v4 | Component library | Prescribed by brief. Copy-paste components (not a dependency). Professionally styled. Built on Radix UI primitives for accessibility. Chart components built on Recharts. |
| Radix UI | latest | Accessible primitives | Ships with shadcn/ui components. Handles keyboard nav, focus management, ARIA -- critical for professional showcase quality. |
| Lucide React | 1.7.0 | Icons | Default icon set for shadcn/ui. Consistent stroke-based icons. Industrial/operational icons available (wrench, alert-triangle, check-circle, calendar). |
| class-variance-authority | 0.7.1 | Variant styling | Used by shadcn/ui for component variants. Status badges (urgent/high/normal/low) and condition ratings map to CVA variants. |
| clsx | 2.1.1 | Conditional classes | Utility for conditional class composition. |
| tailwind-merge | 3.5.0 | Class conflict resolution | Merges Tailwind classes without conflicts. Used by shadcn/ui's `cn()` utility. |

### Data Visualization

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Recharts | 3.8.1 | Charts and graphs | shadcn/ui's chart components are built on Recharts v3. No wrapper abstraction -- direct Recharts API with shadcn styling. Covers cost breakdowns (bar), trends (line/area), compliance % (radial). |

**Why NOT Tremor:** Tremor wraps Recharts with its own abstraction layer. Since shadcn/ui already provides styled Recharts components, adding Tremor creates a redundant layer. Use shadcn/ui charts directly.

### PDF Generation

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| @react-pdf/renderer | 4.3.2 | Compliance report PDFs | React component model for PDF generation. Define PDF layouts using JSX -- natural for a React/Next.js project. Runs server-side in API routes. 860K+ weekly downloads, actively maintained. Ideal for structured compliance reports with tables, headers, and status indicators. |

**Why NOT jsPDF:** Client-side focused, imperative API. @react-pdf/renderer's declarative JSX approach is more maintainable for complex compliance report templates.

**Why NOT Puppeteer:** Requires headless Chrome binary. Cannot run in Vercel serverless functions (binary size limits). Massive overkill for structured report generation.

### Date & Time

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| date-fns | 4.1.0 | Date manipulation | Tree-shakeable, functional API. Used for maintenance schedule calculations (addDays, addMonths, differenceInDays, isAfter, isBefore, format). No mutable state bugs. Smaller bundle than dayjs when tree-shaken for specific functions. |

**Why NOT dayjs:** dayjs plugin system (relativeTime, isBetween) requires explicit imports that are easy to forget. date-fns functions are standalone imports -- simpler mental model for schedule date arithmetic.

### Validation

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Zod | 4.3.6 | Runtime validation | Schema validation for work order forms, asset creation, schedule configuration. Pairs with Drizzle for type-safe form-to-database pipeline. Used in server actions for input validation. |

### Infrastructure & Deployment

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Vercel | -- | Hosting platform | Prescribed by brief. Zero-config Next.js deployment. Edge functions for auth middleware. Custom domain support. |
| Node.js | 20.x LTS | Runtime | Vercel serverless functions runtime. LTS for stability. |

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Auth | iron-session | NextAuth v5 | Overkill for fixed demo accounts. Adds adapter complexity, session table, OAuth config for zero benefit. |
| ORM | Drizzle | Prisma | Drizzle is prescribed. Also: Prisma's generated client is heavier for serverless cold starts. Drizzle's SQL-like API is more transparent. |
| Charts | Recharts (via shadcn) | Tremor | Redundant abstraction over Recharts. shadcn already styles Recharts components. |
| Charts | Recharts (via shadcn) | Chart.js | Canvas-based, less React-native. Recharts uses SVG with React component model. |
| PDF | @react-pdf/renderer | Puppeteer | Cannot run in Vercel serverless (headless Chrome binary too large). |
| PDF | @react-pdf/renderer | jsPDF | Imperative API less maintainable for complex report templates. |
| Dates | date-fns | dayjs | Plugin system adds friction. date-fns tree-shakes better for targeted imports. |
| Dates | date-fns | Temporal API | Not yet widely supported in Node.js runtimes on Vercel. Future option. |
| DB Driver | @neondatabase/serverless | pg (node-postgres) | pg uses TCP connections, incompatible with Vercel Edge. Neon driver uses HTTP/WebSocket. |
| CSS | Tailwind CSS | CSS Modules | Prescribed. Tailwind's utility approach is faster for single-session builds. |
| Validation | Zod | Yup | Zod has better TypeScript inference. Drizzle ecosystem prefers Zod (drizzle-zod integration). |

## Installation

```bash
# Core framework
npx create-next-app@latest dockwatch --typescript --tailwind --eslint --app --src-dir

# Database
npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit

# Auth
npm install iron-session bcryptjs
npm install -D @types/bcryptjs

# UI (shadcn components added via CLI)
npx shadcn@latest init
npx shadcn@latest add button card badge table dialog input select textarea tabs calendar dropdown-menu avatar separator sheet tooltip chart

# Supporting libraries
npm install date-fns zod @react-pdf/renderer recharts lucide-react

# Dev dependencies (most ship with create-next-app)
npm install -D @types/node
```

## Key Configuration Notes

### Environment Variables
```
DATABASE_URL=        # Neon Postgres connection string (pooled)
SESSION_SECRET=      # 32+ char random string for iron-session cookie encryption
```

### Drizzle Config
Use `drizzle-kit push` for rapid prototyping during the build session. Generate proper migrations with `drizzle-kit generate` before production deploy.

### Neon Connection Pattern
Use `@neondatabase/serverless` with HTTP for one-shot queries (most API routes) and WebSocket for transactions (work order status updates with audit log entries).

### shadcn/ui Theming
Configure the industrial color palette in `globals.css` CSS variables. Map safety status colors to semantic tokens:
- `--destructive` for critical/overdue (red)
- `--warning` for due-soon (amber/yellow)
- `--success` for on-track (green)
- Primary slate blue for general UI chrome

## Confidence Assessment

| Technology | Confidence | Notes |
|------------|------------|-------|
| Next.js 16.2.1 | HIGH | Verified via npm. Current stable. |
| Drizzle ORM 0.45.1 | HIGH | Verified via npm. Stable release, well-documented. |
| iron-session 8.0.4 | HIGH | Verified via npm. Native App Router support confirmed. |
| @neondatabase/serverless 1.0.2 | HIGH | Verified via npm. 1.x stable release. |
| shadcn/ui CLI v4 | HIGH | Confirmed March 2026 release. |
| Recharts 3.8.1 | HIGH | Verified via npm. Used by shadcn/ui chart components. |
| @react-pdf/renderer 4.3.2 | HIGH | Verified via npm. 860K+ weekly downloads. |
| date-fns 4.1.0 | HIGH | Verified via npm. Tree-shakeable, functional API. |
| Zod 4.3.6 | HIGH | Verified via npm. Standard validation in Drizzle ecosystem. |
| bcryptjs 3.0.3 | HIGH | Verified via npm. Pure JS, no native deps. |

## Sources

- [Next.js Blog - Version 16.1](https://nextjs.org/blog/next-16-1) - confirmed 16.x line, npm shows 16.2.1
- [Drizzle ORM Latest Releases](https://orm.drizzle.team/docs/latest-releases) - v1 beta exists but 0.45.x is stable
- [Drizzle + Neon Connection Guide](https://orm.drizzle.team/docs/connect-neon) - official integration docs
- [iron-session GitHub](https://github.com/vvo/iron-session) - v8 App Router support confirmed
- [shadcn/ui Changelog - CLI v4](https://ui.shadcn.com/docs/changelog/2026-03-cli-v4) - March 2026 release
- [shadcn/ui Chart Component](https://ui.shadcn.com/docs/components/radix/chart) - built on Recharts v3
- [Neon Serverless Driver Docs](https://neon.com/docs/serverless/serverless-driver) - HTTP + WebSocket modes
- npm registry (direct `npm view` queries for all version numbers)
