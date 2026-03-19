import { describe, it, expect } from "vitest";
import { runWithdrawalComparison } from "../monte-carlo.worker";

const baseInputs = {
  currentMonthlyExpenses: 50000,
  yearsToRetirement: 0,
  inflationRate: 0.025,
  retirementAge: 60,
  lifeExpectancy: 90,
  lumpSum: 10000000,
  governmentPension: 0,
  annuity: 0,
  portfolioExpectedReturn: 0.005,
  portfolioSD: 0.04,
  inflationExpectedReturn: 0.002,
  inflationSD: 0.001,
  rounds: 100,
  comparisonPension: 10000,
};

describe("runWithdrawalComparison", () => {
  it("returns both baseline and withPension results", () => {
    const r = runWithdrawalComparison(baseInputs);
    expect(r.baseline).toBeDefined();
    expect(r.withPension).toBeDefined();
    expect(r.baseline.survivalRate).toBeDefined();
    expect(r.withPension.survivalRate).toBeDefined();
  });

  it("withPension has higher or equal survival rate", () => {
    const r = runWithdrawalComparison(baseInputs);
    expect(r.withPension.survivalRate).toBeGreaterThanOrEqual(r.baseline.survivalRate);
  });

  it("calculates non-negative improvement deltas", () => {
    const r = runWithdrawalComparison(baseInputs);
    expect(r.improvement.successRateDelta).toBeGreaterThanOrEqual(0);
  });

  it("returns a verdict string", () => {
    const r = runWithdrawalComparison(baseInputs);
    expect(r.verdict.length).toBeGreaterThan(0);
  });
});
