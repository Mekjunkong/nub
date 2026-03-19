import { describe, it, expect } from "vitest";
import { runTipp } from "@/workers/tipp.worker";

const defaultInputs = {
  initialCapital: 1000000,
  floorPercentage: 0.85,
  maxMultiplier: 5,
  riskFreeRate: 0.025 / 12,
  assets: [
    { name: "Equity", monthlyReturns: Array.from({ length: 60 }, () => 0.008) },
    { name: "Gold", monthlyReturns: Array.from({ length: 60 }, () => 0.004) },
  ],
  correlationMatrix: [[1, 0.25], [0.25, 1]],
  targetVolatility: 0.14,
  rebalanceThreshold: 0.05,
  simulationMonths: 60,
};

describe("runTipp", () => {
  it("returns wealth path with month 0 + simulation months", () => {
    const r = runTipp(defaultInputs);
    expect(r.wealthPath).toHaveLength(61);
  });

  it("floor never exceeds wealth", () => {
    const r = runTipp(defaultInputs);
    r.wealthPath.forEach(p => expect(p.floor).toBeLessThanOrEqual(p.wealth + 0.01));
  });

  it("floor ratchets up (never decreases)", () => {
    const r = runTipp(defaultInputs);
    for (let i = 1; i < r.wealthPath.length; i++) {
      expect(r.wealthPath[i].floor).toBeGreaterThanOrEqual(r.wealthPath[i - 1].floor - 0.01);
    }
  });

  it("returns valid safety status", () => {
    const r = runTipp(defaultInputs);
    expect(["SAFE", "WARNING", "DANGER"]).toContain(r.safetyStatus);
  });

  it("risky + safe weights sum to ~1", () => {
    const r = runTipp(defaultInputs);
    expect(r.riskyWeight + r.safeWeight).toBeCloseTo(1, 2);
  });
});
