import { describe, it, expect } from "vitest";
import { runBumnan95 } from "@/workers/bumnan95.worker";

const defaultInputs = {
  currentAge: 33,
  retirementAge: 60,
  lifeExpectancy: 95,
  monthlyExpenses: 61392,
  inflationRate: 0.025,
  portfolioReturn: 0.06,
  portfolioSD: 0.12,
  currentSavings: 500000,
  governmentPension: 30520,
  gender: "male" as const,
  annuityStartAge: 60,
  annuityPaymentYears: 26,
  annuityRate: 0.0082,
  simulations: 100,
};

describe("runBumnan95", () => {
  it("returns exactly 6 pension tiers", () => {
    const r = runBumnan95(defaultInputs);
    expect(r.tiers).toHaveLength(6);
  });

  it("tiers are in ascending monthly pension order", () => {
    const r = runBumnan95(defaultInputs);
    for (let i = 1; i < r.tiers.length; i++) {
      expect(r.tiers[i].monthlyPension).toBeGreaterThan(r.tiers[i - 1].monthlyPension);
    }
  });

  it("higher pension tiers have higher or equal success rates", () => {
    const r = runBumnan95(defaultInputs);
    for (let i = 1; i < r.tiers.length; i++) {
      expect(r.tiers[i].successRate).toBeGreaterThanOrEqual(r.tiers[i - 1].successRate);
    }
  });

  it("assigns valid status to each tier", () => {
    const r = runBumnan95(defaultInputs);
    const validStatuses = ["RISKY", "MODERATE", "STRONG", "SECURED"];
    r.tiers.forEach(t => expect(validStatuses).toContain(t.status));
  });

  it("calculates gap status correctly", () => {
    const r = runBumnan95(defaultInputs);
    if (r.retirementGap <= 0) expect(r.gapStatus).toBe("SAFE");
    else expect(r.gapStatus).toBe("GAP_EXISTS");
  });

  it("returns positive annualPremium", () => {
    const r = runBumnan95(defaultInputs);
    expect(r.annualPremium).toBeGreaterThan(0);
  });

  it("provides both gap-closing strategies", () => {
    const r = runBumnan95(defaultInputs);
    expect(typeof r.lumpSumNeeded).toBe("number");
    expect(typeof r.monthlyTopUp).toBe("number");
  });
});
