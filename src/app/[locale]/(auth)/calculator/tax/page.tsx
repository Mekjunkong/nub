"use client";

import { useState } from "react";
import { TaxForm } from "@/components/calculator/tax/tax-form";
import { TaxResultsView } from "@/components/calculator/tax/tax-results";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { optimizeTax } from "@/workers/tax-optimizer.worker";
import { ExportPdfButton } from "@/components/shared/export-pdf-button";
import { track, Events } from "@/lib/analytics";
import type { TaxInputs, TaxResults } from "@/types/calculator";

export default function TaxOptimizerPage() {
  const [results, setResults] = useState<TaxResults | null>(null);

  function handleCalculate(inputs: TaxInputs) {
    const result = optimizeTax(inputs);
    setResults(result);
    track(Events.CALCULATOR_COMPLETED, { type: "tax" });
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="page-header-gradient">
        <h1 className="text-2xl font-bold font-heading">Tax Optimizer</h1>
        <p className="text-sm mt-1 text-white/80">Calculate tax deductions from SSF, RMF, insurance, and more</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Your Income & Deductions</CardTitle></CardHeader>
        <CardContent><TaxForm onCalculate={handleCalculate} /></CardContent>
      </Card>
      {results && (
        <div className="stagger-children flex flex-col gap-6">
          <div className="flex justify-end">
            <ExportPdfButton
              planType="tax"
              planName="Tax Optimization"
              inputs={{}}
              results={results as unknown as Record<string, unknown>}
            />
          </div>
          <TaxResultsView results={results} />
        </div>
      )}
    </div>
  );
}
