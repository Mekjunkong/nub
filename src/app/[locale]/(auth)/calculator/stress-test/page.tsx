"use client";

import { useState } from "react";
import { StressForm } from "@/components/calculator/stress-test/stress-form";
import { StressResults } from "@/components/calculator/stress-test/stress-results";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { runStressTest } from "@/workers/stress-test.worker";
import type { StressTestInputs, StressTestResults } from "@/types/calculator";

export default function StressTestPage() {
  const [results, setResults] = useState<StressTestResults | null>(null);

  function handleCalculate(inputs: StressTestInputs) {
    setResults(runStressTest(inputs));
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text font-heading">Portfolio Stress Test</h1>
        <p className="text-sm text-text-muted">Test your portfolio under 4 crisis scenarios</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Parameters</CardTitle></CardHeader>
        <CardContent><StressForm onCalculate={handleCalculate} /></CardContent>
      </Card>
      {results && <StressResults results={results} />}
    </div>
  );
}
