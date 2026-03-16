import { describe, it, expect } from "vitest";
import { runMptOptimizer } from "../mpt-optimizer.worker";
import type { MptInputs } from "@/types/calculator";

// Known 3-asset portfolio from spreadsheet
const inputs: MptInputs = {
  assets: [
    {
      name: "S&P 500",
      ticker: "SCBRMS&P500",
      expectedReturn: 0.08,
      standardDeviation: 0.1858,
    },
    {
      name: "Bond",
      ticker: "SCBRM2",
      expectedReturn: 0.025,
      standardDeviation: 0.0191,
    },
    {
      name: "Gold",
      ticker: "SCBRMGOLDH",
      expectedReturn: 0.05,
      standardDeviation: 0.1511,
    },
  ],
  correlationMatrix: [
    [1.0, 0.1496, 0.1432],
    [0.1496, 1.0, 0.0978],
    [0.1432, 0.0978, 1.0],
  ],
  riskFreeRate: 0.02,
  frontierPoints: 100,
};

describe("runMptOptimizer", () => {
  it("returns 100 frontier points", () => {
    const results = runMptOptimizer(inputs);
    expect(results.frontier.length).toBe(100);
  });

  it("each frontier point has weights summing to 1.0", () => {
    const results = runMptOptimizer(inputs);
    for (const point of results.frontier) {
      const sum = point.weights.reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1.0, 2);
    }
  });

  it("no negative weights (no short selling)", () => {
    const results = runMptOptimizer(inputs);
    for (const point of results.frontier) {
      for (const w of point.weights) {
        expect(w).toBeGreaterThanOrEqual(-0.001); // small tolerance
      }
    }
  });

  it("max Sharpe has higher Sharpe ratio than all other frontier points", () => {
    const results = runMptOptimizer(inputs);
    for (const point of results.frontier) {
      expect(results.maxSharpe.sharpeRatio).toBeGreaterThanOrEqual(
        point.sharpeRatio - 0.001
      );
    }
  });

  it("min Vol has lower SD than max Sharpe", () => {
    const results = runMptOptimizer(inputs);
    expect(results.minVol.risk).toBeLessThanOrEqual(results.maxSharpe.risk);
  });

  it("min Vol SD is approximately close to bond-only (lowest-risk asset)", () => {
    const results = runMptOptimizer(inputs);
    // Bond SD = 1.91%, min vol should be close to or below that
    expect(results.minVol.risk).toBeLessThanOrEqual(0.025); // some tolerance
  });

  it("max Sharpe portfolio has bond-heavy allocation (mathematically correct with these parameters)", () => {
    const results = runMptOptimizer(inputs);
    const w = results.maxSharpe.weights;
    // With bond SD=1.91% and rf=2%, bond's Sharpe dominates.
    // Max Sharpe is bond-heavy with some S&P500 and Gold for extra return.
    expect(w[1]).toBeGreaterThan(0.5); // Bond dominant (highest risk-adjusted return)
    // Weights sum to 1
    const sum = w.reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1, 2);
    // Sharpe ratio should be positive
    expect(results.maxSharpe.sharpeRatio).toBeGreaterThan(0);
  });

  it("frontier is ordered by risk (ascending)", () => {
    const results = runMptOptimizer(inputs);
    for (let i = 1; i < results.frontier.length; i++) {
      expect(results.frontier[i].risk).toBeGreaterThanOrEqual(
        results.frontier[i - 1].risk - 0.0001
      );
    }
  });

  it("all frontier points have valid Sharpe ratios", () => {
    const results = runMptOptimizer(inputs);
    for (const point of results.frontier) {
      expect(Number.isFinite(point.sharpeRatio)).toBe(true);
    }
  });
});
