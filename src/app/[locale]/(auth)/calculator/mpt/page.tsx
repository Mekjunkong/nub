"use client";

import { useState } from "react";
import { FundSelector } from "@/components/calculator/mpt/fund-selector";
import { MptResultsView } from "@/components/calculator/mpt/mpt-results";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { runMptOptimizer } from "@/workers/mpt-optimizer.worker";
import type { MptResults } from "@/types/calculator";

const SAMPLE_FUNDS = [
  { id: "1", ticker: "SCBRMS&P500", name: "SCB US Equity S&P 500", expectedReturn: 0.08, standardDeviation: 0.1858 },
  { id: "2", ticker: "SCBRM2", name: "SCB Short-term Fixed Income", expectedReturn: 0.025, standardDeviation: 0.0191 },
  { id: "3", ticker: "SCBRMGOLDH", name: "SCB Gold THB Hedged", expectedReturn: 0.05, standardDeviation: 0.1511 },
];

const CORRELATIONS = [
  [1.0, 0.1496, 0.1432],
  [0.1496, 1.0, 0.0978],
  [0.1432, 0.0978, 1.0],
];

export default function MptPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [riskFreeRate, setRiskFreeRate] = useState(2);
  const [results, setResults] = useState<MptResults | null>(null);

  function handleOptimize() {
    const selectedFunds = SAMPLE_FUNDS.filter((f) => selectedIds.includes(f.id));
    const indices = selectedIds.map((id) => SAMPLE_FUNDS.findIndex((f) => f.id === id));
    const corrMatrix = indices.map((i) => indices.map((j) => CORRELATIONS[i][j]));

    const result = runMptOptimizer({
      assets: selectedFunds.map((f) => ({
        name: f.name, ticker: f.ticker,
        expectedReturn: f.expectedReturn, standardDeviation: f.standardDeviation,
      })),
      correlationMatrix: corrMatrix,
      riskFreeRate: riskFreeRate / 100,
      frontierPoints: 100,
    });
    setResults(result);
  }

  const assetNames = selectedIds.map((id) => SAMPLE_FUNDS.find((f) => f.id === id)?.ticker || "");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text font-heading">MPT Portfolio Optimizer</h1>
        <p className="text-sm text-text-muted">Optimize your portfolio with Modern Portfolio Theory</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Select Funds</CardTitle></CardHeader>
        <CardContent>
          <FundSelector funds={SAMPLE_FUNDS} selected={selectedIds} onSelect={setSelectedIds} />
          <div className="mt-4 max-w-xs">
            <Input label="Risk-Free Rate (%)" type="number" value={riskFreeRate} onChange={(e) => setRiskFreeRate(Number(e.target.value))} />
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleOptimize} disabled={selectedIds.length < 2}>Optimize</Button>
          </div>
        </CardContent>
      </Card>
      {results && <MptResultsView results={results} assetNames={assetNames} />}
    </div>
  );
}
