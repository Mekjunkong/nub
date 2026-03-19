"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RebalancedPathEntry } from "@/types/calculator";

interface StressRebalanceLogProps {
  data: RebalancedPathEntry[];
}

export function StressRebalanceLog({ data }: StressRebalanceLogProps) {
  const t = useTranslations("stress_test");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("rebalanceLog")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-surface">
              <tr className="border-b border-border text-left text-text-muted">
                <th className="pb-2 pr-4">{t("month")}</th>
                <th className="pb-2 pr-4">{t("action")}</th>
                <th className="pb-2 pr-4">{t("totalWealth")}</th>
                <th className="pb-2">{t("drawdown")}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((entry) => (
                <tr
                  key={entry.month}
                  className={`border-b border-border/50 ${entry.action === "DCA+Rebal" ? "bg-primary/5" : ""}`}
                >
                  <td className="py-1.5 pr-4 text-text">{entry.month}</td>
                  <td className="py-1.5 pr-4">
                    <span className={entry.action === "DCA+Rebal" ? "font-medium text-primary" : "text-text-muted"}>
                      {entry.action === "DCA+Rebal" ? "DCA+Rebal ⚖️" : "DCA 💰"}
                    </span>
                  </td>
                  <td className="py-1.5 pr-4 text-text">฿{entry.totalWealth.toLocaleString()}</td>
                  <td className="py-1.5">
                    <span className={entry.drawdown < -10 ? "text-danger" : entry.drawdown < -5 ? "text-warning" : "text-text-muted"}>
                      {entry.drawdown.toFixed(1)}%
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
