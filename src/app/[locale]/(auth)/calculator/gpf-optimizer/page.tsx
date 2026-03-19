"use client";

import { useGpfWorker } from "@/hooks/use-gpf-worker";
import { GpfHoldingsForm } from "@/components/calculator/gpf/gpf-holdings-form";
import { GpfOptimizerResultsView } from "@/components/calculator/gpf/gpf-optimizer-results";
import { GpfWealthProjection } from "@/components/calculator/gpf/gpf-wealth-projection";
import { GpfDrawdownTable } from "@/components/calculator/gpf/gpf-drawdown-table";
import { FinancialDisclaimer } from "@/components/calculator/shared/financial-disclaimer";
import type { GpfOptimizerInputs } from "@/types/calculator";

export default function GpfOptimizerPage() {
  const { results, computing, compute } = useGpfWorker();

  function handleOptimize(inputs: GpfOptimizerInputs) {
    compute(inputs);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text font-heading">
          GPF Portfolio Optimizer
        </h1>
        <p className="text-sm text-text-muted">
          Optimize your Government Pension Fund allocation using Modern Portfolio Theory
        </p>
      </div>

      <GpfHoldingsForm onOptimize={handleOptimize} computing={computing} />

      {results && (
        <>
          <GpfOptimizerResultsView results={results} />
          <GpfWealthProjection
            projections={results.wealthProjections}
            years={20}
          />
          <GpfDrawdownTable data={results.maxDrawdownByYear} />
          <FinancialDisclaimer />
        </>
      )}
    </div>
  );
}
