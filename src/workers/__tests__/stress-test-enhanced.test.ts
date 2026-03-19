import { describe, it, expect } from "vitest";
import { runEnhancedStressTest } from "../stress-test.worker";

const defaultInputs = {
  expectedReturn: 0.007,
  sd: 0.04,
  periods: 60,
  dcaAmount: 10000,
  bonusAmount: 0,
  bonusFrequency: 12,
  targetReturn: 1.0,
  varStartPeriod: 12,
  blackSwanStartPeriod: 24,
  blackSwanConsecutivePeriods: 3,
  simulations: 100,
  bearMarketEnabled: true,
  bearMarketReturn: -0.20,
  bearMarketYears: 2,
  rebalanceFrequencyMonths: 12,
};

describe("runEnhancedStressTest", () => {
  it("returns base stress test results", () => {
    const r = runEnhancedStressTest(defaultInputs);
    expect(r.scenarios).toBeDefined();
    expect(r.doublingProbability).toBeDefined();
  });

  it("returns timeline risk for multiple years", () => {
    const r = runEnhancedStressTest(defaultInputs);
    expect(r.timelineRisk.length).toBeGreaterThan(0);
    r.timelineRisk.forEach(e => {
      expect(e.probOfLoss).toBeGreaterThanOrEqual(0);
      expect(e.probOfLoss).toBeLessThanOrEqual(1);
    });
  });

  it("returns bear market impact when enabled", () => {
    const r = runEnhancedStressTest(defaultInputs);
    expect(r.bearMarketImpact.drawdownDuringBear).toBeLessThanOrEqual(0);
  });

  it("returns no bear impact when disabled", () => {
    const r = runEnhancedStressTest({ ...defaultInputs, bearMarketEnabled: false });
    expect(r.bearMarketImpact.drawdownDuringBear).toBe(0);
  });

  it("returns rebalanced path with DCA and Rebal actions", () => {
    const r = runEnhancedStressTest(defaultInputs);
    expect(r.rebalancedPath.length).toBeGreaterThan(0);
    const actions = r.rebalancedPath.map(e => e.action);
    expect(actions).toContain("DCA");
    expect(r.rebalancedPath.filter(e => e.action === "DCA+Rebal").length).toBeGreaterThan(0);
  });
});
