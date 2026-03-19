"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TimelineRiskEntry } from "@/types/calculator";

interface StressTimelineRiskProps {
  data: TimelineRiskEntry[];
}

export function StressTimelineRisk({ data }: StressTimelineRiskProps) {
  const t = useTranslations("stress_test");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("timelineRisk")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-text-muted">
                <th className="pb-2 pr-4">{t("year")}</th>
                <th className="pb-2 pr-4">{t("principal")}</th>
                <th className="pb-2 pr-4">{t("probOfLoss")}</th>
                <th className="pb-2">{t("probOfDoubling")}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((entry) => (
                <tr key={entry.year} className="border-b border-border/50">
                  <td className="py-2 pr-4 font-medium text-text">{entry.year}</td>
                  <td className="py-2 pr-4 text-text">฿{entry.principal.toLocaleString()}</td>
                  <td className="py-2 pr-4">
                    <span className={entry.probOfLoss > 0.5 ? "font-bold text-danger" : entry.probOfLoss > 0.2 ? "text-warning" : "text-text"}>
                      {(entry.probOfLoss * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-2">
                    <span className={entry.probOfDoubling > 0.2 ? "font-bold text-success" : "text-text"}>
                      {(entry.probOfDoubling * 100).toFixed(1)}%
                    </span>
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
