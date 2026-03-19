import { describe, it, expect } from "vitest";
import { runGpfOptimizer } from "@/workers/gpf-optimizer.worker";

const defaultInputs = {
  currentHoldings: { bondPlan: 200000, equityPlan: 150000, goldPlan: 50000 },
  monthlyContribution: 10000,
  investmentYears: 27,
  riskFreeRate: 0.025,
  assetReturns: [0.025, 0.08, 0.05],
  assetSDs: [0.0126, 0.1204, 0.1517],
  correlationMatrix: [[1.0, 0.15, 0.14], [0.15, 1.0, 0.10], [0.14, 0.10, 1.0]],
  rebalanceFrequency: 12,
  simulations: 100,
};

describe("runGpfOptimizer", () => {
  it("returns maxSharpe with 3 weights summing to 1", () => {
    const r = runGpfOptimizer(defaultInputs);
    expect(r.maxSharpe.weights).toHaveLength(3);
    expect(r.maxSharpe.weights.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 4);
  });

  it("returns minVol with lower risk than maxSharpe", () => {
    const r = runGpfOptimizer(defaultInputs);
    expect(r.minVol.risk).toBeLessThanOrEqual(r.maxSharpe.risk + 0.001);
  });

  it("returns rebalance actions for 3 assets", () => {
    const r = runGpfOptimizer(defaultInputs);
    expect(r.rebalanceActions).toHaveLength(3);
    r.rebalanceActions.forEach(a => expect(["BUY", "SELL", "HOLD"]).toContain(a.action));
  });

  it("returns VaR where var99 > var95", () => {
    const r = runGpfOptimizer(defaultInputs);
    expect(r.var99).toBeGreaterThan(r.var95);
  });

  it("returns wealth projections with positive median", () => {
    const r = runGpfOptimizer(defaultInputs);
    expect(r.wealthProjections.median).toBeGreaterThan(0);
  });
});
