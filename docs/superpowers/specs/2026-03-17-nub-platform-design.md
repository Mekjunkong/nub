# Nub Platform — Design Specification

**Date:** 2026-03-17
**Status:** Draft
**Author:** Design collaboration between user and Claude

---

## 1. Product Overview

### 1.1 What is Nub?

Nub is a bilingual (Thai/English) web platform that provides everyday Thai consumers with self-service retirement planning tools. It combines quantitative financial calculators (Monte Carlo simulation, Modern Portfolio Theory optimization, stress testing) with a friendly, approachable interface that makes complex financial planning accessible to non-experts.

### 1.2 Brand Identity

- **Name:** Nub (standalone product brand)
- **Tone:** Friendly, approachable, trustworthy
- **Relationship to Dr. Nub AFPT:** Dr. Nub is mentioned only on the "About" page. The platform operates as an independent product brand.

### 1.3 Target Users

Everyday Thai consumers who want to self-service their own retirement planning. Not financial professionals — people who may have limited financial literacy but want to take control of their future.

### 1.4 Business Model

- **Phase 1 (now):** All features free. Build user base and trust.
- **Phase 2 (future):** Premium subscription tier with advanced features. Additional revenue from affiliate links, sponsored fund placement, insurance lead generation, white-label licensing, and partner APIs.

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth | Supabase Auth (Google, LINE, Email/Password, optional 2FA) |
| Database | Supabase PostgreSQL with Row Level Security |
| Charts | Recharts |
| Animations | Lottie (via lottie-react) |
| i18n | next-intl (Thai/English) |
| Analytics | Posthog |
| Calculations | Client-side Web Workers |
| PWA | next-pwa with Service Worker caching |
| AI Chat | Claude API (Anthropic SDK) |
| Future Payments | Stripe |
| Deployment | Vercel |

---

## 3. Architecture

```
+--------------------------------------------------+
|                  Next.js App                      |
|            (App Router, next-intl TH/EN)          |
+--------+-----------------+-----------+-----------+
| Public | Auth Required   | Future:   | Admin     |
| Pages  | Pages           | Premium   | (Future)  |
+--------+-----------------+-----------+-----------+
|                                                    |
|  +----------------------------------------------+ |
|  |         Client-Side Calculation Engine        | |
|  |  (Web Workers — non-blocking UI thread)       | |
|  |  retirement | monte-carlo | stress-test       | |
|  |  mpt-optimizer | dca-tracker | tax-optimizer  | |
|  +----------------------------------------------+ |
|                                                    |
|  +----------------------------------------------+ |
|  |              Supabase Backend                 | |
|  |  Auth | PostgreSQL | RLS | Storage            | |
|  |  subscription_tier column for future gating   | |
|  +----------------------------------------------+ |
|                                                    |
|  +----------------------------------------------+ |
|  |           External Integrations               | |
|  |  Claude API | Stripe | LINE | Posthog         | |
|  +----------------------------------------------+ |
+--------------------------------------------------+
```

### 3.1 Key Architectural Decisions

1. **All calculations run client-side in Web Workers** — zero server cost for computation, instant feedback, UI never freezes.
2. **Supabase handles auth + data persistence** — user profiles, saved plans, fund data, blog content.
3. **`subscription_tier` field on user profile** — middleware checks this before rendering premium features. Values: `free` | `premium`.
4. **Calculator inputs/results stored as JSONB** — flexible schema, no migration needed when calculator logic changes.
5. **Bilingual fields (`_th` / `_en`)** on content tables — simpler than a separate translations table for just 2 languages.
6. **Progressive Monte Carlo** — show quick results (5K rounds) immediately, then refine to 60K in background. **Phase 1:** All users get full 60K progressive refinement. **Future premium gating:** Free users capped at 5K rounds; premium users get full 60K refinement.

---

## 4. Pages & Routing

### 4.1 Public Pages (no auth required)

| Route | Page | Purpose |
|-------|------|---------|
| `/` | Landing | Hero, value prop, feature highlights, testimonials, CTA |
| `/blog` | Blog | Articles with categories, search, SEO schema markup |
| `/blog/[slug]` | Blog Post | Individual article |
| `/contact` | Contact/Booking | Contact form, advisor booking (Calendly embed) |
| `/legal` | Legal/PDPA | Disclaimer, privacy policy, PDPA compliance |
| `/methodology` | Methodology | Calculation formulas, references, audit trail |
| `/glossary` | Glossary | Searchable Thai financial terms dictionary |
| `/glossary/[term]` | Glossary Term | Individual term page (SEO) |
| `/calendar` | Financial Calendar | Thai financial calendar — tax deadlines, SSF/RMF windows, GPF dates |
| `/login` | Login/Register | Google, LINE, email/password auth |

### 4.2 Auth-Required Pages

| Route | Page | Purpose |
|-------|------|---------|
| `/dashboard` | Dashboard | Financial Health Score, saved plans, progress tracking, recent activity |
| `/calculator/retirement` | Retirement Planner | Employment type selector, adaptive form, results with charts |
| `/calculator/withdrawal` | Withdrawal Simulator | Monte Carlo simulation, survival rate, scenario comparison |
| `/calculator/stress-test` | Stress Test | Black Swan, VaR, doubling probability, 4 scenarios |
| `/calculator/mpt` | Asset Allocation | Portfolio optimizer, efficient frontier, correlation matrix |
| `/calculator/dca` | DCA Tracker | Static vs Glidepath vs DAA, trade log, rebalancing |
| `/calculator/tax` | Tax Optimizer | SSF/RMF/ประกันชีวิต deduction optimizer |
| `/chat` | AI Chatbot | Claude-powered Q&A based on user profile + saved plans |
| `/funds` | Fund Screener | Compare กองทุน, ROIC analysis, filters, affiliate links |
| `/community` | Community Forum | User discussions, Q&A, categories |
| `/profile` | Profile/Settings | Language, dark mode, notifications, data export (CSV/JSON download), 2FA |

---

## 5. User Tiers & Feature Gating

### 5.1 Current Phase: All Free

All features available to all authenticated users. No restrictions.

### 5.2 Future Premium Tier

| Feature | Free | Premium |
|---------|------|---------|
| Retirement Planner | All employment types | Same |
| Withdrawal Simulator | Progressive 5K→60K | Same |
| Stress Test | Full 4 scenarios | Same |
| Monte Carlo Rounds | 5,000 rounds (no progressive refinement) | 60,000 full progressive refinement |
| Asset Allocation (MPT) | View-only suggested allocation | Full optimizer, custom constraints |
| Fund Screener | Top 10 funds, basic filters | Full database, advanced filters |
| DCA Tracker | 1 saved plan | Unlimited, rebalancing alerts |
| Tax Optimizer | Basic calculation | Optimization suggestions |
| AI Chatbot | 5 questions/day | Unlimited |
| PDF Export | Basic 1-page summary | Full branded multi-page report |
| Saved Plans | 3 plans max | Unlimited |
| Email Summary | Monthly | Weekly + on-demand |
| Share Results | Basic social card | Custom branded card |
| Booking Advisor | Contact form only | Priority booking, video call |
| Dark Mode | Yes | Yes |
| PWA/Offline | Saved plans only | Full offline calculators |
| Notifications | None | Market alerts, plan review reminders |
| Community | Read + post | Badges, priority support |

### 5.3 Implementation

- `subscription_tier` column on `profiles` table: `'free'` or `'premium'`
- Next.js middleware checks tier before rendering gated features
- Soft paywall UI: blurred preview of results + "Upgrade to unlock" CTA
- Stripe webhook updates `subscription_tier` and `subscription_expires_at`

---

## 6. Data Model

### 6.1 profiles (extends Supabase auth.users)

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK, FK → auth.users) | User ID |
| display_name | text | User's display name |
| avatar_url | text | Profile picture URL |
| employment_type | enum: government/private/freelance | For adaptive calculator |
| language | enum: th/en | UI language preference |
| dark_mode | boolean | Dark mode toggle |
| role | enum: user/admin | User role (admin for moderation, blog, fund management) |
| subscription_tier | enum: free/premium | Current tier |
| subscription_expires_at | timestamptz (nullable) | Premium expiry |
| financial_health_score | integer (0-100, nullable) | Latest calculated score |
| onboarding_completed | boolean | First-time wizard done |
| created_at | timestamptz | Account creation |
| updated_at | timestamptz | Last update |

### 6.2 saved_plans

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Plan ID |
| user_id | uuid (FK → profiles) | Owner |
| plan_type | enum: retirement/withdrawal/stress_test/mpt/dca/tax | Calculator type |
| name | text | User-given name |
| inputs | jsonb | All calculator inputs |
| results | jsonb | Cached calculation results |
| is_favorite | boolean | Pinned plan |
| version | integer | For version history |
| parent_version_id | uuid (nullable, FK → saved_plans) | Previous version |
| created_at | timestamptz | Creation time |
| updated_at | timestamptz | Last update |

### 6.3 blog_posts

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Post ID |
| slug | text (unique) | URL slug |
| title_th | text | Thai title |
| title_en | text | English title |
| content_th | text | Thai content (markdown) |
| content_en | text | English content (markdown) |
| category | enum: retirement/investing/tax/lifestyle/course | Category |
| cover_image_url | text | Cover image |
| seo_description_th | text | Thai SEO description |
| seo_description_en | text | English SEO description |
| published | boolean | Published status |
| published_at | timestamptz | Publish date |
| created_at | timestamptz | Creation time |
| updated_at | timestamptz | Last update |

### 6.4 funds

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Fund ID |
| ticker | text (unique) | e.g., SCBRMS&P500 |
| name_th | text | Thai name |
| name_en | text | English name |
| category | enum: equity/bond/gold/mixed/money_market | Fund type |
| expected_return | numeric | Expected annual return |
| standard_deviation | numeric | Annual standard deviation |
| roic_current | numeric | Current ROIC |
| roic_history | jsonb | Yearly ROIC values |
| nav_history | jsonb | Monthly NAV values |
| affiliate_url | text (nullable) | Broker purchase link |
| updated_at | timestamptz | Last data update |
| source_url | text | Data source reference |

### 6.5 fund_correlations

| Column | Type | Description |
|--------|------|-------------|
| fund_a_id | uuid (FK → funds) | First fund |
| fund_b_id | uuid (FK → funds) | Second fund |
| correlation | numeric | Correlation coefficient |
| computed_at | timestamptz | Computation date |
| **PK** | (fund_a_id, fund_b_id) | Composite key |

### 6.6 bookings

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Booking ID |
| user_id | uuid (FK → profiles) | Requester |
| booking_type | enum: contact/priority | Type |
| message | text | User message |
| preferred_date | date (nullable) | Preferred date |
| status | enum: pending/confirmed/completed/cancelled | Status |
| created_at | timestamptz | Creation time |
| updated_at | timestamptz | Last update |

### 6.7 forum_posts

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Post ID |
| user_id | uuid (FK → profiles) | Author |
| category | enum: retirement/investing/tax/general | Category |
| title | text | Post title |
| content | text | Post content (markdown) |
| upvotes | integer | Vote count (derived from forum_votes) |
| status | enum: active/hidden/deleted | Moderation status |
| is_pinned | boolean | Admin pinned |
| is_reported | boolean | Flagged by users |
| created_at | timestamptz | Creation time |
| updated_at | timestamptz | Last update |

### 6.8 forum_replies

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Reply ID |
| post_id | uuid (FK → forum_posts) | Parent post |
| user_id | uuid (FK → profiles) | Author |
| content | text | Reply content |
| upvotes | integer | Vote count (derived from forum_votes) |
| status | enum: active/hidden/deleted | Moderation status |
| is_reported | boolean | Flagged by users |
| created_at | timestamptz | Creation time |

### 6.8a forum_votes (prevents duplicate voting)

| Column | Type | Description |
|--------|------|-------------|
| user_id | uuid (FK → profiles) | Voter |
| target_type | enum: post/reply | What was voted on |
| target_id | uuid | FK to forum_posts or forum_replies |
| created_at | timestamptz | Vote time |
| **PK** | (user_id, target_type, target_id) | One vote per user per target |

### 6.9 notifications

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Notification ID |
| user_id | uuid (FK → profiles) | Recipient |
| type | enum: market_alert/plan_reminder/milestone/system | Type |
| title_th | text | Thai title |
| title_en | text | English title |
| body_th | text | Thai body |
| body_en | text | English body |
| read | boolean | Read status |
| created_at | timestamptz | Creation time |
| read_at | timestamptz (nullable) | Read time |

### 6.10 referrals (future)

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Referral ID |
| referrer_id | uuid (FK → profiles) | Referrer |
| referred_email | text | Invitee email |
| status | enum: pending/signed_up/converted | Status |
| created_at | timestamptz | Creation time |
| converted_at | timestamptz (nullable) | Conversion time |

### 6.11 chat_history

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Message ID |
| user_id | uuid (FK → profiles) | User |
| role | enum: user/assistant | Message role |
| content | text | Message content |
| created_at | timestamptz | Timestamp |

### 6.12 glossary_terms

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Term ID |
| slug | text (unique) | URL slug (for `/glossary/[term]`) |
| term_th | text | Thai term |
| term_en | text | English term |
| definition_th | text | Thai definition (markdown) |
| definition_en | text | English definition (markdown) |
| category | enum: retirement/investing/tax/insurance/general | Category |
| related_terms | uuid[] (nullable) | Related glossary term IDs |
| created_at | timestamptz | Creation time |
| updated_at | timestamptz | Last update |

### 6.13 calendar_events

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Event ID |
| title_th | text | Thai title |
| title_en | text | English title |
| description_th | text | Thai description |
| description_en | text | English description |
| event_type | enum: tax_deadline/ssf_rmf/gpf/general | Event type |
| event_date | date | Event date |
| recurring_yearly | boolean | Repeats every year |
| created_at | timestamptz | Creation time |

### 6.14 chat_daily_usage (rate limiting for AI chatbot)

| Column | Type | Description |
|--------|------|-------------|
| user_id | uuid (FK → profiles) | User |
| usage_date | date | Date of usage |
| message_count | integer | Messages sent today |
| **PK** | (user_id, usage_date) | One row per user per day |

**Rate limit enforcement:** API route checks `chat_daily_usage` before processing. Free users: max 5 messages/day. Premium users: unlimited. Counter resets daily.

### 6.15 Row Level Security

All tables with `user_id` enforce RLS:
- Users can only SELECT/INSERT/UPDATE/DELETE their own rows
- `blog_posts`, `funds`, `glossary_terms`, `calendar_events` are read-only for all authenticated users
- `forum_posts` and `forum_replies` are readable by all, writable by owner, moderatable by admins
- Admin users (`role = 'admin'`) can manage blog posts, funds, glossary, calendar, and moderate forum content

**Admin management (Phase 1):** Admins use the Supabase dashboard directly for managing blog posts, fund data, glossary terms, and calendar events. A dedicated admin panel is out of scope for Phase 1 but the `role` column on profiles supports it when needed.

---

## 7. Calculation Engine

### 7.1 Web Worker Architecture

All heavy math runs in dedicated Web Workers so the UI thread never freezes.

```
Main Thread (React UI)
│
├── worker/retirement-planner.worker.ts
├── worker/monte-carlo.worker.ts
├── worker/stress-test.worker.ts
├── worker/mpt-optimizer.worker.ts
├── worker/dca-tracker.worker.ts
└── worker/tax-optimizer.worker.ts
```

### 7.2 Retirement Planner Worker

**Inputs:** employment type, age, salary, retirement age, savings rate, current savings, monthly expenses, expected return, inflation rate, life expectancy, legacy amount, salary growth rate

**Employment-specific inputs:**
- **Government (ข้าราชการ):** GPF (กบข.) contribution rate, current GPF value, service start date, retirement date, position level
- **Private (เอกชน):** Provident Fund (PVD) contribution, employer match, Social Security (ประกันสังคม) status
- **Freelance (อาชีพอิสระ):** Section 40 Social Security, personal savings only

**Calculations:**
1. Project future salary with growth rate
2. Project savings accumulation with compound interest
3. Calculate inflation-adjusted future monthly expenses
4. Calculate required retirement corpus (PV of all future expenses from retirement to life expectancy)
5. Calculate retirement gap = required corpus - projected savings
6. Calculate Financial Health Score (0-100):
   - `fundedRatio = projectedSavings / requiredCorpus` (clamped to 0-1.5)
   - Base score: `fundedRatio * 60` (max 60 points from funding)
   - Diversification bonus: +10 if multiple asset types
   - Savings rate bonus: +10 if savings rate >= 15% of income
   - Time horizon bonus: +10 if years to retirement >= 15
   - Insurance coverage bonus: +10 if has adequate insurance
   - Score = sum of all components, clamped to 0-100
   - Interpretation: 0-30 (Critical), 31-50 (Needs Work), 51-70 (On Track), 71-85 (Good), 86-100 (Excellent)

**Output:** { gap, corpus, projectionByYear[], healthScore, healthScoreBreakdown, monthlyShortfall }

### 7.3 Monte Carlo Worker

**Inputs:** current expenses, years to retirement, inflation rate, retirement age, life expectancy, lump sum, government pension, annuity, portfolio expected return (monthly), portfolio SD (monthly), inflation E(R), inflation SD

**Progressive execution:**
1. Run 5,000 simulations → postMessage({ partial: true, rounds: 5000, results })
2. UI displays instant results with "Refining..." indicator
3. Continue to 60,000 simulations → postMessage({ partial: false, rounds: 60000, results })
4. UI updates smoothly with final results

**Each simulation:**
1. Generate random monthly returns using Geometric Brownian Motion: `r = E(R) + SD * Z` where Z ~ N(0,1)
2. Generate random monthly inflation similarly
3. Simulate month-by-month withdrawal: `balance = balance * (1 + r) - inflated_expense`
4. Track if balance reaches zero before life expectancy

**Output:** { survivalRate, wealthPaths[], percentiles (P10/P25/P50/P75/P90), medianFinalWealth, avgFinalWealth }

### 7.4 Stress Test Worker

**Inputs:** expected return, SD, number of periods, DCA amount, bonus amount, bonus frequency, target return, VaR start period, Black Swan start period, Black Swan consecutive periods

**4 Scenarios:**
1. **Normal:** Standard Monte Carlo
2. **99% VaR:** At specified period, inject worst 1% return
3. **Black Swan:** At specified period, inject consecutive extreme negative returns
4. **Combined:** VaR + Black Swan together

**Output:** { scenarios[], maxDrawdowns[], doublingProbability, recoveryTime, medianDrawdown, worstDrawdown }

### 7.5 MPT Optimizer Worker

**Inputs:** array of funds (expected return, SD), correlation matrix, risk-free rate

**Calculations:**
1. Build covariance matrix from correlations and SDs
2. Generate efficient frontier (100 portfolios along the curve)
3. Find Max Sharpe Ratio portfolio (optimize: `(return - riskFreeRate) / portfolioSD`)
4. Find Min Volatility portfolio (minimize: `portfolioSD`)
5. Constraint: weights sum to 1, no short selling (weights >= 0)

**Output:** { frontier[], maxSharpe: { weights, return, risk, sharpe }, minVol: { weights, return, risk, sharpe } }

### 7.6 DCA Tracker Worker

**Inputs:** monthly DCA amount, asset allocation weights, fund return data, rebalancing frequency, glidepath settings, DAA momentum lookback

**3 Strategies:**
1. **Static:** Fixed allocation, rebalance every N months
2. **Glidepath:** Gradually shift from equity-heavy to bond-heavy over time
3. **DAA (Dynamic):** Momentum-based allocation shifts using shorter rebalancing window

**Output:** { staticResult, glidepathResult, daaResult, tradeLog[], comparisonChart }

### 7.7 Tax Optimizer Worker

**Inputs:** annual income, current tax deductions, SSF holdings, RMF holdings, life insurance premiums, provident fund contributions

**Calculations:**
1. Calculate current effective tax rate
2. Optimize SSF/RMF/life insurance allocation to maximize tax savings within legal limits
3. Show before/after tax comparison
4. Factor in lock-up periods and liquidity impact

**Output:** { currentTax, optimizedTax, taxSaved, recommendations[], allocationBreakdown }

### 7.8 Shared Math Utilities (lib/finance-math.ts)

```typescript
compoundInterest(principal, rate, periods)
futureValue(pv, rate, periods)
presentValue(fv, rate, periods)
normalRandom(mean, sd)          // Box-Muller transform
portfolioReturn(weights, returns)
portfolioVariance(weights, covarianceMatrix)
sharpeRatio(return, riskFreeRate, sd)
maxDrawdown(equityCurve)
percentile(data, p)
correlationMatrix(returnsSeries)
```

---

## 8. UI/UX Design System

### 8.1 Color Palette

```
Primary:      #4F7CF7 (friendly blue)
Secondary:    #7C5CFC (soft purple — accents, CTAs)
Success:      #34D399 (green — positive results)
Warning:      #FBBF24 (amber — caution zones)
Danger:       #F87171 (soft red — negative results)
Background:   #F8FAFC (light) / #0F172A (dark)
Surface:      #FFFFFF (light) / #1E293B (dark)
Text:         #1E293B (light) / #F1F5F9 (dark)
Muted:        #94A3B8
```

### 8.2 Typography

| Usage | Font | Reason |
|-------|------|--------|
| Headings | IBM Plex Sans Thai | Clean, excellent Thai support |
| Body | Inter | Great readability for numbers/data |
| Monospace numbers | IBM Plex Mono | Aligned columns in tables |

### 8.3 Component Styles

| Component | Style |
|-----------|-------|
| Cards | rounded-2xl, subtle shadow, soft border |
| Buttons | rounded-xl, gradient hover (primary→secondary) |
| Inputs | rounded-lg, border-muted, focus ring primary |
| Charts | Recharts with brand colors, animated transitions |
| Tooltips | Dark bg, rounded-lg, contextual help icons (?) |

### 8.4 Key UX Patterns

| Pattern | Description |
|---------|-------------|
| Stepper form | Calculators broken into 2-3 steps (not one long form) |
| Instant preview | Results update live as user types (debounced) |
| Progressive disclosure | Basic results first, "Show detailed analysis" expands |
| Skeleton loading | While Monte Carlo runs, show chart skeletons |
| Soft paywall | Blurred results + "Upgrade" badge on premium features |
| Onboarding wizard | First-time: "What's your goal?" → routes to right calculator |
| Contextual help | (?) icons next to every financial term. Clicking shows an inline popover with a short definition + "Learn more" link to the public `/glossary/[term]` page. Popover content is fetched from the `glossary_terms` table. |
| Mobile bottom nav | 5 tabs: Home, Calculators, Fund, Blog, Profile |
| "What if" sliders | After results, sliders to adjust inputs and see impact live |
| Financial Health Score | Gauge/donut showing 0-100 score prominently on dashboard |
| Goal timeline | Visual roadmap from current age → retirement |
| Plan comparison | Side-by-side 2 saved plans |
| Animated counters | Numbers count up to final value on result load |
| Confetti | Celebration when survival rate > 90% or score > 80 |
| Milestone celebrations | "You've saved 1M baht!" / "50% to your goal!" |
| Lottie animations | Loading states, empty states, onboarding illustrations |
| Dark mode | Toggle in settings + system preference detection |

### 8.5 Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 640px | Single column, bottom nav |
| Tablet | 640-1024px | 2-column forms, sidebar collapsed |
| Desktop | > 1024px | Sidebar nav, 2-3 column layouts |

---

## 9. AI Chatbot

### 9.1 Purpose

Claude-powered financial Q&A assistant. Answers questions based on user's profile data and saved plans. Available in Thai and English.

### 9.2 Implementation

- **API:** Claude API via Anthropic SDK (server-side Next.js API route)
- **Context:** User's profile, employment type, saved plans (anonymized inputs/results) injected as system prompt context
- **Rate limit (free):** 5 questions per day
- **Rate limit (premium):** Unlimited
- **Safety:** System prompt includes "not financial advice" disclaimer, refuses to give specific buy/sell recommendations

### 9.3 Example Interactions

- "Should I invest in SSF or RMF?" → Explains based on user's tax bracket and retirement timeline
- "My survival rate is 72%, what can I do?" → Suggests adjustments based on their plan inputs
- "อธิบายให้หน่อยว่า Monte Carlo คืออะไร" → Explains in simple Thai

---

## 10. Revenue Streams (Future)

| Stream | Implementation |
|--------|---------------|
| Premium subscription | Stripe Checkout → webhook → update `subscription_tier` |
| Affiliate links | `affiliate_url` on `funds` table, track clicks via Posthog |
| Sponsored fund placement | Admin flags sponsored funds, displayed with "Sponsored" badge |
| Insurance lead gen | CTA in retirement gap results → partner form |
| White-label for IFAs | Multi-tenant setup, custom branding per advisor. **Out of scope for Phase 1 architecture.** When needed: add `tenant_id` column to profiles, tenant-specific theming config, subdomain routing. |
| Partner API | REST API for banks to embed calculators. **Out of scope for Phase 1 architecture.** When needed: add API key auth, rate limiting, CORS config for partner domains. |

---

## 11. Trust, Security & Compliance

### 11.1 Security

- Supabase Auth with JWT tokens
- Row Level Security on all user tables
- Optional 2FA (TOTP)
- Rate limiting on API routes and calculations
- HTTPS everywhere (Vercel default)
- No sensitive data in client-side storage (only JWTs)

### 11.2 PDPA Compliance

- Privacy policy page explaining data collection and usage
- Cookie consent banner
- Data export endpoint (CSV/JSON) — users can download all their data
- Account deletion capability
- Data retention policy documented

### 11.3 Financial Disclaimer

- "Not financial advice" disclaimer on every calculator page
- Methodology page showing exact formulas and assumptions
- Calculation audit trail — users can see what formulas were used
- Clear statement that past performance does not guarantee future results

### 11.4 Accessibility (WCAG AA)

- Proper color contrast ratios
- Keyboard navigation for all interactive elements
- Screen reader labels on charts and inputs
- Focus management in stepper forms
- Alt text on all images

---

## 12. Content & SEO

### 12.1 Blog

- Categories: retirement, investing, tax, lifestyle, course
- "Retirement Planning 101" — 5-10 lesson series
- Schema markup (Article, FAQ, HowTo) for rich Google snippets
- Bilingual content (TH/EN)

### 12.2 Glossary

- Searchable dictionary of Thai financial terms
- Simple explanations with examples
- Cross-linked from calculator contextual help (?) popovers
- SEO optimized — each term is a unique page

### 12.3 Thai Financial Calendar

- Tax filing deadlines
- SSF/RMF purchase windows
- GPF contribution dates
- LTF legacy deadlines
- Push notification reminders for logged-in users

### 12.4 Social Sharing

- Auto-generated OG image cards with key stats (survival rate, score, gap)
- LINE and Facebook share buttons
- Customizable share message

---

## 13. Analytics

### 13.1 Posthog Events

| Event | Purpose |
|-------|---------|
| `calculator_started` | Which calculator, employment type |
| `calculator_completed` | Results summary, time taken |
| `plan_saved` | Plan type, is_favorite |
| `plan_compared` | Which plans compared |
| `chat_message_sent` | Topic category |
| `pdf_exported` | Plan type |
| `share_clicked` | Platform (LINE/Facebook) |
| `onboarding_completed` | Selected goal |
| `paywall_shown` | Which feature triggered it |
| `paywall_converted` | Future: subscription started |
| `score_calculated` | Score value, delta from previous |

### 13.2 Key Metrics to Track

- DAU/MAU ratio
- Calculator completion rate (started vs finished)
- Average Financial Health Score
- Score improvement over time (retention indicator)
- Most-used calculator
- Drop-off points in stepper forms
- Chat usage and satisfaction

---

## 14. PWA & Offline

### 14.1 PWA Features

- Installable on phone home screen
- App icon and splash screen
- Offline access to saved plans
- Service Worker caching for calculator pages

### 14.2 Caching Strategy

| Resource | Strategy |
|----------|----------|
| Static assets (JS/CSS/images) | Cache-first, update in background |
| Calculator pages | Stale-while-revalidate |
| Fund data | Network-first, fallback to cache |
| User data | Network-only (always fresh) |
| Blog posts | Stale-while-revalidate |

---

## 15. Project Structure

```
nub/
├── public/
│   ├── locales/
│   │   ├── th/
│   │   └── en/
│   ├── lottie/          # Lottie animation files
│   ├── icons/           # PWA icons
│   └── manifest.json
├── src/
│   ├── app/
│   │   ├── (public)/    # Public routes (landing, blog, legal)
│   │   ├── (auth)/      # Auth-required routes
│   │   ├── api/         # API routes (chat, export, webhooks)
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/          # Base components (button, input, card)
│   │   ├── calculator/  # Calculator-specific components
│   │   ├── charts/      # Chart components (wealth, frontier, gauge)
│   │   ├── layout/      # Nav, sidebar, footer, bottom-nav
│   │   └── shared/      # Shared components (help-tooltip, stepper)
│   ├── hooks/           # Custom React hooks
│   ├── lib/
│   │   ├── supabase/    # Supabase client, types, helpers
│   │   ├── finance-math.ts  # Shared math utilities
│   │   ├── i18n.ts      # i18n configuration
│   │   └── utils.ts     # General utilities
│   ├── workers/
│   │   ├── retirement-planner.worker.ts
│   │   ├── monte-carlo.worker.ts
│   │   ├── stress-test.worker.ts
│   │   ├── mpt-optimizer.worker.ts
│   │   ├── dca-tracker.worker.ts
│   │   └── tax-optimizer.worker.ts
│   ├── types/           # TypeScript types
│   └── styles/          # Additional styles
├── supabase/
│   ├── migrations/      # SQL migrations
│   └── seed.sql         # Seed data (funds, sample blog posts)
├── docs/
│   └── superpowers/
│       └── specs/       # This spec file
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 16. External Data Sources

### 16.1 Fund Data

Fund NAV data, returns, and ROIC sourced from:
- SEC Thailand (สำนักงาน ก.ล.ต.)
- Fund factsheets
- Manual admin upload via Supabase dashboard (Phase 1)
- Future: automated scraping or API integration

### 16.2 Benchmark Data

- Thai government bond yield (risk-free rate)
- SET Index returns
- CPI inflation data (Bank of Thailand)

---

## 17. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Page load (LCP) | < 2.5 seconds |
| Monte Carlo 5K rounds | < 1 second |
| Monte Carlo 60K rounds | < 10 seconds |
| Mobile Lighthouse score | > 90 (Performance, Accessibility, SEO) |
| Uptime | 99.9% (Vercel + Supabase) |
| Data backup | Supabase daily backups |
| Max concurrent users | 1,000+ (client-side calc = no server bottleneck) |

---

## 18. Success Criteria

| Metric | Target (6 months) |
|--------|-------------------|
| Registered users | 1,000+ |
| Monthly active users | 500+ |
| Calculator completions / month | 2,000+ |
| Blog organic traffic | 5,000 visits/month |
| Average Financial Health Score | Tracked (no target, baseline) |
| User retention (30-day) | > 30% |
