"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { WithdrawalComparisonResults } from "@/types/calculator";

interface WithdrawalComparisonResultsViewProps {
  results: WithdrawalComparisonResults;
}

export function WithdrawalComparisonResultsView({ results }: WithdrawalComparisonResultsViewProps) {
  const { baseline, withPension, improvement, verdict } = results;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pension Comparison</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm font-semibold text-text-muted">Current Plan</p>
            <div className="mt-3 space-y-2">
              <div>
                <p className="text-xs text-text-muted">Survival Rate</p>
                <p className="text-2xl font-bold text-text">{(baseline.survivalRate * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Median Final Wealth</p>
                <p className="text-lg font-semibold text-text">฿{baseline.medianFinalWealth.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Avg Age of Ruin</p>
                <p className="text-lg font-semibold text-text">{baseline.avgAgeOfRuin.toFixed(1)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
            <p className="text-sm font-semibold text-primary">With Pension</p>
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                <div>
                  <p className="text-xs text-text-muted">Survival Rate</p>
                  <p className="text-2xl font-bold text-text">{(withPension.survivalRate * 100).toFixed(1)}%</p>
                </div>
                {improvement.successRateDelta > 0 && (
                  <Badge variant="success">+{(improvement.successRateDelta * 100).toFixed(1)}%</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div>
                  <p className="text-xs text-text-muted">Median Final Wealth</p>
                  <p className="text-lg font-semibold text-text">฿{withPension.medianFinalWealth.toLocaleString()}</p>
                </div>
                {improvement.finalWealthDelta > 0 && (
                  <Badge variant="success">+฿{improvement.finalWealthDelta.toLocaleString()}</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div>
                  <p className="text-xs text-text-muted">Avg Age of Ruin</p>
                  <p className="text-lg font-semibold text-text">{withPension.avgAgeOfRuin.toFixed(1)}</p>
                </div>
                {improvement.longevityDelta > 0 && (
                  <Badge variant="success">+{improvement.longevityDelta.toFixed(1)} yrs</Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-surface-hover p-3">
          <p className="text-sm font-medium text-text">{verdict}</p>
        </div>
      </CardContent>
    </Card>
  );
}
