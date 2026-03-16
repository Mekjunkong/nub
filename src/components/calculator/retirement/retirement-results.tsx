"use client";

import type { RetirementResults as Results } from "@/types/calculator";
import { HealthScoreGauge } from "@/components/charts/health-score-gauge";
import { TimelineChart } from "@/components/charts/timeline-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FinancialDisclaimer } from "@/components/calculator/shared/financial-disclaimer";
import { SavePlanButton } from "@/components/calculator/shared/save-plan-button";

interface RetirementResultsProps {
  results: Results;
}

export function RetirementResults({ results }: RetirementResultsProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 }).format(value);

  const timelineData = results.projectionByYear.map((p) => ({
    year: p.year,
    age: p.age,
    savings: p.savings,
    milestone: null as string | null,
  }));

  async function handleSave(name: string) {
    // Will be connected to Supabase
    console.log("Saving plan:", name, results);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Health Score */}
      <Card>
        <CardContent className="flex flex-col items-center py-8">
          <HealthScoreGauge
            score={results.healthScore}
            breakdown={results.healthScoreBreakdown}
          />
        </CardContent>
      </Card>

      {/* Key Numbers */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-xs text-text-muted">Retirement Gap</p>
            <p className="text-2xl font-bold text-danger font-heading">
              {formatCurrency(results.gap)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-xs text-text-muted">Required Corpus</p>
            <p className="text-2xl font-bold text-text font-heading">
              {formatCurrency(results.requiredCorpus)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-xs text-text-muted">Monthly Shortfall</p>
            <p className="text-2xl font-bold text-warning font-heading">
              {formatCurrency(results.monthlyShortfall)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Projection Chart */}
      {timelineData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Year-by-Year Projection</CardTitle>
          </CardHeader>
          <CardContent>
            <TimelineChart data={timelineData} />
          </CardContent>
        </Card>
      )}

      {/* Save & Share */}
      <div className="flex justify-end">
        <SavePlanButton onSave={handleSave} />
      </div>

      <FinancialDisclaimer />
    </div>
  );
}
