"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Bumnan95Tier } from "@/types/calculator";

interface Bumnan95TierTableProps {
  tiers: Bumnan95Tier[];
}

const STATUS_VARIANT: Record<string, "danger" | "warning" | "primary" | "success"> = {
  RISKY: "danger",
  MODERATE: "warning",
  STRONG: "primary",
  SECURED: "success",
};

export function Bumnan95TierTable({ tiers }: Bumnan95TierTableProps) {
  const t = useTranslations("calculator");
  const recommendedIdx = tiers.findIndex((tier) => tier.status === "STRONG" || tier.status === "SECURED");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("bumnan95.tierTable")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-text-muted">
                <th className="pb-2 pr-4">{t("bumnan95.monthlyPension")}</th>
                <th className="pb-2 pr-4">{t("bumnan95.successRate")}</th>
                <th className="pb-2 pr-4">{t("bumnan95.requiredPortfolio")}</th>
                <th className="pb-2 pr-4">{t("bumnan95.monthlySaving")}</th>
                <th className="pb-2">{t("bumnan95.status")}</th>
              </tr>
            </thead>
            <tbody>
              {tiers.map((tier, i) => (
                <tr
                  key={i}
                  className={`border-b border-border/50 ${i === recommendedIdx ? "bg-primary/5" : ""}`}
                >
                  <td className="py-3 pr-4 font-medium text-text">
                    ฿{tier.monthlyPension.toLocaleString()}
                    {i === recommendedIdx && (
                      <span className="ml-2 text-xs text-primary">{t("bumnan95.recommended")}</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-text">{tier.successRate}%</td>
                  <td className="py-3 pr-4 text-text">฿{tier.requiredPortfolio.toLocaleString()}</td>
                  <td className="py-3 pr-4 text-text">฿{tier.monthlySaving.toLocaleString()}/mo</td>
                  <td className="py-3">
                    <Badge variant={STATUS_VARIANT[tier.status]}>{tier.status}</Badge>
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
