"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale } from "next-intl";
import { FundSelector } from "@/components/calculator/mpt/fund-selector";
import { MptResultsView } from "@/components/calculator/mpt/mpt-results";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { runMptOptimizer } from "@/workers/mpt-optimizer.worker";
import { createClient } from "@/lib/supabase/client";
import {
  buildCorrelationFromPairs,
  buildCorrelationFromHistory,
} from "@/lib/correlation-utils";
import { track, Events } from "@/lib/analytics";
import type { Fund } from "@/types/database";
import type { MptResults } from "@/types/calculator";

const SAMPLE_FUNDS: Fund[] = [
  {
    id: "1",
    ticker: "SCBRMS&P500",
    name_th: "SCB US Equity S&P 500",
    name_en: "SCB US Equity S&P 500",
    category: "equity",
    expected_return: 0.08,
    standard_deviation: 0.1858,
    roic_current: null,
    roic_history: null,
    nav_history: null,
    affiliate_url: null,
    updated_at: "",
    source_url: null,
  },
  {
    id: "2",
    ticker: "SCBRM2",
    name_th: "SCB Short-term Fixed Income",
    name_en: "SCB Short-term Fixed Income",
    category: "bond",
    expected_return: 0.025,
    standard_deviation: 0.0191,
    roic_current: null,
    roic_history: null,
    nav_history: null,
    affiliate_url: null,
    updated_at: "",
    source_url: null,
  },
  {
    id: "3",
    ticker: "SCBRMGOLDH",
    name_th: "SCB Gold THB Hedged",
    name_en: "SCB Gold THB Hedged",
    category: "gold",
    expected_return: 0.05,
    standard_deviation: 0.1511,
    roic_current: null,
    roic_history: null,
    nav_history: null,
    affiliate_url: null,
    updated_at: "",
    source_url: null,
  },
];

const SAMPLE_CORRELATIONS = [
  [1.0, 0.1496, 0.1432],
  [0.1496, 1.0, 0.0978],
  [0.1432, 0.0978, 1.0],
];

export default function MptPage() {
  const locale = useLocale();
  const [funds, setFunds] = useState<Fund[]>(SAMPLE_FUNDS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [riskFreeRate, setRiskFreeRate] = useState(2);
  const [results, setResults] = useState<MptResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [usingSampleData, setUsingSampleData] = useState(false);

  // Fetch funds from Supabase on mount
  useEffect(() => {
    let cancelled = false;

    async function fetchFunds() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("funds")
          .select("*")
          .order("ticker", { ascending: true });

        if (error) throw error;

        if (!cancelled && data && data.length > 0) {
          setFunds(data as Fund[]);
          setUsingSampleData(false);
        } else if (!cancelled) {
          setFunds(SAMPLE_FUNDS);
          setUsingSampleData(true);
        }
      } catch {
        if (!cancelled) {
          setFunds(SAMPLE_FUNDS);
          setUsingSampleData(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchFunds();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleOptimize = useCallback(async () => {
    if (selectedIds.length < 2) return;

    setOptimizing(true);
    setResults(null);

    try {
      const selectedFunds = funds.filter((f) => selectedIds.includes(f.id));
      let corrMatrix: number[][];

      if (usingSampleData) {
        // Use hardcoded correlations for sample data
        const indices = selectedIds.map((id) =>
          SAMPLE_FUNDS.findIndex((f) => f.id === id)
        );
        corrMatrix = indices.map((i) =>
          indices.map((j) => SAMPLE_CORRELATIONS[i][j])
        );
      } else {
        // Fetch correlations from Supabase
        corrMatrix = await fetchCorrelationMatrix(selectedIds, selectedFunds);
      }

      const result = runMptOptimizer({
        assets: selectedFunds.map((f) => ({
          name: locale === "th" ? f.name_th : f.name_en,
          ticker: f.ticker,
          expectedReturn: f.expected_return,
          standardDeviation: f.standard_deviation,
        })),
        correlationMatrix: corrMatrix,
        riskFreeRate: riskFreeRate / 100,
        frontierPoints: 100,
      });

      setResults(result);
      track(Events.CALCULATOR_COMPLETED, { type: "mpt" });
    } catch {
      // If correlation fetch fails, show error state
      setResults(null);
    } finally {
      setOptimizing(false);
    }
  }, [selectedIds, funds, usingSampleData, riskFreeRate, locale]);

  const assetNames = selectedIds.map(
    (id) => funds.find((f) => f.id === id)?.ticker || ""
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text font-heading">
          MPT Portfolio Optimizer
        </h1>
        <p className="text-sm text-text-muted">
          Optimize your portfolio with Modern Portfolio Theory
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Funds</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col gap-3">
              {/* Loading skeleton */}
              <div className="h-4 w-32 animate-pulse rounded bg-surface-hover" />
              <div className="h-10 w-full animate-pulse rounded-lg bg-surface-hover" />
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-7 w-20 animate-pulse rounded-full bg-surface-hover"
                  />
                ))}
              </div>
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-14 w-full animate-pulse rounded-lg bg-surface-hover"
                  />
                ))}
              </div>
            </div>
          ) : (
            <>
              {usingSampleData && (
                <p className="mb-3 rounded-lg bg-warning/10 px-3 py-2 text-xs text-warning">
                  Using sample data. Connect to Supabase to load real funds.
                </p>
              )}
              <FundSelector
                funds={funds}
                selected={selectedIds}
                onSelect={setSelectedIds}
                maxSelection={10}
                locale={locale}
              />
            </>
          )}

          <div className="mt-4 max-w-xs">
            <Input
              label="Risk-Free Rate (%)"
              type="number"
              value={riskFreeRate}
              onChange={(e) => setRiskFreeRate(Number(e.target.value))}
            />
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              onClick={handleOptimize}
              disabled={selectedIds.length < 2 || optimizing}
              loading={optimizing}
            >
              Optimize
            </Button>
          </div>
        </CardContent>
      </Card>

      {results && <MptResultsView results={results} assetNames={assetNames} />}
    </div>
  );
}

/**
 * Fetch correlation matrix for selected funds.
 * First tries fund_correlations table; falls back to computing from nav_history.
 */
async function fetchCorrelationMatrix(
  fundIds: string[],
  selectedFunds: Fund[]
): Promise<number[][]> {
  const supabase = createClient();

  // Try fetching pre-computed correlations
  const { data: pairs, error } = await supabase
    .from("fund_correlations")
    .select("*")
    .in("fund_a_id", fundIds)
    .in("fund_b_id", fundIds);

  if (!error && pairs && pairs.length > 0) {
    const matrix = buildCorrelationFromPairs(fundIds, pairs);
    // Verify matrix is complete (all off-diagonal entries filled)
    const n = fundIds.length;
    let complete = true;
    for (let i = 0; i < n && complete; i++) {
      for (let j = 0; j < n && complete; j++) {
        if (i !== j && matrix[i][j] === 0) {
          complete = false;
        }
      }
    }
    if (complete) return matrix;
  }

  // Fallback: compute from nav_history
  const navHistories: number[][] = [];
  let hasAllHistory = true;

  for (const fund of selectedFunds) {
    if (fund.nav_history && typeof fund.nav_history === "object") {
      // nav_history is Record<string, number> — sort by date key and extract values
      const entries = Object.entries(fund.nav_history).sort(
        ([a], [b]) => a.localeCompare(b)
      );
      navHistories.push(entries.map(([, v]) => v));
    } else {
      hasAllHistory = false;
      break;
    }
  }

  if (hasAllHistory && navHistories.length === fundIds.length) {
    return buildCorrelationFromHistory(navHistories);
  }

  // Last resort: identity matrix (no correlation assumed)
  const n = fundIds.length;
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
  );
}
