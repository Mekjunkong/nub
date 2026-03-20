"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Target } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { cn } from "@/lib/utils";

interface GoalTrackerProps {
  scoreHistory: Array<{ date: string; score: number }>;
  currentScore: number | null;
}

export function GoalTracker({ scoreHistory, currentScore }: GoalTrackerProps) {
  const [targetScore, setTargetScore] = useState<number>(() => {
    if (typeof window === "undefined") return 80;
    try {
      const stored = localStorage.getItem("nub_target_score");
      return stored ? Number(stored) : 80;
    } catch {
      return 80;
    }
  });

  function handleTargetChange(value: number) {
    const clamped = Math.min(100, Math.max(1, value));
    setTargetScore(clamped);
    try {
      localStorage.setItem("nub_target_score", String(clamped));
    } catch {
      // localStorage may be unavailable
    }
  }

  const score = currentScore ?? 0;
  const progress = targetScore > 0 ? Math.min(100, (score / targetScore) * 100) : 0;
  const remaining = Math.max(0, targetScore - score);

  const scoreColor = score >= 75 ? "text-success" : score >= 50 ? "text-warning" : "text-danger";
  const barColor = score >= 75 ? "bg-success" : score >= 50 ? "bg-warning" : "bg-danger";
  const chartColor = score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";

  if (currentScore == null && scoreHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4" /> Goal Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-text-muted text-center py-4">
            Run the Portfolio Health calculator to start tracking your progress.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4" /> Goal Tracker
          </CardTitle>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-text-muted">Target:</span>
            <Input
              type="number"
              value={targetScore}
              onChange={(e) => handleTargetChange(Number(e.target.value))}
              className="h-7 w-16 text-xs text-center"
              min={1}
              max={100}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Progress bar */}
        <div>
          <div className="flex items-baseline justify-between mb-1.5">
            <span className={cn("text-2xl font-bold font-mono", scoreColor)}>{score.toFixed(0)}</span>
            <span className="text-xs text-text-muted">
              {remaining > 0 ? `${remaining.toFixed(0)} points to go` : "Target reached!"}
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-surface-hover overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-500", barColor)}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-text-muted mt-1">{progress.toFixed(0)}% of target</p>
        </div>

        {/* Timeline chart */}
        {scoreHistory.length > 1 && (
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={scoreHistory}>
                <defs>
                  <linearGradient id="goalGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="var(--color-text-muted)" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="var(--color-text-muted)" />
                <Tooltip
                  contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }}
                />
                <Area type="monotone" dataKey="score" stroke={chartColor} fill="url(#goalGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
