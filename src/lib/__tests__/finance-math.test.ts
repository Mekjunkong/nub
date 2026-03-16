import { describe, it, expect } from "vitest";
import {
  compoundInterest,
  futureValue,
  presentValue,
  normalRandom,
  portfolioReturn,
  portfolioVariance,
  sharpeRatio,
  maxDrawdown,
  percentile,
  correlationMatrix,
} from "../finance-math";

describe("compoundInterest", () => {
  it("calculates compound interest correctly", () => {
    const result = compoundInterest(1000, 0.05, 10);
    expect(result).toBeCloseTo(1628.89, 2);
  });

  it("returns principal when rate is 0", () => {
    expect(compoundInterest(1000, 0, 10)).toBeCloseTo(1000, 2);
  });

  it("returns principal when periods is 0", () => {
    expect(compoundInterest(1000, 0.05, 0)).toBeCloseTo(1000, 2);
  });
});

describe("futureValue", () => {
  it("calculates future value correctly", () => {
    const result = futureValue(1000, 0.05, 10);
    expect(result).toBeCloseTo(1628.89, 2);
  });
});

describe("presentValue", () => {
  it("calculates present value correctly", () => {
    const result = presentValue(1628.89, 0.05, 10);
    expect(result).toBeCloseTo(1000, 0);
  });

  it("is the inverse of futureValue", () => {
    const fv = futureValue(5000, 0.07, 20);
    const pv = presentValue(fv, 0.07, 20);
    expect(pv).toBeCloseTo(5000, 2);
  });
});

describe("normalRandom", () => {
  it("returns a number", () => {
    const result = normalRandom(0, 1);
    expect(typeof result).toBe("number");
    expect(Number.isFinite(result)).toBe(true);
  });

  it("has mean approximately 0 over many samples", () => {
    const samples = Array.from({ length: 10000 }, () => normalRandom(0, 1));
    const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
    expect(mean).toBeCloseTo(0, 1); // within 0.1
  });

  it("respects custom mean and sd", () => {
    const samples = Array.from({ length: 10000 }, () => normalRandom(5, 2));
    const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
    expect(mean).toBeCloseTo(5, 0); // within 1.0
  });
});

describe("portfolioReturn", () => {
  it("calculates weighted portfolio return", () => {
    const result = portfolioReturn([0.6, 0.4], [0.08, 0.04]);
    expect(result).toBeCloseTo(0.064, 6);
  });

  it("returns single asset return for 100% weight", () => {
    const result = portfolioReturn([1.0], [0.08]);
    expect(result).toBeCloseTo(0.08, 6);
  });
});

describe("portfolioVariance", () => {
  it("calculates portfolio variance with known covariance matrix", () => {
    // 2 assets: SD1=0.2, SD2=0.1, correlation=0.5
    // Cov = [[0.04, 0.01], [0.01, 0.01]]
    const covMatrix = [
      [0.04, 0.01],
      [0.01, 0.01],
    ];
    const weights = [0.6, 0.4];
    const result = portfolioVariance(weights, covMatrix);
    // 0.6^2*0.04 + 2*0.6*0.4*0.01 + 0.4^2*0.01 = 0.0144 + 0.0048 + 0.0016 = 0.0208
    expect(result).toBeCloseTo(0.0208, 4);
  });

  it("returns single asset variance for 100% weight", () => {
    const covMatrix = [[0.04]];
    const weights = [1.0];
    expect(portfolioVariance(weights, covMatrix)).toBeCloseTo(0.04, 6);
  });
});

describe("sharpeRatio", () => {
  it("calculates Sharpe ratio correctly", () => {
    const result = sharpeRatio(0.08, 0.02, 0.15);
    expect(result).toBeCloseTo(0.4, 4);
  });

  it("returns 0 when return equals risk-free rate", () => {
    expect(sharpeRatio(0.02, 0.02, 0.15)).toBeCloseTo(0, 4);
  });

  it("returns negative when return is below risk-free rate", () => {
    expect(sharpeRatio(0.01, 0.02, 0.15)).toBeLessThan(0);
  });
});

describe("maxDrawdown", () => {
  it("calculates max drawdown correctly", () => {
    const result = maxDrawdown([100, 120, 90, 110, 80]);
    // Max peak = 120, worst trough after = 80, drawdown = (80-120)/120 = -33.33%
    expect(result).toBeCloseTo(-0.3333, 3);
  });

  it("returns 0 for monotonically increasing series", () => {
    expect(maxDrawdown([100, 110, 120, 130])).toBe(0);
  });

  it("handles single element", () => {
    expect(maxDrawdown([100])).toBe(0);
  });

  it("handles all same values", () => {
    expect(maxDrawdown([100, 100, 100])).toBe(0);
  });
});

describe("percentile", () => {
  it("calculates 50th percentile (median)", () => {
    const result = percentile([1, 2, 3, 4, 5], 50);
    expect(result).toBe(3);
  });

  it("calculates 0th percentile (min)", () => {
    expect(percentile([1, 2, 3, 4, 5], 0)).toBe(1);
  });

  it("calculates 100th percentile (max)", () => {
    expect(percentile([1, 2, 3, 4, 5], 100)).toBe(5);
  });

  it("interpolates between values", () => {
    // index = 0.25 * 3 = 0.75, so interpolation: 10 + 0.75 * (20-10) = 17.5
    const result = percentile([10, 20, 30, 40], 25);
    expect(result).toBeCloseTo(17.5, 1);
  });

  it("handles unsorted input", () => {
    const result = percentile([5, 3, 1, 4, 2], 50);
    expect(result).toBe(3);
  });
});

describe("correlationMatrix", () => {
  it("returns identity-like matrix for single series", () => {
    const result = correlationMatrix([[1, 2, 3, 4, 5]]);
    expect(result.length).toBe(1);
    expect(result[0][0]).toBeCloseTo(1, 4);
  });

  it("calculates correlation for perfectly correlated series", () => {
    const result = correlationMatrix([
      [1, 2, 3, 4, 5],
      [2, 4, 6, 8, 10],
    ]);
    expect(result[0][1]).toBeCloseTo(1, 4);
    expect(result[1][0]).toBeCloseTo(1, 4);
  });

  it("calculates correlation for perfectly negatively correlated series", () => {
    const result = correlationMatrix([
      [1, 2, 3, 4, 5],
      [10, 8, 6, 4, 2],
    ]);
    expect(result[0][1]).toBeCloseTo(-1, 4);
  });

  it("diagonal is always 1", () => {
    const result = correlationMatrix([
      [1, 2, 3],
      [3, 1, 2],
      [2, 3, 1],
    ]);
    for (let i = 0; i < result.length; i++) {
      expect(result[i][i]).toBeCloseTo(1, 4);
    }
  });

  it("is symmetric", () => {
    const result = correlationMatrix([
      [1, 2, 3, 4],
      [4, 3, 5, 2],
      [2, 5, 1, 3],
    ]);
    for (let i = 0; i < result.length; i++) {
      for (let j = 0; j < result.length; j++) {
        expect(result[i][j]).toBeCloseTo(result[j][i], 10);
      }
    }
  });
});
