import { maxDrawdown as calcMaxDrawdown } from "@/lib/finance-math";
import type {
  DcaInputs,
  DcaStrategy,
  DcaResults,
  DcaStrategyResult,
  TradeLogEntry,
} from "@/types/calculator";

/**
 * Run a single DCA strategy simulation.
 */
export function runDcaStrategy(
  inputs: DcaInputs,
  strategy: DcaStrategy
): DcaStrategyResult {
  const {
    monthlyAmount,
    assets,
    rebalanceFrequency,
    investmentMonths,
    initialEquityWeight = 0.8,
    finalEquityWeight = 0.4,
    equityAssetIndex = 0,
    momentumLookback = 3,
  } = inputs;

  const n = assets.length;
  const tradeLog: TradeLogEntry[] = [];
  const wealthCurve: number[] = [0];

  // Holdings per asset (in monetary value)
  let holdings = Array(n).fill(0);
  let totalInvested = 0;
  let peak = 0;

  // Get target weights based on strategy and current month
  function getTargetWeights(month: number): number[] {
    if (strategy === "static") {
      return assets.map((a) => a.weight);
    }

    if (strategy === "glidepath") {
      // Linear interpolation from initial to final equity weight
      const progress = month / investmentMonths;
      const equityWeight =
        initialEquityWeight +
        (finalEquityWeight - initialEquityWeight) * progress;
      const bondWeight = 1 - equityWeight;

      const weights = Array(n).fill(0);
      weights[equityAssetIndex] = equityWeight;
      // Distribute remaining weight proportionally among other assets
      const otherTotalWeight = assets
        .filter((_, i) => i !== equityAssetIndex)
        .reduce((sum, a) => sum + a.weight, 0);

      for (let i = 0; i < n; i++) {
        if (i !== equityAssetIndex) {
          weights[i] =
            otherTotalWeight > 0
              ? bondWeight * (assets[i].weight / otherTotalWeight)
              : bondWeight / (n - 1);
        }
      }
      return weights;
    }

    if (strategy === "daa") {
      // Momentum-based: look at past returns and overweight winners
      if (month <= momentumLookback) {
        return assets.map((a) => a.weight); // Use default until enough history
      }

      // Calculate momentum scores (cumulative return over lookback)
      const scores = assets.map((a) => {
        let cumReturn = 1;
        for (
          let i = Math.max(0, month - momentumLookback);
          i < month;
          i++
        ) {
          if (i < a.monthlyReturns.length) {
            cumReturn *= 1 + a.monthlyReturns[i];
          }
        }
        return cumReturn - 1;
      });

      // Convert to weights (softmax-like): higher momentum = higher weight
      const minScore = Math.min(...scores);
      const shifted = scores.map((s) => s - minScore + 0.01); // ensure positive
      const total = shifted.reduce((a, b) => a + b, 0);
      return shifted.map((s) => s / total);
    }

    return assets.map((a) => a.weight);
  }

  for (let month = 1; month <= investmentMonths; month++) {
    totalInvested += monthlyAmount;
    const targetWeights = getTargetWeights(month);

    // Apply returns to existing holdings
    for (let i = 0; i < n; i++) {
      const returnIdx = month - 1;
      const r =
        returnIdx < assets[i].monthlyReturns.length
          ? assets[i].monthlyReturns[returnIdx]
          : 0;
      holdings[i] *= 1 + r;
    }

    // Determine if rebalancing
    const shouldRebalance =
      rebalanceFrequency > 0 && month % rebalanceFrequency === 0;

    if (shouldRebalance) {
      // Rebalance: redistribute all holdings according to target weights
      const totalWealth = holdings.reduce((a, b) => a + b, 0) + monthlyAmount;
      holdings = targetWeights.map((w) => w * totalWealth);
    } else {
      // DCA: add new money according to target weights
      for (let i = 0; i < n; i++) {
        holdings[i] += monthlyAmount * targetWeights[i];
      }
    }

    const totalWealth = holdings.reduce((a, b) => a + b, 0);
    wealthCurve.push(totalWealth);

    if (totalWealth > peak) peak = totalWealth;
    const drawdownPercent =
      peak > 0 ? ((totalWealth - peak) / peak) * 100 : 0;

    // Current actual weights
    const actualWeights =
      totalWealth > 0
        ? holdings.map((h) => h / totalWealth)
        : targetWeights;

    const currentYear = Math.ceil(month / 12);

    tradeLog.push({
      month,
      year: currentYear,
      action: shouldRebalance ? "Rebal" : "DCA",
      weights: actualWeights,
      totalWealth,
      drawdownPercent,
    });
  }

  const finalWealth = holdings.reduce((a, b) => a + b, 0);
  const totalReturn =
    totalInvested > 0 ? (finalWealth - totalInvested) / totalInvested : 0;
  const years = investmentMonths / 12;
  const annualizedReturn =
    years > 0 ? Math.pow(1 + totalReturn, 1 / years) - 1 : 0;
  const mdd = calcMaxDrawdown(wealthCurve);

  return {
    totalInvested,
    finalWealth,
    totalReturn,
    annualizedReturn,
    maxDrawdown: mdd,
    tradeLog,
  };
}

/**
 * Run all 3 DCA strategies.
 */
export function runDca(inputs: DcaInputs): DcaResults {
  return {
    static: runDcaStrategy(inputs, "static"),
    glidepath: runDcaStrategy(inputs, "glidepath"),
    daa: runDcaStrategy(inputs, "daa"),
  };
}

// Web Worker message handler
if (
  typeof self !== "undefined" &&
  typeof (self as any).onmessage !== "undefined"
) {
  self.onmessage = (e: MessageEvent<DcaInputs>) => {
    const results = runDca(e.data);
    self.postMessage(results);
  };
}
