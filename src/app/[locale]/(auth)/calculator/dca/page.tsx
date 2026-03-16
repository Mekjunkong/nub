"use client";

import { useState } from "react";
import { DcaForm } from "@/components/calculator/dca/dca-form";
import { DcaResultsView } from "@/components/calculator/dca/dca-results";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { runDca } from "@/workers/dca-tracker.worker";
import type { DcaResults } from "@/types/calculator";

export default function DcaPage() {
  const [results, setResults] = useState<DcaResults | null>(null);

  function handleCalculate(values: { monthlyAmount: number; investmentMonths: number; rebalanceFrequency: number }) {
    // Generate sample monthly returns
    const months = values.investmentMonths;
    const equityReturns = Array.from({ length: months }, () => 0.005 + (Math.random() - 0.5) * 0.08);
    const bondReturns = Array.from({ length: months }, () => 0.002 + (Math.random() - 0.5) * 0.01);

    const result = runDca({
      monthlyAmount: values.monthlyAmount,
      assets: [
        { name: "Equity", weight: 0.6, monthlyReturns: equityReturns },
        { name: "Bond", weight: 0.4, monthlyReturns: bondReturns },
      ],
      rebalanceFrequency: values.rebalanceFrequency,
      investmentMonths: months,
      strategy: "static",
      initialEquityWeight: 0.8,
      finalEquityWeight: 0.4,
      equityAssetIndex: 0,
      momentumLookback: 3,
    });
    setResults(result);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text font-heading">DCA Strategy Comparison</h1>
        <p className="text-sm text-text-muted">Compare Static, Glidepath, and Dynamic Asset Allocation strategies</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Parameters</CardTitle></CardHeader>
        <CardContent><DcaForm onCalculate={handleCalculate} /></CardContent>
      </Card>
      {results && <DcaResultsView results={results} />}
    </div>
  );
}
