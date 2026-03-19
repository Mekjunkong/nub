import {
  normalRandom,
  maxDrawdown,
  recoveryTime,
  portfolioReturn,
  portfolioVariance,
  sharpeRatio,
  buildCovarianceMatrix,
  percentile,
} from "@/lib/finance-math";
import type {
  PortfolioHealthInputs,
  PortfolioHealthResults,
  DrawdownYearAnalysis,
} from "@/types/calculator";

/**
 * Rate a Sharpe ratio on a 1-5 star scale.
 */
function rateSharpe(sharpe: number): string {
  if (sharpe < 0.2) return "1 star";
  if (sharpe < 0.4) return "2 stars";
  if (sharpe < 0.6) return "3 stars";
  if (sharpe < 0.8) return "4 stars";
  return "5 stars";
}

/**
 * Determine risk level from annualised portfolio standard deviation.
 */
function classifyRisk(risk: number): "Low" | "Moderate" | "High" {
  if (risk < 0.08) return "Low";
  if (risk < 0.15) return "Moderate";
  return "High";
}

/**
 * Generate performance commentary.
 */
function performanceComment(alpha: number): string {
  if (alpha > 0) {
    return `Outperform: Portfolio beats benchmark by ${(alpha * 100).toFixed(2)}%`;
  }
  return `Underperform: Portfolio trails benchmark by ${(Math.abs(alpha) * 100).toFixed(2)}%`;
}

/**
 * Generate risk commentary.
 */
function riskComment(risk: number, riskLevel: "Low" | "Moderate" | "High"): string {
  if (riskLevel === "Low") {
    return `Low risk portfolio (SD ${(risk * 100).toFixed(2)}%) — suitable for conservative investors`;
  }
  if (riskLevel === "Moderate") {
    return `Moderate risk portfolio (SD ${(risk * 100).toFixed(2)}%) — balanced risk-return profile`;
  }
  return `High risk portfolio (SD ${(risk * 100).toFixed(2)}%) — suitable for aggressive investors with long horizons`;
}

/**
 * Run portfolio health analysis including MDD simulation per year.
 */
export function runPortfolioHealth(inputs: PortfolioHealthInputs): PortfolioHealthResults {
  const {
    totalNAV,
    previousNAV,
    monthlyDCA,
    holdings,
    correlationMatrix,
    benchmarkReturn,
    riskFreeRate,
    investmentYears,
    simulations,
  } = inputs;

  // --- Portfolio metrics ---
  const weights = holdings.map((h) => h.weight);
  const returns = holdings.map((h) => h.expectedReturn);
  const sds = holdings.map((h) => h.sd);

  const projectedReturn = portfolioReturn(weights, returns);
  const covMatrix = buildCovarianceMatrix(sds, correlationMatrix);
  const portfolioRisk = Math.sqrt(portfolioVariance(weights, covMatrix));

  // Monthly return from NAV change (net of DCA contribution)
  const monthlyReturn = previousNAV > 0
    ? (totalNAV - previousNAV - monthlyDCA) / previousNAV
    : 0;

  // Target return (annualized from monthly)
  const targetReturn = projectedReturn;

  // Alpha
  const alpha = projectedReturn - benchmarkReturn;

  // Sharpe
  const sharpe = sharpeRatio(projectedReturn, riskFreeRate, portfolioRisk);
  const sharpeRatingStr = rateSharpe(sharpe);

  // Risk
  const riskLevel = classifyRisk(portfolioRisk);

  // --- MDD simulation per year ---
  const monthlyMean = projectedReturn / 12;
  const monthlySd = portfolioRisk / Math.sqrt(12);

  const drawdownAnalysis: DrawdownYearAnalysis[] = [];

  for (let year = 1; year <= investmentYears; year++) {
    const months = year * 12;
    const mddValues: number[] = [];
    const recoveryValues: number[] = [];

    for (let sim = 0; sim < simulations; sim++) {
      let balance = totalNAV > 0 ? totalNAV : 1;
      const curve: number[] = [balance];

      for (let m = 1; m <= months; m++) {
        balance += monthlyDCA;
        const r = normalRandom(monthlyMean, monthlySd);
        balance *= 1 + r;
        if (balance < 0) balance = 0;
        curve.push(balance);
      }

      mddValues.push(maxDrawdown(curve));
      const rec = recoveryTime(curve);
      recoveryValues.push(rec === -1 ? months : rec);
    }

    const avgMDD = mddValues.reduce((a, b) => a + b, 0) / mddValues.length;
    const worstMDD = percentile(mddValues, 5); // P5 = worst 5%
    const avgRecoveryMonths = recoveryValues.reduce((a, b) => a + b, 0) / recoveryValues.length;
    const worstRecoveryMonths = percentile(recoveryValues, 95); // P95 = worst recovery

    drawdownAnalysis.push({
      year,
      avgMDD,
      worstMDD,
      avgRecoveryMonths,
      worstRecoveryMonths,
    });
  }

  return {
    monthlyReturn,
    targetReturn,
    projectedReturn,
    benchmarkReturn,
    alpha,
    sharpeRatio: sharpe,
    sharpeRating: sharpeRatingStr,
    portfolioRisk,
    riskLevel,
    drawdownAnalysis,
    performanceComment: performanceComment(alpha),
    riskComment: riskComment(portfolioRisk, riskLevel),
  };
}

// Web Worker message handler
if (typeof self !== "undefined" && typeof (self as any).onmessage !== "undefined") {
  self.onmessage = (e: MessageEvent<PortfolioHealthInputs>) => {
    const results = runPortfolioHealth(e.data);
    self.postMessage(results);
  };
}
