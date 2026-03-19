"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Bumnan95StrategiesProps {
  lumpSumNeeded: number;
  monthlyTopUp: number;
  recommendedStrategy: string;
}

export function Bumnan95Strategies({
  lumpSumNeeded,
  monthlyTopUp,
  recommendedStrategy,
}: Bumnan95StrategiesProps) {
  const t = useTranslations("calculator");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("bumnan95.strategies")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm font-semibold text-text-muted">{t("bumnan95.lumpSum")}</p>
            <p className="mt-2 text-2xl font-bold text-text">฿{lumpSumNeeded.toLocaleString()}</p>
            <p className="mt-1 text-xs text-text-muted">{t("bumnan95.lumpSumDesc")}</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm font-semibold text-text-muted">{t("bumnan95.monthlyTopUp")}</p>
            <p className="mt-2 text-2xl font-bold text-text">฿{monthlyTopUp.toLocaleString()}/mo</p>
            <p className="mt-1 text-xs text-text-muted">{t("bumnan95.monthlyTopUpDesc")}</p>
          </div>
        </div>
        <div className="mt-4 rounded-lg bg-primary/5 p-3">
          <p className="text-sm text-primary font-medium">{recommendedStrategy}</p>
        </div>
      </CardContent>
    </Card>
  );
}
