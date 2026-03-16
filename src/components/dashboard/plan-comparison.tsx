"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { PlanType } from "@/types/database";

interface ComparisonPlan {
  id: string;
  name: string;
  plan_type: PlanType;
  results: Record<string, unknown>;
}

interface PlanComparisonProps {
  plans: ComparisonPlan[];
}

const metricLabels: Record<string, string> = {
  healthScore: "Health Score",
  gap: "Retirement Gap",
  survivalRate: "Survival Rate",
  taxSaved: "Tax Saved",
  maxDrawdown: "Max Drawdown",
  projectedCorpus: "Projected Corpus",
};

// For these metrics, higher is better
const higherIsBetter = new Set(["healthScore", "survivalRate", "taxSaved", "projectedCorpus"]);
// For these, lower is better
const lowerIsBetter = new Set(["gap", "maxDrawdown"]);

export function PlanComparison({ plans }: PlanComparisonProps) {
  if (plans.length < 2) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-text-muted text-sm">Select 2 plans to compare</p>
        </CardContent>
      </Card>
    );
  }

  const [planA, planB] = plans;
  const allKeys = new Set([
    ...Object.keys(planA.results),
    ...Object.keys(planB.results),
  ]);
  const displayKeys = Array.from(allKeys).filter((k) => metricLabels[k]);

  function isBetter(key: string, valueA: number, valueB: number): "a" | "b" | "tie" {
    if (valueA === valueB) return "tie";
    if (higherIsBetter.has(key)) return valueA > valueB ? "a" : "b";
    if (lowerIsBetter.has(key)) return valueA < valueB ? "a" : "b";
    return "tie";
  }

  const formatValue = (v: unknown) => {
    if (typeof v === "number") {
      if (Math.abs(v) < 1) return `${(v * 100).toFixed(1)}%`;
      return new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 }).format(v);
    }
    return String(v ?? "-");
  };

  return (
    <Card>
      <CardHeader><CardTitle>Plan Comparison</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-3 py-2 text-left text-xs text-text-muted">Metric</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-text">{planA.name}</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-text">{planB.name}</th>
              </tr>
            </thead>
            <tbody>
              {displayKeys.map((key) => {
                const valA = Number(planA.results[key] ?? 0);
                const valB = Number(planB.results[key] ?? 0);
                const winner = isBetter(key, valA, valB);
                return (
                  <tr key={key} className="border-b border-border">
                    <td className="px-3 py-2 text-text-muted">{metricLabels[key]}</td>
                    <td
                      data-testid={`plan-0-${key}`}
                      className={cn("px-3 py-2 text-right font-mono", winner === "a" && "text-success font-semibold")}
                    >
                      {formatValue(valA)}
                    </td>
                    <td
                      data-testid={`plan-1-${key}`}
                      className={cn("px-3 py-2 text-right font-mono", winner === "b" && "text-success font-semibold")}
                    >
                      {formatValue(valB)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
