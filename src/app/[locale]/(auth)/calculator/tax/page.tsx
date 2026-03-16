"use client";

import { useState } from "react";
import { TaxForm } from "@/components/calculator/tax/tax-form";
import { TaxResultsView } from "@/components/calculator/tax/tax-results";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { optimizeTax } from "@/workers/tax-optimizer.worker";
import type { TaxInputs, TaxResults } from "@/types/calculator";

export default function TaxOptimizerPage() {
  const [results, setResults] = useState<TaxResults | null>(null);

  function handleCalculate(inputs: TaxInputs) {
    setResults(optimizeTax(inputs));
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text font-heading">Tax Optimizer</h1>
        <p className="text-sm text-text-muted">Calculate tax deductions from SSF, RMF, insurance, and more</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Your Income & Deductions</CardTitle></CardHeader>
        <CardContent><TaxForm onCalculate={handleCalculate} /></CardContent>
      </Card>
      {results && <TaxResultsView results={results} />}
    </div>
  );
}
