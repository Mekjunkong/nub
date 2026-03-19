"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GpfDrawdownYear } from "@/types/calculator";

interface GpfDrawdownTableProps {
  data: GpfDrawdownYear[];
}

function mddColor(mdd: number): string {
  // mdd is negative (e.g. -0.05 = -5%)
  if (mdd > -0.05) return "text-success";
  if (mdd > -0.15) return "text-warning";
  return "text-danger";
}

export function GpfDrawdownTable({ data }: GpfDrawdownTableProps) {
  const t = useTranslations("calculator");
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("gpfOptimizer.drawdownAnalysis")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-2 text-left font-medium text-text-muted">{t("gpfOptimizer.year")}</th>
                <th className="pb-2 text-right font-medium text-text-muted">{t("gpfOptimizer.avgMDD")} (%)</th>
                <th className="pb-2 text-right font-medium text-text-muted">{t("gpfOptimizer.worstMDD")} (%)</th>
                <th className="pb-2 text-right font-medium text-text-muted">{t("gpfOptimizer.recovery")}</th>
                <th className="pb-2 text-center font-medium text-text-muted">{t("gpfOptimizer.alert")}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.year} className="border-b border-border/50">
                  <td className="py-3 text-text">{row.year}</td>
                  <td className={`py-3 text-right font-medium ${mddColor(row.avgMDD)}`}>
                    {(row.avgMDD * 100).toFixed(2)}%
                  </td>
                  <td className={`py-3 text-right font-medium ${mddColor(row.worstMDD)}`}>
                    {(row.worstMDD * 100).toFixed(2)}%
                  </td>
                  <td className="py-3 text-right text-text">
                    {row.recoveryMonths}
                  </td>
                  <td className="py-3 text-center">
                    {row.worstMDD < -0.20 && (
                      <span
                        role="img"
                        aria-label="Warning: worst drawdown exceeds 20%"
                        className="text-danger"
                      >
                        &#9888;
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
