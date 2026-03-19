"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TippAllocationViewProps {
  riskyWeight: number;
  safeWeight: number;
  currentMultiplier: number;
  finalWealth: number;
  initialCapital: number;
}

export function TippAllocationView({
  riskyWeight,
  safeWeight,
  currentMultiplier,
  finalWealth,
  initialCapital,
}: TippAllocationViewProps) {
  const riskyPct = (riskyWeight * 100).toFixed(1);
  const safePct = (safeWeight * 100).toFixed(1);
  const isNewHigh = finalWealth > initialCapital;

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 py-6">
        {/* Stacked bar */}
        <div>
          <p className="mb-2 text-sm font-medium text-text">
            Current Allocation
          </p>
          <div className="flex h-8 w-full overflow-hidden rounded-lg">
            {riskyWeight > 0 && (
              <div
                className="flex items-center justify-center bg-primary text-xs font-medium text-white transition-all"
                style={{ width: `${riskyPct}%` }}
              >
                {Number(riskyPct) > 8 ? `Risky ${riskyPct}%` : ""}
              </div>
            )}
            {safeWeight > 0 && (
              <div
                className="flex items-center justify-center bg-success text-xs font-medium text-white transition-all"
                style={{ width: `${safePct}%` }}
              >
                {Number(safePct) > 8 ? `Safe ${safePct}%` : ""}
              </div>
            )}
          </div>
          <div className="mt-2 flex items-center gap-4 text-xs text-text-muted">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary" />
              Risky {riskyPct}%
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-success" />
              Safe {safePct}%
            </span>
          </div>
        </div>

        {/* Multiplier and new high */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-text-muted">Current Multiplier</p>
            <p className="text-2xl font-bold text-text font-heading">
              {currentMultiplier.toFixed(2)}x
            </p>
          </div>
          {isNewHigh && (
            <Badge variant="success" className="text-sm px-3 py-1">
              New High
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
