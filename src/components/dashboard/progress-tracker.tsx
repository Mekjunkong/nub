"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";

interface ScoreHistory {
  date: string;
  score: number;
}

interface ProgressTrackerProps {
  history: ScoreHistory[];
}

export function ProgressTracker({ history }: ProgressTrackerProps) {
  const t = useTranslations("dashboard");

  if (history.length < 2) {
    return (
      <Card variant="elevated">
        <CardHeader><CardTitle className="text-sm">{t("progress")}</CardTitle></CardHeader>
        <CardContent>
          <p className="text-xs text-text-muted">{t("progressHint")}</p>
        </CardContent>
      </Card>
    );
  }

  const first = history[0];
  const last = history[history.length - 1];
  const delta = last.score - first.score;
  const maxScore = Math.max(...history.map((h) => h.score));
  const minScore = Math.min(...history.map((h) => h.score));
  const range = maxScore - minScore || 1;

  return (
    <Card variant="elevated">
      <CardHeader><CardTitle className="text-sm">{t("progress")}</CardTitle></CardHeader>
      <CardContent>
        <div className={`flex items-center gap-1 text-sm font-semibold ${delta >= 0 ? "text-success" : "text-danger"}`}>
          <TrendingUp className={`h-4 w-4 ${delta < 0 ? "rotate-180" : ""}`} />
          <span>{first.score} &rarr; {last.score}</span>
        </div>
        {/* Sparkline */}
        <div className="mt-3 flex h-12 items-end gap-0.5">
          {history.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-primary/60"
              style={{ height: `${((h.score - minScore) / range) * 100}%`, minHeight: "4px" }}
              title={`${h.date}: ${h.score}`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
