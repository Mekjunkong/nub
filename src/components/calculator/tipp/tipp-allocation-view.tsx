"use client";

import { useTranslations } from "next-intl";
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
  const t = useTranslations("calculator");
  const riskyPct = (riskyWeight * 100).toFixed(1);
  const safePct = (safeWeight * 100).toFixed(1);
  const isNewHigh = finalWealth > initialCapital;

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 py-6">
        {/* Stacked bar */}
        <div>
          <p className="mb-2 text-sm font-medium text-text">
            {t("tipp.currentAllocation")}
          </p>
          <div className="flex h-8 w-full overflow-hidden rounded-lg">
            {riskyWeight > 0 && (
              <div
                className="flex items-center justify-center bg-primary text-xs font-medium text-white transition-all"
                style={{ width: `${riskyPct}%` }}
              >
                {Number(riskyPct) > 8 ? `${t("tipp.risky")} ${riskyPct}%` : ""}
              </div>
            )}
            {safeWeight > 0 && (
              <div
                className="flex items-center justify-center bg-success text-xs font-medium text-white transition-all"
                style={{ width: `${safePct}%` }}
              >
                {Number(safePct) > 8 ? `${t("tipp.safe")} ${safePct}%` : ""}
              </div>
            )}
          </div>
          <div className="mt-2 flex items-center gap-4 text-xs text-text-muted">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary" />
              {t("tipp.risky")} {riskyPct}%
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-success" />
              {t("tipp.safe")} {safePct}%
            </span>
          </div>
        </div>

        {/* Multiplier and new high */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-text-muted">{t("tipp.currentMultiplier")}</p>
            <p className="text-2xl font-bold text-text font-heading">
              {currentMultiplier.toFixed(2)}x
            </p>
          </div>
          {isNewHigh && (
            <Badge variant="success" className="text-sm px-3 py-1">
              {t("tipp.newHigh")}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
