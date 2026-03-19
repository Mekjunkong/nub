import { describe, it, expect } from "vitest";
import { runPortfolioHealth } from "@/workers/portfolio-health.worker";

const defaultInputs = {
  totalNAV: 460000,
  previousNAV: 450000,
  monthlyDCA: 10000,
  holdings: [
    { asset: "Bonds", weight: 0.36, expectedReturn: 0.025, sd: 0.013 },
    { asset: "Foreign Equity", weight: 0.46, expectedReturn: 0.08, sd: 0.12 },
    { asset: "Gold", weight: 0.18, expectedReturn: 0.05, sd: 0.15 },
  ],
  correlationMatrix: [[1, 0.15, 0.14], [0.15, 1, 0.10], [0.14, 0.10, 1]],
  benchmarkReturn: -0.0244,
  riskFreeRate: 0.025,
  investmentYears: 27,
  simulations: 100,
};

describe("runPortfolioHealth", () => {
  it("calculates positive alpha when outperforming benchmark", () => {
    const r = runPortfolioHealth(defaultInputs);
    expect(r.alpha).toBeGreaterThan(0);
  });

  it("returns valid sharpe rating (1-5 stars)", () => {
    const r = runPortfolioHealth(defaultInputs);
    expect(r.sharpeRating).toMatch(/^[1-5] star/);
  });

  it("returns valid risk level", () => {
    const r = runPortfolioHealth(defaultInputs);
    expect(["Low", "Moderate", "High"]).toContain(r.riskLevel);
  });

  it("returns drawdown analysis for each year", () => {
    const r = runPortfolioHealth(defaultInputs);
    expect(r.drawdownAnalysis.length).toBe(defaultInputs.investmentYears);
    r.drawdownAnalysis.forEach(d => {
      expect(d.avgMDD).toBeLessThanOrEqual(0);
      expect(d.worstMDD).toBeLessThanOrEqual(d.avgMDD);
    });
  });

  it("generates performance and risk commentary", () => {
    const r = runPortfolioHealth(defaultInputs);
    expect(r.performanceComment.length).toBeGreaterThan(0);
    expect(r.riskComment.length).toBeGreaterThan(0);
  });
});
