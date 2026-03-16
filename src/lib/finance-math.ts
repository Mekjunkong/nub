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
