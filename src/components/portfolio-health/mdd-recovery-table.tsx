"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DrawdownYearAnalysis } from "@/types/calculator";

interface MddRecoveryTableProps {
  data: DrawdownYearAnalysis[];
}

function mddCellClass(mdd: number): string {
  // mdd values are negative (e.g., -0.15 = -15%)
  if (mdd < -0.2) return "text-danger font-semibold";
  if (mdd < -0.1) return "text-warning font-semibold";
  return "text-text";
}

function mddWarning(mdd: number): string {
  if (mdd < -0.2) return " \u26A0\uFE0F";
  return "";
}

export function MddRecoveryTable({ data }: MddRecoveryTableProps) {
  const fmtPct = (v: number) => (v * 100).toFixed(2) + "%";
  const fmtMo = (v: number) => v.toFixed(1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Max Drawdown &amp; Recovery Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-text-muted">
                <th className="px-3 py-2">Year</th>
                <th className="px-3 py-2">Avg MDD (%)</th>
                <th className="px-3 py-2">Worst MDD P5 (%)</th>
                <th className="px-3 py-2">Avg Recovery (mo)</th>
                <th className="px-3 py-2">Worst Recovery (mo)</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.year} className="border-b border-border last:border-0">
                  <td className="px-3 py-2 font-medium text-text">{row.year}</td>
                  <td className={`px-3 py-2 ${mddCellClass(row.avgMDD)}`}>
                    {fmtPct(row.avgMDD)}{mddWarning(row.avgMDD)}
                  </td>
                  <td className={`px-3 py-2 ${mddCellClass(row.worstMDD)}`}>
                    {fmtPct(row.worstMDD)}{mddWarning(row.worstMDD)}
                  </td>
                  <td className="px-3 py-2 text-text">{fmtMo(row.avgRecoveryMonths)}</td>
                  <td className="px-3 py-2 text-text">{fmtMo(row.worstRecoveryMonths)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
