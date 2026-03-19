"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface RetirementWealthCardProps {
  gpfValue: number;
  rmfValue: number;
  otherRetirement: number;
  targetCorpus: number;
}

export function RetirementWealthCard({
  gpfValue,
  rmfValue,
  otherRetirement,
  targetCorpus,
}: RetirementWealthCardProps) {
  const total = gpfValue + rmfValue + otherRetirement;
  const percent = targetCorpus > 0 ? Math.min((total / targetCorpus) * 100, 100) : 0;

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Retirement Wealth</p>
        </div>
        <p className="text-2xl font-bold text-text">{"\u0E3F"}{total.toLocaleString()}</p>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-text-muted">
          <span>GPF {"\u0E3F"}{gpfValue.toLocaleString()}</span>
          <span>RMF {"\u0E3F"}{rmfValue.toLocaleString()}</span>
          <span>Other {"\u0E3F"}{otherRetirement.toLocaleString()}</span>
        </div>
        <div className="mt-3">
          <div className="h-2 w-full rounded-full bg-surface-hover">
            <div
              className="h-2 rounded-full bg-primary transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="text-sm text-text-muted mt-1.5 block">
            {percent.toFixed(0)}% of target
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
