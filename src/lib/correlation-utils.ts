import { correlationMatrix } from "@/lib/finance-math";

/**
 * Convert NAV history arrays to return series, then compute correlation matrix.
 */
export function buildCorrelationFromHistory(navHistories: number[][]): number[][] {
  const returnsSeries = navHistories.map((navs) => {
    const returns: number[] = [];
    for (let i = 1; i < navs.length; i++) {
      returns.push(navs[i - 1] > 0 ? (navs[i] - navs[i - 1]) / navs[i - 1] : 0);
    }
    return returns;
  });
  return correlationMatrix(returnsSeries);
}

/**
 * Build correlation matrix from fund_correlations table rows.
 */
export function buildCorrelationFromPairs(
  fundIds: string[],
  pairs: { fund_a_id: string; fund_b_id: string; correlation: number }[]
): number[][] {
  const n = fundIds.length;
  const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  const idIndex = new Map(fundIds.map((id, i) => [id, i]));
  for (let i = 0; i < n; i++) matrix[i][i] = 1;
  for (const pair of pairs) {
    const i = idIndex.get(pair.fund_a_id);
    const j = idIndex.get(pair.fund_b_id);
    if (i !== undefined && j !== undefined) {
      matrix[i][j] = pair.correlation;
      matrix[j][i] = pair.correlation;
    }
  }
  return matrix;
}
