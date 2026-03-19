import { normalRandom, maxDrawdown, percentile } from "@/lib/finance-math";
import type {
  StressTestInputs,
  StressTestResults,
  ScenarioResult,
  EnhancedStressTestInputs,
  EnhancedStressTestResults,
  TimelineRiskEntry,
  BearMarketImpact,
  RebalancedPathEntry,
} from "@/types/calculator";

export interface InjectedEvent {
  type: "none" | "var99" | "blackswan" | "combined";
  varPeriod?: number;
  startPeriod?: number;
  consecutivePeriods?: number;
  shockReturn?: number;
}

/**
 * Run a single scenario simulation (averaged over many runs).
 */
export function runSingleScenario(
  name: string,
  expectedReturn: number,
  sd: number,
  periods: number,
  dcaAmount: number,
  bonusAmount: number,
  bonusFrequency: number,
  simulations: number,
  event: InjectedEvent
): ScenarioResult {
  const allDrawdowns: number[] = [];
  const allFinalWealth: number[] = [];
  let totalRecoveryTime = 0;
  let recoveryCount = 0;

  // Median equity curve
  const allCurves: number[][] = [];

  for (let sim = 0; sim < simulations; sim++) {
    let balance = 0;
    const curve: number[] = [0];

    for (let t = 1; t <= periods; t++) {
      // DCA contribution
      balance += dcaAmount;

      // Bonus
      if (bonusFrequency > 0 && t % bonusFrequency === 0) {
        balance += bonusAmount;
      }

      // Determine return for this period
      let monthReturn: number;

      if (event.type === "var99" && event.varPeriod === t) {
        // Inject 1st percentile return (worst 1%)
        monthReturn = expectedReturn - 2.326 * sd; // Z = -2.326 for 99% VaR
      } else if (
        event.type === "blackswan" &&
        event.startPeriod !== undefined &&
        event.consecutivePeriods !== undefined &&
        t >= event.startPeriod &&
        t < event.startPeriod + event.consecutivePeriods
      ) {
        monthReturn = event.shockReturn ?? -0.2;
      } else if (
        event.type === "combined" &&
        event.varPeriod === t
      ) {
        monthReturn = expectedReturn - 2.326 * sd;
      } else if (
        event.type === "combined" &&
        event.startPeriod !== undefined &&
        event.consecutivePeriods !== undefined &&
        t >= event.startPeriod &&
        t < event.startPeriod + event.consecutivePeriods
      ) {
        monthReturn = event.shockReturn ?? -0.2;
      } else {
        monthReturn = normalRandom(expectedReturn, sd);
      }

      balance *= 1 + monthReturn;
      if (balance < 0) balance = 0;
      curve.push(balance);
    }

    allCurves.push(curve);
    allFinalWealth.push(balance);
    const dd = maxDrawdown(curve);
    allDrawdowns.push(dd);

    // Calculate recovery time (from max drawdown point)
    let peak = 0;
    let drawdownStart = -1;
    let recovered = false;
    for (let i = 0; i < curve.length; i++) {
      if (curve[i] > peak) {
        if (drawdownStart >= 0 && !recovered) {
          totalRecoveryTime += i - drawdownStart;
          recoveryCount++;
          recovered = true;
        }
        peak = curve[i];
        drawdownStart = -1;
        recovered = false;
      } else if (drawdownStart < 0) {
        drawdownStart = i;
      }
    }
  }

  // Build median equity curve
  const medianCurve: number[] = [];
  for (let t = 0; t <= periods; t++) {
    const values = allCurves.map((c) => c[t] || 0);
    medianCurve.push(percentile(values, 50));
  }

  const medianDD = percentile(allDrawdowns, 50);
  const avgRecovery =
    recoveryCount > 0 ? totalRecoveryTime / recoveryCount : 0;
  const medianFinal = percentile(allFinalWealth, 50);

  return {
    name,
    equityCurve: medianCurve,
    maxDrawdown: medianDD,
    recoveryTime: Math.round(avgRecovery),
    finalWealth: medianFinal,
  };
}

/**
 * Run all 4 stress test scenarios.
 */
export function runStressTest(inputs: StressTestInputs): StressTestResults {
  const {
    expectedReturn,
    sd,
    periods,
    dcaAmount,
    bonusAmount,
    bonusFrequency,
    varStartPeriod,
    blackSwanStartPeriod,
    blackSwanConsecutivePeriods,
    simulations,
  } = inputs;

  // Scenario 1: Normal
  const normal = runSingleScenario(
    "Normal",
    expectedReturn,
    sd,
    periods,
    dcaAmount,
    bonusAmount,
    bonusFrequency,
    simulations,
    { type: "none" }
  );

  // Scenario 2: VaR (99%)
  const var99 = runSingleScenario(
    "VaR (99%)",
    expectedReturn,
    sd,
    periods,
    dcaAmount,
    bonusAmount,
    bonusFrequency,
    simulations,
    { type: "var99", varPeriod: varStartPeriod }
  );

  // Scenario 3: Black Swan
  const blackSwan = runSingleScenario(
    "Black Swan",
    expectedReturn,
    sd,
    periods,
    dcaAmount,
    bonusAmount,
    bonusFrequency,
    simulations,
    {
      type: "blackswan",
      startPeriod: blackSwanStartPeriod,
      consecutivePeriods: blackSwanConsecutivePeriods,
      shockReturn: -0.2,
    }
  );

  // Scenario 4: Combined
  const combined = runSingleScenario(
    "Combined",
    expectedReturn,
    sd,
    periods,
    dcaAmount,
    bonusAmount,
    bonusFrequency,
    simulations,
    {
      type: "combined",
      varPeriod: varStartPeriod,
      startPeriod: blackSwanStartPeriod,
      consecutivePeriods: blackSwanConsecutivePeriods,
      shockReturn: -0.2,
    }
  );

  // Doubling probability: how many normal simulations double the initial investment
  let doubled = 0;
  const totalInvested = dcaAmount * periods;
  for (let sim = 0; sim < simulations; sim++) {
    let balance = 0;
    for (let t = 1; t <= periods; t++) {
      balance += dcaAmount;
      if (bonusFrequency > 0 && t % bonusFrequency === 0) {
        balance += bonusAmount;
      }
      const r = normalRandom(expectedReturn, sd);
      balance *= 1 + r;
    }
    if (balance >= totalInvested * 2) doubled++;
  }
  const doublingProbability = doubled / simulations;

  const allDrawdowns = [
    normal.maxDrawdown,
    var99.maxDrawdown,
    blackSwan.maxDrawdown,
    combined.maxDrawdown,
  ];

  return {
    scenarios: [normal, var99, blackSwan, combined],
    doublingProbability,
    medianDrawdown: percentile(allDrawdowns, 50),
    worstDrawdown: Math.min(...allDrawdowns),
  };
}

/**
 * Run enhanced stress test with bear market injection, timeline risk, and rebalanced path.
 */
export function runEnhancedStressTest(
  inputs: EnhancedStressTestInputs
): EnhancedStressTestResults {
  // 1. Get base stress test results
  const baseResults = runStressTest(inputs);

  const {
    expectedReturn,
    sd,
    periods,
    dcaAmount,
    bonusAmount,
    bonusFrequency,
    simulations,
    bearMarketEnabled,
    bearMarketReturn,
    bearMarketYears,
    rebalanceFrequencyMonths,
  } = inputs;

  const bearMonths = bearMarketYears * 12;
  const monthlyBearReturn = bearMarketReturn / 12;
  const maxYears = Math.ceil(periods / 12);

  // 2. Timeline risk: for each year, simulate paths and track loss/doubling probabilities
  const timelineRisk: TimelineRiskEntry[] = [];
  for (let year = 1; year <= maxYears; year++) {
    const monthsForYear = year * 12;
    let lossCount = 0;
    let doublingCount = 0;

    for (let sim = 0; sim < simulations; sim++) {
      let balance = 0;
      let principal = 0;

      for (let t = 1; t <= monthsForYear; t++) {
        balance += dcaAmount;
        principal += dcaAmount;
        if (bonusFrequency > 0 && t % bonusFrequency === 0) {
          balance += bonusAmount;
          principal += bonusAmount;
        }

        let monthReturn: number;
        if (bearMarketEnabled && t <= bearMonths) {
          monthReturn = monthlyBearReturn;
        } else {
          monthReturn = normalRandom(expectedReturn, sd);
        }

        balance *= 1 + monthReturn;
        if (balance < 0) balance = 0;
      }

      if (balance < principal) lossCount++;
      if (balance >= principal * 2) doublingCount++;
    }

    timelineRisk.push({
      year,
      principal: dcaAmount * monthsForYear,
      probOfLoss: lossCount / simulations,
      probOfDoubling: doublingCount / simulations,
    });
  }

  // 3. Bear market impact: single representative path
  let bearMarketImpact: BearMarketImpact;
  if (bearMarketEnabled) {
    let balance = 0;
    let peakBeforeBear = 0;
    let minDuringBear = Infinity;
    let wealthAtBearEnd = 0;
    const curve: number[] = [0];

    // Run full simulation
    for (let t = 1; t <= periods; t++) {
      balance += dcaAmount;
      if (bonusFrequency > 0 && t % bonusFrequency === 0) {
        balance += bonusAmount;
      }

      let monthReturn: number;
      if (t <= bearMonths) {
        monthReturn = monthlyBearReturn;
      } else {
        monthReturn = normalRandom(expectedReturn, sd);
      }

      balance *= 1 + monthReturn;
      if (balance < 0) balance = 0;
      curve.push(balance);

      // Track peak right before bear starts (at t=0 there's nothing, so track during bear)
      if (t <= bearMonths) {
        if (t === 1) peakBeforeBear = balance; // first month as reference
        if (balance > peakBeforeBear) peakBeforeBear = balance;
        if (balance < minDuringBear) minDuringBear = balance;
      }
      if (t === bearMonths) {
        wealthAtBearEnd = balance;
      }
    }

    // If bear period exceeds simulation, use last value
    if (bearMonths >= periods) {
      wealthAtBearEnd = balance;
    }

    const drawdownDuringBear =
      peakBeforeBear > 0
        ? (minDuringBear - peakBeforeBear) / peakBeforeBear
        : 0;

    // Recovery: months after bear end to reach peakBeforeBear again
    let recoveryMonths = 0;
    if (bearMonths < periods) {
      let recovered = false;
      for (let t = bearMonths + 1; t < curve.length; t++) {
        if (curve[t] >= peakBeforeBear) {
          recoveryMonths = t - bearMonths;
          recovered = true;
          break;
        }
      }
      if (!recovered) {
        recoveryMonths = periods - bearMonths; // never recovered
      }
    }

    bearMarketImpact = {
      drawdownDuringBear,
      recoveryMonths,
      wealthAtBearEnd,
    };
  } else {
    bearMarketImpact = {
      drawdownDuringBear: 0,
      recoveryMonths: 0,
      wealthAtBearEnd: 0,
    };
  }

  // 4. Rebalanced path: single simulation with DCA and rebalance labels
  const rebalancedPath: RebalancedPathEntry[] = [];
  {
    let balance = 0;
    let peak = 0;

    for (let t = 1; t <= periods; t++) {
      balance += dcaAmount;
      if (bonusFrequency > 0 && t % bonusFrequency === 0) {
        balance += bonusAmount;
      }

      let monthReturn: number;
      if (bearMarketEnabled && t <= bearMonths) {
        monthReturn = monthlyBearReturn;
      } else {
        monthReturn = normalRandom(expectedReturn, sd);
      }

      balance *= 1 + monthReturn;
      if (balance < 0) balance = 0;

      if (balance > peak) peak = balance;
      const drawdown = peak > 0 ? (balance - peak) / peak : 0;

      const isRebalMonth =
        rebalanceFrequencyMonths > 0 && t % rebalanceFrequencyMonths === 0;

      rebalancedPath.push({
        month: t,
        action: isRebalMonth ? "DCA+Rebal" : "DCA",
        totalWealth: balance,
        drawdown,
      });
    }
  }

  return {
    ...baseResults,
    timelineRisk,
    bearMarketImpact,
    rebalancedPath,
  };
}

// Web Worker message handler
if (typeof self !== "undefined" && typeof (self as any).onmessage !== "undefined") {
  self.onmessage = (e: MessageEvent<StressTestInputs>) => {
    const results = runStressTest(e.data);
    self.postMessage(results);
  };
}
