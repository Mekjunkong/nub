"use client";

import { cn } from "@/lib/utils";

interface HealthScoreGaugeProps {
  score: number; // 0-100
  breakdown?: {
    fundingScore: number;
    diversificationBonus: number;
    savingsRateBonus: number;
    timeHorizonBonus: number;
    insuranceBonus: number;
  };
}

function getScoreInfo(score: number) {
  if (score >= 86) return { label: "Excellent", color: "text-yellow-500", bg: "stroke-yellow-500" };
  if (score >= 71) return { label: "Good", color: "text-success", bg: "stroke-success" };
  if (score >= 51) return { label: "On Track", color: "text-primary", bg: "stroke-primary" };
  if (score >= 31) return { label: "Needs Work", color: "text-warning", bg: "stroke-warning" };
  return { label: "Critical", color: "text-danger", bg: "stroke-danger" };
}

export function HealthScoreGauge({ score, breakdown }: HealthScoreGaugeProps) {
  const { label, color, bg } = getScoreInfo(score);
  const circumference = 2 * Math.PI * 45;
  const dashOffset = circumference * (1 - score / 100);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative flex h-40 w-40 items-center justify-center">
        <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
          <circle
            cx="50" cy="50" r="45"
            fill="none" strokeWidth="8"
            className="stroke-surface-hover"
          />
          <circle
            cx="50" cy="50" r="45"
            fill="none" strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className={cn("transition-all duration-1000", bg)}
          />
        </svg>
        <div className="flex flex-col items-center">
          <span className={cn("text-3xl font-bold font-heading", color)}>
            {score}
          </span>
        </div>
      </div>
      <span className={cn("text-sm font-semibold", color)}>{label}</span>
      {breakdown && (
        <div className="mt-2 grid w-full max-w-xs grid-cols-2 gap-1 text-xs text-text-muted">
          <span>Funding: {breakdown.fundingScore}/60</span>
          <span>Diversification: +{breakdown.diversificationBonus}</span>
          <span>Savings Rate: +{breakdown.savingsRateBonus}</span>
          <span>Time Horizon: +{breakdown.timeHorizonBonus}</span>
          <span>Insurance: +{breakdown.insuranceBonus}</span>
        </div>
      )}
    </div>
  );
}
