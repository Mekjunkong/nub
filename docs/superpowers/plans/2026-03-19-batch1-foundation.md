# Batch 1: Foundation & Data Layer — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Cashflow Tracker, 4-Pillar Wealth Dashboard, and ROIC Stock Analyzer — the data foundation that Batch 2 & 3 build upon.

**Architecture:** Three features using the existing pattern: `"use client"` pages → form components → direct calculation functions → results components. All persisted via Supabase with RLS. No web workers needed (simple math).

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Supabase, Recharts, next-intl, Tailwind CSS 4, Vitest

**Spec:** `docs/superpowers/specs/2026-03-19-spreadsheet-features-design.md`

---

## File Structure

```
supabase/migrations/
  002_batch1_cashflow_wealth_roic.sql     — New tables, enums, indexes, RLS

src/types/
  calculator.ts                           — Extended with Cashflow, ROIC, WealthPillar types
  database.ts                             — Extended PlanType union

src/lib/
  cashflow-math.ts                        — Cashflow ratio calculations (pure functions)
  roic-math.ts                            — ROIC, Sloan, fair value calculations (pure functions)

src/lib/__tests__/
  cashflow-math.test.ts                   — Unit tests for cashflow ratios
  roic-math.test.ts                       — Unit tests for ROIC formulas

src/components/calculator/cashflow/
  cashflow-template-form.tsx              — Manage recurring income/expense templates
  cashflow-month-view.tsx                 — Monthly transaction view (auto-fill + manual)
  cashflow-results.tsx                    — Financial health ratios dashboard

src/components/calculator/cashflow/__tests__/
  cashflow-page.test.tsx                  — Page integration test

src/app/[locale]/(auth)/calculator/cashflow/
  page.tsx                                — Cashflow Tracker page

src/components/calculator/roic/
  roic-form.tsx                           — Stock financial input form
  roic-results.tsx                        — ROIC gauge, Sloan, fair value display
  roic-ranking-table.tsx                  — Multi-stock sortable ranking table

src/components/calculator/roic/__tests__/
  roic-page.test.tsx                      — Page integration test

src/app/[locale]/(auth)/calculator/roic/
  page.tsx                                — ROIC Analyzer page

src/components/dashboard/
  emergency-fund-card.tsx                 — Emergency fund pillar card
  education-fund-card.tsx                 — Education fund pillar card
  retirement-wealth-card.tsx              — Retirement wealth pillar card
  insurance-portfolio-card.tsx            — Insurance portfolio pillar card
  wealth-overview.tsx                     — Grid of 4 pillar cards

messages/
  en.json                                 — Extended with cashflow, roic, wealthPillars keys
  th.json                                 — Extended with cashflow, roic, wealthPillars keys
```

---

## Task 1: Database Migration

**Files:**
- Create: `supabase/migrations/002_batch1_cashflow_wealth_roic.sql`
- Modify: `src/types/database.ts`

- [ ] **Step 1: Write the migration SQL**

Create `supabase/migrations/002_batch1_cashflow_wealth_roic.sql`:

```sql
-- =============================================
-- Batch 1: Cashflow Tracker, Wealth Pillars, ROIC
-- =============================================

-- ===== ENUMS =====

CREATE TYPE cashflow_direction AS ENUM ('income', 'expense', 'saving', 'investment');
CREATE TYPE cashflow_category AS ENUM (
  'salary', 'overtime', 'bonus', 'allowance',
  'insurance_life', 'insurance_health', 'insurance_pension',
  'rmf', 'ssf', 'pvd', 'gpf', 'tesg',
  'personal', 'family', 'transport', 'education',
  'travel', 'housing', 'debt', 'donation', 'other'
);

-- ===== Extend plan_type =====

-- Batch 1 types
ALTER TYPE plan_type ADD VALUE 'cashflow';
ALTER TYPE plan_type ADD VALUE 'roic';
-- Forward declarations for Batch 2/3 (no pages/logic yet — safe to add now since
-- Postgres enum values cannot be added inside transactions, so we do them all upfront)
ALTER TYPE plan_type ADD VALUE 'gpf_optimizer';
ALTER TYPE plan_type ADD VALUE 'tipp';
ALTER TYPE plan_type ADD VALUE 'portfolio_health';
ALTER TYPE plan_type ADD VALUE 'bumnan95';

-- ===== TABLE: cashflow_templates =====

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

-- ===== TABLE: cashflow_transactions =====

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

-- ===== TABLE: wealth_pillars =====

CREATE TABLE wealth_pillars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pillar_type TEXT NOT NULL CHECK (pillar_type IN ('emergency', 'education', 'retirement', 'insurance')),
  balance NUMERIC,
  monthly_expenses NUMERIC,
  goal_amount NUMERIC,
  current_amount NUMERIC,
  target_date DATE,
  gpf_value NUMERIC,
  rmf_value NUMERIC,
  other_retirement NUMERIC,
  target_corpus NUMERIC,
  policies JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, pillar_type),
  CHECK (pillar_type != 'emergency' OR (balance IS NOT NULL AND monthly_expenses IS NOT NULL)),
  CHECK (pillar_type != 'education' OR (goal_amount IS NOT NULL AND current_amount IS NOT NULL)),
  CHECK (pillar_type != 'retirement' OR target_corpus IS NOT NULL),
  CHECK (pillar_type != 'insurance' OR policies IS NOT NULL)
);

CREATE TRIGGER set_wealth_pillars_updated_at
  BEFORE UPDATE ON wealth_pillars
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===== INDEXES =====

CREATE INDEX idx_cashflow_templates_user ON cashflow_templates(user_id);
CREATE INDEX idx_cashflow_transactions_user_period ON cashflow_transactions(user_id, year, month);

-- ===== ROW LEVEL SECURITY =====

ALTER TABLE cashflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE cashflow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wealth_pillars ENABLE ROW LEVEL SECURITY;

-- Cashflow templates
CREATE POLICY "Users can view own templates"
  ON cashflow_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own templates"
  ON cashflow_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own templates"
  ON cashflow_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own templates"
  ON cashflow_templates FOR DELETE USING (auth.uid() = user_id);

-- Cashflow transactions
CREATE POLICY "Users can view own transactions"
  ON cashflow_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own transactions"
  ON cashflow_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions"
  ON cashflow_transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions"
  ON cashflow_transactions FOR DELETE USING (auth.uid() = user_id);

-- Wealth pillars
CREATE POLICY "Users can view own pillars"
  ON wealth_pillars FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own pillars"
  ON wealth_pillars FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pillars"
  ON wealth_pillars FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own pillars"
  ON wealth_pillars FOR DELETE USING (auth.uid() = user_id);
```

- [ ] **Step 2: Update TypeScript database types**

In `src/types/database.ts`, update the `PlanType` union:

```typescript
export type PlanType =
  | "retirement"
  | "withdrawal"
  | "stress_test"
  | "mpt"
  | "dca"
  | "tax"
  | "cashflow"
  | "roic"
  | "gpf_optimizer"
  | "tipp"
  | "portfolio_health"
  | "bumnan95";
```

Add new types at the end of the file (before the `Database` interface):

```typescript
export type CashflowDirection = "income" | "expense" | "saving" | "investment";
export type CashflowCategory =
  | "salary" | "overtime" | "bonus" | "allowance"
  | "insurance_life" | "insurance_health" | "insurance_pension"
  | "rmf" | "ssf" | "pvd" | "gpf" | "tesg"
  | "personal" | "family" | "transport" | "education"
  | "travel" | "housing" | "debt" | "donation" | "other";

export interface CashflowTemplate {
  id: string;
  user_id: string;
  name: string;
  direction: CashflowDirection;
  category: CashflowCategory;
  amount: number;
  is_active: boolean;
  updated_at: string;
  created_at: string;
}

export interface CashflowTransaction {
  id: string;
  user_id: string;
  template_id: string | null;
  direction: CashflowDirection;
  category: CashflowCategory;
  name: string;
  amount: number;
  month: number;
  year: number;
  created_at: string;
}

export type WealthPillarType = "emergency" | "education" | "retirement" | "insurance";

export interface WealthPillarRow {
  id: string;
  user_id: string;
  pillar_type: WealthPillarType;
  balance: number | null;
  monthly_expenses: number | null;
  goal_amount: number | null;
  current_amount: number | null;
  target_date: string | null;
  gpf_value: number | null;
  rmf_value: number | null;
  other_retirement: number | null;
  target_corpus: number | null;
  policies: InsurancePolicyRow[] | null;
  updated_at: string;
}

export interface InsurancePolicyRow {
  name: string;
  type: "wholelife" | "saving" | "annuity" | "term" | "critical_illness" | "health";
  death_benefit: number;
  ci_coverage: number;
  surrender_value: number;
  annual_premium: number;
}
```

Also add the new tables to the `Database` interface's `Tables` section.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/002_batch1_cashflow_wealth_roic.sql src/types/database.ts
git commit -m "feat: add Batch 1 migration — cashflow, wealth_pillars tables + extended plan_type"
```

---

## Task 2: Cashflow Math Library + Tests

**Files:**
- Create: `src/lib/cashflow-math.ts`
- Create: `src/lib/__tests__/cashflow-math.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/__tests__/cashflow-math.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  calculateCashflowResults,
  type CashflowTransactionInput,
} from "@/lib/cashflow-math";

const sampleTransactions: CashflowTransactionInput[] = [
  { direction: "income", category: "salary", amount: 40000 },
  { direction: "income", category: "overtime", amount: 5000 },
  { direction: "expense", category: "personal", amount: 8000 },
  { direction: "expense", category: "family", amount: 12000 },
  { direction: "expense", category: "transport", amount: 3000 },
  { direction: "expense", category: "debt", amount: 5000 },
  { direction: "saving", category: "rmf", amount: 5000 },
  { direction: "investment", category: "ssf", amount: 3000 },
  { direction: "saving", category: "insurance_life", amount: 2000 },
];

describe("calculateCashflowResults", () => {
  it("calculates total income correctly", () => {
    const result = calculateCashflowResults(sampleTransactions);
    expect(result.totalIncome).toBe(45000);
  });

  it("calculates total expenses correctly (not savings/investments)", () => {
    const result = calculateCashflowResults(sampleTransactions);
    expect(result.totalExpenses).toBe(28000); // 8000 + 12000 + 3000 + 5000
  });

  it("calculates net cashflow as income minus expenses only", () => {
    const result = calculateCashflowResults(sampleTransactions);
    expect(result.netCashflow).toBe(17000); // 45000 - 28000
  });

  it("calculates savings/investment ratio", () => {
    const result = calculateCashflowResults(sampleTransactions);
    // (5000 + 3000 + 2000) / 45000 = 0.2222...
    expect(result.savingsInvestmentRatio).toBeCloseTo(0.2222, 3);
  });

  it("calculates debt service ratio", () => {
    const result = calculateCashflowResults(sampleTransactions);
    // 5000 / 45000 = 0.1111...
    expect(result.debtServiceRatio).toBeCloseTo(0.1111, 3);
  });

  it("calculates insurance/risk ratio", () => {
    const result = calculateCashflowResults(sampleTransactions);
    // 2000 / 45000 = 0.0444...
    expect(result.insuranceRiskRatio).toBeCloseTo(0.0444, 3);
  });

  it("calculates tax-deductible total including TESG", () => {
    const result = calculateCashflowResults(sampleTransactions);
    // rmf 5000 + ssf 3000 + insurance_life 2000 = 10000
    expect(result.taxDeductibleTotal).toBe(10000);
  });

  it("builds lifestyle breakdown by category", () => {
    const result = calculateCashflowResults(sampleTransactions);
    expect(result.lifestyleBreakdown.personal).toBe(8000);
    expect(result.lifestyleBreakdown.family).toBe(12000);
    expect(result.lifestyleBreakdown.transport).toBe(3000);
    expect(result.lifestyleBreakdown.education).toBe(0);
  });

  it("handles empty transaction list", () => {
    const result = calculateCashflowResults([]);
    expect(result.totalIncome).toBe(0);
    expect(result.totalExpenses).toBe(0);
    expect(result.netCashflow).toBe(0);
    expect(result.savingsInvestmentRatio).toBe(0);
    expect(result.debtServiceRatio).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/__tests__/cashflow-math.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write the implementation**

Create `src/lib/cashflow-math.ts`:

```typescript
export interface CashflowTransactionInput {
  direction: "income" | "expense" | "saving" | "investment";
  category: string;
  amount: number;
}

export interface CashflowResults {
  totalIncome: number;
  totalExpenses: number;
  totalSavingsInvestment: number;
  totalOutflow: number;
  netCashflow: number;
  savingsInvestmentRatio: number;
  insuranceRiskRatio: number;
  debtServiceRatio: number;
  taxDeductibleTotal: number;
  lifestyleBreakdown: {
    personal: number;
    family: number;
    transport: number;
    education: number;
    travel: number;
    housing: number;
    other: number;
  };
}

const TAX_DEDUCTIBLE_CATEGORIES = new Set([
  "rmf", "ssf", "pvd", "gpf", "tesg",
  "insurance_life", "insurance_health", "insurance_pension",
]);

const INSURANCE_CATEGORIES = new Set([
  "insurance_life", "insurance_health", "insurance_pension",
]);

export function calculateCashflowResults(
  transactions: CashflowTransactionInput[]
): CashflowResults {
  let totalIncome = 0;
  let totalExpenses = 0;
  let totalSavingsInvestment = 0;
  let debtTotal = 0;
  let insuranceTotal = 0;
  let taxDeductibleTotal = 0;

  const lifestyle = {
    personal: 0,
    family: 0,
    transport: 0,
    education: 0,
    travel: 0,
    housing: 0,
    other: 0,
  };

  for (const tx of transactions) {
    if (tx.direction === "income") {
      totalIncome += tx.amount;
    } else if (tx.direction === "expense") {
      totalExpenses += tx.amount;
      if (tx.category === "debt") debtTotal += tx.amount;
      if (tx.category in lifestyle) {
        lifestyle[tx.category as keyof typeof lifestyle] += tx.amount;
      } else if (tx.category !== "debt" && tx.category !== "donation") {
        lifestyle.other += tx.amount;
      }
    } else {
      // saving or investment
      totalSavingsInvestment += tx.amount;
    }

    if (TAX_DEDUCTIBLE_CATEGORIES.has(tx.category)) {
      taxDeductibleTotal += tx.amount;
    }
    if (INSURANCE_CATEGORIES.has(tx.category)) {
      insuranceTotal += tx.amount;
    }
  }

  const totalOutflow = totalExpenses + totalSavingsInvestment;
  const netCashflow = totalIncome - totalExpenses;

  return {
    totalIncome,
    totalExpenses,
    totalSavingsInvestment,
    totalOutflow,
    netCashflow,
    savingsInvestmentRatio: totalIncome > 0 ? totalSavingsInvestment / totalIncome : 0,
    insuranceRiskRatio: totalIncome > 0 ? insuranceTotal / totalIncome : 0,
    debtServiceRatio: totalIncome > 0 ? debtTotal / totalIncome : 0,
    taxDeductibleTotal,
    lifestyleBreakdown: lifestyle,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/__tests__/cashflow-math.test.ts`
Expected: All 9 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/cashflow-math.ts src/lib/__tests__/cashflow-math.test.ts
git commit -m "feat: add cashflow math library with ratio calculations"
```

---

## Task 3: ROIC Math Library + Tests

**Files:**
- Create: `src/lib/roic-math.ts`
- Create: `src/lib/__tests__/roic-math.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/__tests__/roic-math.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  calculateRoic,
  type RoicInputs,
  type RoicResults,
} from "@/lib/roic-math";

// MEGA from spreadsheet: EBIT 2,012M, IC 10,748M, ROIC 18.72%
const megaInputs: RoicInputs = {
  ticker: "MEGA",
  ebit: 2012,
  taxRate: 0.20,
  totalAssets: 15000,
  currentLiabilities: 3000,
  cashAndEquivalents: 1252,
  netIncome: 1800,
  operatingCashFlow: 2000,
  wacc: 0.08,
  growthRate: 0.02,
};

describe("calculateRoic", () => {
  it("calculates NOPAT correctly", () => {
    const result = calculateRoic(megaInputs);
    // 2012 * (1 - 0.20) = 1609.6
    expect(result.nopat).toBeCloseTo(1609.6, 1);
  });

  it("calculates invested capital correctly", () => {
    const result = calculateRoic(megaInputs);
    // 15000 - 3000 - 1252 = 10748
    expect(result.investedCapital).toBe(10748);
  });

  it("calculates ROIC correctly", () => {
    const result = calculateRoic(megaInputs);
    // 1609.6 / 10748 = 0.1498 ≈ 14.98%
    expect(result.roic).toBeCloseTo(0.1498, 3);
  });

  it("calculates Sloan ratio correctly", () => {
    const result = calculateRoic(megaInputs);
    // (1800 - 2000) / 15000 = -0.01333 (negative = good quality)
    expect(result.sloanRatio).toBeCloseTo(-0.01333, 4);
  });

  it("calculates fair equity value correctly", () => {
    const result = calculateRoic(megaInputs);
    // 1609.6 / (0.08 - 0.02) = 26826.67
    expect(result.fairEquityValue).toBeCloseTo(26826.67, 0);
  });

  it("calculates ROIC vs WACC spread", () => {
    const result = calculateRoic(megaInputs);
    expect(result.roicVsWacc).toBeCloseTo(0.0698, 3);
  });

  it("assigns quality rating based on ROIC and Sloan", () => {
    const result = calculateRoic(megaInputs);
    // ROIC ~15% and Sloan < 0 → "Good"
    expect(result.qualityRating).toBe("Good");
  });

  it("returns Excellent for ROIC > 20% with negative Sloan", () => {
    const result = calculateRoic({
      ...megaInputs,
      ebit: 3000, // higher EBIT → higher ROIC
    });
    expect(result.qualityRating).toBe("Excellent");
  });

  it("throws error when growthRate >= wacc", () => {
    expect(() =>
      calculateRoic({ ...megaInputs, growthRate: 0.08 })
    ).toThrow("Growth rate must be less than WACC");

    expect(() =>
      calculateRoic({ ...megaInputs, growthRate: 0.10 })
    ).toThrow("Growth rate must be less than WACC");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/__tests__/roic-math.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write the implementation**

Create `src/lib/roic-math.ts`:

```typescript
export interface RoicInputs {
  ticker: string;
  ebit: number;
  taxRate: number;
  totalAssets: number;
  currentLiabilities: number;
  cashAndEquivalents: number;
  netIncome: number;
  operatingCashFlow: number;
  wacc: number;
  growthRate: number;
}

export interface RoicResults {
  nopat: number;
  investedCapital: number;
  roic: number;
  sloanRatio: number;
  fairEquityValue: number;
  roicVsWacc: number;
  qualityRating: "Excellent" | "Good" | "Moderate" | "Poor";
}

export function calculateRoic(inputs: RoicInputs): RoicResults {
  if (inputs.growthRate >= inputs.wacc) {
    throw new Error("Growth rate must be less than WACC");
  }

  const nopat = inputs.ebit * (1 - inputs.taxRate);
  const investedCapital =
    inputs.totalAssets - inputs.currentLiabilities - inputs.cashAndEquivalents;
  const roic = investedCapital > 0 ? nopat / investedCapital : 0;
  const sloanRatio =
    inputs.totalAssets > 0
      ? (inputs.netIncome - inputs.operatingCashFlow) / inputs.totalAssets
      : 0;
  const fairEquityValue = nopat / (inputs.wacc - inputs.growthRate);
  const roicVsWacc = roic - inputs.wacc;

  let qualityRating: RoicResults["qualityRating"];
  if (roic > 0.20 && sloanRatio < 0) {
    qualityRating = "Excellent";
  } else if (roic > 0.15) {
    qualityRating = "Good";
  } else if (roic > 0.08) {
    qualityRating = "Moderate";
  } else {
    qualityRating = "Poor";
  }

  return {
    nopat,
    investedCapital,
    roic,
    sloanRatio,
    fairEquityValue,
    roicVsWacc,
    qualityRating,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/__tests__/roic-math.test.ts`
Expected: All 9 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/roic-math.ts src/lib/__tests__/roic-math.test.ts
git commit -m "feat: add ROIC math library with Sloan ratio and fair value"
```

---

## Task 4: Calculator Types Extension

**Files:**
- Modify: `src/types/calculator.ts`

- [ ] **Step 1: Add ROIC types to calculator.ts**

Append to `src/types/calculator.ts`:

```typescript
// ===== ROIC Analyzer =====

export type { RoicInputs, RoicResults } from "@/lib/roic-math";

// ===== Cashflow Tracker =====

export type { CashflowTransactionInput, CashflowResults } from "@/lib/cashflow-math";

// ===== Wealth Pillars =====

export interface InsurancePolicy {
  name: string;
  type: "wholelife" | "saving" | "annuity" | "term" | "critical_illness" | "health";
  deathBenefit: number;
  ciCoverage: number;
  surrenderValue: number;
  annualPremium: number;
}

export interface WealthPillarData {
  emergency: {
    balance: number;
    monthlyExpenses: number;
    monthsCoverage: number;
    status: "STRONG" | "MODERATE" | "WEAK";
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

- [ ] **Step 2: Commit**

```bash
git add src/types/calculator.ts
git commit -m "feat: add ROIC, Cashflow, WealthPillar types to calculator.ts"
```

---

## Task 5: i18n Messages

**Files:**
- Modify: `messages/en.json`
- Modify: `messages/th.json`

- [ ] **Step 1: Add English messages**

**IMPORTANT: MERGE into the existing JSON — do NOT replace the file.** Read `messages/en.json` first, then add these keys as new nested objects inside the existing `"calculator"` and `"dashboard"` top-level objects. The existing flat keys (e.g., `"currentAge"`, `"retirementAge"`) in `"calculator"` must remain untouched.

```json
{
  "calculator": {
    "cashflow": {
      "title": "Cashflow Tracker",
      "subtitle": "Track your income, expenses, and financial health ratios",
      "templates": "Recurring Items",
      "addTemplate": "Add Recurring Item",
      "monthView": "Monthly View",
      "addTransaction": "Add Transaction",
      "results": "Financial Health",
      "totalIncome": "Total Income",
      "totalExpenses": "Total Expenses",
      "netCashflow": "Net Cashflow",
      "savingsRatio": "Savings & Investment Ratio",
      "debtRatio": "Debt Service Ratio",
      "insuranceRatio": "Insurance Ratio",
      "taxDeductible": "Tax-Deductible Total",
      "lifestyle": "Lifestyle Breakdown",
      "noTransactions": "No transactions for this month"
    },
    "roic": {
      "title": "ROIC Stock Analyzer",
      "subtitle": "Analyze Return on Invested Capital and stock fair value",
      "inputSection": "Financial Data",
      "ebit": "EBIT (Operating Profit)",
      "taxRate": "Corporate Tax Rate",
      "totalAssets": "Total Assets",
      "currentLiabilities": "Current Liabilities",
      "cash": "Cash & Equivalents",
      "netIncome": "Net Income",
      "operatingCashFlow": "Operating Cash Flow",
      "wacc": "WACC (Cost of Capital)",
      "growthRate": "Terminal Growth Rate",
      "results": "Analysis Results",
      "nopat": "NOPAT",
      "investedCapital": "Invested Capital",
      "roicLabel": "ROIC",
      "sloan": "Sloan Accrual Ratio",
      "fairValue": "Fair Equity Value",
      "roicVsWacc": "ROIC vs WACC",
      "quality": "Quality Rating",
      "ranking": "Stock Ranking",
      "excellent": "Excellent",
      "good": "Good",
      "moderate": "Moderate",
      "poor": "Poor",
      "growthRateError": "Growth rate must be less than WACC"
    }
  },
  "dashboard": {
    "wealthPillars": {
      "title": "Wealth Overview",
      "emergency": "Emergency Fund",
      "emergencyMonths": "{months} months coverage",
      "education": "Education Fund",
      "educationProgress": "{percent}% of goal",
      "retirement": "Retirement Wealth",
      "retirementProgress": "{percent}% of target",
      "insurance": "Insurance Portfolio",
      "deathBenefit": "Death Benefit",
      "ciCoverage": "CI Coverage",
      "surrenderValue": "Surrender Value",
      "strong": "Strong",
      "moderate": "Moderate",
      "weak": "Weak",
      "policies": "Policies",
      "noPolicies": "No policies added"
    }
  }
}
```

- [ ] **Step 2: Add Thai messages**

**IMPORTANT: MERGE into the existing JSON — same approach as Step 1.** Read `messages/th.json` first, then add these keys:

```json
{
  "calculator": {
    "cashflow": {
      "title": "บันทึกกระแสเงินสด",
      "subtitle": "ติดตามรายรับ รายจ่าย และอัตราส่วนสุขภาพการเงิน",
      "templates": "รายการประจำ",
      "addTemplate": "เพิ่มรายการประจำ",
      "monthView": "มุมมองรายเดือน",
      "addTransaction": "เพิ่มรายการ",
      "results": "สุขภาพการเงิน",
      "totalIncome": "รายรับรวม",
      "totalExpenses": "รายจ่ายรวม",
      "netCashflow": "กระแสเงินสดสุทธิ",
      "savingsRatio": "อัตราส่วนออม-ลงทุน",
      "debtRatio": "อัตราส่วนภาระหนี้",
      "insuranceRatio": "อัตราส่วนประกัน",
      "taxDeductible": "ยอดลดหย่อนภาษีรวม",
      "lifestyle": "รายจ่ายตามหมวด",
      "noTransactions": "ไม่มีรายการในเดือนนี้"
    },
    "roic": {
      "title": "วิเคราะห์ ROIC หุ้น",
      "subtitle": "วิเคราะห์ผลตอบแทนจากเงินลงทุนและมูลค่าเหมาะสม",
      "inputSection": "ข้อมูลการเงิน",
      "ebit": "EBIT (กำไรจากการดำเนินงาน)",
      "taxRate": "อัตราภาษีนิติบุคคล",
      "totalAssets": "สินทรัพย์รวม",
      "currentLiabilities": "หนี้สินหมุนเวียน",
      "cash": "เงินสดและรายการเทียบเท่า",
      "netIncome": "กำไรสุทธิ",
      "operatingCashFlow": "กระแสเงินสดจากการดำเนินงาน",
      "wacc": "WACC (ต้นทุนเงินทุน)",
      "growthRate": "อัตราเติบโตระยะยาว",
      "results": "ผลวิเคราะห์",
      "nopat": "NOPAT",
      "investedCapital": "เงินลงทุน",
      "roicLabel": "ROIC",
      "sloan": "อัตราส่วน Sloan",
      "fairValue": "มูลค่าเหมาะสม",
      "roicVsWacc": "ROIC เทียบ WACC",
      "quality": "ระดับคุณภาพ",
      "ranking": "จัดอันดับหุ้น",
      "excellent": "ยอดเยี่ยม",
      "good": "ดี",
      "moderate": "ปานกลาง",
      "poor": "ต่ำ",
      "growthRateError": "อัตราเติบโตต้องน้อยกว่า WACC"
    }
  },
  "dashboard": {
    "wealthPillars": {
      "title": "ภาพรวมความมั่งคั่ง",
      "emergency": "เงินสำรองฉุกเฉิน",
      "emergencyMonths": "ครอบคลุม {months} เดือน",
      "education": "กองทุนการศึกษา",
      "educationProgress": "{percent}% ของเป้าหมาย",
      "retirement": "ความมั่งคั่งเกษียณ",
      "retirementProgress": "{percent}% ของเป้าหมาย",
      "insurance": "พอร์ตประกัน",
      "deathBenefit": "ทุนประกันชีวิต",
      "ciCoverage": "ทุนประกัน CI",
      "surrenderValue": "มูลค่าเวนคืน",
      "strong": "แข็งแกร่ง",
      "moderate": "ปานกลาง",
      "weak": "อ่อนแอ",
      "policies": "กรมธรรม์",
      "noPolicies": "ยังไม่มีกรมธรรม์"
    }
  }
}
```

Note: These should be merged into the existing JSON structure, not replace it. Check the current key structure before inserting.

- [ ] **Step 3: Commit**

```bash
git add messages/en.json messages/th.json
git commit -m "feat: add i18n messages for cashflow, ROIC, and wealth pillars (th/en)"
```

---

## Task 6: Cashflow Tracker Page + Components

**Files:**
- Create: `src/app/[locale]/(auth)/calculator/cashflow/page.tsx`
- Create: `src/components/calculator/cashflow/cashflow-template-form.tsx`
- Create: `src/components/calculator/cashflow/cashflow-month-view.tsx`
- Create: `src/components/calculator/cashflow/cashflow-results.tsx`

- [ ] **Step 1: Create the template form component**

Create `src/components/calculator/cashflow/cashflow-template-form.tsx`:

A form component that:
- Lists active templates in a table (name, direction, category, amount)
- Has "Add" button opening an inline form with: name input, direction select, category select (filtered by direction), amount input
- Edit/delete buttons per row
- Props: `templates: CashflowTemplate[]`, `onAdd: (t) => void`, `onUpdate: (id, t) => void`, `onDelete: (id) => void`

Follow the existing pattern from `src/components/calculator/retirement/government-form.tsx` — use `Card`, `CardHeader`, `CardTitle`, `CardContent`, `Input`, `Select`, `Button` from the UI library.

- [ ] **Step 2: Create the month view component**

Create `src/components/calculator/cashflow/cashflow-month-view.tsx`:

A component that:
- Shows month/year selector at top
- Lists transactions grouped by direction (Income, Expenses, Savings/Investments)
- Auto-fills from active templates with "Auto" badge
- Manual "Add Transaction" button per section
- Inline edit/delete for each row
- Props: `transactions: CashflowTransaction[]`, `templates: CashflowTemplate[]`, `month: number`, `year: number`, `onAdd/onUpdate/onDelete`

- [ ] **Step 3: Create the results component**

Create `src/components/calculator/cashflow/cashflow-results.tsx`:

A component that:
- Displays `CashflowResults` in a card grid
- Row 1: Total Income, Total Expenses, Net Cashflow (colored green/red)
- Row 2: Savings Ratio (with target bar at 20%), Debt Ratio (with warning at 40%), Insurance Ratio
- Row 3: Tax-Deductible Total
- Row 4: Lifestyle breakdown as horizontal stacked bar (Recharts)
- Props: `results: CashflowResults`

- [ ] **Step 4: Create the page**

Create `src/app/[locale]/(auth)/calculator/cashflow/page.tsx`:

```typescript
"use client";

import { useState, useMemo } from "react";
import { CashflowTemplateForm } from "@/components/calculator/cashflow/cashflow-template-form";
import { CashflowMonthView } from "@/components/calculator/cashflow/cashflow-month-view";
import { CashflowResultsView } from "@/components/calculator/cashflow/cashflow-results";
import { calculateCashflowResults } from "@/lib/cashflow-math";
import type { CashflowTemplate, CashflowTransaction } from "@/types/database";

// For now, use local state. Supabase integration added when wiring up.
export default function CashflowPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [templates, setTemplates] = useState<CashflowTemplate[]>([]);
  const [transactions, setTransactions] = useState<CashflowTransaction[]>([]);

  const results = useMemo(() => {
    const current = transactions.filter(
      (t) => t.month === month && t.year === year
    );
    return { transactions: current, results: calculateCashflowResults(current) };
  }, [transactions, month, year]);

  const currentTransactions = results.transactions;
  const cashflowResults = results.results;

  // Template CRUD handlers...
  // Transaction CRUD handlers...
  // Auto-fill from templates on month change...

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text font-heading">Cashflow Tracker</h1>
        <p className="text-sm text-text-muted">Track your income, expenses, and financial health ratios</p>
      </div>
      <CashflowTemplateForm templates={templates} onAdd={...} onUpdate={...} onDelete={...} />
      <CashflowMonthView
        transactions={currentTransactions}
        templates={templates}
        month={month}
        year={year}
        onMonthChange={setMonth}
        onYearChange={setYear}
        onAdd={...}
        onUpdate={...}
        onDelete={...}
      />
      {currentTransactions.length > 0 && <CashflowResultsView results={results} />}
    </div>
  );
}
```

Note: The `...` handlers follow the pattern of managing local state arrays. Supabase integration is wired up in Task 9.

- [ ] **Step 5: Commit**

```bash
git add src/app/[locale]/(auth)/calculator/cashflow/ src/components/calculator/cashflow/
git commit -m "feat: add Cashflow Tracker page and components"
```

---

## Task 7: ROIC Analyzer Page + Components

**Files:**
- Create: `src/app/[locale]/(auth)/calculator/roic/page.tsx`
- Create: `src/components/calculator/roic/roic-form.tsx`
- Create: `src/components/calculator/roic/roic-results.tsx`
- Create: `src/components/calculator/roic/roic-ranking-table.tsx`

- [ ] **Step 1: Create the ROIC form component**

Create `src/components/calculator/roic/roic-form.tsx`:

A form with inputs for: ticker (text or select from funds), EBIT, tax rate (default 20%), total assets, current liabilities, cash, net income, operating cash flow, WACC (default 8%), growth rate (default 2%).

Props: `onCalculate: (inputs: RoicInputs) => void`, `funds?: Fund[]` (optional fund selection)

Validation: show error if `growthRate >= wacc`.

- [ ] **Step 2: Create the ROIC results component**

Create `src/components/calculator/roic/roic-results.tsx`:

Displays `RoicResults` in a card layout:
- ROIC gauge (circular progress, color-coded by quality rating)
- NOPAT and Invested Capital side by side
- Sloan ratio with indicator (negative = green "Quality Earnings", positive = red "Accrual Warning")
- Fair Equity Value displayed prominently
- ROIC vs WACC spread bar (green if positive, red if negative)
- Quality rating badge (Excellent/Good/Moderate/Poor with color)

- [ ] **Step 3: Create the ranking table component**

Create `src/components/calculator/roic/roic-ranking-table.tsx`:

A sortable table showing multiple stocks. Columns: Ticker, Name, ROIC (current), ROIC (Y-1), ROIC (Y-2), Sloan, Fair Value, Rating.

Props: `entries: RoicRankingEntry[]`

Sortable by clicking column headers. Color-coded rating badges.

- [ ] **Step 4: Create the page**

Create `src/app/[locale]/(auth)/calculator/roic/page.tsx`:

Two tabs (using the existing Tabs component):
1. **Analyze** tab — form + results for single stock
2. **Ranking** tab — table of all stocks from funds DB

Follow the pattern from `mpt/page.tsx`. Use `SAMPLE_STOCKS` array initially with data from the spreadsheet (MEGA, BH, ADVANC, BDMS). Supabase fetch added in Task 9.

- [ ] **Step 5: Commit**

```bash
git add src/app/[locale]/(auth)/calculator/roic/ src/components/calculator/roic/
git commit -m "feat: add ROIC Stock Analyzer page and components"
```

---

## Task 8: 4-Pillar Wealth Dashboard Cards

**Files:**
- Create: `src/components/dashboard/emergency-fund-card.tsx`
- Create: `src/components/dashboard/education-fund-card.tsx`
- Create: `src/components/dashboard/retirement-wealth-card.tsx`
- Create: `src/components/dashboard/insurance-portfolio-card.tsx`
- Create: `src/components/dashboard/wealth-overview.tsx`

- [ ] **Step 1: Create emergency fund card**

Create `src/components/dashboard/emergency-fund-card.tsx`:

```typescript
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface EmergencyFundCardProps {
  balance: number;
  monthlyExpenses: number;
}

export function EmergencyFundCard({ balance, monthlyExpenses }: EmergencyFundCardProps) {
  const months = monthlyExpenses > 0 ? balance / monthlyExpenses : 0;
  const status = months >= 6 ? "STRONG" : months >= 3 ? "MODERATE" : "WEAK";
  const statusColor = status === "STRONG" ? "success" : status === "MODERATE" ? "warning" : "danger";

  return (
    <Card>
      <CardContent className="py-4">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Emergency Fund</p>
        <p className="text-2xl font-bold text-text mt-1">฿{balance.toLocaleString()}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm text-text-muted">{months.toFixed(1)} months coverage</span>
          <Badge variant={statusColor}>{status}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Create education fund card**

Create `src/components/dashboard/education-fund-card.tsx`:

Shows `currentAmount`, progress bar toward `goalAmount`, percentage, target date.

- [ ] **Step 3: Create retirement wealth card**

Create `src/components/dashboard/retirement-wealth-card.tsx`:

Shows GPF + RMF + Other = Total Retirement. Progress bar toward `targetCorpus`. Percentage.

- [ ] **Step 4: Create insurance portfolio card**

Create `src/components/dashboard/insurance-portfolio-card.tsx`:

Shows total death benefit, CI coverage, surrender value. Expandable policy list.

- [ ] **Step 5: Create wealth overview grid**

Create `src/components/dashboard/wealth-overview.tsx`:

```typescript
"use client";

import { EmergencyFundCard } from "./emergency-fund-card";
import { EducationFundCard } from "./education-fund-card";
import { RetirementWealthCard } from "./retirement-wealth-card";
import { InsurancePortfolioCard } from "./insurance-portfolio-card";
import type { WealthPillarData } from "@/types/calculator";

interface WealthOverviewProps {
  data: WealthPillarData | null;
}

export function WealthOverview({ data }: WealthOverviewProps) {
  if (!data) {
    return (
      <div className="text-center py-8 text-text-muted text-sm">
        Set up your wealth pillars in your profile to see your overview.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <EmergencyFundCard
        balance={data.emergency.balance}
        monthlyExpenses={data.emergency.monthlyExpenses}
      />
      <EducationFundCard
        currentAmount={data.education.currentAmount}
        goalAmount={data.education.goalAmount}
        targetDate={data.education.targetDate}
      />
      <RetirementWealthCard
        gpfValue={data.retirement.gpfValue}
        rmfValue={data.retirement.rmfValue}
        otherRetirement={data.retirement.otherRetirement}
        targetCorpus={data.retirement.targetCorpus}
      />
      <InsurancePortfolioCard
        policies={data.insurance.policies}
      />
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/dashboard/emergency-fund-card.tsx src/components/dashboard/education-fund-card.tsx src/components/dashboard/retirement-wealth-card.tsx src/components/dashboard/insurance-portfolio-card.tsx src/components/dashboard/wealth-overview.tsx
git commit -m "feat: add 4-pillar wealth dashboard cards"
```

---

## Task 9: Supabase Integration

**Files:**
- Modify: `src/app/[locale]/(auth)/calculator/cashflow/page.tsx`
- Modify: `src/app/[locale]/(auth)/calculator/roic/page.tsx`
- Modify: Dashboard layout to include wealth overview

- [ ] **Step 1: Add Supabase CRUD to cashflow page**

Replace local state with Supabase queries:
- Fetch templates: `supabase.from('cashflow_templates').select('*').eq('user_id', userId)`
- Fetch transactions: `supabase.from('cashflow_transactions').select('*').eq('user_id', userId).eq('month', month).eq('year', year)`
- Insert/update/delete handlers for both tables
- Auto-fill: on month change, create transactions from active templates if none exist for that month

Follow the existing Supabase pattern used in other pages (check `src/app/[locale]/(auth)/profile/page.tsx` or similar for the client setup pattern).

- [ ] **Step 2: Add Supabase fetch to ROIC page**

Replace `SAMPLE_STOCKS` with:
- Fetch funds with ROIC data: `supabase.from('funds').select('*').not('roic_current', 'is', null)`
- Populate ranking table from funds
- Keep manual input form as fallback for custom analysis

- [ ] **Step 3: Wire wealth overview to dashboard**

Add `WealthOverview` to the dashboard page:
- Fetch from `wealth_pillars` table: `supabase.from('wealth_pillars').select('*').eq('user_id', userId)`
- Transform rows into `WealthPillarData` shape
- Render below the existing health score card

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/(auth)/calculator/cashflow/page.tsx src/app/[locale]/(auth)/calculator/roic/page.tsx
git commit -m "feat: wire Supabase integration for cashflow, ROIC, and wealth pillars"
```

---

## Task 10: Integration Tests

**Files:**
- Create: `src/components/calculator/cashflow/__tests__/cashflow-page.test.tsx`
- Create: `src/components/calculator/roic/__tests__/roic-page.test.tsx`

- [ ] **Step 1: Write cashflow page test**

Create `src/components/calculator/cashflow/__tests__/cashflow-page.test.tsx`:

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CashflowPage from "@/app/[locale]/(auth)/calculator/cashflow/page";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("CashflowPage", () => {
  it("renders the page title", () => {
    render(<CashflowPage />);
    expect(screen.getByText(/Cashflow Tracker/i)).toBeDefined();
  });

  it("shows template form section", () => {
    render(<CashflowPage />);
    expect(screen.getByText(/Recurring Items/i)).toBeDefined();
  });

  it("shows month view section", () => {
    render(<CashflowPage />);
    expect(screen.getByText(/Monthly View/i)).toBeDefined();
  });
});
```

- [ ] **Step 2: Write ROIC page test**

Create `src/components/calculator/roic/__tests__/roic-page.test.tsx`:

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import RoicPage from "@/app/[locale]/(auth)/calculator/roic/page";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("RoicPage", () => {
  it("renders the page title", () => {
    render(<RoicPage />);
    expect(screen.getByText(/ROIC Stock Analyzer/i)).toBeDefined();
  });

  it("shows the analyze tab by default", () => {
    render(<RoicPage />);
    expect(screen.getByText(/Financial Data/i)).toBeDefined();
  });
});
```

- [ ] **Step 3: Run all tests**

Run: `npx vitest run`
Expected: All new + existing tests PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/calculator/cashflow/__tests__/ src/components/calculator/roic/__tests__/
git commit -m "test: add integration tests for cashflow and ROIC pages"
```

---

---

## Task 8b: Wealth Pillar Edit Form

**Files:**
- Create: `src/components/dashboard/wealth-pillar-editor.tsx`

The display cards from Task 8 are read-only. Users need a way to input/edit their wealth pillar data.

- [ ] **Step 1: Create the wealth pillar editor component**

Create `src/components/dashboard/wealth-pillar-editor.tsx`:

A dialog/sheet component (use existing `Dialog` from `@/components/ui/dialog`) that:
- Opens from an "Edit" button on the wealth overview
- Has 4 tabs (using Tabs component), one per pillar:
  - **Emergency**: balance input, monthly expenses input
  - **Education**: current amount, goal amount, target date
  - **Retirement**: GPF value, RMF value, other retirement, target corpus
  - **Insurance**: add/remove policies (name, type select, death benefit, CI coverage, surrender value, annual premium)
- Saves to Supabase `wealth_pillars` table via upsert
- Props: `data: WealthPillarData | null`, `onSave: (data) => void`

- [ ] **Step 2: Wire editor into wealth overview**

Modify `src/components/dashboard/wealth-overview.tsx` to include:
- "Edit Wealth Data" button that opens the editor dialog
- Pass current data and save handler

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/wealth-pillar-editor.tsx src/components/dashboard/wealth-overview.tsx
git commit -m "feat: add wealth pillar editor form for dashboard"
```

---

## Task 8c: Navigation Entries for New Pages

**Files:**
- Modify: Navigation/sidebar component (find the existing nav config)

- [ ] **Step 1: Find and update navigation config**

Search for the sidebar/nav component that lists calculator pages. Add entries for:
- Cashflow Tracker → `/calculator/cashflow`
- ROIC Analyzer → `/calculator/roic`

Follow the existing pattern used for retirement, withdrawal, stress-test, mpt, dca, tax links.

- [ ] **Step 2: Commit**

```bash
git commit -m "feat: add cashflow and ROIC to sidebar navigation"
```

---

## Task 9b: Dashboard Server/Client Boundary

**Note for Task 9 (Supabase Integration):** The dashboard page is a **server component**. When adding `WealthOverview`:

1. Fetch wealth pillar data **server-side** using `createClient` from `@/lib/supabase/server`
2. Pass the data as props to the `WealthOverview` client component
3. Do NOT use Supabase client-side in the dashboard — follow the existing pattern where the server component fetches and the client component renders

Example pattern:
```typescript
// In dashboard page.tsx (server component)
const supabase = await createClient();
const { data: pillars } = await supabase
  .from('wealth_pillars')
  .select('*')
  .eq('user_id', userId);

// Transform and pass to client component
<WealthOverview data={transformPillars(pillars)} />
```

---

## Task 10: Integration Tests (Updated)

**Files:**
- Create: `src/components/calculator/cashflow/__tests__/cashflow-page.test.tsx`
- Create: `src/components/calculator/roic/__tests__/roic-page.test.tsx`

- [ ] **Step 1: Write cashflow page test**

Create `src/components/calculator/cashflow/__tests__/cashflow-page.test.tsx`:

**Note:** Pages should use `useTranslations` from next-intl. The mock returns the key path, so test against key paths, not English strings.

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import CashflowPage from "@/app/[locale]/(auth)/calculator/cashflow/page";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("CashflowPage", () => {
  it("renders the page with template and month sections", () => {
    render(<CashflowPage />);
    // Check for key structural elements, not hardcoded strings
    expect(document.querySelector('[data-testid="cashflow-templates"]')).toBeDefined();
    expect(document.querySelector('[data-testid="cashflow-month-view"]')).toBeDefined();
  });
});
```

If pages use hardcoded English strings (like existing retirement page does), test against those strings directly instead. Check the actual implementation pattern before writing tests.

- [ ] **Step 2: Write ROIC page test**

Same approach — test structural elements and data flow, not string literals.

- [ ] **Step 3: Run all tests**

Run: `npx vitest run`
Expected: All new + existing tests PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/calculator/cashflow/__tests__/ src/components/calculator/roic/__tests__/
git commit -m "test: add integration tests for cashflow and ROIC pages"
```

---

## Task Summary

| Task | Description | New Files | Tests |
|------|-------------|-----------|-------|
| 1 | Database migration + TS types | 1 SQL + 1 TS modified | — |
| 2 | Cashflow math library | 2 (lib + test) | 9 unit tests |
| 3 | ROIC math library | 2 (lib + test) | 9 unit tests |
| 4 | Calculator types extension | 1 modified | — |
| 5 | i18n messages (th/en) | 2 modified | — |
| 6 | Cashflow page + 3 components | 4 | — |
| 7 | ROIC page + 3 components | 4 | — |
| 8 | 4-pillar dashboard cards | 5 | — |
| 8b | Wealth pillar edit form | 1 + 1 modified | — |
| 8c | Navigation entries | 1 modified | — |
| 9 | Supabase integration | 3 modified | — |
| 9b | Dashboard server/client wiring | (covered in Task 9) | — |
| 10 | Integration tests | 2 test files | 2+ integration tests |

**Total: ~28 files, 20+ tests, 12 commits**
