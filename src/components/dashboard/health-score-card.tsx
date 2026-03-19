"use client";

import { HealthScoreGauge } from "@/components/charts/health-score-gauge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";

interface HealthScoreCardProps {
  score: number | null;
  previousScore?: number | null;
  breakdown?: {
    fundingScore: number;
    diversificationBonus: number;
    savingsRateBonus: number;
    timeHorizonBonus: number;
    insuranceBonus: number;
  };
}

export function HealthScoreCard({ score, previousScore, breakdown }: HealthScoreCardProps) {
  const t = useTranslations("dashboard");
  const delta = score != null && previousScore != null ? score - previousScore : null;

  return (
    <Card variant="gradient">
      <CardContent className="flex flex-col items-center gap-4 py-8">
        <h2 className="text-sm font-semibold text-white/70">{t("healthScore")}</h2>
        {score != null ? (
          <>
            <div className="text-5xl font-bold font-heading number-highlight">{score}</div>
            <HealthScoreGauge score={score} breakdown={breakdown} />
            {delta != null && delta !== 0 && (
              <div className={`flex items-center gap-1 text-sm ${delta > 0 ? "text-green-300" : "text-red-300"}`}>
                <TrendingUp className={`h-4 w-4 ${delta < 0 ? "rotate-180" : ""}`} />
                <span>{delta > 0 ? "+" : ""}{delta} {t("fromLast")}</span>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 py-4">
            <p className="text-white/60 text-sm">{t("noScore")}</p>
            <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0">
              {t("runPlanner")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
