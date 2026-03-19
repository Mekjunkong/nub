"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { RoicResults } from "@/lib/roic-math";

interface RoicResultsViewProps {
  results: RoicResults;
}

const ratingVariant: Record<string, "success" | "primary" | "warning" | "danger"> = {
  Excellent: "success",
  Good: "primary",
  Moderate: "warning",
  Poor: "danger",
};

function formatNumber(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

export function RoicResultsView({ results }: RoicResultsViewProps) {
  const t = useTranslations("calculator");
  const roicColor =
    results.roic > 0.15
      ? "text-success"
      : results.roic > 0.08
        ? "text-warning"
        : "text-danger";

  const spreadPositive = results.roicVsWacc > 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-text-muted">{t("roic.quality")}:</span>
        <Badge variant={ratingVariant[results.qualityRating]} className="text-sm px-3 py-1">
          {results.qualityRating}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* NOPAT */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-text-muted">{t("roic.nopat")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-text">
              ฿{formatNumber(results.nopat)}
            </p>
          </CardContent>
        </Card>

        {/* Invested Capital */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-text-muted">{t("roic.investedCapital")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-text">
              ฿{formatNumber(results.investedCapital)}
            </p>
          </CardContent>
        </Card>

        {/* ROIC */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-text-muted">{t("roic.roicLabel")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${roicColor}`}>
              {formatPercent(results.roic)}
            </p>
          </CardContent>
        </Card>

        {/* Sloan Ratio */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-text-muted">{t("roic.sloan")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-text">
              {results.sloanRatio.toFixed(4)}
            </p>
            {results.sloanRatio < 0 ? (
              <Badge variant="success" className="mt-2">{t("roic.qualityEarnings")}</Badge>
            ) : (
              <Badge variant="danger" className="mt-2">{t("roic.accrualWarning")}</Badge>
            )}
          </CardContent>
        </Card>

        {/* Fair Equity Value */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-text-muted">{t("roic.fairValue")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">
              ฿{formatNumber(results.fairEquityValue)}
            </p>
          </CardContent>
        </Card>

        {/* ROIC vs WACC */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-text-muted">{t("roic.roicVsWacc")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="h-3 flex-1 rounded-full bg-surface-hover overflow-hidden">
                <div
                  className={`h-full rounded-full ${spreadPositive ? "bg-success" : "bg-danger"}`}
                  style={{ width: `${Math.min(Math.abs(results.roicVsWacc) * 500, 100)}%` }}
                />
              </div>
              <span className={`text-sm font-semibold ${spreadPositive ? "text-success" : "text-danger"}`}>
                {spreadPositive ? "+" : ""}
                {formatPercent(results.roicVsWacc)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
