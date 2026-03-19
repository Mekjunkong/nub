"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import type { BearMarketImpact } from "@/types/calculator";

interface StressBearImpactProps {
  impact: BearMarketImpact;
}

export function StressBearImpact({ impact }: StressBearImpactProps) {
  const t = useTranslations("stress_test");
  const severe = impact.drawdownDuringBear < -0.30;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {t("bearImpact")}
          {severe && <AlertTriangle className="h-4 w-4 text-danger" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-danger/10 p-4">
            <p className="text-xs font-semibold text-text-muted uppercase">{t("maxDrawdown")}</p>
            <p className="mt-1 text-2xl font-bold text-danger">
              {(impact.drawdownDuringBear * 100).toFixed(1)}%
            </p>
          </div>
          <div className="rounded-lg bg-surface-hover p-4">
            <p className="text-xs font-semibold text-text-muted uppercase">{t("recovery")}</p>
            <p className="mt-1 text-2xl font-bold text-text">
              {impact.recoveryMonths > 0 ? t("months", { count: impact.recoveryMonths }) : t("notRecovered")}
            </p>
          </div>
          <div className="rounded-lg bg-surface-hover p-4">
            <p className="text-xs font-semibold text-text-muted uppercase">{t("wealthAtBearEnd")}</p>
            <p className="mt-1 text-2xl font-bold text-text">
              ฿{impact.wealthAtBearEnd.toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
