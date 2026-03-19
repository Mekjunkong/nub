"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { WithdrawalForm } from "@/components/calculator/withdrawal/withdrawal-form";
import { WithdrawalResults } from "@/components/calculator/withdrawal/withdrawal-results";
import { WithdrawalComparisonResultsView } from "@/components/calculator/withdrawal/withdrawal-comparison-results";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { runMonteCarlo, runWithdrawalComparison } from "@/workers/monte-carlo.worker";
import { track, Events } from "@/lib/analytics";
import type { MonteCarloInputs, MonteCarloResults, WithdrawalComparisonResults } from "@/types/calculator";

export default function WithdrawalSimulatorPage() {
  const t = useTranslations("withdrawal");
  const [results, setResults] = useState<MonteCarloResults | null>(null);
  const [comparisonResults, setComparisonResults] = useState<WithdrawalComparisonResults | null>(null);
  const [isRefining, setIsRefining] = useState(false);
  const [comparisonEnabled, setComparisonEnabled] = useState(false);
  const [comparisonPension, setComparisonPension] = useState(10000);

  function handleCalculate(inputs: MonteCarloInputs) {
    setIsRefining(true);
    setComparisonResults(null);

    if (comparisonEnabled && comparisonPension > 0) {
      // Yield to the event loop so the loading state paints before heavy work
      requestAnimationFrame(() => {
        const compResult = runWithdrawalComparison({ ...inputs, comparisonPension, rounds: 10000 });
        setResults(compResult.baseline);
        setComparisonResults(compResult);
        track(Events.CALCULATOR_COMPLETED, { type: "withdrawal" });
        setIsRefining(false);
      });
    } else {
      // Quick preview first
      const partial = runMonteCarlo({ ...inputs, rounds: 1000 });
      setResults({ ...partial, partial: true });
      // Full run after paint — 10K rounds gives <1% variance vs 60K
      requestAnimationFrame(() => {
        const final = runMonteCarlo({ ...inputs, rounds: 10000 });
        setResults(final);
        track(Events.CALCULATOR_COMPLETED, { type: "withdrawal" });
        setIsRefining(false);
      });
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="page-header-gradient">
        <h1 className="text-2xl font-bold font-heading">{t("title")}</h1>
        <p className="text-sm mt-1 text-white/80">{t("description")}</p>
      </div>
      <Card>
        <CardHeader><CardTitle>{t("parameters")}</CardTitle></CardHeader>
        <CardContent>
          <WithdrawalForm onCalculate={handleCalculate} />
          <div className="mt-4 flex items-center gap-4 rounded-lg border border-border p-3">
            <Switch
              checked={comparisonEnabled}
              onCheckedChange={setComparisonEnabled}
            />
            <span className="text-sm font-medium text-text">{t("compareToggle")}</span>
            {comparisonEnabled && (
              <div className="ml-auto max-w-48">
                <Input
                  label={t("pensionAmount")}
                  type="number"
                  value={comparisonPension}
                  onChange={(e) => setComparisonPension(Number(e.target.value))}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {results && <WithdrawalResults results={results} isRefining={isRefining} />}
      {comparisonResults && <WithdrawalComparisonResultsView results={comparisonResults} />}
    </div>
  );
}
