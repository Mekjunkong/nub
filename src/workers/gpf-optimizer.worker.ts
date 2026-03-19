import {
  portfolioReturn,
  portfolioVariance,
  sharpeRatio,
  buildCovarianceMatrix,
  normalRandom,
  percentile,
  maxDrawdown,
  valueAtRisk,
  conditionalVaR,
} from "@/lib/finance-math";
import type {
  GpfOptimizerInputs,
  GpfOptimizerResults,
  GpfRebalanceAction,
  GpfDrawdownYear,
} from "@/types/calculator";
import type { PortfolioPoint } from "@/types/calculator";

const ASSET_NAMES = ["แผนตราสารหนี้", "แผนหุ้นต่างประเทศ", "แผนทองคำ"];

/**
 * Generate random weights that sum to 1.0 (Dirichlet-like).
 */
function randomWeights(n: number): number[] {
  const raw = Array.from({ length: n }, () => -Math.log(Math.random()));
  const sum = raw.reduce((a, b) => a + b, 0);
  return raw.map((v) => v / sum);
}

/**
 * Evaluate a portfolio given weights.
 */
function evaluatePortfolio(
  weights: number[],
  returns: number[],
  covMatrix: number[][],
  riskFreeRate: number
): PortfolioPoint {
  const ret = portfolioReturn(weights, returns);
  const variance = portfolioVariance(weights, covMatrix);
  const risk = Math.sqrt(Math.max(0, variance));
  const sharpe = risk > 0 ? sharpeRatio(ret, riskFreeRate, risk) : 0;

  return {
    weights: [...weights],
    expectedReturn: ret,
    risk,
    sharpeRatio: sharpe,
  };
}

/**
 * Generate grid portfolios for 3 assets with 1% step.
 */
function generateGridPortfolios(
  returns: number[],
  covMatrix: number[][],
  riskFreeRate: number
): PortfolioPoint[] {
  const results: PortfolioPoint[] = [];
  const steps = 100;
  const step = 0.01;

  for (let i = 0; i <= steps; i++) {
    for (let j = 0; j <= steps - i; j++) {
      const k = steps - i - j;
      const w = [i * step, j * step, k * step];
      results.push(evaluatePortfolio(w, returns, covMatrix, riskFreeRate));
    }
  }

  return results;
}

/**
 * Compute rebalance actions given optimal weights and current holdings.
 */
function computeRebalanceActions(
  optimalWeights: number[],
  currentHoldings: number[],
  totalPortfolio: number
): GpfRebalanceAction[] {
  const threshold = totalPortfolio * 0.01;

  return optimalWeights.map((w, i) => {
    const target = w * totalPortfolio;
    const diff = target - currentHoldings[i];
    let action: "BUY" | "SELL" | "HOLD";

    if (Math.abs(diff) < threshold) {
      action = "HOLD";
    } else if (diff > 0) {
      action = "BUY";
    } else {
      action = "SELL";
    }

    return {
      asset: ASSET_NAMES[i],
      action,
      amount: Math.abs(diff),
    };
  });
}

/**
 * Run Monte Carlo wealth projection.
 * Returns array of final wealth values and yearly equity curves for drawdown analysis.
 */
function runMonteCarloSimulation(
  inputs: GpfOptimizerInputs,
  optimalWeights: number[],
  covMatrix: number[][]
): { finalWeaths: number[]; yearlyCurves: number[][] } {
  const {
    currentHoldings,
    monthlyContribution,
    investmentYears,
    assetReturns,
    assetSDs,
    rebalanceFrequency,
    simulations,
  } = inputs;

  const totalMonths = investmentYears * 12;
  const initialWealth =
    currentHoldings.bondPlan +
    currentHoldings.equityPlan +
    currentHoldings.goldPlan;

  // Portfolio-level monthly return and SD from optimal weights
  const annualReturn = portfolioReturn(optimalWeights, assetReturns);
  const annualVariance = portfolioVariance(optimalWeights, covMatrix);
  const annualSD = Math.sqrt(Math.max(0, annualVariance));
  const monthlyReturn = annualReturn / 12;
  const monthlySD = annualSD / Math.sqrt(12);

  const finalWeaths: number[] = [];
  // Store yearly snapshots for drawdown: yearlyCurves[sim][year]
  const yearlyCurves: number[][] = [];

  for (let sim = 0; sim < simulations; sim++) {
    let wealth = initialWealth;
    const yearlySnapshots: number[] = [wealth];
    let month = 0;

    for (let m = 1; m <= totalMonths; m++) {
      // Random monthly return
      const r = normalRandom(monthlyReturn, monthlySD);
      wealth = wealth * (1 + r) + monthlyContribution;

      // Ensure wealth doesn't go below zero
      if (wealth < 0) wealth = 0;

      month++;

      // Rebalance at frequency (just continue with portfolio-level sim,
      // rebalancing is implicit since we use portfolio-level returns)
      if (month % rebalanceFrequency === 0) {
        // Rebalancing cost is negligible in GPF, no action needed
      }

      // Record yearly snapshot
      if (m % 12 === 0) {
        yearlySnapshots.push(wealth);
      }
    }

    finalWeaths.push(wealth);
    yearlyCurves.push(yearlySnapshots);
  }

  return { finalWeaths, yearlyCurves };
}

/**
 * Compute max drawdown statistics by year from Monte Carlo paths.
 */
function computeDrawdownByYear(
  yearlyCurves: number[][],
  investmentYears: number
): GpfDrawdownYear[] {
  const results: GpfDrawdownYear[] = [];

  for (let year = 1; year <= investmentYears; year++) {
    const mdds: number[] = [];

    for (const curve of yearlyCurves) {
      // Take the sub-curve up to this year
      const subCurve = curve.slice(0, year + 1);
      const mdd = maxDrawdown(subCurve);
      mdds.push(mdd);
    }

    const avgMDD =
      mdds.reduce((a, b) => a + b, 0) / mdds.length;
    const worstMDD = Math.min(...mdds);

    // Estimate recovery: use absolute value of avgMDD as proxy for recovery months
    // A deeper drawdown takes longer to recover
    const recoveryMonths = Math.round(Math.abs(avgMDD) * 12 * 2);

    results.push({
      year,
      avgMDD,
      worstMDD,
      recoveryMonths,
    });
  }

  return results;
}

/**
 * Run GPF portfolio optimizer.
 */
export function runGpfOptimizer(inputs: GpfOptimizerInputs): GpfOptimizerResults {
  const {
    currentHoldings,
    riskFreeRate,
    assetReturns,
    assetSDs,
    correlationMatrix: corrMatrix,
    investmentYears,
  } = inputs;

  const covMatrix = buildCovarianceMatrix(assetSDs, corrMatrix);

  // --- MPT Optimization: grid search for 3 assets ---
  const portfolios = generateGridPortfolios(assetReturns, covMatrix, riskFreeRate);

  let minVol = portfolios[0];
  let maxSharpePort = portfolios[0];

  for (const p of portfolios) {
    if (p.risk < minVol.risk) minVol = p;
    if (p.sharpeRatio > maxSharpePort.sharpeRatio) maxSharpePort = p;
  }

  // --- Total portfolio value ---
  const totalPortfolio =
    currentHoldings.bondPlan +
    currentHoldings.equityPlan +
    currentHoldings.goldPlan;

  // --- Rebalance actions (based on maxSharpe weights) ---
  const holdingsArray = [
    currentHoldings.bondPlan,
    currentHoldings.equityPlan,
    currentHoldings.goldPlan,
  ];
  const rebalanceActions = computeRebalanceActions(
    maxSharpePort.weights,
    holdingsArray,
    totalPortfolio
  );

  // --- VaR / CVaR ---
  const portfolioSD = maxSharpePort.risk;
  const var95 = valueAtRisk(totalPortfolio, portfolioSD, 0.95);
  const var99 = valueAtRisk(totalPortfolio, portfolioSD, 0.99);
  const cvar95 = conditionalVaR(totalPortfolio, portfolioSD, 0.95);
  const cvar99 = conditionalVaR(totalPortfolio, portfolioSD, 0.99);

  // --- Monte Carlo wealth projection ---
  const { finalWeaths, yearlyCurves } = runMonteCarloSimulation(
    inputs,
    maxSharpePort.weights,
    covMatrix
  );

  const average =
    finalWeaths.reduce((a, b) => a + b, 0) / finalWeaths.length;
  const median = percentile(finalWeaths, 50);
  const conservative = percentile(finalWeaths, 10);
  const bull = percentile(finalWeaths, 90);

  // Success rate: percentage of sims where final wealth > initial investment + total contributions
  const totalContributed =
    totalPortfolio + inputs.monthlyContribution * investmentYears * 12;
  const successRate =
    finalWeaths.filter((w) => w >= totalContributed).length /
    finalWeaths.length;

  // Probability of ruin: wealth goes to zero at any point
  const ruinCount = finalWeaths.filter((w) => w <= 0).length;
  const probabilityOfRuin = ruinCount / finalWeaths.length;

  // --- Drawdown by year ---
  const maxDrawdownByYear = computeDrawdownByYear(
    yearlyCurves,
    investmentYears
  );

  return {
    maxSharpe: {
      weights: maxSharpePort.weights,
      expectedReturn: maxSharpePort.expectedReturn,
      risk: maxSharpePort.risk,
      sharpeRatio: maxSharpePort.sharpeRatio,
    },
    minVol: {
      weights: minVol.weights,
      expectedReturn: minVol.expectedReturn,
      risk: minVol.risk,
      sharpeRatio: minVol.sharpeRatio,
    },
    var95,
    var99,
    cvar95,
    cvar99,
    probabilityOfRuin,
    rebalanceActions,
    wealthProjections: {
      average,
      median,
      conservative,
      bull,
      successRate,
    },
    maxDrawdownByYear,
  };
}

// Web Worker message handler
if (
  typeof self !== "undefined" &&
  typeof (self as any).onmessage !== "undefined"
) {
  self.onmessage = (e: MessageEvent<GpfOptimizerInputs>) => {
    const results = runGpfOptimizer(e.data);
    self.postMessage(results);
  };
}
