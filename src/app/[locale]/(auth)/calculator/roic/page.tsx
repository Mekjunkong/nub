"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoicForm } from "@/components/calculator/roic/roic-form";
import { RoicResultsView } from "@/components/calculator/roic/roic-results";
import { RoicRankingTable } from "@/components/calculator/roic/roic-ranking-table";
import { calculateRoic } from "@/lib/roic-math";
import { createClient } from "@/lib/supabase/client";
import { track, Events } from "@/lib/analytics";
import type { RoicResults } from "@/lib/roic-math";

const SAMPLE_STOCKS = [
  {
    ticker: "MEGA",
    name: "Mega Lifesciences",
    roicCurrent: 0.1872,
    roicHistory: { "2566": 0.17, "2565": 0.16 },
    sloanRatio: -0.013,
    fairValue: 31208,
    rating: "Good",
  },
  {
    ticker: "BH",
    name: "Bumrungrad Hospital",
    roicCurrent: 0.257,
    roicHistory: { "2566": 0.22, "2565": 0.2 },
    sloanRatio: -0.02,
    fairValue: 127188,
    rating: "Excellent",
  },
  {
    ticker: "ADVANC",
    name: "Advanced Info Service",
    roicCurrent: 0.1276,
    roicHistory: { "2566": 0.13, "2565": 0.12 },
    sloanRatio: -0.01,
    fairValue: 475567,
    rating: "Moderate",
  },
  {
    ticker: "BDMS",
    name: "Bangkok Dusit Medical",
    roicCurrent: 0.1647,
    roicHistory: { "2566": 0.15, "2565": 0.14 },
    sloanRatio: -0.008,
    fairValue: 303820,
    rating: "Good",
  },
];

interface RankingEntry {
  ticker: string;
  name: string;
  roicCurrent: number;
  roicHistory: Record<string, number>;
  sloanRatio: number;
  fairValue: number;
  rating: string;
}

function getRating(roic: number): string {
  if (roic >= 0.2) return "Excellent";
  if (roic >= 0.15) return "Good";
  if (roic >= 0.1) return "Moderate";
  return "Poor";
}

export default function RoicPage() {
  const t = useTranslations("calculator");
  const [results, setResults] = useState<RoicResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rankingEntries, setRankingEntries] = useState<RankingEntry[]>(SAMPLE_STOCKS);
  const [rankingLoading, setRankingLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchFunds() {
      try {
        const supabase = createClient();
        const { data: funds, error: fetchError } = await supabase
          .from("funds")
          .select("ticker, name_en, roic_current, roic_history")
          .not("roic_current", "is", null);

        if (fetchError || !funds || cancelled) {
          if (!cancelled) setRankingLoading(false);
          return;
        }

        if (funds.length === 0) {
          // No funds with ROIC data, keep SAMPLE_STOCKS
          if (!cancelled) setRankingLoading(false);
          return;
        }

        const entries: RankingEntry[] = funds.map((f) => ({
          ticker: f.ticker,
          name: f.name_en,
          roicCurrent: f.roic_current as number,
          roicHistory: (f.roic_history as Record<string, number>) ?? {},
          sloanRatio: 0,
          fairValue: 0,
          rating: getRating(f.roic_current as number),
        }));

        if (!cancelled) {
          setRankingEntries(entries);
        }
      } catch (err) {
        console.error("Failed to fetch fund rankings:", err);
        // Keep SAMPLE_STOCKS as fallback
      } finally {
        if (!cancelled) setRankingLoading(false);
      }
    }

    fetchFunds();
    return () => { cancelled = true; };
  }, []);

  function handleCalculate(inputs: Parameters<typeof calculateRoic>[0]) {
    try {
      setError(null);
      setResults(calculateRoic(inputs));
      track(Events.CALCULATOR_COMPLETED, { type: "roic" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Calculation error");
      setResults(null);
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="page-header-gradient">
        <h1 className="text-2xl font-bold font-heading">{t("roic.title")}</h1>
        <p className="text-sm mt-1 text-white/80">
          {t("roic.subtitle")}
        </p>
      </div>

      <Tabs defaultValue="analyze">
        <TabsList>
          <TabsTrigger value="analyze">{t("roic.analyzeTab")}</TabsTrigger>
          <TabsTrigger value="ranking">{t("roic.rankingTab")}</TabsTrigger>
        </TabsList>
        <TabsContent value="analyze" className="flex flex-col gap-6 mt-4">
          <RoicForm onCalculate={handleCalculate} />
          {error && <p className="text-danger text-sm">{error}</p>}
          {results && <RoicResultsView results={results} />}
        </TabsContent>
        <TabsContent value="ranking" className="mt-4">
          {rankingLoading ? (
            <p className="text-sm text-text-muted">{t("roic.loadingRankings")}</p>
          ) : (
            <RoicRankingTable entries={rankingEntries} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
