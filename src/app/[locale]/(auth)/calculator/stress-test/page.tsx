"use client";

import { useState } from "react";
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
  const [results, setResults] = useState<StressTestResults | null>(null);
  const [enhancedResults, setEnhancedResults] = useState<EnhancedStressTestResults | null>(null);
  const [bearEnabled, setBearEnabled] = useState(false);
  const [bearReturn, setBearReturn] = useState(-20);
  const [bearYears, setBearYears] = useState(2);
  const [rebalanceFreq, setRebalanceFreq] = useState(12);

  function handleCalculate(inputs: StressTestInputs) {
    setEnhancedResults(null);

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
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text font-heading">Portfolio Stress Test</h1>
        <p className="text-sm text-text-muted">Test your portfolio under crisis scenarios</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Parameters</CardTitle></CardHeader>
        <CardContent>
          <StressForm onCalculate={handleCalculate} />
          <div className="mt-4 rounded-lg border border-border p-3">
            <div className="flex items-center gap-4">
              <Switch checked={bearEnabled} onCheckedChange={setBearEnabled} />
              <span className="text-sm font-medium text-text">Inject bear market?</span>
            </div>
            {bearEnabled && (
              <div className="mt-3 grid gap-4 sm:grid-cols-3">
                <Input label="Annual Bear Return (%)" type="number" value={bearReturn} onChange={(e) => setBearReturn(Number(e.target.value))} />
                <Input label="Bear Duration (Years)" type="number" value={bearYears} onChange={(e) => setBearYears(Number(e.target.value))} />
                <Input label="Rebalance Every (months)" type="number" value={rebalanceFreq} onChange={(e) => setRebalanceFreq(Number(e.target.value))} />
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
