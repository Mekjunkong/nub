# Spreadsheet Features Migration — Design Spec

> Migrate all tabs and formulas from Dr. Nub's "Copy of Quant" Google Spreadsheet into the Nub web platform.
> 26 spreadsheet tabs → 6 new features + 4 enhancements, delivered in 3 batches.

## Source Spreadsheet

`https://docs.google.com/spreadsheets/d/1XjuQZwTlD7wMbrEMpZcCAa3_DQ5tVWWUPs0pHDji-1k`

26 tabs covering: retirement planning, portfolio optimization (MPT/TIPP/VPPI), cashflow tracking, ROIC stock analysis, GPF pension management, Monte Carlo simulations, tax optimization, wealth dashboards, and annuity planning.

---

## Existing Architecture

- **Framework:** Next.js 16 App Router, React 19, TypeScript
- **Styling:** Tailwind CSS 4 + Radix UI primitives
- **Data:** Supabase (auth + Postgres with RLS), 15 existing tables
- **Computation:** Web Workers for heavy math (Monte Carlo, MPT), direct calls for simple calcs
- **Charts:** Recharts
- **i18n:** next-intl (th/en)
- **Pattern:** Page (`"use client"`) → Form component → Worker/direct function → Results component
- **Persistence:** `saved_plans` table with JSONB inputs/results

---

## Delivery Batches

### Batch 1 — Foundation & Data Layer
1. Cashflow Tracker (CF Transection + CF Record tabs)
2. Enhanced Dashboard — 4-Pillar Wealth (WealthRecordN tab)
3. ROIC Stock Analyzer + Ranking (ROIC + ROIC Ranking tabs)

### Batch 2 — Portfolio Tools
4. GPF Portfolio Optimizer (GPF tab)
5. TIPP/VPPI Portfolio Protection (tipp tab)
6. Portfolio Health Dashboard (ชีต17 tab)
7. Enhanced MPT — 10+ Fund Selection (ชีต13 tab)

### Batch 3 — Retirement Enhancements
8. Bumnan 95 Annuity Planner (ชีต6 tab)
9. Enhanced Withdrawal — Pension Comparison (ชีต25 tab)
10. Enhanced Stress Test — Bear Market Injection (ชีต10 tab)

---

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Calculation pattern | Mixed — direct for simple, workers for heavy | Workers add serialization overhead; not worth it for ratio math |
| ROIC data source | Hybrid — admin seeds + optional API refresh | Matches spreadsheet's manual approach with upgrade path |
| Cashflow input | Template + manual hybrid | Auto-fill recurring items, manual for one-offs |
| Portfolio Health page | Summary card on dashboard + dedicated `/portfolio-health` page | Keeps dashboard clean, deep dive available |
| 4-pillar wealth data | Hybrid auto-aggregate + manual override | Pull from saved plans where possible, manual for insurance/education |
| Implementation order | 3 batches by dependency | Batch 1 data feeds Batch 2 tools; Batch 3 enhances existing features |

---

## Batch 1: Foundation & Data Layer

### Feature 1: Cashflow Tracker

**Route:** `/calculator/cashflow`
**Pattern:** Direct calculation (no worker)
**Spreadsheet tabs:** CF Transection, CF Record

#### Database Schema

```sql
CREATE TYPE cashflow_direction AS ENUM ('income', 'expense', 'saving', 'investment');
CREATE TYPE cashflow_category AS ENUM (
  'salary', 'overtime', 'bonus', 'allowance',
  'insurance_life', 'insurance_health', 'insurance_pension',
  'rmf', 'ssf', 'pvd', 'gpf', 'tesg',
  'personal', 'family', 'transport', 'education',
  'travel', 'housing', 'debt', 'donation', 'other'
);

CREATE TABLE cashflow_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  direction cashflow_direction NOT NULL,
  category cashflow_category NOT NULL,
  amount NUMERIC NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_cashflow_templates_updated_at
  BEFORE UPDATE ON cashflow_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE cashflow_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  template_id UUID REFERENCES cashflow_templates(id) ON DELETE SET NULL,
  direction cashflow_direction NOT NULL,
  category cashflow_category NOT NULL,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes (primary query pattern is user + year + month)
CREATE INDEX idx_cashflow_templates_user ON cashflow_templates(user_id);
CREATE INDEX idx_cashflow_transactions_user_period ON cashflow_transactions(user_id, year, month);

-- RLS
ALTER TABLE cashflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE cashflow_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own templates"
  ON cashflow_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own templates"
  ON cashflow_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own templates"
  ON cashflow_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own templates"
  ON cashflow_templates FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions"
  ON cashflow_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own transactions"
  ON cashflow_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions"
  ON cashflow_transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions"
  ON cashflow_transactions FOR DELETE USING (auth.uid() = user_id);
```

#### Types

```typescript
export interface CashflowTemplate {
  id: string;
  name: string;
  direction: "income" | "expense" | "saving" | "investment";
  category: string;
  amount: number;
  isActive: boolean;
}

export interface CashflowTransaction {
  id: string;
  templateId: string | null;
  direction: "income" | "expense" | "saving" | "investment";
  category: string;
  name: string;
  amount: number;
  month: number;
  year: number;
}

export interface CashflowResults {
  totalIncome: number;
  totalOutflow: number;
  netCashflow: number;
  savingsInvestmentRatio: number;   // target: >20%
  insuranceRiskRatio: number;
  debtServiceRatio: number;         // target: <40%
  lifestyleBreakdown: {
    personal: number;
    family: number;
    transport: number;
    education: number;
    travel: number;
    housing: number;
    other: number;
  };
  taxDeductibleTotal: number;       // sum of RMF + SSF + insurance + PVD
}
```

#### Components

| Component | Purpose |
|-----------|---------|
| `cashflow-template-form.tsx` | Manage recurring items (salary, insurance, RMF, etc.) |
| `cashflow-month-view.tsx` | Monthly view: auto-fills from templates + manual add for one-offs |
| `cashflow-results.tsx` | Financial health ratios: savings %, debt %, lifestyle breakdown, net cashflow |

#### Calculation Logic

```
totalIncome = sum(transactions where direction = 'income')
totalExpenses = sum(transactions where direction = 'expense')
totalSavingsInvestment = sum(transactions where direction IN ('saving', 'investment'))
totalOutflow = totalExpenses + totalSavingsInvestment   // all money out (cash accounting view)
netCashflow = totalIncome - totalExpenses               // disposable surplus (budgeting view)
savingsInvestmentRatio = totalSavingsInvestment / totalIncome
debtServiceRatio = sum(category = 'debt') / totalIncome
lifestyleBreakdown = group by category where direction = 'expense'
taxDeductibleTotal = sum(category IN ('rmf', 'ssf', 'pvd', 'gpf', 'tesg', 'insurance_life', 'insurance_health', 'insurance_pension'))
```

Note: `netCashflow` = income minus expenses only (not savings/investments).
This matches the spreadsheet's CF Record which shows savings as a separate ratio, not subtracted from net cashflow.

---

### Feature 2: Enhanced Dashboard — 4-Pillar Wealth

**Route:** Enhanced `/dashboard`
**Pattern:** Direct calculation
**Spreadsheet tab:** WealthRecordN

#### Database Schema

```sql
CREATE TABLE wealth_pillars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pillar_type TEXT NOT NULL CHECK (pillar_type IN ('emergency', 'education', 'retirement', 'insurance')),

  -- Emergency fund
  balance NUMERIC,
  monthly_expenses NUMERIC,

  -- Education fund
  goal_amount NUMERIC,
  current_amount NUMERIC,
  target_date DATE,

  -- Retirement (auto-aggregated from saved plans)
  gpf_value NUMERIC,
  rmf_value NUMERIC,
  other_retirement NUMERIC,
  target_corpus NUMERIC,

  -- Insurance portfolio
  policies JSONB DEFAULT '[]',

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, pillar_type),

  -- Per-type CHECK constraints to ensure correct columns are populated
  CHECK (pillar_type != 'emergency' OR (balance IS NOT NULL AND monthly_expenses IS NOT NULL)),
  CHECK (pillar_type != 'education' OR (goal_amount IS NOT NULL AND current_amount IS NOT NULL)),
  CHECK (pillar_type != 'retirement' OR target_corpus IS NOT NULL),
  CHECK (pillar_type != 'insurance' OR policies IS NOT NULL)
);

CREATE TRIGGER set_wealth_pillars_updated_at
  BEFORE UPDATE ON wealth_pillars
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE wealth_pillars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pillars"
  ON wealth_pillars FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own pillars"
  ON wealth_pillars FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pillars"
  ON wealth_pillars FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own pillars"
  ON wealth_pillars FOR DELETE USING (auth.uid() = user_id);
```

#### Types

```typescript
export interface InsurancePolicy {
  name: string;
  type: "wholelife" | "saving" | "annuity" | "term" | "critical_illness" | "health";
  deathBenefit: number;
  ciCoverage: number;
  surrenderValue: number;
  annualPremium: number;
}

export interface WealthPillar {
  emergency: {
    balance: number;
    monthlyExpenses: number;
    monthsCoverage: number;          // balance / monthlyExpenses
    status: "STRONG" | "MODERATE" | "WEAK";  // >6mo / 3-6mo / <3mo
  };
  education: {
    currentAmount: number;
    goalAmount: number;
    progressPercent: number;
    targetDate: string;
  };
  retirement: {
    gpfValue: number;
    rmfValue: number;
    otherRetirement: number;
    totalRetirement: number;
    targetCorpus: number;
    progressPercent: number;
  };
  insurance: {
    totalDeathBenefit: number;
    totalCICoverage: number;
    totalSurrenderValue: number;
    policies: InsurancePolicy[];
  };
}
```

#### Components

| Component | Purpose |
|-----------|---------|
| `emergency-fund-card.tsx` | Balance, months coverage, status badge |
| `education-fund-card.tsx` | Progress bar toward goal |
| `retirement-wealth-card.tsx` | GPF + RMF + other, progress vs target corpus |
| `insurance-portfolio-card.tsx` | Total death/CI/surrender, policy list |
| `wealth-overview.tsx` | Grid of all 4 pillar cards |

#### Auto-populate Logic

- Emergency: pulls savings-category totals from cashflow tracker
- Retirement: aggregates `projectedCorpus` from saved retirement plans + manual GPF/RMF input
- Insurance: manual entry; deduction amounts sync to tax calculator
- Education: manual entry with goal tracking

---

### Feature 3: ROIC Stock Analyzer + Ranking

**Route:** `/calculator/roic`
**Pattern:** Direct calculation (no worker)
**Spreadsheet tabs:** ROIC, ROIC Ranking

#### Types

```typescript
export interface RoicInputs {
  ticker: string;
  ebit: number;
  taxRate: number;               // default 0.20
  totalAssets: number;
  currentLiabilities: number;
  cashAndEquivalents: number;
  netIncome: number;
  operatingCashFlow: number;
  wacc: number;                  // default 0.08
  growthRate: number;            // terminal growth, MUST be < wacc (validated in UI + calc)
}

// Validation: growthRate must be strictly less than wacc.
// If growthRate >= wacc, show error: "Growth rate must be less than WACC"
// Fair value formula is undefined when wacc <= growthRate (division by zero/negative).

export interface RoicResults {
  nopat: number;                 // EBIT * (1 - tax)
  investedCapital: number;       // totalAssets - currentLiabilities - cash
  roic: number;                  // NOPAT / investedCapital
  sloanRatio: number;            // (netIncome - operatingCashFlow) / totalAssets
  fairEquityValue: number;       // NOPAT / (WACC - growthRate)
  roicVsWacc: number;           // roic - wacc
  qualityRating: string;         // "Excellent" / "Good" / "Moderate" / "Poor"
}

export interface RoicRankingEntry {
  ticker: string;
  name: string;
  roicCurrent: number;
  roicHistory: Record<string, number>;
  sloanRatio: number;
  fairValue: number;
  rating: string;
}
```

#### Calculation Logic

```
NOPAT = EBIT × (1 - taxRate)
Invested Capital = Total Assets - Current Liabilities - Cash
ROIC = NOPAT / Invested Capital
Sloan Ratio = (Net Income - Operating Cash Flow) / Total Assets
Fair Equity Value = NOPAT / (WACC - Growth Rate)
Quality Rating:
  - ROIC > 20% AND Sloan < 0 → "Excellent"
  - ROIC > 15% → "Good"
  - ROIC > 8% → "Moderate"
  - else → "Poor"
```

#### Components

| Component | Purpose |
|-----------|---------|
| `roic-form.tsx` | Input financials or select from fund database |
| `roic-results.tsx` | ROIC gauge, Sloan indicator, fair value, ROIC vs WACC |
| `roic-ranking-table.tsx` | Sortable multi-stock table with 3-year ROIC history |
| `roic-admin-refresh.tsx` | Admin-only API refresh button |

#### Data Source

Uses existing `funds` table which already has `roic_current` (NUMERIC) and `roic_history` (JSONB) columns. Admin populates via Supabase dashboard or optional API integration. Users can also input custom stock data for analysis.

---

### Batch 1: Shared Migration

```sql
-- Extend plan_type enum for all batches
ALTER TYPE plan_type ADD VALUE 'cashflow';
ALTER TYPE plan_type ADD VALUE 'roic';
ALTER TYPE plan_type ADD VALUE 'gpf_optimizer';
ALTER TYPE plan_type ADD VALUE 'tipp';
ALTER TYPE plan_type ADD VALUE 'portfolio_health';
ALTER TYPE plan_type ADD VALUE 'bumnan95';
```

**TypeScript update required:** Also update `PlanType` union in `src/types/database.ts`:
```typescript
export type PlanType =
  | "retirement" | "withdrawal" | "stress_test" | "mpt" | "dca" | "tax"
  | "cashflow" | "roic" | "gpf_optimizer" | "tipp" | "portfolio_health" | "bumnan95";
```

---

## Batch 2: Portfolio Tools

### Feature 4: GPF Portfolio Optimizer

**Route:** `/calculator/gpf-optimizer`
**Pattern:** Worker (MPT + Monte Carlo)
**Spreadsheet tab:** GPF

#### Types

```typescript
export interface GpfOptimizerInputs {
  currentHoldings: {
    bondPlan: number;
    equityPlan: number;
    goldPlan: number;
  };
  monthlyContribution: number;
  investmentYears: number;
  riskFreeRate: number;
  assetReturns: number[];          // [bond, equity, gold] E(R)
  assetSDs: number[];
  correlationMatrix: number[][];
  rebalanceFrequency: number;
  simulations: number;
}

export interface GpfOptimizerResults {
  maxSharpe: { weights: number[]; expectedReturn: number; risk: number; sharpeRatio: number };
  minVol: { weights: number[]; expectedReturn: number; risk: number; sharpeRatio: number };
  var95: number;
  var99: number;
  cvar95: number;
  cvar99: number;
  probabilityOfRuin: number;
  rebalanceActions: { asset: string; action: "BUY" | "SELL" | "HOLD"; amount: number }[];
  wealthProjections: {
    average: number;
    median: number;
    conservative: number;
    bull: number;
    successRate: number;
  };
  maxDrawdownByYear: { year: number; avgMDD: number; worstMDD: number; recoveryMonths: number }[];
}
```

#### Worker: `gpf-optimizer.worker.ts`

Reuses logic from `mpt-optimizer.worker.ts` for MPT optimization. Adds:
1. VaR/CVaR calculation (percentile-based from Monte Carlo runs)
2. Rebalancing signal generation: `optimal_weight × total_portfolio - current_holding = action_amount`
3. Monte Carlo wealth projection with DCA
4. Year-by-year MDD analysis

#### Components

| Component | Purpose |
|-----------|---------|
| `gpf-holdings-form.tsx` | Current holdings (3 plans) + contribution + horizon |
| `gpf-optimizer-results.tsx` | Optimal allocation pie, risk metrics, rebalancing BUY/SELL table |
| `gpf-wealth-projection.tsx` | Monte Carlo fan chart + success rate gauge |
| `gpf-drawdown-table.tsx` | Year-by-year MDD + recovery table |

#### Pre-filled Data

GPF asset assumptions (hardcoded initially, admin-updatable):
- แผนตราสารหนี้ (Bond): E(R) = 2.50%, SD = 1.26%
- แผนหุ้นต่างประเทศ (Foreign Equity): E(R) = 8.00%, SD = 12.04%
- แผนทองคำ (Gold): E(R) = 5.00%, SD = 15.17%
- Correlation matrix from spreadsheet

---

### Feature 5: TIPP/VPPI Portfolio Protection

**Route:** `/calculator/tipp`
**Pattern:** Worker (simulation)
**Spreadsheet tab:** tipp

#### Types

```typescript
export interface TippInputs {
  initialCapital: number;
  floorPercentage: number;          // default 0.85
  maxMultiplier: number;            // default 5
  riskFreeRate: number;             // default 0.025
  assets: { name: string; monthlyReturns: number[] }[];
  correlationMatrix: number[][];
  targetVolatility: number;         // default 0.14
  rebalanceThreshold: number;       // drift % trigger
  simulationMonths: number;
}

export interface TippResults {
  expectedReturn: number;
  annualSD: number;
  sharpeRatio: number;
  var95: number;
  var99: number;
  cvar95: number;
  cvar99: number;
  currentMultiplier: number;
  floorValue: number;
  cushion: number;
  safetyStatus: "SAFE" | "WARNING" | "DANGER";
  wealthPath: {
    month: number;
    wealth: number;
    floor: number;
    multiplier: number;
    action: string;
  }[];
  finalWealth: number;
  maxDrawdown: number;
  riskyWeight: number;
  safeWeight: number;
}
```

#### Worker: `tipp.worker.ts`

Core VPPI algorithm:
```
For each month:
  1. cushion = wealth - floor
  2. riskyAllocation = min(multiplier × cushion, wealth)
  3. safeAllocation = wealth - riskyAllocation
  4. Apply returns: risky gets portfolio return, safe gets risk-free rate
  5. Update floor: floor = max(floor, floorPercentage × peak_wealth)
  6. If cushion < threshold → reduce multiplier (de-risk)
  7. If wealth hits new high → raise floor (ratchet up protection)
  8. Check rebalance trigger: if drift > threshold → rebalance
```

VaR/CVaR calculated from the actual risky allocation (not total wealth):
```
riskyAllocation = min(multiplier × cushion, wealth)
VaR(α) = riskyAllocation × σ × Z(α)
CVaR(α) = riskyAllocation × σ × φ(Z(α)) / (1-α)
```
Note: Uses `riskyAllocation`, not `wealth × multiplier`, because TIPP caps exposure at total wealth.

#### Components

| Component | Purpose |
|-----------|---------|
| `tipp-form.tsx` | Capital, floor %, multiplier, asset selection, volatility target |
| `tipp-strategy-chart.tsx` | Dual-line: wealth path vs floor path, multiplier overlay |
| `tipp-risk-dashboard.tsx` | VaR/CVaR cards, safety status, cushion gauge |
| `tipp-allocation-view.tsx` | Risky vs safe allocation with rebalance signal |

---

### Feature 6: Portfolio Health Dashboard

**Route:** `/portfolio-health` (auth) + summary card on `/dashboard`
**Pattern:** Worker (MDD simulation)
**Spreadsheet tab:** ชีต17

#### Types

```typescript
export interface PortfolioHealthInputs {
  totalNAV: number;
  previousNAV: number;
  monthlyDCA: number;
  holdings: { asset: string; weight: number; expectedReturn: number; sd: number }[];
  correlationMatrix: number[][];
  benchmarkReturn: number;
  riskFreeRate: number;
  investmentYears: number;
  simulations: number;
}

export interface PortfolioHealthResults {
  monthlyReturn: number;
  targetReturn: number;
  projectedReturn: number;
  benchmarkReturn: number;
  alpha: number;
  sharpeRatio: number;
  sharpeRating: string;            // 1-5 stars
  portfolioRisk: number;
  riskLevel: "Low" | "Moderate" | "High";
  drawdownAnalysis: {
    year: number;
    avgMDD: number;
    worstMDD: number;
    avgRecoveryMonths: number;
    worstRecoveryMonths: number;
  }[];
  performanceComment: string;
  riskComment: string;
}
```

#### Worker: `portfolio-health.worker.ts`

1. Calculate portfolio return, alpha, Sharpe from inputs
2. Run 10,000 Monte Carlo paths for each year horizon (1-27)
3. For each path: track max drawdown and recovery period
4. Aggregate: average MDD, P5 worst MDD, average/worst recovery months per year
5. Generate commentary based on alpha sign and Sharpe magnitude

#### Components

| Component | Purpose |
|-----------|---------|
| `portfolio-health-summary-card.tsx` | Dashboard card: NAV, return, alpha badge, risk level |
| `performance-metrics.tsx` | Return vs benchmark, alpha, Sharpe stars |
| `mdd-recovery-table.tsx` | 27-year MDD + recovery table |
| `risk-commentary.tsx` | Auto-generated assessment |
| `allocation-breakdown.tsx` | Current vs optimal weights |

---

### Feature 7: Enhanced MPT — 10+ Fund Selection

**Route:** Enhanced `/calculator/mpt`
**Spreadsheet tab:** ชีต13

#### Changes

| File | Change |
|------|--------|
| `mpt/page.tsx` | Replace `SAMPLE_FUNDS` with Supabase fetch from `funds` table |
| `fund-selector.tsx` | Multi-select with search, category filter (equity/bond/gold/mixed/money_market), max 10 |
| `mpt-optimizer.worker.ts` | No change needed — already handles N assets |
| **New:** `lib/correlation-utils.ts` | Compute correlation matrix from `fund_correlations` table or calculate from `nav_history` JSONB |

#### Data Flow

1. Page fetches all funds from `funds` table via Supabase
2. User selects 2-10 funds with category filtering
3. Correlation matrix auto-computed from `fund_correlations` or `nav_history`
4. Existing MPT worker runs optimization
5. Results display optimal weights for all selected funds

---

## Batch 3: Retirement Enhancements

### Feature 8: Bumnan 95 Annuity Planner

**Route:** `/calculator/bumnan95`
**Pattern:** Worker (Monte Carlo × 6 scenarios)
**Spreadsheet tab:** ชีต6 (Bumnan 95 section)

#### Types

```typescript
export interface Bumnan95Inputs {
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;            // default 95
  monthlyExpenses: number;
  inflationRate: number;
  portfolioReturn: number;
  portfolioSD: number;
  currentSavings: number;
  governmentPension: number;
  gender: "male" | "female";
  annuityStartAge: number;
  annuityPaymentYears: number;
  annuityRate: number;
  simulations: number;
}

export interface Bumnan95Tier {
  monthlyPension: number;
  successRate: number;
  requiredPortfolio: number;
  monthlySaving: number;
  status: "RISKY" | "MODERATE" | "STRONG" | "SECURED";
}

export interface Bumnan95Results {
  targetCorpus: number;
  estimatedGPF: number;
  pensionLumpSum: number;
  retirementGap: number;
  gapStatus: "SAFE" | "GAP_EXISTS";
  tiers: Bumnan95Tier[];             // 6 rows
  annualPremium: number;
  paymentDuration: number;
  totalPremiumPaid: number;
  lumpSumNeeded: number;
  monthlyTopUp: number;
  recommendedStrategy: string;
}
```

#### Worker: `bumnan95.worker.ts`

1. Calculate retirement gap: target corpus - GPF - pension lump sum
2. Generate 6 pension tiers: ฿0, ฿29,900, ฿59,800, ฿89,700, ฿119,600, ฿149,500/month
3. For each tier: run Monte Carlo survival simulation (10,000 runs)
   - Monthly: withdraw expenses, add pension, apply returns
   - Track: ruin age, final wealth
   - Success rate = % of runs where wealth > 0 at lifeExpectancy
4. Calculate required portfolio for each tier: `monthlyPension × 12 / annuityRate`
5. Calculate monthly saving: FV annuity formula to reach required portfolio
6. Assign status: <60% RISKY, 60-80% MODERATE, 80-95% STRONG, >95% SECURED
7. Gap-closing: Option A (lump sum PV) vs Option B (monthly PMT annuity)

#### Components

| Component | Purpose |
|-----------|---------|
| `bumnan95-form.tsx` | Age, expenses, pension, annuity config |
| `bumnan95-gap-analysis.tsx` | Target vs projected, gap visualization |
| `bumnan95-tier-table.tsx` | 6-row matrix: pension, success rate, required portfolio, monthly saving, status badge |
| `bumnan95-premium-calc.tsx` | Annuity premium: gender, age, annual premium, total cost |
| `bumnan95-strategies.tsx` | Gap-closing: lump sum vs monthly top-up |

---

### Feature 9: Enhanced Withdrawal — Pension Comparison

**Route:** Enhanced `/calculator/withdrawal`
**Spreadsheet tab:** ชีต25

#### Extended Types

```typescript
export interface WithdrawalComparisonInputs extends MonteCarloInputs {
  comparisonPension: number;
}

export interface WithdrawalComparisonResults {
  baseline: MonteCarloResults & { avgAgeOfRuin: number };
  withPension: MonteCarloResults & { avgAgeOfRuin: number };
  improvement: {
    successRateDelta: number;
    finalWealthDelta: number;
    longevityDelta: number;
  };
  verdict: string;
}
```

#### Changes

| File | Change |
|------|--------|
| `withdrawal-form.tsx` | Add toggle "Compare with pension?" + amount input |
| `monte-carlo.worker.ts` | Run two simulation passes (baseline + with pension) |
| **New:** `withdrawal-comparison-results.tsx` | Side-by-side cards, 30-year projection table, improvement badges |

---

### Feature 10: Enhanced Stress Test — Bear Market Injection

**Route:** Enhanced `/calculator/stress-test`
**Spreadsheet tab:** ชีต10

#### Extended Types

```typescript
export interface EnhancedStressTestInputs extends StressTestInputs {
  bearMarketEnabled: boolean;
  bearMarketReturn: number;          // ANNUAL return, e.g., -0.20 (-20%/yr), converted to monthly in worker
  bearMarketYears: number;
  rebalanceFrequency: number;
  assets?: {
    name: string;
    weight: number;
    monthlyReturns: number[];
  }[];
}

export interface EnhancedStressTestResults extends StressTestResults {
  timelineRisk: {
    year: number;
    principal: number;
    probOfLoss: number;
    probOfDoubling: number;
  }[];
  bearMarketImpact: {
    drawdownDuringBear: number;
    recoveryMonths: number;
    wealthAtBearEnd: number;
  };
  rebalancedPath: {
    month: number;
    action: "DCA" | "DCA+Rebal";
    assetValues: number[];
    totalWealth: number;
    drawdown: number;
  }[];
}
```

#### Changes

| File | Change |
|------|--------|
| `stress-form.tsx` | Add collapsible "Bear Market Injection" section |
| `stress-test.worker.ts` | Inject bear returns for first N months, then normal distribution |
| **New:** `stress-bear-impact.tsx` | Drawdown during bear, recovery time, wealth at bear end |
| **New:** `stress-timeline-risk.tsx` | Year 1-20 table: principal, prob of loss, prob of doubling |
| **New:** `stress-rebalance-log.tsx` | Monthly action log with DCA/Rebal labels |

#### Worker Enhancement

```
For month i in simulation:
  if bearMarketEnabled AND i < bearMarketYears × 12:
    monthlyReturn = bearMarketReturn / 12 + noise(small_sd)
  else:
    monthlyReturn = normalRandom(expectedReturn, sd)

  if i % rebalanceFrequency === 0:
    rebalance to target weights
    log action "DCA+Rebal"
  else:
    log action "DCA"
```

---

## Finance Math Library Additions

New functions needed in `src/lib/finance-math.ts`:

```typescript
// VaR (Value at Risk) — parametric method
export function valueAtRisk(portfolioValue: number, sd: number, confidence: number): number;

// CVaR (Conditional VaR / Expected Shortfall)
export function conditionalVaR(portfolioValue: number, sd: number, confidence: number): number;

// NOPAT (Net Operating Profit After Tax)
export function nopat(ebit: number, taxRate: number): number;

// ROIC (Return on Invested Capital)
export function roic(nopat: number, investedCapital: number): number;

// Sloan Accrual Ratio
export function sloanRatio(netIncome: number, operatingCashFlow: number, totalAssets: number): number;

// Fair Equity Value (Gordon Growth Model variant)
export function fairEquityValue(nopat: number, wacc: number, growthRate: number): number;

// Cholesky decomposition (for correlated Monte Carlo)
export function choleskyDecomposition(matrix: number[][]): number[][];

// Generate correlated random returns using Cholesky
export function correlatedReturns(means: number[], sds: number[], cholesky: number[][]): number[];

// Recovery time from drawdown (months to recover to previous peak)
export function recoveryTime(equityCurve: number[]): number;
```

---

## File Structure (New Files)

```
src/
├── app/[locale]/(auth)/
│   ├── calculator/
│   │   ├── cashflow/page.tsx
│   │   ├── roic/page.tsx
│   │   ├── gpf-optimizer/page.tsx
│   │   ├── tipp/page.tsx
│   │   └── bumnan95/page.tsx
│   └── portfolio-health/page.tsx
├── components/
│   ├── calculator/
│   │   ├── cashflow/
│   │   │   ├── cashflow-template-form.tsx
│   │   │   ├── cashflow-month-view.tsx
│   │   │   └── cashflow-results.tsx
│   │   ├── roic/
│   │   │   ├── roic-form.tsx
│   │   │   ├── roic-results.tsx
│   │   │   ├── roic-ranking-table.tsx
│   │   │   └── roic-admin-refresh.tsx
│   │   ├── gpf/
│   │   │   ├── gpf-holdings-form.tsx
│   │   │   ├── gpf-optimizer-results.tsx
│   │   │   ├── gpf-wealth-projection.tsx
│   │   │   └── gpf-drawdown-table.tsx
│   │   ├── tipp/
│   │   │   ├── tipp-form.tsx
│   │   │   ├── tipp-strategy-chart.tsx
│   │   │   ├── tipp-risk-dashboard.tsx
│   │   │   └── tipp-allocation-view.tsx
│   │   ├── bumnan95/
│   │   │   ├── bumnan95-form.tsx
│   │   │   ├── bumnan95-gap-analysis.tsx
│   │   │   ├── bumnan95-tier-table.tsx
│   │   │   ├── bumnan95-premium-calc.tsx
│   │   │   └── bumnan95-strategies.tsx
│   │   ├── withdrawal/
│   │   │   └── withdrawal-comparison-results.tsx  (new)
│   │   └── stress-test/
│   │       ├── stress-bear-impact.tsx  (new)
│   │       ├── stress-timeline-risk.tsx  (new)
│   │       └── stress-rebalance-log.tsx  (new)
│   ├── dashboard/
│   │   ├── emergency-fund-card.tsx
│   │   ├── education-fund-card.tsx
│   │   ├── retirement-wealth-card.tsx
│   │   ├── insurance-portfolio-card.tsx
│   │   ├── wealth-overview.tsx
│   │   └── portfolio-health-summary-card.tsx
│   └── portfolio-health/
│       ├── performance-metrics.tsx
│       ├── mdd-recovery-table.tsx
│       ├── risk-commentary.tsx
│       └── allocation-breakdown.tsx
├── workers/
│   ├── gpf-optimizer.worker.ts
│   ├── tipp.worker.ts
│   ├── portfolio-health.worker.ts
│   └── bumnan95.worker.ts
├── hooks/
│   ├── use-gpf-worker.ts
│   ├── use-tipp-worker.ts
│   ├── use-portfolio-health-worker.ts
│   └── use-bumnan95-worker.ts
├── lib/
│   └── correlation-utils.ts
└── types/
    └── calculator.ts  (extended)

supabase/migrations/
└── 002_spreadsheet_features.sql
```

---

## Testing Strategy

Each feature follows the existing test pattern (`__tests__/` directories):

- **Worker tests:** Pure function tests with known inputs/outputs (e.g., ROIC calculation with known EBIT → expected NOPAT)
- **Component tests:** Render tests with mock data, verify key elements appear
- **Finance math tests:** Unit tests for each new function in `finance-math.ts`
- **Integration:** Each page test verifies form → calculate → results flow

---

## i18n Keys

Each feature adds message keys in `messages/th.json` and `messages/en.json` under its namespace:
- `calculator.cashflow.*`
- `calculator.roic.*`
- `calculator.gpfOptimizer.*`
- `calculator.tipp.*`
- `calculator.bumnan95.*`
- `dashboard.wealthPillars.*`
- `portfolioHealth.*`

---

## Spreadsheet Tab → Feature Mapping (Complete)

| Tab | Feature | Batch |
|-----|---------|-------|
| Summary | Retirement (existing) | — |
| tipp | TIPP/VPPI Protection | 2 |
| RMF(FINNOMENA) | MPT (existing) | — |
| WealthRecordN | 4-Pillar Dashboard | 1 |
| WealthRecord | 4-Pillar Dashboard | 1 |
| CF Transection | Cashflow Tracker | 1 |
| CF Record | Cashflow Tracker | 1 |
| GPF | GPF Optimizer | 2 |
| ROIC | ROIC Analyzer | 1 |
| ROIC Ranking | ROIC Analyzer | 1 |
| Retirement | Retirement (existing) | — |
| ชีต27 | Tax (existing) | — |
| ชีต4 | Data layer (existing) | — |
| ชีต5 | Stress Test (existing) | — |
| ชีต6 | Bumnan 95 Planner | 3 |
| Data | Data layer (existing) | — |
| ชีต8 | MPT + Stress Test (existing) | — |
| ชีต9 | Stress Test (existing) | — |
| ชีต10 | Enhanced Stress Test | 3 |
| ชีต11 | Stress Test (existing) | — |
| Wealth Data | Data layer (existing) | — |
| ส้ม | MPT + DCA (existing) | — |
| ชีต13 | Enhanced MPT (10+ funds) | 2 |
| ชีต14 | Data layer (existing) | — |
| ชีต17 | Portfolio Health Dashboard | 2 |
| ชีต25 | Enhanced Withdrawal | 3 |
