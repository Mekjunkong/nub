import type { PlanType } from "@/types/database";

interface ResultField {
  key: string;
  label: string;
  format: "number" | "percent" | "currency";
}

export const planResultFields: Partial<Record<PlanType, ResultField[]>> = {
  retirement: [
    { key: "gap", label: "Retirement Gap", format: "currency" },
    { key: "requiredCorpus", label: "Required Corpus", format: "currency" },
    { key: "projectedCorpus", label: "Projected Corpus", format: "currency" },
    { key: "healthScore", label: "Health Score", format: "number" },
    { key: "fundedRatio", label: "Funded Ratio", format: "percent" },
  ],
  withdrawal: [
    { key: "survivalRate", label: "Survival Rate", format: "percent" },
    { key: "medianFinalWealth", label: "Median Final Wealth", format: "currency" },
    { key: "avgFinalWealth", label: "Avg Final Wealth", format: "currency" },
  ],
  stress_test: [
    { key: "doublingProbability", label: "Doubling Probability", format: "percent" },
    { key: "medianDrawdown", label: "Median Drawdown", format: "percent" },
    { key: "worstDrawdown", label: "Worst Drawdown", format: "percent" },
  ],
  mpt: [
    { key: "maxSharpe.expectedReturn", label: "Expected Return", format: "percent" },
    { key: "maxSharpe.risk", label: "Risk (SD)", format: "percent" },
    { key: "maxSharpe.sharpe", label: "Sharpe Ratio", format: "number" },
  ],
  dca: [
    { key: "static.totalReturn", label: "Static Return", format: "percent" },
    { key: "glidepath.totalReturn", label: "Glidepath Return", format: "percent" },
  ],
  tax: [
    { key: "optimized.totalTax", label: "Optimized Tax", format: "currency" },
    { key: "optimized.totalDeductions", label: "Total Deductions", format: "currency" },
    { key: "optimized.effectiveRate", label: "Effective Rate", format: "percent" },
  ],
  portfolio_health: [
    { key: "overallScore", label: "Overall Score", format: "number" },
    { key: "alpha", label: "Alpha", format: "percent" },
  ],
  bumnan95: [
    { key: "successRate", label: "Success Rate", format: "percent" },
    { key: "medianEndWealth", label: "Median End Wealth", format: "currency" },
  ],
};

/** Extract a nested value from an object using dot-notation key */
export function getNestedValue(obj: Record<string, unknown>, key: string): unknown {
  return key.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[part];
    return undefined;
  }, obj);
}

/** Format a result value for display */
export function formatResultValue(value: unknown, format: ResultField["format"]): string {
  if (value == null) return "\u2014";
  const num = Number(value);
  if (isNaN(num)) return String(value);
  switch (format) {
    case "currency":
      return `\u0E3F${num.toLocaleString("th-TH", { maximumFractionDigits: 0 })}`;
    case "percent":
      return `${(num * 100).toFixed(1)}%`;
    case "number":
      return num.toFixed(1);
  }
}
