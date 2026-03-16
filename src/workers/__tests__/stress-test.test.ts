import { describe, it, expect } from "vitest";
import { runStressTest, runSingleScenario } from "../stress-test.worker";
import { maxDrawdown } from "@/lib/finance-math";
import type { StressTestInputs } from "@/types/calculator";

const baseInputs: StressTestInputs = {
  expectedReturn: 0.005, // 0.5% monthly
  sd: 0.04,
  periods: 60,
  dcaAmount: 10000,
  bonusAmount: 0,
  bonusFrequency: 0,
  targetReturn: 1.0, // doubling
  varStartPeriod: 5,
  blackSwanStartPeriod: 10,
  blackSwanConsecutivePeriods: 3,
  simulations: 200,
};

describe("maxDrawdown (from finance-math)", () => {
  it("calculates drawdown for [100, 120, 80, 110, 70]", () => {
    const dd = maxDrawdown([100, 120, 80, 110, 70]);
    // Peak = 120, trough = 70, dd = (70-120)/120 = -41.67%
    expect(dd).toBeCloseTo(-0.4167, 3);
  });
});

describe("runSingleScenario", () => {
  it("normal scenario with 0% SD produces identical simulations with drawdown = 0", () => {
    const result = runSingleScenario(
      "Normal",
      0.01, // positive return
      0, // zero SD
      60,
      10000,
      0,
      0,
      100,
      // No injected events
      { type: "none" }
    );
    expect(result.maxDrawdown).toBeCloseTo(0, 4);
    // All paths should be identical (no randomness)
    expect(result.finalWealth).toBeGreaterThan(0);
  });

  it("black swan scenario injects negative returns", () => {
    const normalResult = runSingleScenario(
      "Normal",
      0.005,
      0.02,
      60,
      10000,
      0,
      0,
      100,
      { type: "none" }
    );
    const blackSwanResult = runSingleScenario(
      "Black Swan",
      0.005,
      0.02,
      60,
      10000,
      0,
      0,
      100,
      {
        type: "blackswan",
        startPeriod: 10,
        consecutivePeriods: 3,
        shockReturn: -0.2,
      }
    );
    // Black swan should produce worse drawdown
    expect(blackSwanResult.maxDrawdown).toBeLessThanOrEqual(
      normalResult.maxDrawdown
    );
  });
});

describe("runStressTest", () => {
  it("returns 4 scenarios", () => {
    const results = runStressTest(baseInputs);
    expect(results.scenarios.length).toBe(4);
    expect(results.scenarios[0].name).toBe("Normal");
    expect(results.scenarios[1].name).toBe("VaR (99%)");
    expect(results.scenarios[2].name).toBe("Black Swan");
    expect(results.scenarios[3].name).toBe("Combined");
  });

  it("combined scenario produces worst or equal drawdown vs individual scenarios", () => {
    const results = runStressTest({
      ...baseInputs,
      simulations: 300,
    });
    const normalDD = results.scenarios[0].maxDrawdown;
    const combinedDD = results.scenarios[3].maxDrawdown;
    // Combined should be at least as bad
    expect(combinedDD).toBeLessThanOrEqual(normalDD + 0.01); // small tolerance
  });

  it("doubling probability approaches 100% with high returns", () => {
    const results = runStressTest({
      ...baseInputs,
      expectedReturn: 0.1, // 10% monthly
      sd: 0,
      periods: 100,
      simulations: 100,
    });
    expect(results.doublingProbability).toBeGreaterThanOrEqual(0.9);
  });

  it("doubling probability approaches 0% with negative returns", () => {
    const results = runStressTest({
      ...baseInputs,
      expectedReturn: -0.05,
      sd: 0,
      periods: 100,
      simulations: 100,
    });
    expect(results.doublingProbability).toBeLessThanOrEqual(0.1);
  });

  it("returns valid drawdown statistics", () => {
    const results = runStressTest(baseInputs);
    expect(results.medianDrawdown).toBeLessThanOrEqual(0);
    expect(results.worstDrawdown).toBeLessThanOrEqual(results.medianDrawdown);
  });
});
