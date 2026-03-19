"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";
import type { PortfolioHealthResults } from "@/types/calculator";

interface PortfolioHealthSummaryCardProps {
  results: PortfolioHealthResults | null;
}

const riskBadgeVariant: Record<string, "success" | "warning" | "danger"> = {
  Low: "success",
  Moderate: "warning",
  High: "danger",
};

export function PortfolioHealthSummaryCard({ results }: PortfolioHealthSummaryCardProps) {
  if (!results) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-6">
          <h2 className="text-sm font-semibold text-text-muted">Portfolio Health</h2>
          <p className="text-text-muted text-sm">No data</p>
          <Link
            href="/portfolio-health"
            className="text-sm font-medium text-primary hover:underline"
          >
            Run Analysis &rarr;
          </Link>
        </CardContent>
      </Card>
    );
  }

  const monthlyReturnPct = results.monthlyReturn * 100;
  const isPositiveReturn = results.monthlyReturn >= 0;
  const alphaPct = results.alpha * 100;
  const isPositiveAlpha = results.alpha >= 0;

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 py-6">
        <h2 className="text-sm font-semibold text-text-muted">Portfolio Health</h2>

        {/* NAV */}
        <div>
          <p className="text-xs text-text-muted">NAV</p>
          <p className="text-2xl font-bold text-text font-heading">
            {new Intl.NumberFormat("th-TH", {
              style: "currency",
              currency: "THB",
              maximumFractionDigits: 0,
            }).format(460_000)}
          </p>
        </div>

        {/* Monthly Return */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">Monthly Return:</span>
          <span
            className={`flex items-center gap-1 text-sm font-medium ${
              isPositiveReturn ? "text-success" : "text-danger"
            }`}
          >
            <TrendingUp className={`h-3.5 w-3.5 ${!isPositiveReturn ? "rotate-180" : ""}`} />
            {isPositiveReturn ? "+" : ""}
            {monthlyReturnPct.toFixed(2)}%
          </span>
        </div>

        {/* Alpha */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">Alpha:</span>
          <Badge variant={isPositiveAlpha ? "success" : "danger"}>
            {isPositiveAlpha ? "Outperform" : "Underperform"} ({alphaPct >= 0 ? "+" : ""}
            {alphaPct.toFixed(2)}%)
          </Badge>
        </div>

        {/* Risk Level */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">Risk Level:</span>
          <Badge variant={riskBadgeVariant[results.riskLevel]}>
            {results.riskLevel}
          </Badge>
        </div>

        <Link
          href="/portfolio-health"
          className="mt-1 text-sm font-medium text-primary hover:underline"
        >
          View Details &rarr;
        </Link>
      </CardContent>
    </Card>
  );
}
