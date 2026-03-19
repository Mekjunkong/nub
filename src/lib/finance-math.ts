/**
 * Shared Finance Math Library
 * Pure functions for financial calculations used across all Web Workers.
 */

/**
 * Calculate compound interest: principal * (1 + rate)^periods
 */
export function compoundInterest(
  principal: number,
  rate: number,
  periods: number
): number {
  return principal * Math.pow(1 + rate, periods);
}

/**
 * Future Value (alias for compoundInterest)
 */
export function futureValue(
  pv: number,
  rate: number,
  periods: number
): number {
  return compoundInterest(pv, rate, periods);
}

/**
 * Present Value: fv / (1 + rate)^periods
 */
export function presentValue(
  fv: number,
  rate: number,
  periods: number
): number {
  return fv / Math.pow(1 + rate, periods);
}

/**
 * Generate a normally distributed random number using Box-Muller transform.
 */
export function normalRandom(mean: number, sd: number): number {
  let u1 = 0;
  let u2 = 0;
  // Avoid log(0)
  while (u1 === 0) u1 = Math.random();
  while (u2 === 0) u2 = Math.random();

  const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return mean + sd * z;
}

/**
 * Weighted portfolio return: sum(weights[i] * returns[i])
 */
export function portfolioReturn(
  weights: number[],
  returns: number[]
): number {
  let result = 0;
  for (let i = 0; i < weights.length; i++) {
    result += weights[i] * returns[i];
  }
  return result;
}

/**
 * Portfolio variance: w' * Cov * w
 */
export function portfolioVariance(
  weights: number[],
  covMatrix: number[][]
): number {
  let variance = 0;
  const n = weights.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      variance += weights[i] * weights[j] * covMatrix[i][j];
    }
  }
  return variance;
}

/**
 * Sharpe Ratio: (portfolioReturn - riskFreeRate) / sd
 */
export function sharpeRatio(
  portReturn: number,
  riskFreeRate: number,
  sd: number
): number {
  if (sd === 0) return 0;
  return (portReturn - riskFreeRate) / sd;
}

/**
 * Maximum drawdown from peak.
 * Returns negative fraction (e.g., -0.3333 for 33.33% drawdown).
 */
export function maxDrawdown(equityCurve: number[]): number {
  if (equityCurve.length <= 1) return 0;

  let peak = equityCurve[0];
  let maxDD = 0;

  for (let i = 1; i < equityCurve.length; i++) {
    if (equityCurve[i] > peak) {
      peak = equityCurve[i];
    }
    const dd = (equityCurve[i] - peak) / peak;
    if (dd < maxDD) {
      maxDD = dd;
    }
  }

  return maxDD;
}

/**
 * Calculate the p-th percentile of a dataset.
 * Uses linear interpolation between closest ranks.
 */
export function percentile(data: number[], p: number): number {
  const sorted = [...data].sort((a, b) => a - b);
  if (p <= 0) return sorted[0];
  if (p >= 100) return sorted[sorted.length - 1];

  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  if (lower === upper) return sorted[lower];

  const fraction = index - lower;
  return sorted[lower] + fraction * (sorted[upper] - sorted[lower]);
}

/**
 * Calculate correlation matrix from an array of return series.
 * returnsSeries[i] is an array of returns for asset i.
 */
export function correlationMatrix(returnsSeries: number[][]): number[][] {
  const n = returnsSeries.length;
  const result: number[][] = Array.from({ length: n }, () =>
    Array(n).fill(0)
  );

  // Calculate means
  const means = returnsSeries.map(
    (series) => series.reduce((a, b) => a + b, 0) / series.length
  );

  // Calculate standard deviations
  const sds = returnsSeries.map((series, i) => {
    const mean = means[i];
    const sumSqDiff = series.reduce(
      (sum, val) => sum + (val - mean) ** 2,
      0
    );
    return Math.sqrt(sumSqDiff / (series.length - 1));
  });

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) {
        result[i][j] = 1;
        continue;
      }

      const len = Math.min(
        returnsSeries[i].length,
        returnsSeries[j].length
      );
      let sumProduct = 0;

      for (let k = 0; k < len; k++) {
        sumProduct +=
          (returnsSeries[i][k] - means[i]) *
          (returnsSeries[j][k] - means[j]);
      }

      const covariance = sumProduct / (len - 1);
      result[i][j] =
        sds[i] === 0 || sds[j] === 0 ? 0 : covariance / (sds[i] * sds[j]);
    }
  }

  return result;
}

/**
 * Build covariance matrix from standard deviations and correlation matrix.
 */
export function buildCovarianceMatrix(
  sds: number[],
  corrMatrix: number[][]
): number[][] {
  const n = sds.length;
  const cov: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      cov[i][j] = sds[i] * sds[j] * corrMatrix[i][j];
    }
  }
  return cov;
}

/**
 * Future value of an annuity (regular monthly contributions).
 * PMT * [((1+r)^n - 1) / r]
 */
export function futureValueAnnuity(
  pmt: number,
  rate: number,
  periods: number
): number {
  if (rate === 0) return pmt * periods;
  return pmt * ((Math.pow(1 + rate, periods) - 1) / rate);
}

/**
 * Present value of an annuity.
 * PMT * [(1 - (1+r)^-n) / r]
 */
export function presentValueAnnuity(
  pmt: number,
  rate: number,
  periods: number
): number {
  if (rate === 0) return pmt * periods;
  return pmt * ((1 - Math.pow(1 + rate, -periods)) / rate);
}

/**
 * Create a seeded pseudo-random number generator (LCG algorithm).
 * Returns a function that produces deterministic values in [0, 1).
 * Use a fixed seed for reproducible simulations.
 */
export function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

// ---------------------------------------------------------------------------
// Internal helpers for normal distribution
// ---------------------------------------------------------------------------

function normalPDF(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

function normalInvCDF(p: number): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  if (p < 0.5) return -normalInvCDF(1 - p);

  const a = [
    -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2,
    1.383577518672690e2, -3.066479806614716e1, 2.506628277459239e0,
  ];
  const b = [
    -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2,
    6.680131188771972e1, -1.328068155288572e1,
  ];
  const c = [
    -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838e0,
    -2.549732539343734e0, 4.374664141464968e0, 2.938163982698783e0,
  ];
  const d = [
    7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996e0,
    3.754408661907416e0,
  ];

  const pLow = 0.02425;
  const pHigh = 1 - pLow;
  let q: number, r: number;

  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  } else if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    return (
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) *
        q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
    );
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return (
      -(
        ((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q +
        c[5]
      ) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }
}

// ---------------------------------------------------------------------------
// Extended financial functions
// ---------------------------------------------------------------------------

/**
 * Parametric Value at Risk.
 * Returns the estimated maximum loss at a given confidence level.
 */
export function valueAtRisk(
  allocation: number,
  sd: number,
  confidence: number
): number {
  if (allocation === 0) return 0;
  return allocation * sd * normalInvCDF(confidence);
}

/**
 * Conditional Value at Risk (Expected Shortfall).
 * Average loss in the worst (1 - confidence) tail.
 */
export function conditionalVaR(
  allocation: number,
  sd: number,
  confidence: number
): number {
  if (allocation === 0) return 0;
  const z = normalInvCDF(confidence);
  return (allocation * sd * normalPDF(z)) / (1 - confidence);
}

/**
 * Cholesky decomposition of a positive-definite matrix.
 * Returns the lower triangular matrix L such that L * L^T = matrix.
 */
export function choleskyDecomposition(matrix: number[][]): number[][] {
  const n = matrix.length;
  const L: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      let sum = 0;
      for (let k = 0; k < j; k++) sum += L[i][k] * L[j][k];

      if (i === j) {
        L[i][j] = Math.sqrt(Math.max(0, matrix[i][i] - sum));
      } else {
        L[i][j] = L[j][j] > 0 ? (matrix[i][j] - sum) / L[j][j] : 0;
      }
    }
  }

  return L;
}

/**
 * Generate correlated random returns using Cholesky decomposition.
 * Multiplies independent standard‑normal draws by the Cholesky factor,
 * then scales by each asset's mean and standard deviation.
 */
export function correlatedReturns(
  means: number[],
  sds: number[],
  cholesky: number[][]
): number[] {
  const n = means.length;
  const z: number[] = Array.from({ length: n }, () => normalRandom(0, 1));
  const result: number[] = new Array(n);

  for (let i = 0; i < n; i++) {
    let correlated = 0;
    for (let j = 0; j <= i; j++) correlated += cholesky[i][j] * z[j];
    result[i] = means[i] + sds[i] * correlated;
  }

  return result;
}

/**
 * Recovery time: periods from peak to recovery after max drawdown.
 * Returns -1 if the portfolio never recovered, 0 if there was no drawdown.
 */
export function recoveryTime(equityCurve: number[]): number {
  if (equityCurve.length <= 1) return 0;

  let peak = equityCurve[0];
  let currentPeakIndex = 0;
  let maxDD = 0;
  let maxDDPeakIndex = 0;
  let troughIndex = 0;

  for (let i = 1; i < equityCurve.length; i++) {
    if (equityCurve[i] > peak) {
      peak = equityCurve[i];
      currentPeakIndex = i;
    }
    const dd = (equityCurve[i] - peak) / peak;
    if (dd < maxDD) {
      maxDD = dd;
      troughIndex = i;
      maxDDPeakIndex = currentPeakIndex;
    }
  }

  if (maxDD === 0) return 0;

  const preDrawdownPeak = equityCurve[maxDDPeakIndex];
  for (let i = troughIndex + 1; i < equityCurve.length; i++) {
    if (equityCurve[i] >= preDrawdownPeak) return i - maxDDPeakIndex;
  }

  return -1;
}
