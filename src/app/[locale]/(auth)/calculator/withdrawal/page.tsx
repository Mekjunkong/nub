"use client";

import { useState } from "react";
import { WithdrawalForm } from "@/components/calculator/withdrawal/withdrawal-form";
import { WithdrawalResults } from "@/components/calculator/withdrawal/withdrawal-results";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { runMonteCarlo } from "@/workers/monte-carlo.worker";
import type { MonteCarloInputs, MonteCarloResults } from "@/types/calculator";

export default function WithdrawalSimulatorPage() {
  const [results, setResults] = useState<MonteCarloResults | null>(null);
  const [isRefining, setIsRefining] = useState(false);

  function handleCalculate(inputs: MonteCarloInputs) {
    setIsRefining(true);
    const partial = runMonteCarlo({ ...inputs, rounds: 5000 });
    setResults({ ...partial, partial: true });
    setTimeout(() => {
      const final = runMonteCarlo({ ...inputs, rounds: 60000 });
      setResults(final);
      setIsRefining(false);
    }, 50);
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
        </CardContent>
      </Card>
      {results && <WithdrawalResults results={results} isRefining={isRefining} />}
    </div>
  );
}
