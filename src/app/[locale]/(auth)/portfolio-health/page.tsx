"use client";

import { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePortfolioHealthWorker } from "@/hooks/use-portfolio-health-worker";
import { PerformanceMetrics } from "@/components/portfolio-health/performance-metrics";
import { AllocationBreakdown } from "@/components/portfolio-health/allocation-breakdown";
import { MddRecoveryTable } from "@/components/portfolio-health/mdd-recovery-table";
import { RiskCommentary } from "@/components/portfolio-health/risk-commentary";
import { Plus, Trash2 } from "lucide-react";
import { track, Events } from "@/lib/analytics";
import type { PortfolioHealthInputs } from "@/types/calculator";

interface HoldingRow {
  id: string;
  asset: string;
  weight: number; // stored as percentage (0-100) for display
  expectedReturn: number; // stored as percentage
  sd: number; // stored as percentage
}

const INITIAL_HOLDINGS: HoldingRow[] = [
  { id: "1", asset: "Bonds", weight: 36, expectedReturn: 2.5, sd: 1.3 },
  { id: "2", asset: "Foreign Equity", weight: 46, expectedReturn: 8, sd: 12 },
  { id: "3", asset: "Gold", weight: 18, expectedReturn: 5, sd: 15 },
];

const DEFAULT_CORRELATION: number[][] = [
  [1.0, 0.2, 0.05],
  [0.2, 1.0, 0.1],
  [0.05, 0.1, 1.0],
];

let holdingIdCounter = 4;

export default function PortfolioHealthPage() {
  const t = useTranslations("portfolioHealth");
  const { results, isCalculating, calculate } = usePortfolioHealthWorker();

  // Form state
  const [totalNAV, setTotalNAV] = useState(460_000);
  const [previousNAV, setPreviousNAV] = useState(450_000);
  const [monthlyDCA, setMonthlyDCA] = useState(5_000);
  const [benchmarkReturn, setBenchmarkReturn] = useState(0.05);
  const [riskFreeRate, setRiskFreeRate] = useState(0.02);
  const [investmentYears, setInvestmentYears] = useState(5);
  const [simulations, setSimulations] = useState(1_000);

  // Editable holdings state
  const [holdings, setHoldings] = useState<HoldingRow[]>(INITIAL_HOLDINGS);

  const weightSum = useMemo(
    () => holdings.reduce((sum, h) => sum + h.weight, 0),
    [holdings]
  );
  const weightValid = Math.abs(weightSum - 100) <= 1;

  const updateHolding = useCallback(
    (id: string, field: keyof HoldingRow, value: string | number) => {
      setHoldings((prev) =>
        prev.map((h) => (h.id === id ? { ...h, [field]: value } : h))
      );
    },
    []
  );

  function addHolding() {
    const newId = String(holdingIdCounter++);
    setHoldings((prev) => [
      ...prev,
      { id: newId, asset: "", weight: 0, expectedReturn: 0, sd: 0 },
    ]);
  }

  function removeHolding(id: string) {
    setHoldings((prev) => prev.filter((h) => h.id !== id));
  }

  // Build a simple correlation matrix (identity-like with 0.1 off-diagonal) for the current holdings count
  function buildCorrelation(n: number): number[][] {
    if (n === INITIAL_HOLDINGS.length) return DEFAULT_CORRELATION;
    return Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, j) => (i === j ? 1.0 : 0.1))
    );
  }

  function handleCalculate() {
    const inputs: PortfolioHealthInputs = {
      totalNAV,
      previousNAV,
      monthlyDCA,
      holdings: holdings.map((h) => ({
        asset: h.asset,
        weight: h.weight / 100,
        expectedReturn: h.expectedReturn / 100,
        sd: h.sd / 100,
      })),
      correlationMatrix: buildCorrelation(holdings.length),
      benchmarkReturn,
      riskFreeRate,
      investmentYears,
      simulations,
    };
    calculate(inputs);
    track(Events.CALCULATOR_COMPLETED, { type: "portfolio_health" });
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="page-header-gradient">
        <h1 className="text-2xl font-bold font-heading">{t("title")}</h1>
        <p className="text-sm mt-1 text-white/80">
          {t("subtitle")}
        </p>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle>{t("parameters")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-text-muted">{t("totalNAV")}</span>
              <input
                type="number"
                value={totalNAV}
                onChange={(e) => setTotalNAV(Number(e.target.value))}
                className="h-10 rounded-xl border border-border bg-surface px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-text-muted">{t("previousNAV")} (THB)</span>
              <input
                type="number"
                value={previousNAV}
                onChange={(e) => setPreviousNAV(Number(e.target.value))}
                className="h-10 rounded-xl border border-border bg-surface px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-text-muted">{t("monthlyDCA")} (THB)</span>
              <input
                type="number"
                value={monthlyDCA}
                onChange={(e) => setMonthlyDCA(Number(e.target.value))}
                className="h-10 rounded-xl border border-border bg-surface px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-text-muted">{t("benchmarkReturn")}</span>
              <input
                type="number"
                step="0.01"
                value={benchmarkReturn}
                onChange={(e) => setBenchmarkReturn(Number(e.target.value))}
                className="h-10 rounded-xl border border-border bg-surface px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-text-muted">{t("riskFreeRate")}</span>
              <input
                type="number"
                step="0.01"
                value={riskFreeRate}
                onChange={(e) => setRiskFreeRate(Number(e.target.value))}
                className="h-10 rounded-xl border border-border bg-surface px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-text-muted">{t("investmentYears")}</span>
              <input
                type="number"
                value={investmentYears}
                onChange={(e) => setInvestmentYears(Number(e.target.value))}
                className="h-10 rounded-xl border border-border bg-surface px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-text-muted">{t("simulations")}</span>
              <input
                type="number"
                value={simulations}
                onChange={(e) => setSimulations(Number(e.target.value))}
                className="h-10 rounded-xl border border-border bg-surface px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </label>
          </div>

          {/* Editable Holdings */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-text-muted">{t("holdings")} ({t("holdingsSubtitle")})</p>
              <Button size="sm" variant="outline" onClick={addHolding} className="h-7 gap-1 text-xs">
                <Plus className="h-3 w-3" /> Add Asset
              </Button>
            </div>

            {/* Header row */}
            <div className="hidden sm:grid sm:grid-cols-[1fr_80px_80px_80px_32px] gap-2 mb-1 px-1">
              <span className="text-xs text-text-muted">Asset Name</span>
              <span className="text-xs text-text-muted">Weight %</span>
              <span className="text-xs text-text-muted">Return %</span>
              <span className="text-xs text-text-muted">SD %</span>
              <span />
            </div>

            <div className="flex flex-col gap-2">
              {holdings.map((h) => (
                <div
                  key={h.id}
                  className="grid grid-cols-1 sm:grid-cols-[1fr_80px_80px_80px_32px] gap-2 rounded-xl border border-border bg-surface-hover p-2 items-center"
                >
                  <input
                    type="text"
                    value={h.asset}
                    onChange={(e) => updateHolding(h.id, "asset", e.target.value)}
                    placeholder="Asset name"
                    className="h-8 rounded-lg border border-border bg-surface px-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="number"
                    step="0.1"
                    value={h.weight}
                    onChange={(e) => updateHolding(h.id, "weight", Number(e.target.value))}
                    className="h-8 rounded-lg border border-border bg-surface px-2 text-sm text-text text-center focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="number"
                    step="0.1"
                    value={h.expectedReturn}
                    onChange={(e) => updateHolding(h.id, "expectedReturn", Number(e.target.value))}
                    className="h-8 rounded-lg border border-border bg-surface px-2 text-sm text-text text-center focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="number"
                    step="0.1"
                    value={h.sd}
                    onChange={(e) => updateHolding(h.id, "sd", Number(e.target.value))}
                    className="h-8 rounded-lg border border-border bg-surface px-2 text-sm text-text text-center focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => removeHolding(h.id)}
                    disabled={holdings.length <= 1}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-danger/10 hover:text-danger disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Weight sum indicator */}
            <div className={`mt-2 text-xs font-medium ${weightValid ? "text-success" : "text-danger"}`}>
              Total weight: {weightSum.toFixed(1)}%{" "}
              {!weightValid && "(should be ~100%)"}
            </div>
          </div>

          <div className="mt-4">
            <Button onClick={handleCalculate} loading={isCalculating} disabled={!weightValid || holdings.length === 0}>
              {isCalculating ? t("calculating") : t("runAnalysis")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <>
          <PerformanceMetrics results={results} />

          <AllocationBreakdown
            holdings={holdings.map((h) => ({
              asset: h.asset,
              weight: h.weight / 100,
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
