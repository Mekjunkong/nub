"use client";

import { useTranslations } from "next-intl";
import { useGpfWorker } from "@/hooks/use-gpf-worker";
import { GpfHoldingsForm } from "@/components/calculator/gpf/gpf-holdings-form";
import { GpfOptimizerResultsView } from "@/components/calculator/gpf/gpf-optimizer-results";
import { GpfWealthProjection } from "@/components/calculator/gpf/gpf-wealth-projection";
import { GpfDrawdownTable } from "@/components/calculator/gpf/gpf-drawdown-table";
import { FinancialDisclaimer } from "@/components/calculator/shared/financial-disclaimer";
import { track, Events } from "@/lib/analytics";
import type { GpfOptimizerInputs } from "@/types/calculator";

export default function GpfOptimizerPage() {
  const t = useTranslations("calculator");
  const { results, computing, compute } = useGpfWorker();

  function handleOptimize(inputs: GpfOptimizerInputs) {
    compute(inputs);
    track(Events.CALCULATOR_COMPLETED, { type: "gpf_optimizer" });
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="page-header-gradient">
        <h1 className="text-2xl font-bold font-heading">
          {t("gpfOptimizer.title")}
        </h1>
        <p className="text-sm mt-1 text-white/80">
          {t("gpfOptimizer.subtitle")}
        </p>
      </div>

      <GpfHoldingsForm onOptimize={handleOptimize} computing={computing} />

      {results && (
        <div className="stagger-children flex flex-col gap-6">
          <GpfOptimizerResultsView results={results} />
          <GpfWealthProjection
            projections={results.wealthProjections}
            years={20}
          />
          <GpfDrawdownTable data={results.maxDrawdownByYear} />
          <FinancialDisclaimer />
        </div>
      )}
    </div>
  );
}
