import { describe, it, expect } from "vitest";
import {
  valueAtRisk,
  conditionalVaR,
  choleskyDecomposition,
  correlatedReturns,
  recoveryTime,
} from "@/lib/finance-math";

describe("valueAtRisk", () => {
  it("calculates parametric VaR at 95% confidence", () => {
    const var95 = valueAtRisk(100000, 0.10, 0.95);
    expect(var95).toBeCloseTo(16449, 0);
  });

  it("calculates parametric VaR at 99% confidence", () => {
    const var99 = valueAtRisk(100000, 0.10, 0.99);
    expect(var99).toBeCloseTo(23263, 0);
  });

  it("returns 0 for zero allocation", () => {
    expect(valueAtRisk(0, 0.10, 0.95)).toBe(0);
  });
});

describe("conditionalVaR", () => {
  it("calculates CVaR greater than VaR", () => {
    const cvar = conditionalVaR(100000, 0.10, 0.95);
    const var95 = valueAtRisk(100000, 0.10, 0.95);
    expect(cvar).toBeGreaterThan(var95);
  });

  it("returns 0 for zero allocation", () => {
    expect(conditionalVaR(0, 0.10, 0.95)).toBe(0);
  });
});

describe("choleskyDecomposition", () => {
  it("decomposes a 2x2 identity matrix", () => {
    const L = choleskyDecomposition([[1, 0], [0, 1]]);
    expect(L).toEqual([[1, 0], [0, 1]]);
  });

  it("decomposes a 2x2 correlation matrix", () => {
    const corr = [[1, 0.5], [0.5, 1]];
    const L = choleskyDecomposition(corr);
    expect(L[0][0]).toBeCloseTo(1, 4);
    expect(L[1][0]).toBeCloseTo(0.5, 4);
    expect(L[1][1]).toBeCloseTo(0.866, 2);
  });

  it("decomposes a 3x3 matrix and L*L^T ≈ original", () => {
    const corr = [
      [1.0, 0.15, 0.14],
      [0.15, 1.0, 0.10],
      [0.14, 0.10, 1.0],
    ];
    const L = choleskyDecomposition(corr);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        let sum = 0;
        for (let k = 0; k < 3; k++) sum += L[i][k] * L[j][k];
        expect(sum).toBeCloseTo(corr[i][j], 4);
      }
    }
  });
});

describe("correlatedReturns", () => {
  it("returns array of correct length", () => {
    const L = choleskyDecomposition([[1, 0.5], [0.5, 1]]);
    const returns = correlatedReturns([0.08, 0.05], [0.15, 0.10], L);
    expect(returns).toHaveLength(2);
  });

  it("returns are finite numbers", () => {
    const L = choleskyDecomposition([[1, 0], [0, 1]]);
    const returns = correlatedReturns([0.05, 0.03], [0.12, 0.05], L);
    expect(Number.isFinite(returns[0])).toBe(true);
    expect(Number.isFinite(returns[1])).toBe(true);
  });
});

describe("recoveryTime", () => {
  it("returns 0 for monotonically increasing curve", () => {
    expect(recoveryTime([100, 110, 120, 130])).toBe(0);
  });

  it("calculates recovery from a drawdown", () => {
    const curve = [100, 90, 80, 90, 100, 110];
    expect(recoveryTime(curve)).toBe(4);
  });

  it("returns -1 if never recovered", () => {
    expect(recoveryTime([100, 90, 80, 70])).toBe(-1);
  });
});
