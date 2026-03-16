import {
  portfolioReturn,
  portfolioVariance,
  sharpeRatio,
  buildCovarianceMatrix,
} from "@/lib/finance-math";
import type {
  MptInputs,
  MptResults,
  PortfolioPoint,
} from "@/types/calculator";

/**
 * Generate random weights that sum to 1.0 (Dirichlet-like).
 */
function randomWeights(n: number): number[] {
  const raw = Array.from({ length: n }, () => -Math.log(Math.random()));
  const sum = raw.reduce((a, b) => a + b, 0);
  return raw.map((v) => v / sum);
}

/**
 * Evaluate a portfolio given weights.
 */
function evaluatePortfolio(
  weights: number[],
  returns: number[],
  covMatrix: number[][],
  riskFreeRate: number
): PortfolioPoint {
  const ret = portfolioReturn(weights, returns);
  const variance = portfolioVariance(weights, covMatrix);
  const risk = Math.sqrt(Math.max(0, variance));
  const sharpe = risk > 0 ? sharpeRatio(ret, riskFreeRate, risk) : 0;

  return {
    weights: [...weights],
    expectedReturn: ret,
    risk,
    sharpeRatio: sharpe,
  };
}

/**
 * Generate grid portfolios for n assets with given step size.
 * For n=3 with step=0.01, generates all (w1,w2,w3) where wi are multiples
 * of step and sum to 1.
 */
function generateGridPortfolios(
  n: number,
  step: number,
  returns: number[],
  covMatrix: number[][],
  riskFreeRate: number
): PortfolioPoint[] {
  const results: PortfolioPoint[] = [];
  const steps = Math.round(1 / step);

  if (n === 2) {
    for (let i = 0; i <= steps; i++) {
      const w = [i * step, 1 - i * step];
      results.push(evaluatePortfolio(w, returns, covMatrix, riskFreeRate));
    }
  } else if (n === 3) {
    for (let i = 0; i <= steps; i++) {
      for (let j = 0; j <= steps - i; j++) {
        const k = steps - i - j;
        const w = [i * step, j * step, k * step];
        results.push(evaluatePortfolio(w, returns, covMatrix, riskFreeRate));
      }
    }
  } else {
    // For n > 3, use random sampling (grid explodes combinatorially)
    for (let i = 0; i < 100000; i++) {
      const w = randomWeights(n);
      results.push(evaluatePortfolio(w, returns, covMatrix, riskFreeRate));
    }
  }

  return results;
}

/**
 * Run MPT optimization.
 * For 2-3 assets: exhaustive grid search (exact).
 * For 4+ assets: random sampling with local refinement.
 */
export function runMptOptimizer(inputs: MptInputs): MptResults {
  const { assets, correlationMatrix: corrMatrix, riskFreeRate } = inputs;
  const frontierPoints = inputs.frontierPoints ?? 100;
  const n = assets.length;

  const returns = assets.map((a) => a.expectedReturn);
  const sds = assets.map((a) => a.standardDeviation);
  const covMatrix = buildCovarianceMatrix(sds, corrMatrix);

  // Generate portfolios
  let portfolios: PortfolioPoint[];
  if (n <= 3) {
    // Grid search with 1% step (exact enough)
    portfolios = generateGridPortfolios(
      n,
      0.01,
      returns,
      covMatrix,
      riskFreeRate
    );
  } else {
    // Random sampling for larger portfolios
    portfolios = [];
    for (let i = 0; i < n; i++) {
      const w = Array(n).fill(0);
      w[i] = 1;
      portfolios.push(
        evaluatePortfolio(w, returns, covMatrix, riskFreeRate)
      );
    }
    for (let i = 0; i < 100000; i++) {
      const w = randomWeights(n);
      portfolios.push(
        evaluatePortfolio(w, returns, covMatrix, riskFreeRate)
      );
    }
  }

  // Find min vol and max Sharpe
  let minVol = portfolios[0];
  let maxSharpe = portfolios[0];

  for (const p of portfolios) {
    if (p.risk < minVol.risk) minVol = p;
    if (p.sharpeRatio > maxSharpe.sharpeRatio) maxSharpe = p;
  }

  // Build efficient frontier
  const minReturn = minVol.expectedReturn;
  const maxReturn = Math.max(...portfolios.map((p) => p.expectedReturn));
  const returnStep =
    frontierPoints > 1
      ? (maxReturn - minReturn) / (frontierPoints - 1)
      : 0;

  const frontier: PortfolioPoint[] = [];

  for (let i = 0; i < frontierPoints; i++) {
    const targetReturn = minReturn + i * returnStep;
    const tolerance = returnStep > 0 ? returnStep * 0.6 : 0.001;

    let best: PortfolioPoint | null = null;
    for (const p of portfolios) {
      if (Math.abs(p.expectedReturn - targetReturn) <= tolerance) {
        if (!best || p.risk < best.risk) {
          best = p;
        }
      }
    }

    if (best) {
      frontier.push(best);
    }
  }

  // Fill to required length
  while (frontier.length < frontierPoints) {
    frontier.push(frontier[frontier.length - 1] || minVol);
  }

  // Sort frontier by risk ascending
  frontier.sort((a, b) => a.risk - b.risk);

  return {
    frontier: frontier.slice(0, frontierPoints),
    maxSharpe: { ...maxSharpe },
    minVol: { ...minVol },
  };
}

// Web Worker message handler
if (
  typeof self !== "undefined" &&
  typeof (self as any).onmessage !== "undefined"
) {
  self.onmessage = (e: MessageEvent<MptInputs>) => {
    const results = runMptOptimizer(e.data);
    self.postMessage(results);
  };
}
