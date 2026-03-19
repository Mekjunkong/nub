"use client";

import { useState } from "react";
import { WithdrawalForm } from "@/components/calculator/withdrawal/withdrawal-form";
import { WithdrawalResults } from "@/components/calculator/withdrawal/withdrawal-results";
import { WithdrawalComparisonResultsView } from "@/components/calculator/withdrawal/withdrawal-comparison-results";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { runMonteCarlo, runWithdrawalComparison } from "@/workers/monte-carlo.worker";
import type { MonteCarloInputs, MonteCarloResults, WithdrawalComparisonResults } from "@/types/calculator";

export default function WithdrawalSimulatorPage() {
  const [results, setResults] = useState<MonteCarloResults | null>(null);
  const [comparisonResults, setComparisonResults] = useState<WithdrawalComparisonResults | null>(null);
  const [isRefining, setIsRefining] = useState(false);
  const [comparisonEnabled, setComparisonEnabled] = useState(false);
  const [comparisonPension, setComparisonPension] = useState(10000);

  function handleCalculate(inputs: MonteCarloInputs) {
    setIsRefining(true);
    setComparisonResults(null);

    if (comparisonEnabled && comparisonPension > 0) {
      const compInputs = { ...inputs, comparisonPension, rounds: 10000 };
      const compResult = runWithdrawalComparison(compInputs);
      setResults(compResult.baseline);
      setComparisonResults(compResult);
      setIsRefining(false);
    } else {
      const partial = runMonteCarlo({ ...inputs, rounds: 5000 });
      setResults({ ...partial, partial: true });
      setTimeout(() => {
        const final = runMonteCarlo({ ...inputs, rounds: 60000 });
        setResults(final);
        setIsRefining(false);
      }, 50);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text font-heading">Withdrawal Simulator</h1>
        <p className="text-sm text-text-muted">Simulate retirement withdrawals with Monte Carlo Simulation</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Simulation Parameters</CardTitle></CardHeader>
        <CardContent>
          <WithdrawalForm onCalculate={handleCalculate} />
          <div className="mt-4 flex items-center gap-4 rounded-lg border border-border p-3">
            <Switch
              checked={comparisonEnabled}
              onCheckedChange={setComparisonEnabled}
            />
            <span className="text-sm font-medium text-text">Compare with pension?</span>
            {comparisonEnabled && (
              <div className="ml-auto max-w-48">
                <Input
                  label="Additional Pension (฿/mo)"
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
