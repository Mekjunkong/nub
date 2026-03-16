"use client";

import type { MonteCarloResults } from "@/types/calculator";
import { SurvivalGauge } from "@/components/charts/survival-gauge";
import { WealthProjectionChart } from "@/components/charts/wealth-projection-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FinancialDisclaimer } from "@/components/calculator/shared/financial-disclaimer";
import { SavePlanButton } from "@/components/calculator/shared/save-plan-button";

interface WithdrawalResultsProps {
  results: MonteCarloResults;
  isRefining: boolean;
}

export function WithdrawalResults({ results, isRefining }: WithdrawalResultsProps) {
  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 }).format(v);

  return (
    <div className="flex flex-col gap-6">
      {isRefining && (
        <Badge variant="warning" className="self-center">
          Refining results (60,000 simulations)...
        </Badge>
      )}

      <Card>
        <CardContent className="flex flex-col items-center py-8">
          <p className="mb-2 text-sm text-text-muted">Survival Rate</p>
          <SurvivalGauge rate={results.survivalRate} size="lg" />
          <p className="mt-2 text-xs text-text-muted">
            {results.rounds.toLocaleString()} simulations
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-xs text-text-muted">Median Final Wealth</p>
            <p className="text-xl font-bold text-text font-heading">
              {formatCurrency(results.medianFinalWealth)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-xs text-text-muted">Average Final Wealth</p>
            <p className="text-xl font-bold text-text font-heading">
              {formatCurrency(results.avgFinalWealth)}
            </p>
          </CardContent>
        </Card>
      </div>

      {results.percentiles.p50.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Wealth Projection (P10-P90)</CardTitle>
          </CardHeader>
          <CardContent>
            <WealthProjectionChart percentiles={results.percentiles} />
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <SavePlanButton onSave={async (name) => console.log("Save:", name)} />
      </div>

      <FinancialDisclaimer />
    </div>
  );
}
