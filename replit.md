# Overview

Settlement & Revenue Split Tracker — a full-stack web application for recording weekly income, tracking expenses, automatically calculating three-party revenue splits based on date-dependent contract rules, and exporting settlement reports to Excel and PDF. It serves as a tax-safe accounting tool separate from PayPal transaction history.

The core business logic splits net income (gross income minus PayPal fees minus expenses) among three parties (A, B, C) with Party C always receiving 5%. The split percentages for A and B change based on whether the settlement week ends before or after a configurable cutoff date (Feb 8, 2026).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript, bundled via Vite
- **Routing**: Wouter (lightweight client-side router), single-page app with SPA fallback
- **State/Data Fetching**: TanStack React Query for server state management with custom hooks (`use-settlements.ts`)
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives with Tailwind CSS
- **Forms**: React Hook Form with Zod resolver for validation
- **Styling**: Tailwind CSS with CSS custom properties for a dark theme with purple accents. Custom font setup (Inter, Playfair Display)
- **Path aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`
- **Key pages**: Dashboard (main view with stats, settlement table, create form in dialog), 404 page

### Backend
- **Framework**: Express.js on Node with TypeScript, executed via `tsx`
- **Architecture**: RESTful API under `/api/` prefix. Routes defined in `server/routes.ts`, storage abstraction in `server/storage.ts`
- **API Contract**: Shared route definitions in `shared/routes.ts` using Zod schemas — both client and server reference the same type-safe contract
- **Business Logic**: Revenue split calculations happen server-side in the route handler. Split rules are configurable via a `splitConfig` object with a cutoff date determining which percentage tier applies
- **Export Services**: 
  - Excel export via `exceljs` library (multi-sheet workbooks with settlement summary and expense details)
  - PDF export via `jspdf` with `jspdf-autotable` for formatted reports
- **Dev Server**: Vite dev server integrated as middleware (HMR via `server/vite.ts`)
- **Production**: Client built to `dist/public`, server bundled to `dist/index.cjs` via esbuild

### Shared Layer (`shared/`)
- **Schema** (`shared/schema.ts`): Drizzle ORM table definitions for `settlements` and `expenses` with relations, plus Zod insert schemas generated via `drizzle-zod`
- **Routes** (`shared/routes.ts`): Type-safe API contract with path definitions, HTTP methods, input/output Zod schemas — used by both frontend hooks and backend handlers

### Database
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL via `pg` Pool, connection string from `DATABASE_URL` environment variable
- **Schema Management**: `drizzle-kit push` for schema migrations (no migration files workflow, direct push)
- **Tables**:
  - `settlements`: id, week_start_date, week_end_date, gross_income, paypal_fees, fee_percentage, total_expenses, net_income, party_a_share, party_b_share, party_c_share, notes, created_at
  - `expenses`: id, settlement_id (FK with cascade delete), description, amount, payee_email, notes, created_at
- **Storage Pattern**: `IStorage` interface with `DatabaseStorage` implementation, instantiated as singleton `storage`

### Build System
- **Dev**: `tsx server/index.ts` with Vite middleware for HMR
- **Build**: Custom `script/build.ts` — runs Vite build for client, esbuild for server. Server dependencies are selectively bundled (allowlist) or externalized to optimize cold start
- **Output**: `dist/public/` (static client files), `dist/index.cjs` (server bundle)

## External Dependencies

### Required Services
- **PostgreSQL Database**: Required. Connection via `DATABASE_URL` environment variable. Used for all data persistence via Drizzle ORM

### Key NPM Packages
- **Server**: express, drizzle-orm, pg, exceljs, jspdf/jspdf-autotable, zod, connect-pg-simple
- **Client**: react, @tanstack/react-query, react-hook-form, wouter, date-fns, react-day-picker, lucide-react, recharts, shadcn/ui (Radix primitives + tailwindcss + class-variance-authority)
- **Shared**: drizzle-zod, zod
- **Build**: vite, esbuild, tsx, typescript

### Replit-Specific
- `@replit/vite-plugin-runtime-error-modal` — runtime error overlay in dev
- `@replit/vite-plugin-cartographer` and `@replit/vite-plugin-dev-banner` — dev-only Replit integrations