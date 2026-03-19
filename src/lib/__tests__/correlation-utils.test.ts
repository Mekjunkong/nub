import { describe, it, expect } from "vitest";
import { buildCorrelationFromHistory, buildCorrelationFromPairs } from "@/lib/correlation-utils";

describe("buildCorrelationFromHistory", () => {
  it("computes correlation from NAV histories", () => {
    const histories = [
      [100, 110, 120, 130],
      [50, 55, 60, 65],
    ];
    const corr = buildCorrelationFromHistory(histories);
    expect(corr[0][0]).toBeCloseTo(1, 4);
    expect(corr[1][1]).toBeCloseTo(1, 4);
    expect(corr[0][1]).toBeCloseTo(1, 1);
  });

  it("handles inversely correlated assets", () => {
    const histories = [
      [100, 110, 100, 110],
      [100, 90, 100, 90],
    ];
    const corr = buildCorrelationFromHistory(histories);
    expect(corr[0][1]).toBeCloseTo(-1, 1);
  });

  it("returns identity for single asset", () => {
    const corr = buildCorrelationFromHistory([[100, 110, 120]]);
    expect(corr).toEqual([[1]]);
  });
});

describe("buildCorrelationFromPairs", () => {
  it("builds matrix from fund correlation pairs", () => {
    const fundIds = ["a", "b", "c"];
    const pairs = [
      { fund_a_id: "a", fund_b_id: "b", correlation: 0.5 },
      { fund_a_id: "a", fund_b_id: "c", correlation: 0.3 },
      { fund_a_id: "b", fund_b_id: "c", correlation: 0.2 },
    ];
    const corr = buildCorrelationFromPairs(fundIds, pairs);
    expect(corr[0][0]).toBe(1);
    expect(corr[0][1]).toBe(0.5);
    expect(corr[1][0]).toBe(0.5);
    expect(corr[0][2]).toBe(0.3);
    expect(corr[1][2]).toBe(0.2);
  });

  it("handles missing pairs with 0", () => {
    const corr = buildCorrelationFromPairs(["a", "b"], []);
    expect(corr[0][0]).toBe(1);
    expect(corr[0][1]).toBe(0);
  });
});
