import {
  maxDrawdown as calcMaxDrawdown,
  portfolioReturn,
  portfolioVariance,
  sharpeRatio as calcSharpeRatio,
  buildCovarianceMatrix,
  valueAtRisk,
  conditionalVaR,
} from "@/lib/finance-math";
import type {
  TippInputs,
  TippResults,
  TippWealthPoint,
} from "@/types/calculator";

/**
 * Run TIPP/VPPI (Time-Invariant Portfolio Protection) simulation.
 *
 * Core idea: maintain a protective floor that ratchets up with new wealth highs.
 * Risky allocation = multiplier * cushion (wealth - floor).
 */
export function runTipp(inputs: TippInputs): TippResults {
  const {
    initialCapital,
    floorPercentage,
    maxMultiplier,
    riskFreeRate,
    assets,
    correlationMatrix,
    targetVolatility,
    rebalanceThreshold,
    simulationMonths,
  } = inputs;

  const n = assets.length;

  // --- Portfolio statistics ---
  // Equal weights for the risky portfolio
  const weights = Array(n).fill(1 / n);

  // Compute mean monthly returns per asset
  const assetMeans = assets.map((a) => {
    const sum = a.monthlyReturns.reduce((s, r) => s + r, 0);
    return sum / a.monthlyReturns.length;
  });

  // Compute monthly SDs per asset
  const assetSDs = assets.map((a, idx) => {
    const mean = assetMeans[idx];
    const sumSqDiff = a.monthlyReturns.reduce(
      (s, r) => s + (r - mean) ** 2,
      0
    );
    return Math.sqrt(sumSqDiff / (a.monthlyReturns.length - 1));
  });

  // Covariance matrix from SDs and correlation
  const covMatrix = buildCovarianceMatrix(assetSDs, correlationMatrix);

  // Portfolio monthly expected return and SD
  const portMonthlyReturn = portfolioReturn(weights, assetMeans);
  const portMonthlyVariance = portfolioVariance(weights, covMatrix);
  const portMonthlySD = Math.sqrt(portMonthlyVariance);

  // Annualized
  const annualReturn = portMonthlyReturn * 12;
  const annualSD = portMonthlySD * Math.sqrt(12);

  const annualRiskFreeRate = riskFreeRate * 12;
  const sr = calcSharpeRatio(annualReturn, annualRiskFreeRate, annualSD);

  // --- TIPP Simulation ---
  let wealth = initialCapital;
  let floor = floorPercentage * initialCapital;
  let peakWealth = initialCapital;
  let prevRiskyWeight = 0;

  const wealthPath: TippWealthPoint[] = [];

  // Month 0
  const initialCushion = Math.max(0, wealth - floor);
  const initialMultiplier =
    portMonthlySD > 0
      ? Math.min(maxMultiplier, targetVolatility / (portMonthlySD * Math.sqrt(12)))
      : maxMultiplier;
  const initialRiskyAlloc = Math.min(initialMultiplier * initialCushion, wealth);
  prevRiskyWeight = wealth > 0 ? initialRiskyAlloc / wealth : 0;

  wealthPath.push({
    month: 0,
    wealth,
    floor,
    multiplier: initialMultiplier,
    action: "Init",
  });

  for (let t = 1; t <= simulationMonths; t++) {
    const cushion = Math.max(0, wealth - floor);

    // Dynamic multiplier: target vol / portfolio annual vol, capped
    const multiplier =
      portMonthlySD > 0
        ? Math.min(maxMultiplier, targetVolatility / (portMonthlySD * Math.sqrt(12)))
        : maxMultiplier;

    let riskyAllocation = Math.min(multiplier * cushion, wealth);
    const safeAllocation = wealth - riskyAllocation;

    // Determine if rebalance is needed
    const currentRiskyWeight = wealth > 0 ? riskyAllocation / wealth : 0;
    const drift = Math.abs(currentRiskyWeight - prevRiskyWeight);
    const action = drift > rebalanceThreshold ? "Rebalance" : "Hold";

    // Apply returns for this month
    // Use the month index (clamped) to get asset returns
    const monthIdx = Math.min(t - 1, assets[0].monthlyReturns.length - 1);
    const assetReturnsThisMonth = assets.map((a) =>
      a.monthlyReturns[Math.min(monthIdx, a.monthlyReturns.length - 1)]
    );
    const riskyReturn = portfolioReturn(weights, assetReturnsThisMonth);
    const safeReturn = riskFreeRate;

    wealth =
      riskyAllocation * (1 + riskyReturn) +
      safeAllocation * (1 + safeReturn);

    // Ratchet floor on new highs
    if (wealth > peakWealth) {
      peakWealth = wealth;
      floor = Math.max(floor, floorPercentage * peakWealth);
    }

    // Track for next iteration
    prevRiskyWeight = wealth > 0 ? riskyAllocation / wealth : 0;

    wealthPath.push({
      month: t,
      wealth,
      floor,
      multiplier,
      action,
    });
  }

  // --- Final metrics ---
  const finalWealth = wealth;
  const equityCurve = wealthPath.map((p) => p.wealth);
  const mdd = calcMaxDrawdown(equityCurve);

  // Current state (last month)
  const finalCushion = Math.max(0, wealth - floor);
  const cushionRatio = wealth > 0 ? finalCushion / wealth : 0;

  let safetyStatus: "SAFE" | "WARNING" | "DANGER";
  if (cushionRatio > 0.15) {
    safetyStatus = "SAFE";
  } else if (cushionRatio > 0.05) {
    safetyStatus = "WARNING";
  } else {
    safetyStatus = "DANGER";
  }

  // Final allocation weights
  const finalMultiplier =
    portMonthlySD > 0
      ? Math.min(maxMultiplier, targetVolatility / (portMonthlySD * Math.sqrt(12)))
      : maxMultiplier;
  const finalRiskyAlloc = Math.min(finalMultiplier * finalCushion, wealth);
  const riskyWeight = wealth > 0 ? finalRiskyAlloc / wealth : 0;
  const safeWeight = 1 - riskyWeight;

  // VaR / CVaR based on risky allocation and portfolio SD
  const var95 = valueAtRisk(finalRiskyAlloc, portMonthlySD, 0.95);
  const var99 = valueAtRisk(finalRiskyAlloc, portMonthlySD, 0.99);
  const cvar95 = conditionalVaR(finalRiskyAlloc, portMonthlySD, 0.95);
  const cvar99 = conditionalVaR(finalRiskyAlloc, portMonthlySD, 0.99);

  return {
    expectedReturn: annualReturn,
    annualSD,
    sharpeRatio: sr,
    var95,
    var99,
    cvar95,
    cvar99,
    currentMultiplier: finalMultiplier,
    floorValue: floor,
    cushion: finalCushion,
    safetyStatus,
    wealthPath,
    finalWealth,
    maxDrawdown: mdd,
    riskyWeight,
    safeWeight,
  };
}

// Web Worker message handler
if (typeof self !== "undefined" && typeof (self as any).onmessage !== "undefined") {
  self.onmessage = (e: MessageEvent<TippInputs>) => {
    const results = runTipp(e.data);
    self.postMessage(results);
  };
}
