# Nub Platform Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a bilingual (TH/EN) retirement planning web platform with 6 calculators, auth, dashboard, blog, community forum, AI chatbot, fund screener, and PWA support.

**Architecture:** Next.js App Router with Supabase (auth + PostgreSQL). All financial calculations run client-side in Web Workers. Progressive Monte Carlo (5K→60K rounds). i18n via next-intl.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS 4, Supabase, Recharts, Web Workers, next-intl, Lottie, Posthog, Claude API, Vercel

**Spec:** `docs/superpowers/specs/2026-03-17-nub-platform-design.md`

**Working directory:** `/Users/pasuthunjunkong/workspace/nub`

---

## Chunk 1: Foundation — Project Setup, Design System, Auth, i18n, Layout

### Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install core dependencies**

```bash
cd /Users/pasuthunjunkong/workspace/nub
npm install @supabase/supabase-js @supabase/ssr next-intl recharts lottie-react posthog-js @anthropic-ai/sdk next-pwa
```

- [ ] **Step 2: Install UI/utility dependencies**

```bash
npm install clsx tailwind-merge lucide-react @radix-ui/react-dialog @radix-ui/react-popover @radix-ui/react-tooltip @radix-ui/react-dropdown-menu @radix-ui/react-tabs @radix-ui/react-select @radix-ui/react-switch
```

- [ ] **Step 3: Install dev dependencies**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @types/node canvas-confetti @types/canvas-confetti
```

- [ ] **Step 4: Verify all installed correctly**

Run: `npm ls --depth=0`
Expected: No missing peer dependencies or errors

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install core dependencies for Nub platform"
```

---

### Task 2: Tailwind Design System & Dark Mode

**Files:**
- Create: `src/lib/utils.ts`
- Modify: `src/app/globals.css`
- Modify: `tailwind.config.ts` (if exists, otherwise handled by Tailwind v4 CSS)

- [ ] **Step 1: Create utility function for class merging**

Create `src/lib/utils.ts`:
```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 2: Set up CSS custom properties for theming**

Update `src/app/globals.css` with the Nub design tokens. Define CSS variables for light/dark mode using `@theme` and `@custom-variant` with Tailwind v4 syntax. Include:
- Brand colors: primary (#4F7CF7), secondary (#7C5CFC), success (#34D399), warning (#FBBF24), danger (#F87171)
- Background: #F8FAFC (light) / #0F172A (dark)
- Surface: #FFFFFF (light) / #1E293B (dark)
- Text: #1E293B (light) / #F1F5F9 (dark)
- Muted: #94A3B8
- Font families: IBM Plex Sans Thai (headings), Inter (body), IBM Plex Mono (monospace)
- Dark mode via `.dark` class on `<html>`

- [ ] **Step 3: Verify build succeeds**

Run: `cd /Users/pasuthunjunkong/workspace/nub && npm run build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/lib/utils.ts src/app/globals.css
git commit -m "feat: add design system tokens and dark mode CSS variables"
```

---

### Task 3: Supabase Setup & Database Schema

**Files:**
- Create: `src/lib/supabase/client.ts` (browser client)
- Create: `src/lib/supabase/server.ts` (server client)
- Create: `src/lib/supabase/middleware.ts` (middleware helper)
- Create: `src/types/database.ts` (TypeScript types for all tables)
- Create: `supabase/migrations/001_initial_schema.sql`
- Create: `supabase/seed.sql`
- Create: `.env.local.example`

- [ ] **Step 1: Create `.env.local.example`**

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
ANTHROPIC_API_KEY=your-anthropic-api-key
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

- [ ] **Step 2: Create TypeScript types for all database tables**

Create `src/types/database.ts` with full types matching the spec Section 6:
- `Database` type with `public.Tables` for all 15 tables
- `Profile`, `SavedPlan`, `BlogPost`, `Fund`, `FundCorrelation`, `Booking`, `ForumPost`, `ForumReply`, `ForumVote`, `Notification`, `Referral`, `ChatHistory`, `GlossaryTerm`, `CalendarEvent`, `ChatDailyUsage`
- Row, Insert, Update types for each table
- Enums: `EmploymentType`, `SubscriptionTier`, `PlanType`, `FundCategory`, `BookingStatus`, `ForumStatus`, `NotificationType`, `CalendarEventType`, `UserRole`

- [ ] **Step 3: Create Supabase browser client**

Create `src/lib/supabase/client.ts`:
```typescript
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 4: Create Supabase server client**

Create `src/lib/supabase/server.ts` using `createServerClient` from `@supabase/ssr` with cookie handling via `next/headers`.

- [ ] **Step 5: Create Supabase middleware helper**

Create `src/lib/supabase/middleware.ts` that refreshes auth tokens and passes them via cookies. This will be used by the Next.js middleware.

- [ ] **Step 6: Create SQL migration — enums and core tables (profiles, saved_plans, blog_posts, funds, fund_correlations, bookings)**

Create `supabase/migrations/001_initial_schema.sql` Part 1:
- All enums (employment_type, subscription_tier, plan_type, fund_category, booking_status, forum_status, notification_type, calendar_event_type, user_role)
- Tables: profiles, saved_plans, blog_posts, funds, fund_correlations, bookings
- Foreign keys, constraints, defaults
- Trigger for auto-creating profile on auth.users insert
- Trigger for updated_at timestamps

- [ ] **Step 6b: Create SQL migration — community tables (forum_posts, forum_replies, forum_votes)**

Append to migration:
- Tables: forum_posts, forum_replies, forum_votes
- Moderation fields (status, is_reported)
- Composite PK on forum_votes

- [ ] **Step 6c: Create SQL migration — remaining tables (notifications, referrals, chat_history, glossary_terms, calendar_events, chat_daily_usage)**

Append to migration:
- Tables: notifications, referrals, chat_history, glossary_terms, calendar_events, chat_daily_usage
- All constraints and defaults

- [ ] **Step 6d: Create SQL migration — RLS policies**

Append to migration:
- RLS policies per spec Section 6.15
- Enable RLS on all tables
- User-own-data policies, admin policies, read-only public policies

- [ ] **Step 6e: Verify migration syntax and completeness**

Run: `cd /Users/pasuthunjunkong/workspace/nub && grep -c 'CREATE TABLE' supabase/migrations/001_initial_schema.sql`
Expected: 15 (one per table: profiles, saved_plans, blog_posts, funds, fund_correlations, bookings, forum_posts, forum_replies, forum_votes, notifications, referrals, chat_history, glossary_terms, calendar_events, chat_daily_usage)

Run: `grep -c 'CREATE TYPE' supabase/migrations/001_initial_schema.sql`
Expected: 10 (one per enum type)

Run: `grep -c 'ALTER TABLE.*ENABLE ROW LEVEL SECURITY' supabase/migrations/001_initial_schema.sql`
Expected: 15 (RLS enabled on all tables)

Note: If Supabase CLI is available, also run `npx supabase db lint` for full SQL validation.

- [ ] **Step 7: Create seed data**

Create `supabase/seed.sql` with:
- 3 sample funds (SCBRMS&P500, SCBRM2, SCBRMGOLDH) with data from the spreadsheet
- Fund correlations from the spreadsheet
- 5 glossary terms (Monte Carlo, ROIC, Sharpe Ratio, กบข., กองทุนสำรองเลี้ยงชีพ)
- 3 calendar events (tax filing deadline, SSF/RMF deadline, GPF contribution)

- [ ] **Step 8: Commit**

```bash
git add src/lib/supabase/ src/types/database.ts supabase/ .env.local.example
git commit -m "feat: add Supabase setup, database schema, types, and seed data"
```

---

### Task 4: i18n Setup (Thai/English)

**Files:**
- Create: `src/i18n/request.ts`
- Create: `src/i18n/routing.ts`
- Create: `messages/th.json`
- Create: `messages/en.json`
- Modify: `next.config.ts` (add next-intl plugin)
- Create: `src/middleware.ts`

- [ ] **Step 1: Create i18n routing config**

Create `src/i18n/routing.ts`:
```typescript
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["th", "en"],
  defaultLocale: "th",
});
```

- [ ] **Step 2: Create i18n request config**

Create `src/i18n/request.ts` that loads messages for the requested locale using `getRequestConfig` from `next-intl/server`.

- [ ] **Step 3: Create Thai translation file**

Create `messages/th.json` with sections:
- `common`: navigation items, buttons (เข้าสู่ระบบ, สมัครสมาชิก, คำนวณ, บันทึก, etc.)
- `landing`: hero title, subtitle, features, CTA
- `auth`: login, register, forgot password labels
- `dashboard`: Financial Health Score labels, plan cards
- `calculator`: shared labels (อายุปัจจุบัน, เงินเดือน, อัตราเงินเฟ้อ, etc.)
- `retirement`: employment type labels, GPF/PVD/SSS specific
- `withdrawal`: Monte Carlo labels
- `stress_test`: scenario labels
- `mpt`: portfolio optimizer labels
- `dca`: strategy labels
- `tax`: SSF/RMF/insurance labels
- `chat`: chatbot labels
- `funds`: screener labels
- `community`: forum labels
- `profile`: settings labels

- [ ] **Step 4: Create English translation file**

Create `messages/en.json` — same structure as Thai, all values in English.

- [ ] **Step 5: Update Next.js config for next-intl**

Update `next.config.ts` to add the `createNextIntlPlugin` wrapper.

- [ ] **Step 6: Create middleware combining auth + i18n**

Create `src/middleware.ts` that:
1. Refreshes Supabase auth tokens
2. Handles locale routing via next-intl
3. Protects auth-required routes (redirect to `/login` if not authenticated)
4. Matches routes per spec Section 4 (public vs auth-required)

- [ ] **Step 7: Update app directory for locale routing**

Rename `src/app` route structure to support `[locale]` dynamic segment:
- `src/app/[locale]/layout.tsx` — root layout with locale provider
- `src/app/[locale]/page.tsx` — landing page

- [ ] **Step 8: Verify build**

Run: `cd /Users/pasuthunjunkong/workspace/nub && npm run build`
Expected: Build succeeds

- [ ] **Step 9: Commit**

```bash
git add src/i18n/ messages/ src/middleware.ts next.config.ts src/app/
git commit -m "feat: add i18n with Thai/English support and locale routing"
```

---

### Task 5: Base UI Components

**Files:**
- Create: `src/components/ui/button.tsx`
- Create: `src/components/ui/input.tsx`
- Create: `src/components/ui/card.tsx`
- Create: `src/components/ui/select.tsx`
- Create: `src/components/ui/slider.tsx`
- Create: `src/components/ui/tooltip.tsx`
- Create: `src/components/ui/badge.tsx`
- Create: `src/components/ui/skeleton.tsx`
- Create: `src/components/ui/switch.tsx`
- Create: `src/components/ui/dialog.tsx`
- Create: `src/components/ui/popover.tsx`
- Create: `src/components/ui/tabs.tsx`

- [ ] **Step 1: Write smoke tests for core UI components**

Create `src/components/ui/__tests__/ui-components.test.tsx`:
- Button renders with all variants (primary, secondary, outline, ghost, danger)
- Button shows spinner when `loading` prop is true
- Input renders with label, shows error message
- Card renders children
- Stepper renders correct number of steps, advances on next

Run: `cd /Users/pasuthunjunkong/workspace/nub && npx vitest run src/components/ui/__tests__/ui-components.test.ts`
Expected: FAIL (components don't exist yet)

- [ ] **Step 2: Create Button component**

Variants: `primary` (gradient blue→purple), `secondary`, `outline`, `ghost`, `danger`.
Sizes: `sm`, `md`, `lg`. Rounded-xl. Support `loading` prop with spinner.

- [ ] **Step 2: Create Input component**

Rounded-lg, border-muted, focus ring primary. Support `label`, `error`, `helpText` props. Support `type="number"` with formatted display.

- [ ] **Step 3: Create Card, Select, Slider, Tooltip, Badge, Skeleton, Switch, Dialog, Popover, Tabs**

Each following the design system spec. Cards: rounded-2xl, subtle shadow. Use Radix primitives for Dialog, Popover, Tooltip, Select, Tabs, Switch.

- [ ] **Step 4: Create shared HelpTooltip component**

Create `src/components/shared/help-tooltip.tsx`:
A (?) icon that shows a popover with a short definition and "Learn more" link to `/glossary/[term]`. Fetches content from `glossary_terms` table via a React hook.

- [ ] **Step 5: Create Stepper component**

Create `src/components/shared/stepper.tsx`:
Multi-step form wrapper. Shows step indicators (1, 2, 3...), back/next buttons, progress bar. Used by all calculators.

- [ ] **Step 6: Run UI component tests**

Run: `cd /Users/pasuthunjunkong/workspace/nub && npx vitest run src/components/ui/__tests__/`
Expected: All PASS

- [ ] **Step 7: Verify build**

Run: `cd /Users/pasuthunjunkong/workspace/nub && npm run build`
Expected: Build succeeds

- [ ] **Step 8: Commit**

```bash
git add src/components/
git commit -m "feat: add base UI components with design system"
```

---

### Task 6: Layout Components (Nav, Sidebar, Footer, Bottom Nav)

**Files:**
- Create: `src/components/layout/header.tsx` (public header with logo, nav, language toggle, login CTA)
- Create: `src/components/layout/sidebar.tsx` (auth layout sidebar for desktop)
- Create: `src/components/layout/bottom-nav.tsx` (mobile bottom nav with 5 tabs)
- Create: `src/components/layout/footer.tsx`
- Create: `src/components/layout/auth-layout.tsx` (wrapper for auth-required pages)
- Create: `src/components/layout/public-layout.tsx` (wrapper for public pages)
- Create: `src/components/layout/language-toggle.tsx`
- Create: `src/components/layout/dark-mode-toggle.tsx`
- Create: `src/components/layout/user-menu.tsx`

- [ ] **Step 1: Create public layout header**

Logo ("Nub"), navigation links (Blog, Glossary, Calendar, Contact), language toggle (TH/EN), dark mode toggle, Login/Register CTA. Responsive: hamburger menu on mobile.

- [ ] **Step 2: Create auth layout sidebar**

Desktop sidebar with navigation:
- Dashboard (home icon)
- Calculators (expandable: Retirement, Withdrawal, Stress Test, MPT, DCA, Tax)
- Fund Screener
- AI Chat
- Community
- Profile

Show user avatar + name at bottom. Collapsible to icons-only.

- [ ] **Step 3: Create mobile bottom nav**

5 tabs: Home, Calculators, Funds, Blog, Profile. Fixed bottom, rounded icons, active state with primary color.

- [ ] **Step 4: Create footer**

Links: Legal, PDPA, Methodology, Contact. Copyright. Social links.

- [ ] **Step 5: Create language toggle and dark mode toggle**

Language: dropdown with TH/EN flags. Dark mode: switch component, persist to profile + localStorage.

- [ ] **Step 6: Create auth-layout and public-layout wrappers**

`auth-layout.tsx`: Sidebar (desktop) + bottom nav (mobile) + main content area.
`public-layout.tsx`: Header + main content + footer.

- [ ] **Step 7: Wire up layouts in app directory**

- `src/app/[locale]/(public)/layout.tsx` → uses `PublicLayout`
- `src/app/[locale]/(auth)/layout.tsx` → uses `AuthLayout`

- [ ] **Step 8: Verify build and visual check**

Run: `cd /Users/pasuthunjunkong/workspace/nub && npm run dev`
Check: Landing page renders with header, footer. Login redirects work.

- [ ] **Step 9: Commit**

```bash
git add src/components/layout/ src/app/
git commit -m "feat: add layout components — header, sidebar, bottom nav, footer"
```

---

### Task 7: Auth Pages (Login/Register)

**Files:**
- Create: `src/app/[locale]/(public)/login/page.tsx`
- Create: `src/components/auth/login-form.tsx`
- Create: `src/components/auth/social-auth-buttons.tsx`
- Create: `src/app/[locale]/(public)/auth/callback/route.ts` (OAuth callback)

- [ ] **Step 1: Create social auth buttons**

Google and LINE login buttons. Each calls `supabase.auth.signInWithOAuth()` with redirect to `/auth/callback`.

- [ ] **Step 2: Create login form**

Tabs: "Login" / "Register". Email + password form for each. Social auth buttons above. "Forgot password" link.

- [ ] **Step 3: Create login page**

Clean centered layout with Nub branding. Login form component.

- [ ] **Step 4: Create OAuth callback route**

`/auth/callback/route.ts`: Exchanges auth code for session, redirects to `/dashboard`.

- [ ] **Step 5: Test auth flow**

Set up Supabase project with Google OAuth. Test login → callback → redirect to dashboard.

- [ ] **Step 6: Commit**

```bash
git add src/app/[locale]/(public)/login/ src/app/[locale]/(public)/auth/ src/components/auth/
git commit -m "feat: add auth pages with Google, LINE, and email login"
```

---

### Task 8: Onboarding Wizard

**Files:**
- Create: `src/components/onboarding/onboarding-wizard.tsx`
- Create: `src/app/[locale]/(auth)/onboarding/page.tsx`

- [ ] **Step 1: Create onboarding wizard**

3 steps:
1. "What's your employment type?" → government / private / freelance (saves to profile)
2. "What's your primary goal?" → Retirement planning / Investment optimization / Tax saving (routes to relevant calculator)
3. "Set your language preference" → TH / EN

Updates `profiles.employment_type` and `profiles.onboarding_completed = true`.

- [ ] **Step 2: Create onboarding page**

Route: `/onboarding`. Middleware redirects first-time users here after login (check `onboarding_completed` flag).

- [ ] **Step 3: Commit**

```bash
git add src/components/onboarding/ src/app/[locale]/(auth)/onboarding/
git commit -m "feat: add first-time onboarding wizard"
```

---

## Chunk 2: Financial Math Library & Web Workers

### Task 9: Shared Finance Math Library

**Files:**
- Create: `src/lib/finance-math.ts`
- Create: `src/lib/__tests__/finance-math.test.ts`

- [ ] **Step 1: Write tests for all finance math functions**

Test cases for:
- `compoundInterest(1000, 0.05, 10)` → 1628.89
- `futureValue(1000, 0.05, 10)` → 1628.89
- `presentValue(1628.89, 0.05, 10)` → ~1000
- `normalRandom(0, 1)` → returns number (statistical test: mean ≈ 0 over 10000 samples)
- `portfolioReturn([0.6, 0.4], [0.08, 0.04])` → 0.064
- `portfolioVariance` with known covariance matrix
- `sharpeRatio(0.08, 0.02, 0.15)` → 0.4
- `maxDrawdown([100, 120, 90, 110, 80])` → -33.33%
- `percentile([1,2,3,4,5], 50)` → 3

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Users/pasuthunjunkong/workspace/nub && npx vitest run src/lib/__tests__/finance-math.test.ts`
Expected: All FAIL

- [ ] **Step 3: Implement all finance math functions**

Create `src/lib/finance-math.ts` with:
```typescript
export function compoundInterest(principal: number, rate: number, periods: number): number
export function futureValue(pv: number, rate: number, periods: number): number
export function presentValue(fv: number, rate: number, periods: number): number
export function normalRandom(mean: number, sd: number): number  // Box-Muller
export function portfolioReturn(weights: number[], returns: number[]): number
export function portfolioVariance(weights: number[], covMatrix: number[][]): number
export function sharpeRatio(portfolioReturn: number, riskFreeRate: number, sd: number): number
export function maxDrawdown(equityCurve: number[]): number
export function percentile(data: number[], p: number): number
export function correlationMatrix(returnsSeries: number[][]): number[][]
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Users/pasuthunjunkong/workspace/nub && npx vitest run src/lib/__tests__/finance-math.test.ts`
Expected: All PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/finance-math.ts src/lib/__tests__/
git commit -m "feat: add shared finance math library with tests"
```

---

### Task 10: Retirement Planner Web Worker

**Files:**
- Create: `src/workers/retirement-planner.worker.ts`
- Create: `src/hooks/use-retirement-worker.ts`
- Create: `src/types/calculator.ts` (shared calculator types)
- Create: `src/workers/__tests__/retirement-planner.test.ts`

- [ ] **Step 1: Define calculator types**

Create `src/types/calculator.ts` with:
- `RetirementInputs` (all fields from spec 7.2, union type for employment-specific fields)
- `RetirementResults` (gap, corpus, projectionByYear, healthScore, healthScoreBreakdown, monthlyShortfall)
- `HealthScoreBreakdown` (fundingScore, diversificationBonus, savingsRateBonus, timeHorizonBonus, insuranceBonus)
- Similar input/output types for all other calculators

- [ ] **Step 2: Write tests for retirement calculations**

Test:
- Government employee with known inputs → expected gap
- Private employee with PVD + employer match → expected corpus
- Health score calculation: funded ratio 0.5 → score ~30 (base only)
- Health score with all bonuses → score ~90

- [ ] **Step 3: Run tests to verify they fail**

Run: `cd /Users/pasuthunjunkong/workspace/nub && npx vitest run src/workers/__tests__/retirement-planner.test.ts`
Expected: FAIL

- [ ] **Step 4: Implement retirement planner worker**

Worker receives inputs via `postMessage`, runs calculations using finance-math functions, returns results. Include Financial Health Score formula from spec (fundedRatio * 60 + bonuses).

- [ ] **Step 5: Create React hook for worker**

`use-retirement-worker.ts`: Creates worker instance, sends inputs, receives results. Returns `{ results, isCalculating, calculate }`.

- [ ] **Step 6: Run tests to verify they pass**

Run: `cd /Users/pasuthunjunkong/workspace/nub && npx vitest run src/workers/__tests__/retirement-planner.test.ts`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/workers/ src/hooks/ src/types/calculator.ts
git commit -m "feat: add retirement planner web worker with health score"
```

---

### Task 11: Monte Carlo Web Worker (Progressive)

**Files:**
- Create: `src/workers/monte-carlo.worker.ts`
- Create: `src/hooks/use-monte-carlo-worker.ts`
- Create: `src/workers/__tests__/monte-carlo.test.ts`

- [ ] **Step 1: Write tests**

Test:
- 100 rounds with 100% return → 100% survival rate
- 100 rounds with -50% monthly return → 0% survival rate
- Progressive mode: first message has `partial: true`, second has `partial: false`
- Percentile calculations are in correct order (P10 < P25 < P50 < P75 < P90)

- [ ] **Step 2: Run tests to verify they fail**

- [ ] **Step 3: Implement Monte Carlo worker**

Progressive execution: 5K rounds → postMessage partial → continue to 60K → postMessage final.
Each simulation: Geometric Brownian Motion, monthly withdrawal, track survival.
Output: survivalRate, wealthPaths (sample 100 paths for charting), percentiles.

- [ ] **Step 4: Create React hook**

`use-monte-carlo-worker.ts`: Returns `{ results, partialResults, isRefining, progress, calculate }`.

- [ ] **Step 5: Run tests to verify they pass**

- [ ] **Step 6: Commit**

```bash
git add src/workers/monte-carlo.worker.ts src/hooks/use-monte-carlo-worker.ts src/workers/__tests__/monte-carlo.test.ts
git commit -m "feat: add progressive Monte Carlo web worker (5K→60K)"
```

---

### Task 12: Stress Test Web Worker

**Files:**
- Create: `src/workers/stress-test.worker.ts`
- Create: `src/hooks/use-stress-test-worker.ts`
- Create: `src/workers/__tests__/stress-test.test.ts`

- [ ] **Step 1: Write tests for 4 scenarios**

Create `src/workers/__tests__/stress-test.test.ts`:
- Normal scenario with 0% SD → all simulations identical, drawdown = 0
- VaR(99%) at period 5 → that period's return is at the 1st percentile of normal distribution
- Black Swan at period 10 for 3 consecutive months → those 3 months have extreme negative returns (e.g., -20% each)
- Combined scenario produces worst drawdown >= Black Swan alone
- Doubling probability with high return (10%/month) and 100 periods → approaches 100%
- Doubling probability with negative return → approaches 0%
- Max drawdown calculation: input [100, 120, 80, 110, 70] → drawdown = (70-120)/120 = -41.67%

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Users/pasuthunjunkong/workspace/nub && npx vitest run src/workers/__tests__/stress-test.test.ts`
Expected: All FAIL

- [ ] **Step 3: Implement stress test worker**

4 scenarios: Normal, VaR(99%), Black Swan, Combined. Each runs Monte Carlo with injected extreme events. Calculate max drawdown, doubling probability, recovery time.

- [ ] **Step 4: Create React hook**

- [ ] **Step 5: Run tests, verify pass**

- [ ] **Step 6: Commit**

```bash
git add src/workers/stress-test.worker.ts src/hooks/use-stress-test-worker.ts src/workers/__tests__/stress-test.test.ts
git commit -m "feat: add stress test web worker with 4 scenarios"
```

---

### Task 13: MPT Optimizer Web Worker

**Files:**
- Create: `src/workers/mpt-optimizer.worker.ts`
- Create: `src/hooks/use-mpt-worker.ts`
- Create: `src/workers/__tests__/mpt-optimizer.test.ts`

- [ ] **Step 1: Write tests**

Create `src/workers/__tests__/mpt-optimizer.test.ts` with known 3-asset portfolio from spreadsheet:
- Assets: S&P500 (E(R)=8%, SD=18.58%), Bond (E(R)=2.5%, SD=1.91%), Gold (E(R)=5%, SD=15.11%)
- Correlations: S&P500-Bond=0.1496, S&P500-Gold=0.1432, Bond-Gold=0.0978
- Efficient frontier returns array of 100 portfolios
- Each frontier point: weights array sums to 1.0 (within 0.001 tolerance)
- No negative weights in any portfolio (no short selling constraint)
- Max Sharpe portfolio has higher Sharpe ratio than all other frontier points
- Min Vol portfolio has lower SD than Max Sharpe portfolio
- Min Vol portfolio SD is approximately 1.91% (close to bond-only, the lowest-risk asset)
- Max Sharpe weights approximately match spreadsheet: ~63.8% S&P500, ~0.1% Bond, ~36.2% Gold (within 5% tolerance)

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Users/pasuthunjunkong/workspace/nub && npx vitest run src/workers/__tests__/mpt-optimizer.test.ts`
Expected: All FAIL

- [ ] **Step 3: Implement MPT optimizer worker**

Build covariance matrix, generate efficient frontier via quadratic optimization (numerical approach with constrained random portfolios + interpolation), find Max Sharpe and Min Vol.

- [ ] **Step 4: Create React hook**

- [ ] **Step 5: Run tests, verify pass**

- [ ] **Step 6: Commit**

```bash
git add src/workers/mpt-optimizer.worker.ts src/hooks/use-mpt-worker.ts src/workers/__tests__/mpt-optimizer.test.ts
git commit -m "feat: add MPT portfolio optimizer web worker"
```

---

### Task 14: DCA Tracker Web Worker

**Files:**
- Create: `src/workers/dca-tracker.worker.ts`
- Create: `src/hooks/use-dca-worker.ts`
- Create: `src/workers/__tests__/dca-tracker.test.ts`

- [ ] **Step 1: Write tests**

Create `src/workers/__tests__/dca-tracker.test.ts`:
- Static strategy: DCA 10,000/month into 60% equity + 40% bond for 12 months with known returns → total principal = 120,000, final wealth matches manual calculation
- Static rebalancing: after rebalance, weights reset to target allocation (within 1% tolerance)
- Glidepath: equity weight decreases over time (year 1: 80% equity → year 10: 40% equity)
- Glidepath final equity weight is lower than initial equity weight
- DAA: momentum lookback shifts allocation toward best-performing asset
- All 3 strategies return trade log with correct number of entries (= number of months)
- Trade log entry has: month, year, action (DCA/Rebal), weights per asset, total wealth, drawdown%
- With identical constant returns, all 3 strategies produce the same result (no rebalancing effect)

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Users/pasuthunjunkong/workspace/nub && npx vitest run src/workers/__tests__/dca-tracker.test.ts`
Expected: All FAIL

- [ ] **Step 3: Implement DCA tracker worker**

3 strategies: Static (fixed allocation + periodic rebalancing), Glidepath (equity→bond shift), DAA (momentum-based). Generate monthly trade log.

- [ ] **Step 4: Create React hook**

- [ ] **Step 5: Run tests, verify pass**

- [ ] **Step 6: Commit**

```bash
git add src/workers/dca-tracker.worker.ts src/hooks/use-dca-worker.ts src/workers/__tests__/dca-tracker.test.ts
git commit -m "feat: add DCA tracker web worker with 3 strategies"
```

---

### Task 15: Tax Optimizer Web Worker

**Files:**
- Create: `src/workers/tax-optimizer.worker.ts`
- Create: `src/hooks/use-tax-worker.ts`
- Create: `src/workers/__tests__/tax-optimizer.test.ts`

- [ ] **Step 1: Write tests**

Test with known Thai tax brackets:
- Income 500K → expected tax without deductions
- Income 500K with max SSF → expected tax savings
- Optimization recommends SSF before RMF for lower incomes

- [ ] **Step 2: Run tests to verify they fail**

- [ ] **Step 3: Implement tax optimizer worker**

Thai progressive tax rates (2024/2567 brackets). SSF limit: 30% of income, max 200K. RMF limit: 30% of income, max 500K. Life insurance: max 100K. Calculate optimal allocation.

- [ ] **Step 4: Create React hook**

- [ ] **Step 5: Run tests, verify pass**

- [ ] **Step 6: Commit**

```bash
git add src/workers/tax-optimizer.worker.ts src/hooks/use-tax-worker.ts src/workers/__tests__/tax-optimizer.test.ts
git commit -m "feat: add Thai tax optimizer web worker"
```

---

## Chunk 3: Chart Components & Calculator Pages

### Task 16: Chart Components

**Files:**
- Create: `src/components/charts/wealth-projection-chart.tsx` (area chart for Monte Carlo paths)
- Create: `src/components/charts/survival-gauge.tsx` (donut/gauge for survival rate)
- Create: `src/components/charts/efficient-frontier-chart.tsx` (scatter plot for MPT)
- Create: `src/components/charts/scenario-comparison-chart.tsx` (bar chart for stress test)
- Create: `src/components/charts/dca-comparison-chart.tsx` (line chart for 3 strategies)
- Create: `src/components/charts/health-score-gauge.tsx` (gauge 0-100)
- Create: `src/components/charts/timeline-chart.tsx` (goal visualization timeline)
- Create: `src/components/charts/tax-comparison-chart.tsx` (before/after bar chart)

- [ ] **Step 1: Write smoke tests for all chart components**

Create `src/components/charts/__tests__/charts.test.tsx`:
- WealthProjectionChart renders with mock percentile data, has `aria-label="Wealth projection chart"`
- SurvivalGauge renders with rate=85%, shows "85%" text
- HealthScoreGauge renders with score=72, correct color class (On Track = blue)
- EfficientFrontierChart renders with mock frontier data
- ScenarioComparisonChart renders with 4 scenario bars
- DCAComparisonChart renders with 3 strategy lines
- TimelineChart renders with mock year data
- TaxComparisonChart renders with before/after values
- All charts have accessible `<table>` fallback with `sr-only` class

Run: `cd /Users/pasuthunjunkong/workspace/nub && npx vitest run src/components/charts/__tests__/charts.test.tsx`
Expected: FAIL

- [ ] **Step 2: Create WealthProjectionChart**

Recharts AreaChart showing P10/P25/P50/P75/P90 wealth paths over time. Gradient fill for confidence bands. Responsive. Animated on load.

- [ ] **Step 2: Create SurvivalGauge**

Circular gauge showing survival rate percentage. Green (>80%), amber (50-80%), red (<50%). Animated counter. Confetti trigger when >90%.

- [ ] **Step 3: Create HealthScoreGauge**

Similar to SurvivalGauge but for 0-100 score. Shows score breakdown on hover. Color: Critical (red) → Needs Work (amber) → On Track (blue) → Good (green) → Excellent (gold).

- [ ] **Step 4: Create EfficientFrontierChart**

Recharts ScatterChart. Points along frontier curve. Max Sharpe highlighted in gold. Min Vol highlighted in blue. Hover shows portfolio weights.

- [ ] **Step 5: Create remaining charts**

ScenarioComparisonChart, DCAComparisonChart, TimelineChart, TaxComparisonChart — all following design system colors and animation patterns.

- [ ] **Step 6: Run chart tests**

Run: `cd /Users/pasuthunjunkong/workspace/nub && npx vitest run src/components/charts/__tests__/charts.test.tsx`
Expected: All PASS

- [ ] **Step 7: Commit**

```bash
git add src/components/charts/
git commit -m "feat: add chart components for all calculators with tests"
```

---

### Task 17: Retirement Planner Page

**Files:**
- Create: `src/app/[locale]/(auth)/calculator/retirement/page.tsx`
- Create: `src/components/calculator/retirement/employment-selector.tsx`
- Create: `src/components/calculator/retirement/government-form.tsx`
- Create: `src/components/calculator/retirement/private-form.tsx`
- Create: `src/components/calculator/retirement/freelance-form.tsx`
- Create: `src/components/calculator/retirement/retirement-results.tsx`
- Create: `src/components/calculator/retirement/what-if-sliders.tsx`

- [ ] **Step 1: Write integration tests for retirement planner page**

Create `src/components/calculator/retirement/__tests__/retirement-page.test.tsx`:
- Employment selector renders 3 cards (government, private, freelance)
- Selecting "Government" shows GPF-specific fields
- Selecting "Private" shows PVD-specific fields
- Stepper form advances on "Next", goes back on "Back"
- Form validates required fields (age, salary) before advancing
- Results component renders health score gauge after calculation
- "What if" sliders are present in results view
- "Save plan" button is visible in results view

Run: `cd /Users/pasuthunjunkong/workspace/nub && npx vitest run src/components/calculator/retirement/__tests__/`
Expected: FAIL

- [ ] **Step 2: Create employment type selector**

3 cards: ข้าราชการ (Government), เอกชน (Private), อาชีพอิสระ (Freelance). Each with icon and brief description. Selecting one shows the corresponding form.

- [ ] **Step 2: Create government employee form (stepper)**

Step 1: Personal info (name, age, salary, position level)
Step 2: GPF details (contribution rate dropdown, current GPF value, service start date, retirement date)
Step 3: Retirement goals (monthly expenses, inflation, life expectancy, legacy amount)

- [ ] **Step 3: Create private employee form (stepper)**

Similar steps but with PVD contribution, employer match %, Social Security status.

- [ ] **Step 4: Create freelance form (stepper)**

Simpler: age, income, savings, Section 40 Social Security, retirement goals.

- [ ] **Step 5: Create results component**

Shows: Financial Health Score gauge, retirement gap (big number), year-by-year projection chart, monthly shortfall, score breakdown. Financial disclaimer at bottom.

- [ ] **Step 6: Create "What if" sliders**

Below results: sliders for retirement age, monthly savings, expected return. Adjusting instantly recalculates and updates charts.

- [ ] **Step 7: Add save plan and share functionality**

"Save this plan" button → saves to `saved_plans` table. "Share" button → generates social card image.

- [ ] **Step 8: Run integration tests**

Run: `cd /Users/pasuthunjunkong/workspace/nub && npx vitest run src/components/calculator/retirement/__tests__/`
Expected: All PASS

- [ ] **Step 9: Verify page works end-to-end**

Run dev server, fill form, get results, adjust sliders, save plan.

- [ ] **Step 10: Commit**

```bash
git add src/app/[locale]/(auth)/calculator/retirement/ src/components/calculator/retirement/
git commit -m "feat: add retirement planner page with 3 employment types"
```

---

### Task 18: Withdrawal Simulator Page

**Files:**
- Create: `src/app/[locale]/(auth)/calculator/withdrawal/page.tsx`
- Create: `src/components/calculator/withdrawal/withdrawal-form.tsx`
- Create: `src/components/calculator/withdrawal/withdrawal-results.tsx`
- Create: `src/components/calculator/withdrawal/scenario-comparison.tsx`

- [ ] **Step 1: Write integration tests for withdrawal simulator**

Create `src/components/calculator/withdrawal/__tests__/withdrawal-page.test.tsx`:
- Form renders 3 steps (pre-retirement, at retirement, assumptions)
- Results show survival gauge and wealth projection chart
- Progressive loading: shows "Refining..." indicator during 5K→60K transition
- Scenario comparison renders when pension value is provided

Run: `cd /Users/pasuthunjunkong/workspace/nub && npx vitest run src/components/calculator/withdrawal/__tests__/`
Expected: FAIL

- [ ] **Step 2: Create withdrawal form (stepper)**

Step 1: Pre-retirement (current expenses, years to retirement, inflation)
Step 2: At retirement (retirement age, life expectancy, lump sum, pension, annuity)
Step 3: Assumptions (portfolio E(R), SD, inflation E(R), SD)

- [ ] **Step 2: Create results component**

Survival rate gauge (big, prominent), wealth projection chart (P10-P90 bands), scenario comparison (current plan vs +pension), key stats (median final wealth, average case).

Progressive loading: skeleton → 5K results → "Refining..." badge → 60K final results.

- [ ] **Step 3: Add "What if" sliders and save/share**

- [ ] **Step 4: Verify end-to-end**

- [ ] **Step 5: Commit**

```bash
git add src/app/[locale]/(auth)/calculator/withdrawal/ src/components/calculator/withdrawal/
git commit -m "feat: add withdrawal simulator page with progressive Monte Carlo"
```

---

### Task 19: Stress Test Page

**Files:**
- Create: `src/app/[locale]/(auth)/calculator/stress-test/page.tsx`
- Create: `src/components/calculator/stress-test/stress-form.tsx`
- Create: `src/components/calculator/stress-test/stress-results.tsx`

- [ ] **Step 1: Write integration tests**

Create `src/components/calculator/stress-test/__tests__/stress-test-page.test.tsx`:
- Form renders all input fields (E(R), SD, periods, DCA, VaR, Black Swan)
- Results show 4-scenario comparison chart
- Max drawdown values displayed for each scenario

Expected: FAIL

- [ ] **Step 2: Create stress test form**

Inputs: E(R), SD, periods, DCA amount, bonus amount/frequency, target return, VaR period, Black Swan period + duration.

- [ ] **Step 2: Create results with 4-scenario comparison**

Bar chart comparing Normal/VaR/BlackSwan/Combined. Max drawdown for each. Doubling probability. Recovery time estimation.

- [ ] **Step 3: Commit**

```bash
git add src/app/[locale]/(auth)/calculator/stress-test/ src/components/calculator/stress-test/
git commit -m "feat: add stress test page with 4 scenarios"
```

---

### Task 20: MPT Asset Allocation Page

**Files:**
- Create: `src/app/[locale]/(auth)/calculator/mpt/page.tsx`
- Create: `src/components/calculator/mpt/fund-selector.tsx`
- Create: `src/components/calculator/mpt/mpt-results.tsx`

- [ ] **Step 1: Write integration tests**

Create `src/components/calculator/mpt/__tests__/mpt-page.test.tsx`:
- Fund selector renders fund list from mock data
- Selecting 2+ funds enables "Optimize" button
- Results show efficient frontier chart and portfolio weights

Expected: FAIL

- [ ] **Step 1b: Create fund selector**

User picks 2-10 funds from the `funds` table. Shows each fund's expected return and SD. Fetches correlation matrix from `fund_correlations`.

- [ ] **Step 2: Create results component**

Efficient frontier scatter chart. Max Sharpe portfolio highlighted with weights pie chart. Min Vol portfolio highlighted. Portfolio metrics table (return, risk, Sharpe ratio).

- [ ] **Step 3: Commit**

```bash
git add src/app/[locale]/(auth)/calculator/mpt/ src/components/calculator/mpt/
git commit -m "feat: add MPT asset allocation page with efficient frontier"
```

---

### Task 21: DCA Tracker Page

**Files:**
- Create: `src/app/[locale]/(auth)/calculator/dca/page.tsx`
- Create: `src/components/calculator/dca/dca-form.tsx`
- Create: `src/components/calculator/dca/dca-results.tsx`

- [ ] **Step 1: Write integration tests**

Create `src/components/calculator/dca/__tests__/dca-page.test.tsx`:
- Form renders DCA amount, fund selection, strategy toggles
- Results show 3-strategy comparison chart and trade log table

Expected: FAIL

- [ ] **Step 1b: Create DCA form**

Monthly amount, fund selection + weights, rebalancing frequency, glidepath toggle, DAA toggle.

- [ ] **Step 2: Create results**

3-strategy comparison line chart. Trade log table. Summary stats (final wealth, max drawdown, Sharpe ratio for each).

- [ ] **Step 3: Commit**

```bash
git add src/app/[locale]/(auth)/calculator/dca/ src/components/calculator/dca/
git commit -m "feat: add DCA tracker page with 3 strategy comparison"
```

---

### Task 22: Tax Optimizer Page

**Files:**
- Create: `src/app/[locale]/(auth)/calculator/tax/page.tsx`
- Create: `src/components/calculator/tax/tax-form.tsx`
- Create: `src/components/calculator/tax/tax-results.tsx`

- [ ] **Step 1: Write integration tests**

Create `src/components/calculator/tax/__tests__/tax-page.test.tsx`:
- Form renders income, deduction, SSF/RMF fields
- Results show before/after tax comparison chart and tax saved amount

Expected: FAIL

- [ ] **Step 1b: Create tax form**

Annual income, current deductions, SSF/RMF holdings, life insurance premiums, provident fund contributions.

- [ ] **Step 2: Create results**

Before/after tax comparison bar chart. Tax saved (big number). Recommended allocation breakdown. Lock-up period warnings.

- [ ] **Step 3: Commit**

```bash
git add src/app/[locale]/(auth)/calculator/tax/ src/components/calculator/tax/
git commit -m "feat: add Thai tax optimizer page with SSF/RMF optimization"
```

---

## Chunk 4: Dashboard, Profile, & Data Features

### Task 23: Dashboard Page

**Files:**
- Create: `src/app/[locale]/(auth)/dashboard/page.tsx`
- Create: `src/components/dashboard/health-score-card.tsx`
- Create: `src/components/dashboard/saved-plans-list.tsx`
- Create: `src/components/dashboard/progress-tracker.tsx`
- Create: `src/components/dashboard/recent-activity.tsx`
- Create: `src/components/dashboard/quick-actions.tsx`

- [ ] **Step 1: Create Health Score card**

Prominent gauge showing current Financial Health Score. Score breakdown on hover/click. "Improve your score" CTA. Shows delta from previous score if available.

- [ ] **Step 2: Create saved plans list**

Cards for each saved plan. Shows plan type icon, name, key result (gap/survival rate), date. Favorite toggle. Click to open. Side-by-side comparison mode.

- [ ] **Step 3: Create progress tracker**

"Your score improved from 45 → 62 this year" with sparkline chart. Milestone celebrations.

- [ ] **Step 4: Create recent activity feed and quick actions**

Recent: "You ran a retirement simulation", "You saved Plan A". Quick actions: "Run retirement planner", "Check tax optimizer".

- [ ] **Step 5: Wire up dashboard page**

Grid layout: Health score (top left), Quick actions (top right), Saved plans (middle), Progress (bottom left), Activity (bottom right).

- [ ] **Step 6: Commit**

```bash
git add src/app/[locale]/(auth)/dashboard/ src/components/dashboard/
git commit -m "feat: add dashboard with health score, saved plans, and progress tracking"
```

---

### Task 24: Profile/Settings Page

**Files:**
- Create: `src/app/[locale]/(auth)/profile/page.tsx`
- Create: `src/components/profile/profile-form.tsx`
- Create: `src/components/profile/preferences-form.tsx`
- Create: `src/components/profile/data-export.tsx`
- Create: `src/components/profile/danger-zone.tsx`

- [ ] **Step 1: Create profile form**

Display name, avatar, employment type. Update profile in Supabase.

- [ ] **Step 2: Create preferences form**

Language toggle (TH/EN), dark mode toggle, notification preferences.

- [ ] **Step 3: Create data export component**

"Download my data" button → API route that queries all user's saved_plans, chat_history, bookings → returns CSV or JSON zip.

- [ ] **Step 4: Create 2FA (TOTP) setup component**

Create `src/components/profile/two-factor-setup.tsx`:
- "Enable 2FA" button → generates TOTP secret via Supabase MFA API
- Shows QR code for authenticator app (Google Authenticator, Authy)
- Verification step: user enters 6-digit code to confirm
- "Disable 2FA" with password confirmation
- Status indicator: 2FA enabled/disabled

- [ ] **Step 5: Create danger zone**

"Delete my account" with confirmation dialog. Calls Supabase admin API to delete user + cascade.

- [ ] **Step 6: Create API route for data export**

Create `src/app/api/export/route.ts`: Authenticated, fetches all user data, returns zip file.

- [ ] **Step 7: Commit**

```bash
git add src/app/[locale]/(auth)/profile/ src/components/profile/ src/app/api/export/
git commit -m "feat: add profile/settings page with 2FA, data export, and account deletion"
```

---

### Task 25: PDF Export

**Files:**
- Create: `src/lib/pdf-generator.ts`
- Create: `src/app/api/pdf/route.ts`

- [ ] **Step 1: Install PDF library**

```bash
cd /Users/pasuthunjunkong/workspace/nub && npm install @react-pdf/renderer
```

- [ ] **Step 2: Create PDF generator**

Takes calculator results + inputs → generates branded PDF with Nub logo, charts as images, key stats, financial disclaimer.

- [ ] **Step 3: Create API route**

POST `/api/pdf` with plan data → returns PDF file.

- [ ] **Step 4: Add "Download PDF" button to all calculator result pages**

- [ ] **Step 5: Commit**

```bash
git add src/lib/pdf-generator.ts src/app/api/pdf/
git commit -m "feat: add branded PDF export for calculator results"
```

---

## Chunk 5: Content Pages — Blog, Glossary, Calendar, Legal

### Task 26: Blog Pages

**Files:**
- Create: `src/app/[locale]/(public)/blog/page.tsx` (blog listing)
- Create: `src/app/[locale]/(public)/blog/[slug]/page.tsx` (blog post)
- Create: `src/components/blog/blog-card.tsx`
- Create: `src/components/blog/blog-filters.tsx`

- [ ] **Step 1: Create blog listing page**

Grid of blog cards. Category filter tabs. Search input. Fetches from `blog_posts` table. Bilingual: show `title_th`/`title_en` based on locale. SEO schema markup (Article).

- [ ] **Step 2: Create blog post page**

Markdown rendering. Cover image. Category badge. Published date. Share buttons. Related posts. SEO structured data.

- [ ] **Step 3: Commit**

```bash
git add src/app/[locale]/(public)/blog/ src/components/blog/
git commit -m "feat: add blog listing and post pages with SEO"
```

---

### Task 27: Glossary Pages

**Files:**
- Create: `src/app/[locale]/(public)/glossary/page.tsx` (searchable listing)
- Create: `src/app/[locale]/(public)/glossary/[term]/page.tsx` (individual term)
- Create: `src/components/glossary/glossary-search.tsx`
- Create: `src/components/glossary/glossary-card.tsx`

- [ ] **Step 1: Create glossary listing**

Searchable, filterable by category. Alphabetical/category grouping. Each term links to its own page.

- [ ] **Step 2: Create individual term page**

Term in TH + EN, full definition, related terms links. SEO optimized.

- [ ] **Step 3: Commit**

```bash
git add src/app/[locale]/(public)/glossary/ src/components/glossary/
git commit -m "feat: add glossary pages with search and individual term SEO"
```

---

### Task 28: Financial Calendar Page

**Files:**
- Create: `src/app/[locale]/(public)/calendar/page.tsx`
- Create: `src/components/calendar/calendar-view.tsx`
- Create: `src/components/calendar/event-card.tsx`

- [ ] **Step 1: Create calendar view**

Monthly/yearly view. Color-coded by event type. Fetches from `calendar_events` table.

- [ ] **Step 2: Commit**

```bash
git add src/app/[locale]/(public)/calendar/ src/components/calendar/
git commit -m "feat: add Thai financial calendar page"
```

---

### Task 29: Legal, Methodology, Contact, About Pages

**Files:**
- Create: `src/app/[locale]/(public)/legal/page.tsx`
- Create: `src/app/[locale]/(public)/methodology/page.tsx`
- Create: `src/app/[locale]/(public)/contact/page.tsx`
- Create: `src/app/[locale]/(public)/about/page.tsx`

- [ ] **Step 1: Create legal page**

Financial disclaimer + PDPA privacy policy + cookie policy. Bilingual.

- [ ] **Step 2: Create methodology page**

Explain all calculation formulas with mathematical notation. Reference academic sources. Show audit trail concept.

- [ ] **Step 3: Create contact page**

Contact form (name, email, message) → saves to `bookings` table. Optional Calendly embed for advisor booking.

- [ ] **Step 4: Create about page**

About "Nub" platform. Dr. Nub AFPT credentials (AFPT no. 250238, IC License no. 136911). Mission statement. Team/founder bio.

- [ ] **Step 5: Commit**

```bash
git add src/app/[locale]/(public)/legal/ src/app/[locale]/(public)/methodology/ src/app/[locale]/(public)/contact/ src/app/[locale]/(public)/about/
git commit -m "feat: add legal, methodology, contact, and about pages"
```

---

### Task 30: Landing Page

**Files:**
- Create: `src/app/[locale]/(public)/page.tsx` (or update existing)
- Create: `src/components/landing/hero.tsx`
- Create: `src/components/landing/features.tsx`
- Create: `src/components/landing/testimonials.tsx`
- Create: `src/components/landing/cta-section.tsx`

- [ ] **Step 1: Create hero section**

Big headline (bilingual), subtitle explaining value prop, CTA button "Start Planning Free", Lottie animation of retirement visualization.

- [ ] **Step 2: Create features section**

6 feature cards (one per calculator). Icon + title + description for each.

- [ ] **Step 3: Create testimonials and CTA**

Placeholder testimonials (to be replaced with real ones). Final CTA section.

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/(public)/ src/components/landing/
git commit -m "feat: add landing page with hero, features, and CTA"
```

---

## Chunk 6: Social Features — AI Chat, Community Forum, Fund Screener

### Task 31: AI Chatbot

**Files:**
- Create: `src/app/[locale]/(auth)/chat/page.tsx`
- Create: `src/components/chat/chat-interface.tsx`
- Create: `src/components/chat/chat-message.tsx`
- Create: `src/app/api/chat/route.ts`

- [ ] **Step 1: Create chat API route**

POST `/api/chat`:
1. Check auth
2. Check rate limit (query `chat_daily_usage`, enforce 5/day for free)
3. Fetch user profile + saved plans for context
4. Call Claude API with system prompt (financial advisor, not financial advice, bilingual)
5. Stream response back
6. Save to `chat_history`
7. Increment `chat_daily_usage`

- [ ] **Step 2: Create chat interface**

Full-screen chat UI. Message list with user/assistant bubbles. Input box with send button. Streaming response display. Rate limit indicator ("3/5 questions used today").

- [ ] **Step 3: Create chat page**

Route: `/chat`. Shows chat history from `chat_history` table. New conversation button.

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/(auth)/chat/ src/components/chat/ src/app/api/chat/
git commit -m "feat: add AI chatbot with Claude API and rate limiting"
```

---

### Task 32: Community Forum

**Files:**
- Create: `src/app/[locale]/(auth)/community/page.tsx` (forum listing)
- Create: `src/app/[locale]/(auth)/community/[postId]/page.tsx` (thread view)
- Create: `src/app/[locale]/(auth)/community/new/page.tsx` (new post)
- Create: `src/components/community/post-card.tsx`
- Create: `src/components/community/post-form.tsx`
- Create: `src/components/community/reply-form.tsx`
- Create: `src/components/community/vote-button.tsx`

- [ ] **Step 1: Create forum listing**

Category tabs (retirement/investing/tax/general). Post cards with title, author, upvotes, reply count. Sort by newest/most upvoted. Pinned posts at top.

- [ ] **Step 2: Create thread view**

Original post + all replies. Vote buttons (upvote only, no downvote). Reply form at bottom. Report button.

- [ ] **Step 3: Create new post form**

Category selector, title, content (markdown). Submit creates `forum_posts` entry.

- [ ] **Step 4: Create vote button**

Optimistic update. Inserts/deletes from `forum_votes`. Updates upvote count on post/reply.

- [ ] **Step 5: Commit**

```bash
git add src/app/[locale]/(auth)/community/ src/components/community/
git commit -m "feat: add community forum with posts, replies, and voting"
```

---

### Task 33: Fund Screener

**Files:**
- Create: `src/app/[locale]/(auth)/funds/page.tsx`
- Create: `src/components/funds/fund-table.tsx`
- Create: `src/components/funds/fund-filters.tsx`
- Create: `src/components/funds/fund-comparison.tsx`
- Create: `src/components/funds/fund-detail-modal.tsx`

- [ ] **Step 1: Create fund table**

Sortable table: ticker, name, category, expected return, SD, ROIC, Sharpe ratio. Fetches from `funds` table. "Last updated" date shown.

- [ ] **Step 2: Create filters**

Category filter, return range slider, risk range slider, search by name/ticker.

- [ ] **Step 3: Create comparison mode**

Select 2-3 funds → side-by-side comparison card. Correlation between selected funds from `fund_correlations`.

- [ ] **Step 4: Create fund detail modal**

Click fund → modal with full details, ROIC history chart, NAV history chart, affiliate link button.

- [ ] **Step 5: Commit**

```bash
git add src/app/[locale]/(auth)/funds/ src/components/funds/
git commit -m "feat: add fund screener with filters, comparison, and affiliate links"
```

---

## Chunk 7: PWA, Analytics, Social Sharing, Final Polish

### Task 34: PWA Setup

**Files:**
- Create: `public/manifest.json`
- Create: `public/icons/` (icon-192.png, icon-512.png)
- Modify: `src/app/[locale]/layout.tsx` (add manifest link, meta tags)

- [ ] **Step 1: Create PWA manifest**

App name: "Nub", short name: "Nub", theme color: #4F7CF7, background: #F8FAFC, display: standalone, start_url: "/dashboard".

- [ ] **Step 2: Add app icons**

Create placeholder icons (192x192, 512x512) with Nub branding.

- [ ] **Step 3: Configure next-pwa in next.config.ts**

Add `next-pwa` wrapper to `next.config.ts`:
```typescript
import withPWA from "next-pwa";
```
Configure caching strategies per spec Section 14.2:
- Static assets: cache-first
- Calculator pages: stale-while-revalidate
- Fund data: network-first, fallback to cache
- User data: network-only
- Blog posts: stale-while-revalidate

Verify: `npm run build` generates service worker in `.next/`

- [ ] **Step 4: Add meta tags for mobile**

Viewport, theme-color, apple-mobile-web-app-capable, apple-touch-icon.

- [ ] **Step 5: Commit**

```bash
git add public/manifest.json public/icons/ src/app/
git commit -m "feat: add PWA support with manifest and service worker"
```

---

### Task 35: Posthog Analytics

**Files:**
- Create: `src/lib/analytics.ts`
- Create: `src/components/shared/analytics-provider.tsx`

- [ ] **Step 1: Create analytics wrapper**

Initialize Posthog client. Create `track()` helper function. Event names from spec Section 13.1.

- [ ] **Step 2: Create provider component**

Wrap app with Posthog provider. Identify user on auth. Track page views automatically.

- [ ] **Step 3: Add tracking to all calculators**

`calculator_started`, `calculator_completed`, `plan_saved`, `share_clicked` events in relevant components.

- [ ] **Step 4: Commit**

```bash
git add src/lib/analytics.ts src/components/shared/analytics-provider.tsx
git commit -m "feat: add Posthog analytics with calculator tracking events"
```

---

### Task 36: Social Sharing & OG Images

**Files:**
- Create: `src/app/api/og/route.tsx` (OG image generation)
- Create: `src/components/shared/share-buttons.tsx`

- [ ] **Step 1: Create OG image API route**

Uses Next.js `ImageResponse` to generate branded cards with key stats (survival rate, score, gap). Accepts plan data as query params.

- [ ] **Step 2: Create share buttons component**

LINE and Facebook share buttons. Generate share URL with OG image.

- [ ] **Step 3: Add share buttons to all calculator result pages**

- [ ] **Step 4: Commit**

```bash
git add src/app/api/og/ src/components/shared/share-buttons.tsx
git commit -m "feat: add social sharing with LINE/Facebook and OG image generation"
```

---

### Task 37: Cookie Consent Banner

**Files:**
- Create: `src/components/shared/cookie-consent.tsx`
- Create: `src/components/shared/__tests__/cookie-consent.test.tsx`

- [ ] **Step 1: Write test for cookie consent**

Create `src/components/shared/__tests__/cookie-consent.test.tsx`:
- Banner renders when no consent in localStorage
- Banner hides after clicking "Accept"
- Banner hides after clicking "Decline"
- localStorage stores consent preference
- Posthog `opt_out_capturing()` is called when declined
- Posthog `opt_in_capturing()` is called when accepted
- Banner does not render if consent already stored

Run: `cd /Users/pasuthunjunkong/workspace/nub && npx vitest run src/components/shared/__tests__/cookie-consent.test.tsx`
Expected: FAIL

- [ ] **Step 2: Create cookie consent banner**

Bottom banner: "We use cookies..." with Accept/Decline buttons. Saves preference to localStorage. Blocks Posthog until accepted. PDPA compliant.

- [ ] **Step 3: Run test to verify it passes**

Run: `cd /Users/pasuthunjunkong/workspace/nub && npx vitest run src/components/shared/__tests__/cookie-consent.test.tsx`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/shared/cookie-consent.tsx src/components/shared/__tests__/cookie-consent.test.tsx
git commit -m "feat: add PDPA-compliant cookie consent banner with tests"
```

---

### Task 38: Plan Comparison View

**Files:**
- Create: `src/components/dashboard/plan-comparison.tsx`
- Create: `src/components/dashboard/__tests__/plan-comparison.test.tsx`

- [ ] **Step 1: Write test for plan comparison**

Create `src/components/dashboard/__tests__/plan-comparison.test.tsx`:
- Renders two plans side by side
- Shows key metrics for each (gap, survival rate, health score)
- Highlights differences (green for better, red for worse)
- Shows "Select plans to compare" when fewer than 2 selected

- [ ] **Step 2: Implement plan comparison component**

Side-by-side layout. Select 2 plans from saved_plans. Shows: inputs diff, results diff, chart overlay (both wealth projections on same chart). Color-coded differences.

- [ ] **Step 3: Wire into dashboard**

Add "Compare" button to saved plans list. Opens comparison view.

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/plan-comparison.tsx src/components/dashboard/__tests__/
git commit -m "feat: add plan comparison view for side-by-side analysis"
```

---

### Task 39: Notifications UI

**Files:**
- Create: `src/components/layout/notification-bell.tsx`
- Create: `src/components/notifications/notification-list.tsx`
- Create: `src/hooks/use-notifications.ts`

- [ ] **Step 1: Create notification hook**

`use-notifications.ts`: Fetches unread notifications from `notifications` table. Returns `{ notifications, unreadCount, markAsRead, markAllAsRead }`. Polls every 60 seconds.

- [ ] **Step 2: Create notification bell**

Bell icon in header/sidebar. Badge showing unread count. Click opens dropdown with notification list.

- [ ] **Step 3: Create notification list**

Dropdown/panel showing notifications. Click marks as read. "Mark all as read" button. Empty state with Lottie animation.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/notification-bell.tsx src/components/notifications/ src/hooks/use-notifications.ts
git commit -m "feat: add notifications UI with bell icon and dropdown"
```

---

### Task 40: Milestone Celebrations & Lottie Integration

**Files:**
- Create: `src/components/shared/milestone-celebration.tsx`
- Create: `src/components/shared/lottie-loader.tsx`
- Create: `src/components/shared/empty-state.tsx`
- Create: `src/hooks/use-milestones.ts`
- Create: `public/lottie/loading.json` (placeholder)
- Create: `public/lottie/empty.json` (placeholder)
- Create: `public/lottie/celebration.json` (placeholder)

- [ ] **Step 1: Create Lottie loader component**

Generic wrapper for Lottie animations. Used for loading states across the app. Accepts animation data URL.

- [ ] **Step 2: Create empty state component**

Friendly Lottie animation + message for empty lists (no saved plans, no notifications, no chat history).

- [ ] **Step 3: Create milestone celebration component**

Triggered when user reaches milestones:
- First plan saved: "Great start!"
- Score > 50: "You're on track!"
- Score > 80: "Excellent! 🎉"
- Savings > 1M: "Millionaire milestone!"
- 50% to goal: "Halfway there!"

Shows as a modal with Lottie animation + congratulatory message. Dismissible. Only shows once per milestone (track in localStorage).

- [ ] **Step 4: Create milestones hook**

`use-milestones.ts`: Checks current user state against milestone thresholds. Returns milestones to celebrate.

- [ ] **Step 5: Wire milestones into dashboard and calculator results**

Check milestones after each calculation and on dashboard load.

- [ ] **Step 6: Add Lottie loaders to all loading states**

Replace skeleton loaders with Lottie animations in: calculator pages (while computing), chat (while AI responds), fund screener (while loading), dashboard (initial load).

- [ ] **Step 7: Commit**

```bash
git add src/components/shared/milestone-celebration.tsx src/components/shared/lottie-loader.tsx src/components/shared/empty-state.tsx src/hooks/use-milestones.ts public/lottie/
git commit -m "feat: add milestone celebrations, Lottie loaders, and empty states"
```

---

### Task 41: Share Message Customization

**Files:**
- Modify: `src/components/shared/share-buttons.tsx`
- Create: `src/components/shared/share-dialog.tsx`

- [ ] **Step 1: Create share dialog**

Modal that opens when "Share" is clicked. Shows:
- Preview of the OG image card
- Editable share message text (pre-filled with key stats)
- Platform selector (LINE / Facebook / Copy link)
- "Share" button sends to selected platform

- [ ] **Step 2: Wire into all calculator result pages**

Replace direct share buttons with "Share" button that opens share dialog.

- [ ] **Step 3: Commit**

```bash
git add src/components/shared/share-dialog.tsx src/components/shared/share-buttons.tsx
git commit -m "feat: add customizable share message dialog"
```

---

### Task 42: Accessibility (WCAG AA) Audit & Fixes

**Files:**
- Modify: Multiple component files across the app

- [ ] **Step 1: Install accessibility testing tools**

```bash
cd /Users/pasuthunjunkong/workspace/nub && npm install -D @axe-core/react eslint-plugin-jsx-a11y
```

- [ ] **Step 2: Add jsx-a11y ESLint plugin**

Update `eslint.config.mjs` to include `jsx-a11y` recommended rules.

- [ ] **Step 3: Run lint and fix all a11y violations**

Run: `cd /Users/pasuthunjunkong/workspace/nub && npm run lint`
Fix: All jsx-a11y warnings/errors. Common fixes:
- Add `aria-label` to icon-only buttons (sidebar collapse, dark mode toggle, language toggle)
- Add `role` and `aria-*` attributes to chart components
- Ensure all `<img>` have `alt` text
- Add `aria-live="polite"` to Monte Carlo progress indicator
- Ensure color contrast ratios meet WCAG AA (4.5:1 for text, 3:1 for large text)

- [ ] **Step 4: Add keyboard navigation**

- Tab order flows logically through all pages
- Stepper form: Enter advances step, Escape goes back
- Modal dialogs: focus trap, Escape closes
- Sidebar: keyboard navigable, collapsible with keyboard
- Calculator results: accessible chart alternatives (data tables)

- [ ] **Step 5: Add screen reader support for charts**

Each chart component gets a `<table>` fallback with `sr-only` class that shows the data in tabular form. Recharts `<AccessibilityTable>` pattern.

- [ ] **Step 6: Run axe accessibility audit**

Run dev server, check with axe DevTools or `@axe-core/react` in dev mode.
Expected: No critical or serious violations.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add WCAG AA accessibility — keyboard nav, screen readers, contrast"
```

---

### Task 43: Error Boundaries & Suspense Loading States

**Files:**
- Create: `src/components/shared/error-boundary.tsx`
- Create: `src/components/shared/calculator-suspense.tsx`

- [ ] **Step 1: Create error boundary**

React error boundary that catches rendering errors. Shows friendly "Something went wrong" message with retry button. Reports to Posthog.

- [ ] **Step 2: Create calculator suspense wrapper**

Wraps each calculator page with `<Suspense>` fallback showing Lottie loading animation. Used for data fetching (fund data, user plans).

- [ ] **Step 3: Wrap all calculator pages with error boundary + suspense**

- [ ] **Step 4: Commit**

```bash
git add src/components/shared/error-boundary.tsx src/components/shared/calculator-suspense.tsx
git commit -m "feat: add error boundaries and suspense loading states"
```

---

### Task 44: Animated Counters & Confetti

**Files:**
- Create: `src/components/shared/animated-counter.tsx`
- Create: `src/components/shared/confetti.tsx`
- Create: `src/hooks/use-animated-number.ts`

Note: `canvas-confetti` already installed in Task 1 Step 3.

- [ ] **Step 1: Create animated counter**

Hook that animates from 0 to target number over 1 second. Used for all big numbers in results.

- [ ] **Step 3: Create confetti trigger**

Fires confetti when survival rate > 90% or health score > 80. Triggered from result components.

- [ ] **Step 4: Wire up to calculator results**

Replace static numbers with `<AnimatedCounter>` in all result components.

- [ ] **Step 5: Commit**

```bash
git add src/components/shared/animated-counter.tsx src/components/shared/confetti.tsx src/hooks/use-animated-number.ts
git commit -m "feat: add animated counters and confetti celebrations"
```

---

### Task 45: Final Integration, Build & Deploy

- [ ] **Step 1: Run full test suite**

```bash
cd /Users/pasuthunjunkong/workspace/nub && npx vitest run
```
Expected: All tests pass

- [ ] **Step 2: Run build**

```bash
cd /Users/pasuthunjunkong/workspace/nub && npm run build
```
Expected: Build succeeds with no errors

- [ ] **Step 3: Run lint**

```bash
cd /Users/pasuthunjunkong/workspace/nub && npm run lint
```
Expected: No lint errors

- [ ] **Step 4: Lighthouse check**

Run dev server and check Lighthouse scores for:
- Landing page (target: >90 all categories)
- Dashboard (target: >80 performance)
- Calculator page (target: >80 performance)

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore: final integration and build verification"
```

- [ ] **Step 6: Deploy to Vercel**

```bash
vercel --prod
```

---

## Summary

| Chunk | Tasks | What it builds |
|-------|-------|----------------|
| 1: Foundation | 1-8 | Project setup, design system, Supabase, auth, i18n, layouts, onboarding |
| 2: Math & Workers | 9-15 | Finance math library, 6 Web Workers with tests |
| 3: Calculator UI | 16-22 | Chart components, 6 calculator pages |
| 4: Dashboard & Profile | 23-25 | Dashboard, profile/settings (with 2FA), PDF export |
| 5: Content | 26-30 | Blog, glossary, calendar, legal, about, landing page |
| 6: Social | 31-33 | AI chatbot, community forum, fund screener |
| 7: Polish | 34-45 | PWA, analytics, sharing, plan comparison, notifications, milestones, Lottie, a11y, error boundaries, animations, deploy |

**Total: 45 tasks across 7 chunks**

**Dependency Graph:**
```
[Chunk 1: Foundation]
    ├── [Chunk 2: Math & Workers] ──┐
    ├── [Chunk 5: Content]          ├── [Chunk 3: Calculator UI] ──┐
    └── [Chunk 6: Social]           │                              │
                                    └── [Chunk 4: Dashboard] ──────┤
                                                                   └── [Chunk 7: Polish & Deploy]
```

- Chunk 1 must complete first (all others depend on it)
- Chunk 2 and Chunk 5 and Chunk 6 can run in parallel (independent of each other)
- Chunk 3 depends on Chunk 2 (needs workers for calculator pages)
- Chunk 4 depends on Chunk 3 (dashboard shows saved calculator results)
- Chunk 7 depends on all others (integration, a11y audit, deploy)
