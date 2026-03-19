# Batch 2: Portfolio Tools — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add GPF Portfolio Optimizer, TIPP/VPPI Portfolio Protection, Portfolio Health Dashboard, and expand MPT to support 10+ funds.

**Architecture:** Four features using web workers for heavy computation (Monte Carlo, MPT optimization, TIPP simulation). Each worker follows the existing pattern: pure function exported from `.worker.ts`, called via a custom hook. Portfolio Health gets a summary card on `/dashboard` + a dedicated deep-dive page.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Supabase, Recharts, Web Workers, next-intl, Tailwind CSS 4, Vitest

**Spec:** `docs/superpowers/specs/2026-03-19-spreadsheet-features-design.md` (Batch 2 section)

**Depends on:** Batch 1 complete (plan_type enum, funds table with ROIC data, wealth pillars)

---

## File Structure

```
src/types/
  calculator.ts                                — Extended with GPF, TIPP, PortfolioHealth types

src/lib/
  finance-math.ts                              — Extended with VaR, CVaR, Cholesky, correlatedReturns, recoveryTime
  correlation-utils.ts                         — Compute correlation matrix from fund_correlations or nav_history

src/lib/__tests__/
  finance-math-extended.test.ts                — Tests for new finance-math functions
  correlation-utils.test.ts                    — Tests for correlation computation

src/workers/
  gpf-optimizer.worker.ts                      — GPF MPT + Monte Carlo + rebalancing
  tipp.worker.ts                               — TIPP/VPPI floor-based protection simulation
  portfolio-health.worker.ts                   — MDD simulation with recovery analysis

src/hooks/
  use-gpf-worker.ts                            — Hook for GPF optimizer worker
  use-tipp-worker.ts                           — Hook for TIPP worker
  use-portfolio-health-worker.ts               — Hook for portfolio health worker

src/components/calculator/gpf/
  gpf-holdings-form.tsx                        — Current holdings + contribution input
  gpf-optimizer-results.tsx                    — Optimal allocation, risk metrics, rebalancing table
  gpf-wealth-projection.tsx                    — Monte Carlo fan chart + success rate
  gpf-drawdown-table.tsx                       — Year-by-year MDD + recovery

src/components/calculator/gpf/__tests__/
  gpf-page.test.tsx                            — Page integration test

src/app/[locale]/(auth)/calculator/gpf-optimizer/
  page.tsx                                     — GPF Optimizer page

src/components/calculator/tipp/
  tipp-form.tsx                                — Capital, floor, multiplier, assets
  tipp-strategy-chart.tsx                      — Wealth vs floor dual-line chart
  tipp-risk-dashboard.tsx                      — VaR/CVaR cards, safety status
  tipp-allocation-view.tsx                     — Risky vs safe allocation

src/components/calculator/tipp/__tests__/
  tipp-page.test.tsx                           — Page integration test

src/app/[locale]/(auth)/calculator/tipp/
  page.tsx                                     — TIPP/VPPI page

src/components/portfolio-health/
  performance-metrics.tsx                      — Return vs benchmark, alpha, Sharpe
  mdd-recovery-table.tsx                       — 27-year MDD + recovery table
  risk-commentary.tsx                          — Auto-generated assessment
  allocation-breakdown.tsx                     — Current vs optimal weights

src/components/dashboard/
  portfolio-health-summary-card.tsx            — Dashboard summary card

src/app/[locale]/(auth)/portfolio-health/
  page.tsx                                     — Portfolio Health deep-dive page

src/components/calculator/mpt/
  fund-selector.tsx                            — Enhanced: multi-select with search + category filter

messages/
  en.json                                      — Extended with gpfOptimizer, tipp, portfolioHealth keys
  th.json                                      — Extended with gpfOptimizer, tipp, portfolioHealth keys
```

---

## Task 1: Finance Math Library Extensions + Tests

**Files:**
- Modify: `src/lib/finance-math.ts`
- Create: `src/lib/__tests__/finance-math-extended.test.ts`

- [ ] **Step 1: Write failing tests for new finance functions**

Create `src/lib/__tests__/finance-math-extended.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  valueAtRisk,
  conditionalVaR,
  choleskyDecomposition,
  correlatedReturns,
  recoveryTime,
} from "@/lib/finance-math";

describe("valueAtRisk", () => {
  it("calculates parametric VaR at 95% confidence", () => {
    // VaR = allocation * sd * Z(0.95), Z(0.95) = 1.645
    const var95 = valueAtRisk(100000, 0.10, 0.95);
    expect(var95).toBeCloseTo(16449, 0);
  });

  it("calculates parametric VaR at 99% confidence", () => {
    // Z(0.99) = 2.326
    const var99 = valueAtRisk(100000, 0.10, 0.99);
    expect(var99).toBeCloseTo(23263, 0);
  });

  it("returns 0 for zero allocation", () => {
    expect(valueAtRisk(0, 0.10, 0.95)).toBe(0);
  });
});

describe("conditionalVaR", () => {
  it("calculates CVaR (expected shortfall) at 95%", () => {
    const cvar = conditionalVaR(100000, 0.10, 0.95);
    // CVaR > VaR always
    const var95 = valueAtRisk(100000, 0.10, 0.95);
    expect(cvar).toBeGreaterThan(var95);
  });
});

describe("choleskyDecomposition", () => {
  it("decomposes a 2x2 identity matrix", () => {
    const L = choleskyDecomposition([[1, 0], [0, 1]]);
    expect(L).toEqual([[1, 0], [0, 1]]);
  });

  it("decomposes a 2x2 correlation matrix", () => {
    const corr = [[1, 0.5], [0.5, 1]];
    const L = choleskyDecomposition(corr);
    // L[0][0] = 1, L[1][0] = 0.5, L[1][1] = sqrt(1 - 0.25) = 0.866
    expect(L[0][0]).toBeCloseTo(1, 4);
    expect(L[1][0]).toBeCloseTo(0.5, 4);
    expect(L[1][1]).toBeCloseTo(0.866, 2);
  });

  it("decomposes a 3x3 matrix correctly", () => {
    const corr = [
      [1.0, 0.15, 0.14],
      [0.15, 1.0, 0.10],
      [0.14, 0.10, 1.0],
    ];
    const L = choleskyDecomposition(corr);
    // Verify L * L^T ≈ corr
    const n = 3;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        let sum = 0;
        for (let k = 0; k < n; k++) {
          sum += L[i][k] * L[j][k];
        }
        expect(sum).toBeCloseTo(corr[i][j], 4);
      }
    }
  });
});

describe("correlatedReturns", () => {
  it("returns array of correct length", () => {
    const L = choleskyDecomposition([[1, 0.5], [0.5, 1]]);
    const returns = correlatedReturns([0.08, 0.05], [0.15, 0.10], L);
    expect(returns).toHaveLength(2);
  });

  it("returns are numbers, not NaN", () => {
    const L = choleskyDecomposition([[1, 0], [0, 1]]);
    const returns = correlatedReturns([0.05, 0.03], [0.12, 0.05], L);
    expect(Number.isNaN(returns[0])).toBe(false);
    expect(Number.isNaN(returns[1])).toBe(false);
  });
});

describe("recoveryTime", () => {
  it("returns 0 for monotonically increasing curve", () => {
    expect(recoveryTime([100, 110, 120, 130])).toBe(0);
  });

  it("calculates recovery from a drawdown", () => {
    // Peak at 100, drops to 80, recovers to 100 at index 4
    const curve = [100, 90, 80, 90, 100, 110];
    expect(recoveryTime(curve)).toBe(4); // 4 periods from peak to recovery
  });

  it("returns -1 if never recovered", () => {
    const curve = [100, 90, 80, 70];
    expect(recoveryTime(curve)).toBe(-1);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/__tests__/finance-math-extended.test.ts`
Expected: FAIL — functions not exported

- [ ] **Step 3: Implement new functions in finance-math.ts**

Add to `src/lib/finance-math.ts`:

```typescript
/**
 * Standard normal CDF approximation (Abramowitz & Stegun).
 */
function normalCDF(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  const t = 1.0 / (1.0 + p * Math.abs(x));
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x / 2);
  return 0.5 * (1.0 + sign * y);
}

/**
 * Standard normal PDF.
 */
function normalPDF(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

/**
 * Inverse normal CDF (rational approximation).
 */
function normalInvCDF(p: number): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  if (p < 0.5) return -normalInvCDF(1 - p);
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.383577518672690e2, -3.066479806614716e1, 2.506628277459239e0];
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838e0, -2.549732539343734e0, 4.374664141464968e0, 2.938163982698783e0];
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996e0, 3.754408661907416e0];
  const pLow = 0.02425;
  const pHigh = 1 - pLow;
  let q: number, r: number;
  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  } else if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
}

/**
 * Parametric Value at Risk.
 * @param allocation - risky allocation amount
 * @param sd - portfolio standard deviation
 * @param confidence - confidence level (e.g., 0.95)
 * @returns VaR as positive number (potential loss)
 */
export function valueAtRisk(allocation: number, sd: number, confidence: number): number {
  if (allocation === 0) return 0;
  const z = normalInvCDF(confidence);
  return allocation * sd * z;
}

/**
 * Conditional Value at Risk (Expected Shortfall).
 */
export function conditionalVaR(allocation: number, sd: number, confidence: number): number {
  if (allocation === 0) return 0;
  const z = normalInvCDF(confidence);
  return allocation * sd * normalPDF(z) / (1 - confidence);
}

/**
 * Cholesky decomposition of a positive-definite matrix.
 * Returns lower triangular matrix L such that L * L^T = matrix.
 */
export function choleskyDecomposition(matrix: number[][]): number[][] {
  const n = matrix.length;
  const L: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      let sum = 0;
      for (let k = 0; k < j; k++) {
        sum += L[i][k] * L[j][k];
      }
      if (i === j) {
        L[i][j] = Math.sqrt(Math.max(0, matrix[i][i] - sum));
      } else {
        L[i][j] = L[j][j] > 0 ? (matrix[i][j] - sum) / L[j][j] : 0;
      }
    }
  }

  return L;
}

/**
 * Generate correlated random returns using Cholesky decomposition.
 */
export function correlatedReturns(
  means: number[],
  sds: number[],
  cholesky: number[][]
): number[] {
  const n = means.length;
  const z: number[] = Array.from({ length: n }, () => normalRandom(0, 1));
  const result: number[] = new Array(n);

  for (let i = 0; i < n; i++) {
    let correlated = 0;
    for (let j = 0; j <= i; j++) {
      correlated += cholesky[i][j] * z[j];
    }
    result[i] = means[i] + sds[i] * correlated;
  }

  return result;
}

/**
 * Recovery time: periods from peak to recovery after max drawdown.
 * Returns -1 if never recovered.
 */
export function recoveryTime(equityCurve: number[]): number {
  if (equityCurve.length <= 1) return 0;

  let peak = equityCurve[0];
  let peakIndex = 0;
  let maxDD = 0;
  let troughIndex = 0;

  // Find the max drawdown trough
  for (let i = 1; i < equityCurve.length; i++) {
    if (equityCurve[i] > peak) {
      peak = equityCurve[i];
      peakIndex = i;
    }
    const dd = (equityCurve[i] - peak) / peak;
    if (dd < maxDD) {
      maxDD = dd;
      troughIndex = i;
    }
  }

  if (maxDD === 0) return 0;

  // Find recovery point after trough
  const preDrawdownPeak = equityCurve[peakIndex];
  for (let i = troughIndex + 1; i < equityCurve.length; i++) {
    if (equityCurve[i] >= preDrawdownPeak) {
      return i - peakIndex;
    }
  }

  return -1; // never recovered
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/__tests__/finance-math-extended.test.ts`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/finance-math.ts src/lib/__tests__/finance-math-extended.test.ts
git commit -m "feat: add VaR, CVaR, Cholesky, correlatedReturns, recoveryTime to finance-math"
```

---

## Task 2: Correlation Utils + Tests

**Files:**
- Create: `src/lib/correlation-utils.ts`
- Create: `src/lib/__tests__/correlation-utils.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/lib/__tests__/correlation-utils.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { buildCorrelationFromHistory } from "@/lib/correlation-utils";

describe("buildCorrelationFromHistory", () => {
  it("computes correlation matrix from nav history arrays", () => {
    // Two perfectly correlated assets
    const histories = [
      [100, 110, 120, 130],
      [50, 55, 60, 65],
    ];
    const corr = buildCorrelationFromHistory(histories);
    expect(corr[0][0]).toBeCloseTo(1, 4);
    expect(corr[1][1]).toBeCloseTo(1, 4);
    expect(corr[0][1]).toBeCloseTo(1, 2); // perfectly correlated
  });

  it("handles uncorrelated assets", () => {
    const histories = [
      [100, 110, 100, 110],
      [100, 90, 100, 90],
    ];
    const corr = buildCorrelationFromHistory(histories);
    expect(corr[0][1]).toBeCloseTo(-1, 1); // inversely correlated
  });

  it("returns identity matrix for single asset", () => {
    const corr = buildCorrelationFromHistory([[100, 110, 120]]);
    expect(corr).toEqual([[1]]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/__tests__/correlation-utils.test.ts`
Expected: FAIL

- [ ] **Step 3: Write implementation**

Create `src/lib/correlation-utils.ts`:

```typescript
import { correlationMatrix } from "@/lib/finance-math";

/**
 * Convert NAV history arrays to return series, then compute correlation matrix.
 * Each history is an array of NAV values in chronological order.
 */
export function buildCorrelationFromHistory(navHistories: number[][]): number[][] {
  // Convert NAV to returns: (NAV[t] - NAV[t-1]) / NAV[t-1]
  const returnsSeries = navHistories.map((navs) => {
    const returns: number[] = [];
    for (let i = 1; i < navs.length; i++) {
      returns.push(navs[i - 1] > 0 ? (navs[i] - navs[i - 1]) / navs[i - 1] : 0);
    }
    return returns;
  });

  return correlationMatrix(returnsSeries);
}

/**
 * Build correlation matrix from fund_correlations table rows.
 * Returns a symmetric n×n matrix given fund IDs and correlation pairs.
 */
export function buildCorrelationFromPairs(
  fundIds: string[],
  pairs: { fund_a_id: string; fund_b_id: string; correlation: number }[]
): number[][] {
  const n = fundIds.length;
  const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  const idIndex = new Map(fundIds.map((id, i) => [id, i]));

  for (let i = 0; i < n; i++) {
    matrix[i][i] = 1; // diagonal
  }

  for (const pair of pairs) {
    const i = idIndex.get(pair.fund_a_id);
    const j = idIndex.get(pair.fund_b_id);
    if (i !== undefined && j !== undefined) {
      matrix[i][j] = pair.correlation;
      matrix[j][i] = pair.correlation;
    }
  }

  return matrix;
}
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/lib/__tests__/correlation-utils.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/correlation-utils.ts src/lib/__tests__/correlation-utils.test.ts
git commit -m "feat: add correlation utils for fund history and fund_correlations table"
```

---

## Task 3: GPF Optimizer Types + Worker + Tests

**Files:**
- Modify: `src/types/calculator.ts`
- Create: `src/workers/gpf-optimizer.worker.ts`
- Create: `src/hooks/use-gpf-worker.ts`
- Create: `src/workers/__tests__/gpf-optimizer.test.ts`

- [ ] **Step 1: Add GPF types to calculator.ts**

```typescript
// ===== GPF Portfolio Optimizer =====

export interface GpfOptimizerInputs {
  currentHoldings: {
    bondPlan: number;
    equityPlan: number;
    goldPlan: number;
  };
  monthlyContribution: number;
  investmentYears: number;
  riskFreeRate: number;
  assetReturns: number[];
  assetSDs: number[];
  correlationMatrix: number[][];
  rebalanceFrequency: number;
  simulations: number;
}

export interface GpfRebalanceAction {
  asset: string;
  action: "BUY" | "SELL" | "HOLD";
  amount: number;
}

export interface GpfDrawdownYear {
  year: number;
  avgMDD: number;
  worstMDD: number;
  recoveryMonths: number;
}

export interface GpfOptimizerResults {
  maxSharpe: { weights: number[]; expectedReturn: number; risk: number; sharpeRatio: number };
  minVol: { weights: number[]; expectedReturn: number; risk: number; sharpeRatio: number };
  var95: number;
  var99: number;
  cvar95: number;
  cvar99: number;
  probabilityOfRuin: number;
  rebalanceActions: GpfRebalanceAction[];
  wealthProjections: {
    average: number;
    median: number;
    conservative: number;
    bull: number;
    successRate: number;
  };
  maxDrawdownByYear: GpfDrawdownYear[];
}
```

- [ ] **Step 2: Write failing worker test**

Create `src/workers/__tests__/gpf-optimizer.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { runGpfOptimizer } from "@/workers/gpf-optimizer.worker";

const defaultInputs = {
  currentHoldings: { bondPlan: 200000, equityPlan: 150000, goldPlan: 50000 },
  monthlyContribution: 10000,
  investmentYears: 27,
  riskFreeRate: 0.025,
  assetReturns: [0.025, 0.08, 0.05],
  assetSDs: [0.0126, 0.1204, 0.1517],
  correlationMatrix: [
    [1.0, 0.15, 0.14],
    [0.15, 1.0, 0.10],
    [0.14, 0.10, 1.0],
  ],
  rebalanceFrequency: 12,
  simulations: 100, // small for test speed
};

describe("runGpfOptimizer", () => {
  it("returns maxSharpe with 3 weights summing to 1", () => {
    const result = runGpfOptimizer(defaultInputs);
    expect(result.maxSharpe.weights).toHaveLength(3);
    const sum = result.maxSharpe.weights.reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1, 4);
  });

  it("returns rebalance actions for all 3 assets", () => {
    const result = runGpfOptimizer(defaultInputs);
    expect(result.rebalanceActions).toHaveLength(3);
    result.rebalanceActions.forEach((a) => {
      expect(["BUY", "SELL", "HOLD"]).toContain(a.action);
    });
  });

  it("returns VaR values where var99 > var95", () => {
    const result = runGpfOptimizer(defaultInputs);
    expect(result.var99).toBeGreaterThan(result.var95);
  });

  it("returns wealth projections with median > 0", () => {
    const result = runGpfOptimizer(defaultInputs);
    expect(result.wealthProjections.median).toBeGreaterThan(0);
  });

  it("returns drawdown analysis array", () => {
    const result = runGpfOptimizer(defaultInputs);
    expect(result.maxDrawdownByYear.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/workers/__tests__/gpf-optimizer.test.ts`
Expected: FAIL

- [ ] **Step 4: Implement the worker**

Create `src/workers/gpf-optimizer.worker.ts`:

The worker should:
1. Run MPT optimization (reuse logic from `mpt-optimizer.worker.ts` — `evaluatePortfolio`, `randomWeights`, frontier generation)
2. Find maxSharpe and minVol portfolios
3. Calculate rebalancing: for each asset, `optimalWeight × totalPortfolio - currentHolding` → BUY/SELL/HOLD
4. Calculate VaR/CVaR using `valueAtRisk` and `conditionalVaR` from finance-math
5. Run Monte Carlo: for each simulation, for each month, generate correlated returns via `correlatedReturns`, add DCA, rebalance at interval, track wealth
6. Calculate wealth percentiles and success rate
7. Calculate year-by-year MDD from simulation paths

Export: `export function runGpfOptimizer(inputs: GpfOptimizerInputs): GpfOptimizerResults`

- [ ] **Step 5: Create the hook**

Create `src/hooks/use-gpf-worker.ts` following the pattern from `use-monte-carlo-worker.ts`:

```typescript
import { useState, useCallback } from "react";
import { runGpfOptimizer } from "@/workers/gpf-optimizer.worker";
import type { GpfOptimizerInputs, GpfOptimizerResults } from "@/types/calculator";

export function useGpfWorker() {
  const [results, setResults] = useState<GpfOptimizerResults | null>(null);
  const [computing, setComputing] = useState(false);

  const compute = useCallback((inputs: GpfOptimizerInputs) => {
    setComputing(true);
    try {
      const result = runGpfOptimizer(inputs);
      setResults(result);
    } finally {
      setComputing(false);
    }
  }, []);

  return { results, computing, compute };
}
```

- [ ] **Step 6: Run tests**

Run: `npx vitest run src/workers/__tests__/gpf-optimizer.test.ts`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/types/calculator.ts src/workers/gpf-optimizer.worker.ts src/hooks/use-gpf-worker.ts src/workers/__tests__/gpf-optimizer.test.ts
git commit -m "feat: add GPF optimizer worker with MPT, Monte Carlo, and rebalancing"
```

---

## Task 4: TIPP/VPPI Types + Worker + Tests

**Files:**
- Modify: `src/types/calculator.ts`
- Create: `src/workers/tipp.worker.ts`
- Create: `src/hooks/use-tipp-worker.ts`
- Create: `src/workers/__tests__/tipp.test.ts`

- [ ] **Step 1: Add TIPP types to calculator.ts**

```typescript
// ===== TIPP/VPPI Portfolio Protection =====

export interface TippInputs {
  initialCapital: number;
  floorPercentage: number;
  maxMultiplier: number;
  riskFreeRate: number;
  assets: { name: string; monthlyReturns: number[] }[];
  correlationMatrix: number[][];
  targetVolatility: number;
  rebalanceThreshold: number;
  simulationMonths: number;
}

export interface TippWealthPoint {
  month: number;
  wealth: number;
  floor: number;
  multiplier: number;
  action: string;
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
  wealthPath: TippWealthPoint[];
  finalWealth: number;
  maxDrawdown: number;
  riskyWeight: number;
  safeWeight: number;
}
```

- [ ] **Step 2: Write failing worker test**

Create `src/workers/__tests__/tipp.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { runTipp } from "@/workers/tipp.worker";

const defaultInputs = {
  initialCapital: 1000000,
  floorPercentage: 0.85,
  maxMultiplier: 5,
  riskFreeRate: 0.025 / 12,
  assets: [
    { name: "Equity", monthlyReturns: Array.from({ length: 60 }, () => 0.008) },
    { name: "Gold", monthlyReturns: Array.from({ length: 60 }, () => 0.004) },
  ],
  correlationMatrix: [[1, 0.25], [0.25, 1]],
  targetVolatility: 0.14,
  rebalanceThreshold: 0.05,
  simulationMonths: 60,
};

describe("runTipp", () => {
  it("returns wealth path of correct length", () => {
    const result = runTipp(defaultInputs);
    expect(result.wealthPath).toHaveLength(61); // month 0 + 60 months
  });

  it("floor never exceeds wealth", () => {
    const result = runTipp(defaultInputs);
    result.wealthPath.forEach((point) => {
      expect(point.floor).toBeLessThanOrEqual(point.wealth + 0.01);
    });
  });

  it("floor ratchets up (never decreases)", () => {
    const result = runTipp(defaultInputs);
    for (let i = 1; i < result.wealthPath.length; i++) {
      expect(result.wealthPath[i].floor).toBeGreaterThanOrEqual(
        result.wealthPath[i - 1].floor - 0.01
      );
    }
  });

  it("returns valid safety status", () => {
    const result = runTipp(defaultInputs);
    expect(["SAFE", "WARNING", "DANGER"]).toContain(result.safetyStatus);
  });

  it("risky + safe weights sum to ~1", () => {
    const result = runTipp(defaultInputs);
    expect(result.riskyWeight + result.safeWeight).toBeCloseTo(1, 2);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/workers/__tests__/tipp.test.ts`
Expected: FAIL

- [ ] **Step 4: Implement the TIPP worker**

Create `src/workers/tipp.worker.ts`:

Core algorithm per the spec:
```
month 0: wealth = initialCapital, floor = floorPercentage * initialCapital
for each month 1..N:
  cushion = wealth - floor
  riskyAllocation = min(maxMultiplier * cushion, wealth)
  safeAllocation = wealth - riskyAllocation
  riskyReturn = weighted portfolio return from assets
  safeReturn = riskFreeRate
  wealth = riskyAllocation * (1 + riskyReturn) + safeAllocation * (1 + safeReturn)
  floor = max(floor, floorPercentage * wealth)  // ratchet up on new highs
  record point
```

Calculate VaR/CVaR using: `riskyAllocation * portfolioSD * Z(alpha)`

Safety status: cushion/wealth > 0.15 → SAFE, > 0.05 → WARNING, else DANGER

Export: `export function runTipp(inputs: TippInputs): TippResults`

- [ ] **Step 5: Create the hook**

Create `src/hooks/use-tipp-worker.ts` (same pattern as use-gpf-worker.ts).

- [ ] **Step 6: Run tests**

Run: `npx vitest run src/workers/__tests__/tipp.test.ts`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/types/calculator.ts src/workers/tipp.worker.ts src/hooks/use-tipp-worker.ts src/workers/__tests__/tipp.test.ts
git commit -m "feat: add TIPP/VPPI worker with floor-based protection simulation"
```

---

## Task 5: Portfolio Health Types + Worker + Tests

**Files:**
- Modify: `src/types/calculator.ts`
- Create: `src/workers/portfolio-health.worker.ts`
- Create: `src/hooks/use-portfolio-health-worker.ts`
- Create: `src/workers/__tests__/portfolio-health.test.ts`

- [ ] **Step 1: Add PortfolioHealth types to calculator.ts**

```typescript
// ===== Portfolio Health Dashboard =====

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

export interface DrawdownYearAnalysis {
  year: number;
  avgMDD: number;
  worstMDD: number;
  avgRecoveryMonths: number;
  worstRecoveryMonths: number;
}

export interface PortfolioHealthResults {
  monthlyReturn: number;
  targetReturn: number;
  projectedReturn: number;
  benchmarkReturn: number;
  alpha: number;
  sharpeRatio: number;
  sharpeRating: string;
  portfolioRisk: number;
  riskLevel: "Low" | "Moderate" | "High";
  drawdownAnalysis: DrawdownYearAnalysis[];
  performanceComment: string;
  riskComment: string;
}
```

- [ ] **Step 2: Write failing test, implement worker, create hook**

Follow same pattern as Tasks 3-4. The worker:
1. Calculates portfolio-level return and risk from holdings
2. Computes alpha = portfolioReturn - benchmarkReturn
3. Computes Sharpe = (portfolioReturn - riskFreeRate) / portfolioRisk
4. Sharpe rating: <0.2 → "1 star", <0.4 → "2 stars", <0.6 → "3 stars", <0.8 → "4 stars", else "5 stars"
5. Risk level: portfolioRisk < 0.08 → Low, < 0.15 → Moderate, else High
6. Runs Monte Carlo for each year (1 to investmentYears): simulate N paths, track MDD and recovery per path, aggregate percentiles
7. Generates commentary: alpha > 0 → "Outperform", else "Underperform"

- [ ] **Step 3: Run tests, verify pass**

- [ ] **Step 4: Commit**

```bash
git add src/types/calculator.ts src/workers/portfolio-health.worker.ts src/hooks/use-portfolio-health-worker.ts src/workers/__tests__/portfolio-health.test.ts
git commit -m "feat: add portfolio health worker with MDD simulation and Sharpe rating"
```

---

## Task 6: i18n Messages for Batch 2

**Files:**
- Modify: `messages/en.json`
- Modify: `messages/th.json`

- [ ] **Step 1: MERGE English messages for gpfOptimizer, tipp, portfolioHealth**

**IMPORTANT: MERGE into the existing JSON.** Add new nested keys inside existing top-level objects.

Keys to add under `"calculator"`:
- `gpfOptimizer.title`, `gpfOptimizer.subtitle`, `gpfOptimizer.bondPlan`, `gpfOptimizer.equityPlan`, `gpfOptimizer.goldPlan`, `gpfOptimizer.contribution`, `gpfOptimizer.horizon`, `gpfOptimizer.optimize`, `gpfOptimizer.rebalance`, `gpfOptimizer.buy`, `gpfOptimizer.sell`, `gpfOptimizer.hold`
- `tipp.title`, `tipp.subtitle`, `tipp.floor`, `tipp.multiplier`, `tipp.volatility`, `tipp.simulate`, `tipp.safe`, `tipp.warning`, `tipp.danger`, `tipp.cushion`, `tipp.riskyAllocation`, `tipp.safeAllocation`

Keys to add under `"portfolioHealth"`:
- `title`, `subtitle`, `nav`, `return`, `alpha`, `sharpe`, `risk`, `mdd`, `recovery`, `outperform`, `underperform`, `viewDetails`

- [ ] **Step 2: MERGE Thai messages** (same keys, Thai translations)

- [ ] **Step 3: Commit**

```bash
git add messages/en.json messages/th.json
git commit -m "feat: add i18n messages for GPF optimizer, TIPP, and portfolio health (th/en)"
```

---

## Task 7: GPF Optimizer Page + Components

**Files:**
- Create: `src/app/[locale]/(auth)/calculator/gpf-optimizer/page.tsx`
- Create: `src/components/calculator/gpf/gpf-holdings-form.tsx`
- Create: `src/components/calculator/gpf/gpf-optimizer-results.tsx`
- Create: `src/components/calculator/gpf/gpf-wealth-projection.tsx`
- Create: `src/components/calculator/gpf/gpf-drawdown-table.tsx`

- [ ] **Step 1: Create GPF holdings form**

3 number inputs (bond, equity, gold holdings in THB) + monthly contribution + investment years. Pre-filled with GPF defaults: bond E(R)=2.5%, equity E(R)=8%, gold E(R)=5%.

- [ ] **Step 2: Create GPF results component**

Pie chart (Recharts) for optimal allocation. Risk metric cards (VaR95, VaR99, CVaR). Rebalancing action table with BUY/SELL/HOLD badges and amounts.

- [ ] **Step 3: Create wealth projection component**

Monte Carlo fan chart (Recharts Area chart with percentile bands). Success rate gauge.

- [ ] **Step 4: Create drawdown table component**

Table with columns: Year, Avg MDD, Worst MDD (P5), Avg Recovery, Worst Recovery. Color-code rows where MDD > 20%.

- [ ] **Step 5: Create the page**

Follow retirement page pattern. Use `useGpfWorker()` hook. Layout: form card → results → wealth projection → drawdown table.

- [ ] **Step 6: Commit**

```bash
git add src/app/[locale]/(auth)/calculator/gpf-optimizer/ src/components/calculator/gpf/
git commit -m "feat: add GPF Portfolio Optimizer page and components"
```

---

## Task 8: TIPP/VPPI Page + Components

**Files:**
- Create: `src/app/[locale]/(auth)/calculator/tipp/page.tsx`
- Create: `src/components/calculator/tipp/tipp-form.tsx`
- Create: `src/components/calculator/tipp/tipp-strategy-chart.tsx`
- Create: `src/components/calculator/tipp/tipp-risk-dashboard.tsx`
- Create: `src/components/calculator/tipp/tipp-allocation-view.tsx`

- [ ] **Step 1: Create TIPP form**

Inputs: initial capital, floor % (slider, default 85%), max multiplier (slider, default 5), target volatility, simulation months. Asset selection from hardcoded GPF/RMF defaults initially.

- [ ] **Step 2: Create strategy chart**

Recharts LineChart with two lines: wealth path (blue) and floor path (red dashed). Multiplier as secondary Y-axis or area fill. Month labels on X-axis.

- [ ] **Step 3: Create risk dashboard**

4 cards: VaR95, VaR99, CVaR95, CVaR99. Safety status badge (SAFE green, WARNING yellow, DANGER red). Cushion gauge (wealth - floor as %).

- [ ] **Step 4: Create allocation view**

Horizontal bar or donut showing risky vs safe allocation. Rebalance signal if drift > threshold.

- [ ] **Step 5: Create the page**

Use `useTippWorker()` hook. Layout: form → strategy chart → risk dashboard → allocation.

- [ ] **Step 6: Commit**

```bash
git add src/app/[locale]/(auth)/calculator/tipp/ src/components/calculator/tipp/
git commit -m "feat: add TIPP/VPPI Portfolio Protection page and components"
```

---

## Task 9: Portfolio Health Page + Dashboard Card

**Files:**
- Create: `src/app/[locale]/(auth)/portfolio-health/page.tsx`
- Create: `src/components/portfolio-health/performance-metrics.tsx`
- Create: `src/components/portfolio-health/mdd-recovery-table.tsx`
- Create: `src/components/portfolio-health/risk-commentary.tsx`
- Create: `src/components/portfolio-health/allocation-breakdown.tsx`
- Create: `src/components/dashboard/portfolio-health-summary-card.tsx`

- [ ] **Step 1: Create dashboard summary card**

Small card for `/dashboard`: shows NAV, monthly return %, alpha badge (green/red), risk level badge. "View Details" link to `/portfolio-health`.

- [ ] **Step 2: Create performance metrics component**

Cards: target return, projected return, benchmark return. Alpha with color indicator. Sharpe ratio with star rating.

- [ ] **Step 3: Create MDD recovery table**

Table: Year (1-27), Avg MDD, Worst MDD (P5), Avg Recovery Months, Worst Recovery Months. Matching the spreadsheet ชีต17 format.

- [ ] **Step 4: Create risk commentary**

Auto-generated text based on results: performance comment + risk comment. Use i18n keys for templates.

- [ ] **Step 5: Create allocation breakdown**

Horizontal stacked bar or donut showing current asset weights.

- [ ] **Step 6: Create the portfolio health page**

Use `usePortfolioHealthWorker()` hook. Input form for NAV, DCA, holdings. Results: metrics → allocation → MDD table → commentary.

- [ ] **Step 7: Wire dashboard card into dashboard page**

Fetch portfolio health data server-side (or from most recent saved plan), pass to `PortfolioHealthSummaryCard`.

- [ ] **Step 8: Commit**

```bash
git add src/app/[locale]/(auth)/portfolio-health/ src/components/portfolio-health/ src/components/dashboard/portfolio-health-summary-card.tsx
git commit -m "feat: add Portfolio Health Dashboard page and summary card"
```

---

## Task 10: Enhanced MPT — 10+ Fund Selection

**Files:**
- Modify: `src/components/calculator/mpt/fund-selector.tsx`
- Modify: `src/app/[locale]/(auth)/calculator/mpt/page.tsx`

- [ ] **Step 1: Enhance fund-selector.tsx**

Replace the simple checkbox list with:
- Search input (filter by ticker or name)
- Category filter (equity/bond/gold/mixed/money_market badges)
- Max 10 selection with counter
- Selected funds shown as chips with remove button

- [ ] **Step 2: Update MPT page to fetch from Supabase**

Replace hardcoded `SAMPLE_FUNDS` and `CORRELATIONS` with:
```typescript
// Fetch all funds
const { data: funds } = await supabase.from('funds').select('*');

// When user selects funds, compute correlation:
// 1. Try fund_correlations table first
// 2. Fallback: compute from nav_history using buildCorrelationFromHistory
```

Use `buildCorrelationFromPairs` or `buildCorrelationFromHistory` from `correlation-utils.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/components/calculator/mpt/fund-selector.tsx src/app/[locale]/(auth)/calculator/mpt/page.tsx
git commit -m "feat: enhance MPT to support 10+ fund selection from database"
```

---

## Task 11: Navigation + Integration Tests

**Files:**
- Modify: Navigation component
- Create: `src/components/calculator/gpf/__tests__/gpf-page.test.tsx`
- Create: `src/components/calculator/tipp/__tests__/tipp-page.test.tsx`

- [ ] **Step 1: Add navigation entries**

Add GPF Optimizer, TIPP/VPPI, Portfolio Health to sidebar navigation.

- [ ] **Step 2: Write integration tests**

Test each new page renders its key sections. Use `data-testid` attributes for reliable element selection.

- [ ] **Step 3: Run all tests**

Run: `npx vitest run`
Expected: All PASS

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add navigation entries and integration tests for Batch 2"
```

---

## Task Summary

| Task | Description | Key Files | Tests |
|------|-------------|-----------|-------|
| 1 | Finance math extensions | finance-math.ts | 12 unit tests |
| 2 | Correlation utils | correlation-utils.ts | 3 unit tests |
| 3 | GPF optimizer worker | gpf-optimizer.worker.ts + hook | 5 unit tests |
| 4 | TIPP worker | tipp.worker.ts + hook | 5 unit tests |
| 5 | Portfolio health worker | portfolio-health.worker.ts + hook | 5+ unit tests |
| 6 | i18n messages | en.json, th.json | — |
| 7 | GPF page + 4 components | 5 files | — |
| 8 | TIPP page + 4 components | 5 files | — |
| 9 | Portfolio Health page + card + 4 components | 7 files | — |
| 10 | Enhanced MPT (10+ funds) | 2 modified | — |
| 11 | Navigation + integration tests | 1 modified + 2 tests | 2+ integration tests |

**Total: ~35 files, 30+ tests, 11 commits**
