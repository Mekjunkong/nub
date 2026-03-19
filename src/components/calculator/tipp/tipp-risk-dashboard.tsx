"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TippResults } from "@/types/calculator";

interface TippRiskDashboardProps {
  results: TippResults;
}

function formatBaht(v: number): string {
  return v.toLocaleString("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

const safetyVariant: Record<string, "success" | "warning" | "danger"> = {
  SAFE: "success",
  WARNING: "warning",
  DANGER: "danger",
};

export function TippRiskDashboard({ results }: TippRiskDashboardProps) {
  const t = useTranslations("calculator");
  const cushionPct =
    results.finalWealth > 0
      ? ((results.cushion / results.finalWealth) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="py-4 text-center">
          <p className="text-xs text-text-muted">{t("tipp.var95")}</p>
          <p className="text-xl font-bold text-text font-heading">
            {formatBaht(results.var95)}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="py-4 text-center">
          <p className="text-xs text-text-muted">{t("tipp.var99")}</p>
          <p className="text-xl font-bold text-text font-heading">
            {formatBaht(results.var99)}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="py-4 text-center">
          <p className="text-xs text-text-muted">{t("tipp.cvar95")}</p>
          <p className="text-xl font-bold text-text font-heading">
            {formatBaht(results.cvar95)}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="py-4 text-center">
          <p className="text-xs text-text-muted">{t("tipp.cvar99")}</p>
          <p className="text-xl font-bold text-text font-heading">
            {formatBaht(results.cvar99)}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="py-4 text-center">
          <p className="text-xs text-text-muted">{t("tipp.safetyStatus")}</p>
          <Badge
            variant={safetyVariant[results.safetyStatus]}
            className="mt-1 text-base px-4 py-1"
          >
            {results.safetyStatus}
          </Badge>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="py-4 text-center">
          <p className="text-xs text-text-muted">{t("tipp.cushion")}</p>
          <p className="text-xl font-bold text-success font-heading">
            {formatBaht(results.cushion)}
          </p>
          <p className="text-xs text-text-muted">{cushionPct}%</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="py-4 text-center">
          <p className="text-xs text-text-muted">{t("tipp.sharpeRatio")}</p>
          <p className="text-xl font-bold text-text font-heading">
            {results.sharpeRatio.toFixed(2)}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="py-4 text-center">
          <p className="text-xs text-text-muted">{t("tipp.maxDrawdown")}</p>
          <p className="text-xl font-bold text-danger font-heading">
            {(results.maxDrawdown * 100).toFixed(1)}%
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
