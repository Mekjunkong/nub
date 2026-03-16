"use client";

import { cn } from "@/lib/utils";

interface SurvivalGaugeProps {
  rate: number; // 0-1
  size?: "sm" | "md" | "lg";
}

function getColor(rate: number): "green" | "amber" | "red" {
  if (rate > 0.8) return "green";
  if (rate >= 0.5) return "amber";
  return "red";
}

const colorClasses = {
  green: "text-success",
  amber: "text-warning",
  red: "text-danger",
};

const bgColorClasses = {
  green: "stroke-success",
  amber: "stroke-warning",
  red: "stroke-danger",
};

export function SurvivalGauge({ rate, size = "md" }: SurvivalGaugeProps) {
  const color = getColor(rate);
  const percentage = Math.round(rate * 100);
  const circumference = 2 * Math.PI * 45;
  const dashOffset = circumference * (1 - rate);

  const sizeClass = {
    sm: "h-24 w-24",
    md: "h-40 w-40",
    lg: "h-56 w-56",
  };

  const textSize = {
    sm: "text-xl",
    md: "text-3xl",
    lg: "text-5xl",
  };

  return (
    <div
      data-testid="survival-gauge"
      data-color={color}
      className={cn("relative flex items-center justify-center", sizeClass[size])}
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
        <circle
          cx="50" cy="50" r="45"
          fill="none"
          strokeWidth="8"
          className="stroke-surface-hover"
        />
        <circle
          cx="50" cy="50" r="45"
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className={cn("transition-all duration-1000", bgColorClasses[color])}
        />
      </svg>
      <div className="flex flex-col items-center">
        <span className={cn("font-bold font-heading", textSize[size], colorClasses[color])}>
          {percentage}%
        </span>
      </div>
    </div>
  );
}
