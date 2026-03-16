"use client";

import type { DcaResults } from "@/types/calculator";
import { DcaComparisonChart } from "@/components/charts/dca-comparison-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FinancialDisclaimer } from "@/components/calculator/shared/financial-disclaimer";
import { SavePlanButton } from "@/components/calculator/shared/save-plan-button";

interface DcaResultsViewProps {
  results: DcaResults;
}

export function DcaResultsView({ results }: DcaResultsViewProps) {
  const formatCurrency = (v: number) => new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 }).format(v);
  const strategies = [
    { key: "Static" as const, data: results.static },
    { key: "Glidepath" as const, data: results.glidepath },
    { key: "DAA" as const, data: results.daa },
  ];

  const chartData = {
    static: results.static.tradeLog.map((t) => t.totalWealth),
    glidepath: results.glidepath.tradeLog.map((t) => t.totalWealth),
    daa: results.daa.tradeLog.map((t) => t.totalWealth),
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {strategies.map((s) => (
          <Card key={s.key}>
            <CardContent className="py-4 text-center">
              <p className="text-xs font-semibold text-text-muted">{s.key}</p>
              <p className="text-xl font-bold text-text font-heading">{formatCurrency(s.data.finalWealth)}</p>
              <p className="text-xs text-text-muted">Return: {(s.data.totalReturn * 100).toFixed(1)}%</p>
              <p className="text-xs text-text-muted">Max DD: {(s.data.maxDrawdown * 100).toFixed(1)}%</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {chartData.static.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Strategy Comparison</CardTitle></CardHeader>
          <CardContent>
            <DcaComparisonChart data={chartData} />
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
