import { normalRandom, percentile } from "@/lib/finance-math";
import type { MonteCarloInputs, MonteCarloResults } from "@/types/calculator";

/**
 * Run Monte Carlo simulation for retirement withdrawal planning.
 * Exported for direct testing.
 */
export function runMonteCarlo(inputs: MonteCarloInputs): MonteCarloResults {
  const {
    lumpSum,
    currentMonthlyExpenses,
    yearsToRetirement,
    retirementAge,
    lifeExpectancy,
    governmentPension,
    annuity,
    portfolioExpectedReturn,
    portfolioSD,
    inflationExpectedReturn,
    inflationSD,
    rounds = 5000,
  } = inputs;

  const retirementMonths = (lifeExpectancy - retirementAge) * 12;
  if (retirementMonths <= 0) {
    return {
      survivalRate: 1,
      wealthPaths: [[lumpSum]],
      percentiles: { p10: [lumpSum], p25: [lumpSum], p50: [lumpSum], p75: [lumpSum], p90: [lumpSum] },
      medianFinalWealth: lumpSum,
      avgFinalWealth: lumpSum,
      partial: false,
      rounds,
    };
  }

  // Inflate expenses to retirement start
  const inflationMultiplier = Math.pow(
    1 + inputs.inflationRate,
    yearsToRetirement
  );
  const baseMonthlyExpense = currentMonthlyExpenses * inflationMultiplier;

  const allFinalWealth: number[] = [];
  let survived = 0;

  // Store all paths for percentile calculation
  const allPaths: number[][] = [];
  // Sample paths for charting (max 100)
  const sampleInterval = Math.max(1, Math.floor(rounds / 100));

  for (let sim = 0; sim < rounds; sim++) {
    let balance = lumpSum;
    const path: number[] = [balance];
    let alive = true;

    for (let month = 1; month <= retirementMonths; month++) {
      // Random return
      const monthlyReturn = normalRandom(portfolioExpectedReturn, portfolioSD);

      // Random inflation for this month
      const monthlyInflation = normalRandom(
        inflationExpectedReturn,
        inflationSD
      );

      // Inflate expenses
      const expense =
        baseMonthlyExpense * Math.pow(1 + monthlyInflation, month);

      // Net withdrawal (expenses minus pension/annuity income)
      const netWithdrawal = Math.max(
        0,
        expense - governmentPension - annuity
      );

      // Apply return then withdraw
      balance = balance * (1 + monthlyReturn) - netWithdrawal;

      if (balance <= 0) {
        balance = 0;
        alive = false;
        // Fill remaining months with 0
        for (let m = month; m <= retirementMonths; m++) {
          path.push(0);
        }
        break;
      }

      path.push(balance);
    }

    if (alive) survived++;
    allFinalWealth.push(balance);
    allPaths.push(path);
  }

  // Calculate percentiles at each month
  const p10: number[] = [];
  const p25: number[] = [];
  const p50: number[] = [];
  const p75: number[] = [];
  const p90: number[] = [];

  const pathLength = retirementMonths + 1;
  for (let m = 0; m < pathLength; m++) {
    const values = allPaths.map((p) => (m < p.length ? p[m] : 0));
    p10.push(percentile(values, 10));
    p25.push(percentile(values, 25));
    p50.push(percentile(values, 50));
    p75.push(percentile(values, 75));
    p90.push(percentile(values, 90));
  }

  // Sample paths for charting
  const wealthPaths: number[][] = [];
  for (let i = 0; i < allPaths.length; i += sampleInterval) {
    wealthPaths.push(allPaths[i]);
    if (wealthPaths.length >= 100) break;
  }

  const sortedFinal = [...allFinalWealth].sort((a, b) => a - b);
  const medianFinalWealth = percentile(sortedFinal, 50);
  const avgFinalWealth =
    allFinalWealth.reduce((a, b) => a + b, 0) / allFinalWealth.length;

  return {
    survivalRate: survived / rounds,
    wealthPaths,
    percentiles: { p10, p25, p50, p75, p90 },
    medianFinalWealth,
    avgFinalWealth,
    partial: false,
    rounds,
  };
}

// Web Worker message handler with progressive execution
if (typeof self !== "undefined" && typeof (self as any).onmessage !== "undefined") {
  self.onmessage = (e: MessageEvent<MonteCarloInputs>) => {
    const inputs = e.data;

    // Phase 1: Quick results with 5K rounds
    const partialResults = runMonteCarlo({ ...inputs, rounds: 5000 });
    self.postMessage({ ...partialResults, partial: true, rounds: 5000 });

    // Phase 2: Full results with 60K rounds
    const finalResults = runMonteCarlo({ ...inputs, rounds: 60000 });
    self.postMessage({ ...finalResults, partial: false, rounds: 60000 });
  };
}
