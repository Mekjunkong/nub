"use client";

import { useTranslations } from "next-intl";
import { useBumnan95Worker } from "@/hooks/use-bumnan95-worker";
import { Bumnan95Form } from "@/components/calculator/bumnan95/bumnan95-form";
import { Bumnan95GapAnalysis } from "@/components/calculator/bumnan95/bumnan95-gap-analysis";
import { Bumnan95TierTable } from "@/components/calculator/bumnan95/bumnan95-tier-table";
import { Bumnan95PremiumCalc } from "@/components/calculator/bumnan95/bumnan95-premium-calc";
import { Bumnan95Strategies } from "@/components/calculator/bumnan95/bumnan95-strategies";
import { FinancialDisclaimer } from "@/components/calculator/shared/financial-disclaimer";
import type { Bumnan95Inputs } from "@/types/calculator";

export default function Bumnan95Page() {
  const t = useTranslations("calculator");
  const { results, computing, compute } = useBumnan95Worker();

  function handleCalculate(inputs: Bumnan95Inputs) {
    compute(inputs);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text font-heading">
          {t("bumnan95.title")}
        </h1>
        <p className="text-sm text-text-muted">
          {t("bumnan95.subtitle")}
        </p>
      </div>

      <Bumnan95Form onCalculate={handleCalculate} computing={computing} />

      {results && (
        <>
          <Bumnan95GapAnalysis
            targetCorpus={results.targetCorpus}
            estimatedGPF={results.estimatedGPF}
            pensionLumpSum={results.pensionLumpSum}
            retirementGap={results.retirementGap}
            gapStatus={results.gapStatus}
          />
          <Bumnan95TierTable tiers={results.tiers} />
          <Bumnan95PremiumCalc
            gender={results.annualPremium > 0 ? "male" : "male"}
            annualPremium={results.annualPremium}
            paymentDuration={results.paymentDuration}
            totalPremiumPaid={results.totalPremiumPaid}
          />
          <Bumnan95Strategies
            lumpSumNeeded={results.lumpSumNeeded}
            monthlyTopUp={results.monthlyTopUp}
            recommendedStrategy={results.recommendedStrategy}
          />
          <FinancialDisclaimer />
        </>
      )}
    </div>
  );
}
