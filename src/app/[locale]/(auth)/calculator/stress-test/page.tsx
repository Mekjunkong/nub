"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { StressForm } from "@/components/calculator/stress-test/stress-form";
import { StressResults } from "@/components/calculator/stress-test/stress-results";
import { StressBearImpact } from "@/components/calculator/stress-test/stress-bear-impact";
import { StressTimelineRisk } from "@/components/calculator/stress-test/stress-timeline-risk";
import { StressRebalanceLog } from "@/components/calculator/stress-test/stress-rebalance-log";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { runStressTest, runEnhancedStressTest } from "@/workers/stress-test.worker";
import type { StressTestInputs, StressTestResults, EnhancedStressTestResults } from "@/types/calculator";

export default function StressTestPage() {
  const t = useTranslations("stress_test");
  const [results, setResults] = useState<StressTestResults | null>(null);
  const [enhancedResults, setEnhancedResults] = useState<EnhancedStressTestResults | null>(null);
  const [bearEnabled, setBearEnabled] = useState(false);
  const [bearReturn, setBearReturn] = useState(-20);
  const [bearYears, setBearYears] = useState(2);
  const [rebalanceFreq, setRebalanceFreq] = useState(12);

  const [isCalculating, setIsCalculating] = useState(false);

  function handleCalculate(inputs: StressTestInputs) {
    setEnhancedResults(null);
    setIsCalculating(true);

    // Yield to the event loop so the loading state paints before heavy work
    requestAnimationFrame(() => {
      if (bearEnabled) {
        const enhanced = runEnhancedStressTest({
          ...inputs,
          bearMarketEnabled: true,
          bearMarketReturn: bearReturn / 100,
          bearMarketYears: bearYears,
          rebalanceFrequencyMonths: rebalanceFreq,
        });
        setResults(enhanced);
        setEnhancedResults(enhanced);
      } else {
        setResults(runStressTest(inputs));
      }
      setIsCalculating(false);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text font-heading">{t("title")}</h1>
        <p className="text-sm text-text-muted">{t("description")}</p>
      </div>
      <Card>
        <CardHeader><CardTitle>{t("parameters")}</CardTitle></CardHeader>
        <CardContent>
          <StressForm onCalculate={handleCalculate} />
          <div className="mt-4 rounded-lg border border-border p-3">
            <div className="flex items-center gap-4">
              <Switch checked={bearEnabled} onCheckedChange={setBearEnabled} />
              <span className="text-sm font-medium text-text">{t("bearToggle")}</span>
            </div>
            {bearEnabled && (
              <div className="mt-3 grid gap-4 sm:grid-cols-3">
                <Input label={t("bearReturn")} type="number" value={bearReturn} onChange={(e) => setBearReturn(Number(e.target.value))} />
                <Input label={t("bearDuration")} type="number" value={bearYears} onChange={(e) => setBearYears(Number(e.target.value))} />
                <Input label={t("rebalanceEvery")} type="number" value={rebalanceFreq} onChange={(e) => setRebalanceFreq(Number(e.target.value))} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {results && <StressResults results={results} />}
      {enhancedResults && (
        <>
          <StressBearImpact impact={enhancedResults.bearMarketImpact} />
          <StressTimelineRisk data={enhancedResults.timelineRisk} />
          <StressRebalanceLog data={enhancedResults.rebalancedPath} />
        </>
      )}
    </div>
  );
}
