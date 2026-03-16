import { describe, it, expect } from "vitest";
import { runMonteCarlo } from "../monte-carlo.worker";
import type { MonteCarloInputs } from "@/types/calculator";

const baseInputs: MonteCarloInputs = {
  currentMonthlyExpenses: 30000,
  yearsToRetirement: 0, // already retired
  inflationRate: 0.03,
  retirementAge: 60,
  lifeExpectancy: 85,
  lumpSum: 10000000, // 10M
  governmentPension: 0,
  annuity: 0,
  portfolioExpectedReturn: 0.005, // 0.5% monthly
  portfolioSD: 0.04, // 4% monthly SD
  inflationExpectedReturn: 0.0025,
  inflationSD: 0.001,
  rounds: 100,
};

describe("runMonteCarlo", () => {
  it("returns 100% survival with very high returns and no withdrawals", () => {
    const inputs: MonteCarloInputs = {
      ...baseInputs,
      currentMonthlyExpenses: 0,
      portfolioExpectedReturn: 0.10, // 10% monthly = unrealistically high
      portfolioSD: 0,
      inflationExpectedReturn: 0,
      inflationSD: 0,
      rounds: 100,
    };
    const result = runMonteCarlo(inputs);
    expect(result.survivalRate).toBe(1);
  });

  it("returns 0% survival with -50% monthly return and withdrawals", () => {
    const inputs: MonteCarloInputs = {
      ...baseInputs,
      lumpSum: 100000, // only 100K
      currentMonthlyExpenses: 50000,
      portfolioExpectedReturn: -0.5,
      portfolioSD: 0,
      inflationExpectedReturn: 0,
      inflationSD: 0,
      rounds: 100,
    };
    const result = runMonteCarlo(inputs);
    expect(result.survivalRate).toBe(0);
  });

  it("returns survival rate between 0 and 1", () => {
    const result = runMonteCarlo(baseInputs);
    expect(result.survivalRate).toBeGreaterThanOrEqual(0);
    expect(result.survivalRate).toBeLessThanOrEqual(1);
  });

  it("percentiles are in correct order (P10 <= P25 <= P50 <= P75 <= P90)", () => {
    const result = runMonteCarlo({ ...baseInputs, rounds: 200 });
    const { percentiles } = result;
    // Check at the final month
    const lastIdx = percentiles.p10.length - 1;
    expect(percentiles.p10[lastIdx]).toBeLessThanOrEqual(
      percentiles.p25[lastIdx]
    );
    expect(percentiles.p25[lastIdx]).toBeLessThanOrEqual(
      percentiles.p50[lastIdx]
    );
    expect(percentiles.p50[lastIdx]).toBeLessThanOrEqual(
      percentiles.p75[lastIdx]
    );
    expect(percentiles.p75[lastIdx]).toBeLessThanOrEqual(
      percentiles.p90[lastIdx]
    );
  });

  it("generates sampled wealth paths for charting", () => {
    const result = runMonteCarlo({ ...baseInputs, rounds: 200 });
    expect(result.wealthPaths.length).toBeGreaterThan(0);
    expect(result.wealthPaths.length).toBeLessThanOrEqual(100);
    // Each path should start at lumpSum
    for (const path of result.wealthPaths) {
      expect(path[0]).toBeCloseTo(baseInputs.lumpSum, -2);
    }
  });

  it("calculates median and average final wealth", () => {
    const result = runMonteCarlo(baseInputs);
    expect(typeof result.medianFinalWealth).toBe("number");
    expect(typeof result.avgFinalWealth).toBe("number");
  });

  it("supports progressive mode with partial flag", () => {
    // Test the non-partial result
    const result = runMonteCarlo({ ...baseInputs, rounds: 100 });
    expect(result.partial).toBe(false);
    expect(result.rounds).toBe(100);
  });

  it("pension income increases survival rate", () => {
    const withoutPension = runMonteCarlo({
      ...baseInputs,
      governmentPension: 0,
      rounds: 500,
    });
    const withPension = runMonteCarlo({
      ...baseInputs,
      governmentPension: 15000,
      rounds: 500,
    });
    expect(withPension.survivalRate).toBeGreaterThanOrEqual(
      withoutPension.survivalRate
    );
  });
});
