"use client";

import { HealthScoreGauge } from "@/components/charts/health-score-gauge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";

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
  const delta = score != null && previousScore != null ? score - previousScore : null;

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-6">
        <h2 className="text-sm font-semibold text-text-muted">Financial Health Score</h2>
        {score != null ? (
          <>
            <HealthScoreGauge score={score} breakdown={breakdown} />
            {delta != null && delta !== 0 && (
              <div className={`flex items-center gap-1 text-sm ${delta > 0 ? "text-success" : "text-danger"}`}>
                <TrendingUp className={`h-4 w-4 ${delta < 0 ? "rotate-180" : ""}`} />
                <span>{delta > 0 ? "+" : ""}{delta} from last calculation</span>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 py-8">
            <p className="text-text-muted text-sm">No score yet</p>
            <Button size="sm" variant="primary">Run Retirement Planner</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
