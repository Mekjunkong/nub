import { describe, it, expect } from "vitest";
import { calculateRoic, type RoicInputs } from "@/lib/roic-math";

const megaInputs: RoicInputs = {
  ticker: "MEGA",
  ebit: 2012,
  taxRate: 0.20,
  totalAssets: 15000,
  currentLiabilities: 3000,
  cashAndEquivalents: 1252,
  netIncome: 1800,
  operatingCashFlow: 2000,
  wacc: 0.08,
  growthRate: 0.02,
};

describe("calculateRoic", () => {
  it("calculates NOPAT correctly", () => {
    const result = calculateRoic(megaInputs);
    expect(result.nopat).toBeCloseTo(1609.6, 1);
  });

  it("calculates invested capital correctly", () => {
    const result = calculateRoic(megaInputs);
    expect(result.investedCapital).toBe(10748);
  });

  it("calculates ROIC correctly", () => {
    const result = calculateRoic(megaInputs);
    expect(result.roic).toBeCloseTo(0.1498, 3);
  });

  it("calculates Sloan ratio correctly", () => {
    const result = calculateRoic(megaInputs);
    expect(result.sloanRatio).toBeCloseTo(-0.01333, 4);
  });

  it("calculates fair equity value correctly", () => {
    const result = calculateRoic(megaInputs);
    expect(result.fairEquityValue).toBeCloseTo(26826.67, 0);
  });

  it("calculates ROIC vs WACC spread", () => {
    const result = calculateRoic(megaInputs);
    expect(result.roicVsWacc).toBeCloseTo(0.0698, 3);
  });

  it("assigns quality rating based on ROIC and Sloan", () => {
    const result = calculateRoic(megaInputs);
    expect(result.qualityRating).toBe("Good");
  });

  it("returns Excellent for ROIC > 20% with negative Sloan", () => {
    const result = calculateRoic({ ...megaInputs, ebit: 3000 });
    expect(result.qualityRating).toBe("Excellent");
  });

  it("throws error when growthRate >= wacc", () => {
    expect(() => calculateRoic({ ...megaInputs, growthRate: 0.08 })).toThrow(
      "Growth rate must be less than WACC"
    );
    expect(() => calculateRoic({ ...megaInputs, growthRate: 0.10 })).toThrow(
      "Growth rate must be less than WACC"
    );
  });
});
