"use client";

import type { TaxResults } from "@/types/calculator";
import { TaxComparisonChart } from "@/components/charts/tax-comparison-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FinancialDisclaimer } from "@/components/calculator/shared/financial-disclaimer";
import { SavePlanButton } from "@/components/calculator/shared/save-plan-button";

interface TaxResultsViewProps {
  results: TaxResults;
  inputs?: Record<string, unknown>;
}

export function TaxResultsView({ results, inputs = {} }: TaxResultsViewProps) {
  const formatCurrency = (v: number) => new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 }).format(v);

  return (
    <div className="flex flex-col gap-6">
      <TaxComparisonChart
        currentTax={results.currentTax}
        optimizedTax={results.optimizedTax}
        taxSaved={results.taxSaved}
      />

      {results.recommendations.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Recommendations</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {results.recommendations.map((rec) => (
                <div key={rec.instrument} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="font-medium text-sm text-text">{rec.instrument}</p>
                    <p className="text-xs text-text-muted">
                      Current: {formatCurrency(rec.currentAmount)} / Max: {formatCurrency(rec.maxAllowed)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-success">
                      +{formatCurrency(rec.recommendedAmount - rec.currentAmount)}
                    </p>
                    <p className="text-xs text-text-muted">
                      Saves {formatCurrency(rec.additionalTaxSaved)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <SavePlanButton planType="tax" inputs={inputs} results={results as unknown as Record<string, unknown>} />
      </div>
      <FinancialDisclaimer />
    </div>
  );
}
