"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePortfolioHealthWorker } from "@/hooks/use-portfolio-health-worker";
import { PerformanceMetrics } from "@/components/portfolio-health/performance-metrics";
import { AllocationBreakdown } from "@/components/portfolio-health/allocation-breakdown";
import { MddRecoveryTable } from "@/components/portfolio-health/mdd-recovery-table";
import { RiskCommentary } from "@/components/portfolio-health/risk-commentary";
import type { PortfolioHealthInputs } from "@/types/calculator";

const DEFAULT_HOLDINGS = [
  { asset: "Bonds", weight: 0.36, expectedReturn: 0.025, sd: 0.013 },
  { asset: "Foreign Equity", weight: 0.46, expectedReturn: 0.08, sd: 0.12 },
  { asset: "Gold", weight: 0.18, expectedReturn: 0.05, sd: 0.15 },
];

const DEFAULT_CORRELATION: number[][] = [
  [1.0, 0.2, 0.05],
  [0.2, 1.0, 0.1],
  [0.05, 0.1, 1.0],
];

export default function PortfolioHealthPage() {
  const { results, isCalculating, calculate } = usePortfolioHealthWorker();

  // Form state
  const [totalNAV, setTotalNAV] = useState(460_000);
  const [previousNAV, setPreviousNAV] = useState(450_000);
  const [monthlyDCA, setMonthlyDCA] = useState(5_000);
  const [benchmarkReturn, setBenchmarkReturn] = useState(0.05);
  const [riskFreeRate, setRiskFreeRate] = useState(0.02);
  const [investmentYears, setInvestmentYears] = useState(5);
  const [simulations, setSimulations] = useState(1_000);

  function handleCalculate() {
    const inputs: PortfolioHealthInputs = {
      totalNAV,
      previousNAV,
      monthlyDCA,
      holdings: DEFAULT_HOLDINGS,
      correlationMatrix: DEFAULT_CORRELATION,
      benchmarkReturn,
      riskFreeRate,
      investmentYears,
      simulations,
    };
    calculate(inputs);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text font-heading">Portfolio Health Dashboard</h1>
        <p className="text-sm text-text-muted">
          Analyze your portfolio performance, risk, and drawdown scenarios
        </p>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle>Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-text-muted">Total NAV (THB)</span>
              <input
                type="number"
                value={totalNAV}
                onChange={(e) => setTotalNAV(Number(e.target.value))}
                className="h-10 rounded-xl border border-border bg-surface px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-text-muted">Previous NAV (THB)</span>
              <input
                type="number"
                value={previousNAV}
                onChange={(e) => setPreviousNAV(Number(e.target.value))}
                className="h-10 rounded-xl border border-border bg-surface px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-text-muted">Monthly DCA (THB)</span>
              <input
                type="number"
                value={monthlyDCA}
                onChange={(e) => setMonthlyDCA(Number(e.target.value))}
                className="h-10 rounded-xl border border-border bg-surface px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-text-muted">Benchmark Return (annual)</span>
              <input
                type="number"
                step="0.01"
                value={benchmarkReturn}
                onChange={(e) => setBenchmarkReturn(Number(e.target.value))}
                className="h-10 rounded-xl border border-border bg-surface px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-text-muted">Risk-Free Rate (annual)</span>
              <input
                type="number"
                step="0.01"
                value={riskFreeRate}
                onChange={(e) => setRiskFreeRate(Number(e.target.value))}
                className="h-10 rounded-xl border border-border bg-surface px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-text-muted">Investment Years</span>
              <input
                type="number"
                value={investmentYears}
                onChange={(e) => setInvestmentYears(Number(e.target.value))}
                className="h-10 rounded-xl border border-border bg-surface px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-text-muted">Simulations</span>
              <input
                type="number"
                value={simulations}
                onChange={(e) => setSimulations(Number(e.target.value))}
                className="h-10 rounded-xl border border-border bg-surface px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </label>
          </div>

          {/* Holdings display */}
          <div className="mt-4">
            <p className="text-xs text-text-muted mb-2">Holdings (GPF Default Allocation)</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {DEFAULT_HOLDINGS.map((h) => (
                <div
                  key={h.asset}
                  className="rounded-xl border border-border bg-surface-hover p-3 text-sm"
                >
                  <p className="font-medium text-text">{h.asset}</p>
                  <p className="text-text-muted">
                    Weight: {(h.weight * 100).toFixed(0)}% | Return: {(h.expectedReturn * 100).toFixed(1)}% | SD:{" "}
                    {(h.sd * 100).toFixed(1)}%
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <Button onClick={handleCalculate} loading={isCalculating}>
              {isCalculating ? "Calculating..." : "Run Analysis"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <>
          <PerformanceMetrics results={results} />

          <AllocationBreakdown
            holdings={DEFAULT_HOLDINGS.map((h) => ({
              asset: h.asset,
              weight: h.weight,
            }))}
          />

          <MddRecoveryTable data={results.drawdownAnalysis} />

          <RiskCommentary
            performanceComment={results.performanceComment}
            riskComment={results.riskComment}
          />
        </>
      )}
    </div>
  );
}
