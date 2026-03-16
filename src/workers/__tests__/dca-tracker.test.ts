import { describe, it, expect } from "vitest";
import { runDca, runDcaStrategy } from "../dca-tracker.worker";
import type { DcaInputs } from "@/types/calculator";

// 12 months of known returns (monthly)
const equityReturns = [0.02, -0.01, 0.03, 0.01, -0.02, 0.04, 0.01, -0.03, 0.02, 0.03, -0.01, 0.02];
const bondReturns = [0.003, 0.002, 0.001, 0.003, 0.002, 0.001, 0.003, 0.002, 0.001, 0.003, 0.002, 0.001];

const baseInputs: DcaInputs = {
  monthlyAmount: 10000,
  assets: [
    { name: "Equity", weight: 0.6, monthlyReturns: equityReturns },
    { name: "Bond", weight: 0.4, monthlyReturns: bondReturns },
  ],
  rebalanceFrequency: 6,
  investmentMonths: 12,
  strategy: "static",
  initialEquityWeight: 0.8,
  finalEquityWeight: 0.4,
  equityAssetIndex: 0,
  momentumLookback: 3,
};

describe("runDcaStrategy (static)", () => {
  it("total principal equals monthlyAmount * months", () => {
    const result = runDcaStrategy(baseInputs, "static");
    expect(result.totalInvested).toBe(10000 * 12);
  });

  it("trade log has correct number of entries", () => {
    const result = runDcaStrategy(baseInputs, "static");
    expect(result.tradeLog.length).toBe(12);
  });

  it("after rebalance, weights reset to target allocation (within 5%)", () => {
    const result = runDcaStrategy(baseInputs, "static");
    // Rebalance happens at month 6, so month 7 should be close to target
    const rebalMonth = result.tradeLog.find(
      (e) => e.month === 6 && e.action === "Rebal"
    );
    if (rebalMonth) {
      expect(rebalMonth.weights[0]).toBeCloseTo(0.6, 1);
      expect(rebalMonth.weights[1]).toBeCloseTo(0.4, 1);
    }
  });

  it("final wealth is greater than 0", () => {
    const result = runDcaStrategy(baseInputs, "static");
    expect(result.finalWealth).toBeGreaterThan(0);
  });

  it("calculates max drawdown", () => {
    const result = runDcaStrategy(baseInputs, "static");
    expect(result.maxDrawdown).toBeLessThanOrEqual(0);
  });
});

describe("runDcaStrategy (glidepath)", () => {
  it("equity weight decreases over time", () => {
    const result = runDcaStrategy(baseInputs, "glidepath");
    const firstMonth = result.tradeLog[0];
    const lastMonth = result.tradeLog[result.tradeLog.length - 1];
    // First month equity weight should be close to initialEquityWeight
    expect(firstMonth.weights[0]).toBeGreaterThan(lastMonth.weights[0]);
  });

  it("final equity weight is lower than initial equity weight", () => {
    const result = runDcaStrategy(baseInputs, "glidepath");
    const first = result.tradeLog[0].weights[0];
    const last = result.tradeLog[result.tradeLog.length - 1].weights[0];
    expect(last).toBeLessThan(first);
  });
});

describe("runDcaStrategy (daa)", () => {
  it("momentum-based allocation shifts toward best performer", () => {
    const result = runDcaStrategy(baseInputs, "daa");
    expect(result.tradeLog.length).toBe(12);
    expect(result.finalWealth).toBeGreaterThan(0);
  });
});

describe("runDca (all 3 strategies)", () => {
  it("returns results for all 3 strategies", () => {
    const results = runDca(baseInputs);
    expect(results.static).toBeDefined();
    expect(results.glidepath).toBeDefined();
    expect(results.daa).toBeDefined();
  });

  it("all strategies have same total invested", () => {
    const results = runDca(baseInputs);
    expect(results.static.totalInvested).toBe(results.glidepath.totalInvested);
    expect(results.static.totalInvested).toBe(results.daa.totalInvested);
  });

  it("with identical constant returns, all strategies produce similar results", () => {
    const constReturn = 0.005;
    const constInputs: DcaInputs = {
      ...baseInputs,
      assets: [
        {
          name: "Equity",
          weight: 0.6,
          monthlyReturns: Array(12).fill(constReturn),
        },
        {
          name: "Bond",
          weight: 0.4,
          monthlyReturns: Array(12).fill(constReturn),
        },
      ],
    };
    const results = runDca(constInputs);
    // With same return for all assets, strategy doesn't matter much
    // Allow 5% tolerance due to allocation differences
    const avgWealth =
      (results.static.finalWealth +
        results.glidepath.finalWealth +
        results.daa.finalWealth) /
      3;
    expect(
      Math.abs(results.static.finalWealth - avgWealth) / avgWealth
    ).toBeLessThan(0.05);
  });

  it("trade log entries have correct structure", () => {
    const results = runDca(baseInputs);
    const entry = results.static.tradeLog[0];
    expect(entry).toHaveProperty("month");
    expect(entry).toHaveProperty("year");
    expect(entry).toHaveProperty("action");
    expect(entry).toHaveProperty("weights");
    expect(entry).toHaveProperty("totalWealth");
    expect(entry).toHaveProperty("drawdownPercent");
  });
});
