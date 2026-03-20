# Nub — Retirement Planning Platform

## Commands

```bash
npm run dev          # Start dev server (Next.js 16 + Turbopack)
npm run build        # Production build
npm run start        # Serve production build
npm run lint         # ESLint
npx vitest run       # Run all tests (Vitest + jsdom)
npx tsc --noEmit     # Type check
vercel --prod        # Deploy to production (Vercel linked, no git remote)
```

## Architecture

**Stack**: Next.js 16 (App Router) · Supabase (auth + Postgres + RLS) · Tailwind CSS v4 · shadcn/ui (Radix) · Recharts · next-intl (Thai/English) · Vitest

```
src/
├── app/[locale]/(auth)/        # Authenticated pages (sidebar layout)
│   ├── calculator/             # 12 calculator pages
│   │   ├── retirement/         # Retirement gap analysis
│   │   ├── withdrawal/         # Monte Carlo withdrawal sim
│   │   ├── stress-test/        # Portfolio stress testing
│   │   ├── mpt/                # Modern Portfolio Theory optimizer
│   │   ├── dca/                # DCA strategy comparison
│   │   ├── tax/                # Thai tax optimizer
│   │   ├── cashflow/           # Monthly cashflow tracker (Supabase CRUD)
│   │   ├── roic/               # ROIC stock analysis
│   │   ├── gpf-optimizer/      # GPF (กบข.) portfolio optimizer
│   │   ├── tipp/               # TIPP/VPPI floor protection
│   │   └── bumnan95/           # Bumnan 95 pension Monte Carlo
│   ├── dashboard/              # Bento grid dashboard
│   ├── portfolio-health/       # Portfolio health scoring
│   └── funds/                  # Fund screener (Supabase)
├── app/[locale]/(public)/      # Public pages (header layout)
│   ├── login/                  # Auth with Google/LINE/email
│   └── ...                     # Landing, blog, glossary, etc.
├── app/api/                    # Route handlers (chat, pdf, og, export)
├── components/
│   ├── ui/                     # shadcn/ui primitives (Card has variant prop)
│   ├── calculator/             # Calculator-specific components
│   ├── dashboard/              # Dashboard widgets
│   ├── layout/                 # Sidebar, BottomNav, Header, AuthLayout
│   └── shared/                 # NubLogo, ErrorBoundary, FinancialDisclaimer
├── workers/                    # Sync calculator functions (NOT real Web Workers)
├── hooks/                      # use-*-worker hooks (state + error handling)
├── lib/                        # Math libraries, Supabase client, utils
│   ├── finance-math.ts         # VaR, CVaR, Cholesky, Monte Carlo, seededRandom
│   ├── cashflow-math.ts        # Cashflow ratios + lifestyle breakdown
│   ├── roic-math.ts            # NOPAT, Sloan, fair value
│   ├── correlation-utils.ts    # Correlation matrix builders
│   ├── analytics.ts            # PostHog wrapper (track, Events)
│   └── supabase/               # Client + server Supabase helpers
├── types/
│   ├── calculator.ts           # All calculator input/result types
│   └── database.ts             # Supabase row types, PlanType union (12 types)
└── messages/                   # en.json + th.json (next-intl)
```

## Key Patterns

**Workers are synchronous** — files in `src/workers/` are regular functions, not Web Workers. Heavy calculators use `requestAnimationFrame()` to yield before computation.

**Calculator page pattern**:
```
page.tsx → form component → worker function → result components
         → page-header-gradient banner + animate-fade-in wrapper
         → stagger-children on results section
```

**Card variants**: `<Card variant="default|elevated|glass|gradient|inset">` — defined in `globals.css` utility classes.

**i18n**: All UI text uses `useTranslations()` from next-intl. Translation keys in `messages/en.json` and `messages/th.json`.

## Environment Variables

Copy `.env.local.example` to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=       # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Supabase anon key
ANTHROPIC_API_KEY=              # For AI chat feature
NEXT_PUBLIC_POSTHOG_KEY=        # Optional: analytics
NEXT_PUBLIC_POSTHOG_HOST=       # Optional: analytics
```

## Database

- Migrations in `supabase/migrations/` (001 initial, 002 cashflow/wealth/ROIC tables)
- RLS enabled on all tables — policies require `auth.uid()`
- `saved_plans` table stores all calculator results as JSONB
- `PlanType` enum: retirement, withdrawal, stress_test, mpt, dca, tax, cashflow, roic, gpf_optimizer, tipp, portfolio_health, bumnan95

## Testing

- **Framework**: Vitest + jsdom
- **Component tests** must mock next-intl: `vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }))`
- **Math tests** are pure functions — no mocking needed
- 1 known flaky test: `bumnan95.test.ts` Monte Carlo success rate ordering (stochastic)

## Gotchas

- **Tailwind v4**: Uses `@theme inline` block in `globals.css`, not `tailwind.config.ts`
- **No git remote**: Deploy via `vercel --prod` CLI only (project linked via `.vercel/`)
- **`formatThaiCurrency()`** in `src/lib/utils.ts` — use for THB formatting
- **Metadata `themeColor`**: Build warns about themeColor in metadata — should use `generateViewport` instead (low priority)
- **`middleware.ts`**: Deprecated in Next.js 16 — should be renamed to `proxy.ts`

## Deployment

Vercel project: `nub` (team: pasuthun-junkongs-projects)
Production URL: https://nub-six.vercel.app
