"use client";

import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";

interface EducationFundCardProps {
  currentAmount: number;
  goalAmount: number;
  targetDate: string;
}

export function EducationFundCard({ currentAmount, goalAmount, targetDate }: EducationFundCardProps) {
  const percent = goalAmount > 0 ? Math.min((currentAmount / goalAmount) * 100, 100) : 0;

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center gap-2 mb-2">
          <GraduationCap className="h-4 w-4 text-primary" />
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Education Fund</p>
        </div>
        <p className="text-2xl font-bold text-text">{"\u0E3F"}{currentAmount.toLocaleString()}</p>
        <div className="mt-3">
          <div className="h-2 w-full rounded-full bg-surface-hover">
            <div
              className="h-2 rounded-full bg-primary transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-sm text-text-muted">
              {percent.toFixed(0)}% of {"\u0E3F"}{goalAmount.toLocaleString()}
            </span>
            <span className="text-xs text-text-muted">Target: {targetDate}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
