"use client";

import type { StressTestResults } from "@/types/calculator";
import { ScenarioComparisonChart } from "@/components/charts/scenario-comparison-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FinancialDisclaimer } from "@/components/calculator/shared/financial-disclaimer";
import { SavePlanButton } from "@/components/calculator/shared/save-plan-button";

interface StressResultsProps {
  results: StressTestResults;
}

export function StressResults({ results }: StressResultsProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-xs text-text-muted">Doubling Probability</p>
            <p className="text-2xl font-bold text-success font-heading">
              {Math.round(results.doublingProbability * 100)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-xs text-text-muted">Median Drawdown</p>
            <p className="text-2xl font-bold text-warning font-heading">
              {(results.medianDrawdown * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-xs text-text-muted">Worst Drawdown</p>
            <p className="text-2xl font-bold text-danger font-heading">
              {(results.worstDrawdown * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Scenario Comparison</CardTitle></CardHeader>
        <CardContent>
          <ScenarioComparisonChart scenarios={results.scenarios} />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <SavePlanButton onSave={async (name) => console.log("Save:", name)} />
      </div>
      <FinancialDisclaimer />
    </div>
  );
}
