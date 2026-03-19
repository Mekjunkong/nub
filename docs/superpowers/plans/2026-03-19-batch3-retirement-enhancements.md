# Batch 3: Retirement Enhancements — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Bumnan 95 Annuity Planner, enhance the withdrawal calculator with pension comparison mode, and enhance the stress test with bear market injection.

**Architecture:** One new feature (Bumnan 95) with its own worker, plus two enhancements to existing calculators that extend their workers and add new components. All follow the established pattern.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Supabase, Recharts, Web Workers, next-intl, Tailwind CSS 4, Vitest

**Spec:** `docs/superpowers/specs/2026-03-19-spreadsheet-features-design.md` (Batch 3 section)

**Depends on:** Batch 1 complete (plan_type enum). Batch 2 not strictly required but recommended (finance-math extensions used here).

---

## File Structure

```
src/types/
  calculator.ts                                         — Extended with Bumnan95, WithdrawalComparison, EnhancedStressTest types

src/workers/
  bumnan95.worker.ts                                    — Monte Carlo survival sim × 6 pension tiers
  monte-carlo.worker.ts                                 — Extended: dual-scenario comparison mode
  stress-test.worker.ts                                 — Extended: bear market injection + rebalanced path

src/workers/__tests__/
  bumnan95.test.ts                                      — Worker tests
  monte-carlo-comparison.test.ts                        — Comparison mode tests
  stress-test-enhanced.test.ts                          — Bear market injection tests

src/hooks/
  use-bumnan95-worker.ts                                — Hook for Bumnan 95 worker

src/components/calculator/bumnan95/
  bumnan95-form.tsx                                     — Age, expenses, pension, annuity config
  bumnan95-gap-analysis.tsx                             — Target vs projected gap visualization
  bumnan95-tier-table.tsx                               — 6-row pension goal matrix
  bumnan95-premium-calc.tsx                             — Annuity premium breakdown
  bumnan95-strategies.tsx                               — Gap-closing options

src/components/calculator/bumnan95/__tests__/
  bumnan95-page.test.tsx                                — Page integration test

src/app/[locale]/(auth)/calculator/bumnan95/
  page.tsx                                              — Bumnan 95 page

src/components/calculator/withdrawal/
  withdrawal-comparison-results.tsx                     — NEW: side-by-side comparison

src/components/calculator/stress-test/
  stress-bear-impact.tsx                                — NEW: bear market impact display
  stress-timeline-risk.tsx                              — NEW: year-by-year risk table
  stress-rebalance-log.tsx                              — NEW: monthly DCA/Rebal action log

messages/
  en.json                                               — Extended
  th.json                                               — Extended
```

---

## Task 1: Bumnan 95 Types + Worker + Tests

**Files:**
- Modify: `src/types/calculator.ts`
- Create: `src/workers/bumnan95.worker.ts`
- Create: `src/hooks/use-bumnan95-worker.ts`
- Create: `src/workers/__tests__/bumnan95.test.ts`

- [ ] **Step 1: Add Bumnan 95 types to calculator.ts**

```typescript
// ===== Bumnan 95 Annuity Planner =====

export interface Bumnan95Inputs {
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;             // default 95
  monthlyExpenses: number;            // inflation-adjusted at retirement
  inflationRate: number;
  portfolioReturn: number;
  portfolioSD: number;
  currentSavings: number;
  governmentPension: number;          // monthly
  gender: "male" | "female";
  annuityStartAge: number;
  annuityPaymentYears: number;
  annuityRate: number;                // payout rate per 10,000 premium
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
  tiers: Bumnan95Tier[];
  annualPremium: number;
  paymentDuration: number;
  totalPremiumPaid: number;
  lumpSumNeeded: number;
  monthlyTopUp: number;
  recommendedStrategy: string;
}
```

- [ ] **Step 2: Write failing worker tests**

Create `src/workers/__tests__/bumnan95.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { runBumnan95 } from "@/workers/bumnan95.worker";

const defaultInputs = {
  currentAge: 33,
  retirementAge: 60,
  lifeExpectancy: 95,
  monthlyExpenses: 61392,
  inflationRate: 0.025,
  portfolioReturn: 0.06,
  portfolioSD: 0.12,
  currentSavings: 500000,
  governmentPension: 30520,
  gender: "male" as const,
  annuityStartAge: 60,
  annuityPaymentYears: 26,
  annuityRate: 0.0082,
  simulations: 100, // small for test speed
};

describe("runBumnan95", () => {
  it("returns exactly 6 pension tiers", () => {
    const result = runBumnan95(defaultInputs);
    expect(result.tiers).toHaveLength(6);
  });

  it("tiers are in ascending monthly pension order", () => {
    const result = runBumnan95(defaultInputs);
    for (let i = 1; i < result.tiers.length; i++) {
      expect(result.tiers[i].monthlyPension).toBeGreaterThan(
        result.tiers[i - 1].monthlyPension
      );
    }
  });

  it("success rates increase with higher pension", () => {
    const result = runBumnan95(defaultInputs);
    for (let i = 1; i < result.tiers.length; i++) {
      expect(result.tiers[i].successRate).toBeGreaterThanOrEqual(
        result.tiers[i - 1].successRate
      );
    }
  });

  it("assigns valid status to each tier", () => {
    const result = runBumnan95(defaultInputs);
    const validStatuses = ["RISKY", "MODERATE", "STRONG", "SECURED"];
    result.tiers.forEach((tier) => {
      expect(validStatuses).toContain(tier.status);
    });
  });

  it("calculates gap status correctly", () => {
    const result = runBumnan95(defaultInputs);
    if (result.retirementGap <= 0) {
      expect(result.gapStatus).toBe("SAFE");
    } else {
      expect(result.gapStatus).toBe("GAP_EXISTS");
    }
  });

  it("returns positive annualPremium", () => {
    const result = runBumnan95(defaultInputs);
    expect(result.annualPremium).toBeGreaterThan(0);
  });

  it("provides both gap-closing strategies", () => {
    const result = runBumnan95(defaultInputs);
    expect(typeof result.lumpSumNeeded).toBe("number");
    expect(typeof result.monthlyTopUp).toBe("number");
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run src/workers/__tests__/bumnan95.test.ts`
Expected: FAIL

- [ ] **Step 4: Implement the worker**

Create `src/workers/bumnan95.worker.ts`:

```typescript
import { normalRandom, presentValueAnnuity, futureValueAnnuity } from "@/lib/finance-math";
import type { Bumnan95Inputs, Bumnan95Results, Bumnan95Tier } from "@/types/calculator";

// Pension tier multipliers (matching spreadsheet: 0, 0.5x, 1x, 1.5x, 2x, 2.5x of monthlyExpenses)
const TIER_MULTIPLIERS = [0, 0.5, 1.0, 1.5, 2.0, 2.5];

export function runBumnan95(inputs: Bumnan95Inputs): Bumnan95Results {
  const yearsToRetirement = inputs.retirementAge - inputs.currentAge;
  const retirementYears = inputs.lifeExpectancy - inputs.retirementAge;
  const monthlyReturn = inputs.portfolioReturn / 12;
  const monthlySD = inputs.portfolioSD / Math.sqrt(12);

  // Gap analysis
  const targetCorpus = presentValueAnnuity(
    inputs.monthlyExpenses,
    (inputs.portfolioReturn - inputs.inflationRate) / 12,
    retirementYears * 12
  );
  const estimatedGPF = inputs.governmentPension > 0
    ? presentValueAnnuity(inputs.governmentPension, inputs.portfolioReturn / 12, retirementYears * 12)
    : 0;
  const pensionLumpSum = estimatedGPF; // GPF as lump sum PV
  const retirementGap = targetCorpus - estimatedGPF - futureValueAnnuity(
    inputs.currentSavings, inputs.portfolioReturn / 12, yearsToRetirement * 12
  );
  const gapStatus = retirementGap <= 0 ? "SAFE" as const : "GAP_EXISTS" as const;

  // Generate 6 tiers
  const tiers: Bumnan95Tier[] = TIER_MULTIPLIERS.map((mult) => {
    const monthlyPension = Math.round(mult * inputs.monthlyExpenses);

    // Run Monte Carlo survival simulation for this tier
    let successes = 0;
    for (let sim = 0; sim < inputs.simulations; sim++) {
      let wealth = targetCorpus;
      let survived = true;
      for (let m = 0; m < retirementYears * 12; m++) {
        const inflAdj = inputs.monthlyExpenses * Math.pow(1 + inputs.inflationRate / 12, m);
        const netWithdraw = inflAdj - monthlyPension;
        const ret = normalRandom(monthlyReturn, monthlySD);
        wealth = wealth * (1 + ret) - Math.max(0, netWithdraw);
        if (wealth <= 0) {
          survived = false;
          break;
        }
      }
      if (survived) successes++;
    }
    const successRate = successes / inputs.simulations;

    // Required portfolio for this pension level
    const requiredPortfolio = monthlyPension > 0
      ? (monthlyPension * 12) / inputs.annuityRate
      : 0;

    // Monthly saving needed
    const fvTarget = requiredPortfolio;
    const monthlySaving = fvTarget > 0
      ? fvTarget / (((Math.pow(1 + monthlyReturn, yearsToRetirement * 12) - 1) / monthlyReturn) || yearsToRetirement * 12)
      : 0;

    const status: Bumnan95Tier["status"] =
      successRate >= 0.95 ? "SECURED" :
      successRate >= 0.80 ? "STRONG" :
      successRate >= 0.60 ? "MODERATE" : "RISKY";

    return {
      monthlyPension,
      successRate: Math.round(successRate * 1000) / 10, // 1 decimal %
      requiredPortfolio: Math.round(requiredPortfolio),
      monthlySaving: Math.round(monthlySaving),
      status,
    };
  });

  // Annuity premium
  const annualPremium = Math.round(inputs.monthlyExpenses * 12 * inputs.annuityRate);
  const paymentDuration = yearsToRetirement;
  const totalPremiumPaid = annualPremium * paymentDuration;

  // Gap-closing strategies
  const lumpSumNeeded = Math.max(0, Math.round(retirementGap));
  const monthlyTopUp = retirementGap > 0
    ? Math.round(retirementGap / (((Math.pow(1 + monthlyReturn, yearsToRetirement * 12) - 1) / monthlyReturn) || yearsToRetirement * 12))
    : 0;

  return {
    targetCorpus: Math.round(targetCorpus),
    estimatedGPF: Math.round(estimatedGPF),
    pensionLumpSum: Math.round(pensionLumpSum),
    retirementGap: Math.round(retirementGap),
    gapStatus,
    tiers,
    annualPremium,
    paymentDuration,
    totalPremiumPaid,
    lumpSumNeeded,
    monthlyTopUp,
    recommendedStrategy: monthlyTopUp < inputs.monthlyExpenses * 0.3
      ? "Monthly top-up is feasible — recommended for steady accumulation"
      : "Consider annuity/dividend plan to supplement pension income",
  };
}
```

- [ ] **Step 5: Create the hook**

Create `src/hooks/use-bumnan95-worker.ts`:

```typescript
import { useState, useCallback } from "react";
import { runBumnan95 } from "@/workers/bumnan95.worker";
import type { Bumnan95Inputs, Bumnan95Results } from "@/types/calculator";

export function useBumnan95Worker() {
  const [results, setResults] = useState<Bumnan95Results | null>(null);
  const [computing, setComputing] = useState(false);

  const compute = useCallback((inputs: Bumnan95Inputs) => {
    setComputing(true);
    try {
      setResults(runBumnan95(inputs));
    } finally {
      setComputing(false);
    }
  }, []);

  return { results, computing, compute };
}
```

- [ ] **Step 6: Run tests**

Run: `npx vitest run src/workers/__tests__/bumnan95.test.ts`
Expected: All 7 tests PASS

- [ ] **Step 7: Commit**

```bash
git add src/types/calculator.ts src/workers/bumnan95.worker.ts src/hooks/use-bumnan95-worker.ts src/workers/__tests__/bumnan95.test.ts
git commit -m "feat: add Bumnan 95 annuity planner worker with 6-tier Monte Carlo"
```

---

## Task 2: Enhanced Withdrawal — Pension Comparison Types + Worker Extension + Tests

**Files:**
- Modify: `src/types/calculator.ts`
- Modify: `src/workers/monte-carlo.worker.ts`
- Create: `src/workers/__tests__/monte-carlo-comparison.test.ts`

- [ ] **Step 1: Add comparison types**

Add to `src/types/calculator.ts`:

```typescript
// ===== Enhanced Withdrawal — Pension Comparison =====

export interface WithdrawalComparisonInputs extends MonteCarloInputs {
  comparisonPension: number;         // additional monthly pension to compare
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

- [ ] **Step 2: Write failing tests**

Create `src/workers/__tests__/monte-carlo-comparison.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { runWithdrawalComparison } from "@/workers/monte-carlo.worker";

const baseInputs = {
  currentMonthlyExpenses: 50000,
  yearsToRetirement: 0,
  inflationRate: 0.025,
  retirementAge: 60,
  lifeExpectancy: 90,
  lumpSum: 10000000,
  governmentPension: 0,
  annuity: 0,
  portfolioExpectedReturn: 0.005,
  portfolioSD: 0.04,
  inflationExpectedReturn: 0.002,
  inflationSD: 0.001,
  rounds: 100,
  comparisonPension: 10000,
};

describe("runWithdrawalComparison", () => {
  it("returns both baseline and withPension results", () => {
    const result = runWithdrawalComparison(baseInputs);
    expect(result.baseline).toBeDefined();
    expect(result.withPension).toBeDefined();
  });

  it("withPension has higher or equal survival rate", () => {
    const result = runWithdrawalComparison(baseInputs);
    expect(result.withPension.survivalRate).toBeGreaterThanOrEqual(
      result.baseline.survivalRate
    );
  });

  it("calculates positive improvement deltas", () => {
    const result = runWithdrawalComparison(baseInputs);
    expect(result.improvement.successRateDelta).toBeGreaterThanOrEqual(0);
  });

  it("returns a verdict string", () => {
    const result = runWithdrawalComparison(baseInputs);
    expect(result.verdict.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run src/workers/__tests__/monte-carlo-comparison.test.ts`
Expected: FAIL — `runWithdrawalComparison` not exported

- [ ] **Step 4: Extend the Monte Carlo worker**

Read the existing `src/workers/monte-carlo.worker.ts` first. Then add a new exported function:

```typescript
export function runWithdrawalComparison(
  inputs: WithdrawalComparisonInputs
): WithdrawalComparisonResults {
  // Run baseline (no extra pension)
  const baseline = runMonteCarlo(inputs); // existing function

  // Run with pension
  const withPensionInputs = {
    ...inputs,
    annuity: (inputs.annuity || 0) + inputs.comparisonPension,
  };
  const withPension = runMonteCarlo(withPensionInputs);

  // Calculate avg age of ruin from failed paths
  // (This requires tracking ruin age in the existing Monte Carlo — may need to extend it)
  const baselineRuin = calculateAvgRuinAge(inputs, false);
  const withPensionRuin = calculateAvgRuinAge(inputs, true);

  const improvement = {
    successRateDelta: withPension.survivalRate - baseline.survivalRate,
    finalWealthDelta: withPension.medianFinalWealth - baseline.medianFinalWealth,
    longevityDelta: withPensionRuin - baselineRuin,
  };

  const verdict = improvement.successRateDelta > 0.05
    ? "Significant improvement — pension provides strong longevity protection"
    : improvement.successRateDelta > 0
    ? "Modest improvement — pension adds safety margin"
    : "Minimal impact — current plan is already well-funded";

  return {
    baseline: { ...baseline, avgAgeOfRuin: baselineRuin },
    withPension: { ...withPension, avgAgeOfRuin: withPensionRuin },
    improvement,
    verdict,
  };
}
```

Note: The existing `runMonteCarlo` function's internals need to be checked. If it doesn't track ruin age, add a helper `calculateAvgRuinAge` that runs a focused simulation tracking only when wealth hits 0.

- [ ] **Step 5: Run tests**

Run: `npx vitest run src/workers/__tests__/monte-carlo-comparison.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/types/calculator.ts src/workers/monte-carlo.worker.ts src/workers/__tests__/monte-carlo-comparison.test.ts
git commit -m "feat: add withdrawal pension comparison mode to Monte Carlo worker"
```

---

## Task 3: Enhanced Stress Test — Bear Market Types + Worker Extension + Tests

**Files:**
- Modify: `src/types/calculator.ts`
- Modify: `src/workers/stress-test.worker.ts`
- Create: `src/workers/__tests__/stress-test-enhanced.test.ts`

- [ ] **Step 1: Add enhanced stress test types**

Add to `src/types/calculator.ts`:

```typescript
// ===== Enhanced Stress Test — Bear Market Injection =====

export interface EnhancedStressTestInputs extends StressTestInputs {
  bearMarketEnabled: boolean;
  bearMarketReturn: number;           // ANNUAL return, e.g., -0.20
  bearMarketYears: number;
  rebalanceFrequencyMonths: number;
  assets?: {
    name: string;
    weight: number;
    monthlyReturns: number[];
  }[];
}

export interface TimelineRiskEntry {
  year: number;
  principal: number;
  probOfLoss: number;
  probOfDoubling: number;
}

export interface BearMarketImpact {
  drawdownDuringBear: number;
  recoveryMonths: number;
  wealthAtBearEnd: number;
}

export interface RebalancedPathEntry {
  month: number;
  action: "DCA" | "DCA+Rebal";
  assetValues: number[];
  totalWealth: number;
  drawdown: number;
}

export interface EnhancedStressTestResults extends StressTestResults {
  timelineRisk: TimelineRiskEntry[];
  bearMarketImpact: BearMarketImpact;
  rebalancedPath: RebalancedPathEntry[];
}
```

- [ ] **Step 2: Write failing tests**

Create `src/workers/__tests__/stress-test-enhanced.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { runEnhancedStressTest } from "@/workers/stress-test.worker";

const defaultInputs = {
  expectedReturn: 0.007,
  sd: 0.04,
  periods: 60,
  dcaAmount: 10000,
  bonusAmount: 0,
  bonusFrequency: 12,
  targetReturn: 1.0,
  varStartPeriod: 12,
  blackSwanStartPeriod: 24,
  blackSwanConsecutivePeriods: 3,
  simulations: 100,
  // Enhanced fields
  bearMarketEnabled: true,
  bearMarketReturn: -0.20,
  bearMarketYears: 2,
  rebalanceFrequencyMonths: 12,
};

describe("runEnhancedStressTest", () => {
  it("returns base stress test results", () => {
    const result = runEnhancedStressTest(defaultInputs);
    expect(result.scenarios).toBeDefined();
    expect(result.doublingProbability).toBeDefined();
  });

  it("returns timeline risk for multiple years", () => {
    const result = runEnhancedStressTest(defaultInputs);
    expect(result.timelineRisk.length).toBeGreaterThan(0);
    result.timelineRisk.forEach((entry) => {
      expect(entry.probOfLoss).toBeGreaterThanOrEqual(0);
      expect(entry.probOfLoss).toBeLessThanOrEqual(1);
    });
  });

  it("returns bear market impact when enabled", () => {
    const result = runEnhancedStressTest(defaultInputs);
    expect(result.bearMarketImpact.drawdownDuringBear).toBeLessThan(0);
    expect(result.bearMarketImpact.wealthAtBearEnd).toBeGreaterThan(0);
  });

  it("returns no bear impact when disabled", () => {
    const result = runEnhancedStressTest({
      ...defaultInputs,
      bearMarketEnabled: false,
    });
    expect(result.bearMarketImpact.drawdownDuringBear).toBe(0);
  });

  it("returns rebalanced path with correct actions", () => {
    const result = runEnhancedStressTest(defaultInputs);
    expect(result.rebalancedPath.length).toBeGreaterThan(0);
    const actions = result.rebalancedPath.map((e) => e.action);
    expect(actions).toContain("DCA");
    // At month 12 (rebalanceFrequency), should have rebal
    const rebalEntries = result.rebalancedPath.filter((e) => e.action === "DCA+Rebal");
    expect(rebalEntries.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run src/workers/__tests__/stress-test-enhanced.test.ts`
Expected: FAIL

- [ ] **Step 4: Extend the stress test worker**

Read the existing `src/workers/stress-test.worker.ts` first. Add:

```typescript
export function runEnhancedStressTest(
  inputs: EnhancedStressTestInputs
): EnhancedStressTestResults {
  // Run base stress test
  const baseResults = runStressTest(inputs); // existing function

  // Bear market injection simulation
  const bearMonths = inputs.bearMarketYears * 12;
  const bearMonthlyReturn = inputs.bearMarketReturn / 12;
  const bearSD = inputs.sd * 0.5; // reduced noise during bear regime

  // Timeline risk: for each year, run simulations
  const maxYears = Math.floor(inputs.periods / 12);
  const timelineRisk: TimelineRiskEntry[] = [];

  for (let y = 1; y <= maxYears; y++) {
    const months = y * 12;
    let losses = 0;
    let doubles = 0;
    let totalPrincipal = inputs.dcaAmount * months;

    for (let sim = 0; sim < inputs.simulations; sim++) {
      let wealth = 0;
      for (let m = 0; m < months; m++) {
        wealth += inputs.dcaAmount;
        const isBear = inputs.bearMarketEnabled && m < bearMonths;
        const ret = isBear
          ? normalRandom(bearMonthlyReturn, bearSD)
          : normalRandom(inputs.expectedReturn, inputs.sd);
        wealth *= (1 + ret);
      }
      if (wealth < totalPrincipal) losses++;
      if (wealth >= totalPrincipal * 2) doubles++;
    }

    timelineRisk.push({
      year: y,
      principal: totalPrincipal,
      probOfLoss: losses / inputs.simulations,
      probOfDoubling: doubles / inputs.simulations,
    });
  }

  // Bear market impact (single representative path)
  let bearWealth = 0;
  let bearPeak = 0;
  let bearDrawdown = 0;
  let wealthAtBearEnd = 0;
  let recoveryMonth = -1;

  if (inputs.bearMarketEnabled) {
    for (let m = 0; m < inputs.periods; m++) {
      bearWealth += inputs.dcaAmount;
      const isBear = m < bearMonths;
      const ret = isBear
        ? bearMonthlyReturn
        : inputs.expectedReturn;
      bearWealth *= (1 + ret);
      if (bearWealth > bearPeak) bearPeak = bearWealth;
      const dd = bearPeak > 0 ? (bearWealth - bearPeak) / bearPeak : 0;
      if (dd < bearDrawdown) bearDrawdown = dd;
      if (m === bearMonths - 1) wealthAtBearEnd = bearWealth;
      if (m > bearMonths && bearWealth >= bearPeak && recoveryMonth === -1) {
        recoveryMonth = m - bearMonths;
      }
    }
  }

  // Rebalanced path
  const rebalancedPath: RebalancedPathEntry[] = [];
  let pathWealth = 0;
  let pathPeak = 0;

  for (let m = 0; m < inputs.periods; m++) {
    pathWealth += inputs.dcaAmount;
    const isBear = inputs.bearMarketEnabled && m < bearMonths;
    const ret = isBear
      ? normalRandom(bearMonthlyReturn, bearSD)
      : normalRandom(inputs.expectedReturn, inputs.sd);
    pathWealth *= (1 + ret);
    if (pathWealth > pathPeak) pathPeak = pathWealth;
    const dd = pathPeak > 0 ? (pathWealth - pathPeak) / pathPeak : 0;

    const isRebal = inputs.rebalanceFrequencyMonths > 0
      && m > 0
      && m % inputs.rebalanceFrequencyMonths === 0;

    rebalancedPath.push({
      month: m + 1,
      action: isRebal ? "DCA+Rebal" : "DCA",
      assetValues: [], // single-asset simplified; multi-asset if inputs.assets provided
      totalWealth: Math.round(pathWealth),
      drawdown: Math.round(dd * 10000) / 100,
    });
  }

  return {
    ...baseResults,
    timelineRisk,
    bearMarketImpact: {
      drawdownDuringBear: inputs.bearMarketEnabled ? bearDrawdown : 0,
      recoveryMonths: inputs.bearMarketEnabled ? Math.max(0, recoveryMonth) : 0,
      wealthAtBearEnd: Math.round(wealthAtBearEnd),
    },
    rebalancedPath,
  };
}
```

Import `normalRandom` from `@/lib/finance-math`. Import the new types.

- [ ] **Step 5: Run tests**

Run: `npx vitest run src/workers/__tests__/stress-test-enhanced.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/types/calculator.ts src/workers/stress-test.worker.ts src/workers/__tests__/stress-test-enhanced.test.ts
git commit -m "feat: add bear market injection and timeline risk to stress test worker"
```

---

## Task 4: i18n Messages for Batch 3

**Files:**
- Modify: `messages/en.json`
- Modify: `messages/th.json`

- [ ] **Step 1: MERGE English messages**

**IMPORTANT: MERGE into existing JSON.** Add new keys:

Under `"calculator"`:
- `bumnan95.title`: "Bumnan 95 Annuity Planner"
- `bumnan95.subtitle`: "Plan pension income to close your retirement gap"
- `bumnan95.gapAnalysis`: "Retirement Gap Analysis"
- `bumnan95.targetCorpus`: "Target Corpus"
- `bumnan95.estimatedGPF`: "Estimated GPF"
- `bumnan95.retirementGap`: "Retirement Gap"
- `bumnan95.safe`: "Safe"
- `bumnan95.gapExists`: "Gap Exists"
- `bumnan95.tierTable`: "Pension Goal Matrix"
- `bumnan95.monthlyPension`: "Monthly Pension"
- `bumnan95.successRate`: "Success Rate"
- `bumnan95.requiredPortfolio`: "Required Portfolio"
- `bumnan95.monthlySaving`: "Monthly Saving"
- `bumnan95.premiumCalc`: "Annuity Premium"
- `bumnan95.annualPremium`: "Annual Premium"
- `bumnan95.totalCost`: "Total Premium Paid"
- `bumnan95.strategies`: "Gap-Closing Strategies"
- `bumnan95.lumpSum`: "Option A: Lump Sum Now"
- `bumnan95.monthlyTopUp`: "Option B: Monthly Top-Up"

Under `"calculator.withdrawal"` (new sub-object):
- `comparison`: "Pension Comparison"
- `compareToggle`: "Compare with pension?"
- `pensionAmount`: "Additional Monthly Pension"
- `baseline`: "Current Plan"
- `withPension`: "With Pension"
- `improvement`: "Improvement"
- `verdict`: "Verdict"

Under `"calculator.stressTest"` (new sub-object):
- `bearMarket`: "Bear Market Injection"
- `bearToggle`: "Inject bear market?"
- `bearReturn`: "Annual Bear Return"
- `bearYears`: "Bear Duration (Years)"
- `timelineRisk`: "Timeline Risk Analysis"
- `probOfLoss`: "Probability of Loss"
- `probOfDoubling`: "Probability of 2x"
- `bearImpact`: "Bear Market Impact"
- `rebalanceLog`: "DCA & Rebalance Log"

- [ ] **Step 2: MERGE Thai messages** (corresponding translations)

- [ ] **Step 3: Commit**

```bash
git add messages/en.json messages/th.json
git commit -m "feat: add i18n messages for Bumnan 95, withdrawal comparison, enhanced stress test (th/en)"
```

---

## Task 5: Bumnan 95 Page + Components

**Files:**
- Create: `src/app/[locale]/(auth)/calculator/bumnan95/page.tsx`
- Create: `src/components/calculator/bumnan95/bumnan95-form.tsx`
- Create: `src/components/calculator/bumnan95/bumnan95-gap-analysis.tsx`
- Create: `src/components/calculator/bumnan95/bumnan95-tier-table.tsx`
- Create: `src/components/calculator/bumnan95/bumnan95-premium-calc.tsx`
- Create: `src/components/calculator/bumnan95/bumnan95-strategies.tsx`

- [ ] **Step 1: Create form component**

Inputs: current age, retirement age, life expectancy (default 95), monthly expenses, inflation rate, portfolio return/SD, current savings, government pension, gender select, annuity start age, payment years, annuity rate.

Group into sections: Personal → Retirement → Annuity Config.

- [ ] **Step 2: Create gap analysis component**

Visual comparison: Target Corpus vs (GPF + Projected Savings). Gap bar/badge colored green (SAFE) or red (GAP_EXISTS). Numbers displayed prominently.

- [ ] **Step 3: Create tier table component**

Table matching spreadsheet exactly: 6 rows. Columns: Monthly Pension, Success Rate, Required Portfolio, Monthly Saving, Status. Color-coded status badges: RISKY (red), MODERATE (yellow), STRONG (blue), SECURED (green).

- [ ] **Step 4: Create premium calc component**

Card showing: gender, age at purchase, annual premium, payment duration, total cost.

- [ ] **Step 5: Create strategies component**

Two-column card: Option A (lump sum amount) vs Option B (monthly top-up). Recommended strategy highlighted.

- [ ] **Step 6: Create the page**

Use `useBumnan95Worker()` hook. Layout: form → gap analysis → tier table → premium calc → strategies.

- [ ] **Step 7: Commit**

```bash
git add src/app/[locale]/(auth)/calculator/bumnan95/ src/components/calculator/bumnan95/
git commit -m "feat: add Bumnan 95 Annuity Planner page and components"
```

---

## Task 6: Withdrawal Comparison UI Components

**Files:**
- Create: `src/components/calculator/withdrawal/withdrawal-comparison-results.tsx`
- Modify: `src/components/calculator/withdrawal/withdrawal-form.tsx`
- Modify: `src/app/[locale]/(auth)/calculator/withdrawal/page.tsx`

- [ ] **Step 1: Create comparison results component**

`withdrawal-comparison-results.tsx`:

Side-by-side layout:
- Left card: "Current Plan" — survival rate, median final wealth, avg age of ruin
- Right card: "With Pension" — same metrics, delta badges (green) showing improvement
- Bottom: Improvement summary row — success rate delta, wealth delta, longevity delta
- Verdict badge with text

- [ ] **Step 2: Modify withdrawal form**

Add to existing `withdrawal-form.tsx`:
- Toggle switch: "Compare with pension?"
- When enabled: show number input for "Additional Monthly Pension (฿)"
- Pass `comparisonPension` to parent

- [ ] **Step 3: Modify withdrawal page**

Update `withdrawal/page.tsx`:
- When comparison is enabled, call `runWithdrawalComparison` instead of regular Monte Carlo
- Show `WithdrawalComparisonResults` below regular results when comparison is active

- [ ] **Step 4: Commit**

```bash
git add src/components/calculator/withdrawal/ src/app/[locale]/(auth)/calculator/withdrawal/page.tsx
git commit -m "feat: add pension comparison mode to withdrawal calculator"
```

---

## Task 7: Enhanced Stress Test UI Components

**Files:**
- Create: `src/components/calculator/stress-test/stress-bear-impact.tsx`
- Create: `src/components/calculator/stress-test/stress-timeline-risk.tsx`
- Create: `src/components/calculator/stress-test/stress-rebalance-log.tsx`
- Modify: `src/components/calculator/stress-test/stress-form.tsx`
- Modify: `src/app/[locale]/(auth)/calculator/stress-test/page.tsx`

- [ ] **Step 1: Create bear market impact component**

`stress-bear-impact.tsx`:

Card showing: drawdown during bear (red %), recovery months, wealth at bear end. Warning icon if drawdown > -30%.

- [ ] **Step 2: Create timeline risk table component**

`stress-timeline-risk.tsx`:

Table: Year (1-20), Principal, Prob of Loss (%), Prob of Doubling (%). Color-coded: loss prob > 50% → red warning, doubling > 20% → green highlight. Matching ชีต10 format.

- [ ] **Step 3: Create rebalance log component**

`stress-rebalance-log.tsx`:

Scrollable table: Month, Action (with emoji: "DCA 💰" or "DCA+Rebal ⚖️"), Total Wealth, Drawdown %. Alternating row colors. Rebal rows highlighted.

- [ ] **Step 4: Modify stress test form**

Add collapsible section "Bear Market Injection" with:
- Toggle: "Inject bear market?"
- When enabled: Annual bear return input (default -20%), Duration in years (default 2)
- Rebalance frequency input (default every 12 months)

- [ ] **Step 5: Modify stress test page**

Update page to:
- Call `runEnhancedStressTest` when bear market is enabled
- Show bear impact, timeline risk, and rebalance log below existing results

- [ ] **Step 6: Commit**

```bash
git add src/components/calculator/stress-test/ src/app/[locale]/(auth)/calculator/stress-test/page.tsx
git commit -m "feat: add bear market injection and timeline risk to stress test"
```

---

## Task 8: Navigation + Integration Tests

**Files:**
- Modify: Navigation component
- Create: `src/components/calculator/bumnan95/__tests__/bumnan95-page.test.tsx`

- [ ] **Step 1: Add Bumnan 95 to navigation**

Add to sidebar: "Bumnan 95 Planner" → `/calculator/bumnan95`

- [ ] **Step 2: Write integration test**

Test Bumnan 95 page renders form and key sections. Use `data-testid` for reliable selection.

- [ ] **Step 3: Run all tests**

Run: `npx vitest run`
Expected: All PASS (existing + all new Batch 1/2/3 tests)

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add Bumnan 95 to navigation + integration tests for Batch 3"
```

---

## Task Summary

| Task | Description | Key Files | Tests |
|------|-------------|-----------|-------|
| 1 | Bumnan 95 worker + types | bumnan95.worker.ts + hook | 7 unit tests |
| 2 | Withdrawal comparison extension | monte-carlo.worker.ts extended | 4 unit tests |
| 3 | Enhanced stress test extension | stress-test.worker.ts extended | 5 unit tests |
| 4 | i18n messages | en.json, th.json | — |
| 5 | Bumnan 95 page + 5 components | 6 files | — |
| 6 | Withdrawal comparison UI | 1 new + 2 modified | — |
| 7 | Enhanced stress test UI | 3 new + 2 modified | — |
| 8 | Navigation + integration tests | 1 modified + 1 test | 1 integration test |

**Total: ~20 files, 16+ tests, 8 commits**
