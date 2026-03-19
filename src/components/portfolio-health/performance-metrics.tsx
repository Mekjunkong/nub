"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PortfolioHealthResults } from "@/types/calculator";

interface PerformanceMetricsProps {
  results: PortfolioHealthResults;
}

function starDisplay(rating: string): string {
  const match = rating.match(/^(\d)/);
  const count = match ? Number(match[1]) : 0;
  return "\u2B50".repeat(count);
}

const riskBadgeVariant: Record<string, "success" | "warning" | "danger"> = {
  Low: "success",
  Moderate: "warning",
  High: "danger",
};

export function PerformanceMetrics({ results }: PerformanceMetricsProps) {
  const t = useTranslations("portfolioHealth");
  const fmt = (v: number) => (v * 100).toFixed(2) + "%";

  const metrics = [
    {
      label: t("targetReturn"),
      value: fmt(results.targetReturn),
      sub: t("annual"),
    },
    {
      label: t("projectedReturn"),
      value: fmt(results.projectedReturn),
      sub: t("annual"),
    },
    {
      label: t("benchmarkReturn"),
      value: fmt(results.benchmarkReturn),
      sub: t("annual"),
    },
    {
      label: t("alpha"),
      value: (
        <span className={results.alpha >= 0 ? "text-success" : "text-danger"}>
          {results.alpha >= 0 ? "+" : ""}
          {fmt(results.alpha)}
        </span>
      ),
      sub: t("vsBenchmark"),
    },
    {
      label: t("sharpe"),
      value: (
        <span>
          {results.sharpeRatio.toFixed(2)}{" "}
          <span className="ml-1">{starDisplay(results.sharpeRating)}</span>
        </span>
      ),
      sub: results.sharpeRating,
    },
    {
      label: t("portfolioRiskSD"),
      value: fmt(results.portfolioRisk),
      sub: (
        <Badge variant={riskBadgeVariant[results.riskLevel]}>
          {results.riskLevel}
        </Badge>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {metrics.map((m) => (
        <Card key={m.label}>
          <CardContent className="flex flex-col gap-1 py-5">
            <p className="text-xs text-text-muted">{m.label}</p>
            <p className="text-xl font-bold text-text font-heading">{m.value}</p>
            <div className="text-xs text-text-muted">{m.sub}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
