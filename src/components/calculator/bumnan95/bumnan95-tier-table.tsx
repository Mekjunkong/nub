"use client";

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
  const recommendedIdx = tiers.findIndex((t) => t.status === "STRONG" || t.status === "SECURED");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pension Goal Matrix</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-text-muted">
                <th className="pb-2 pr-4">Monthly Pension</th>
                <th className="pb-2 pr-4">Success Rate</th>
                <th className="pb-2 pr-4">Required Portfolio</th>
                <th className="pb-2 pr-4">Monthly Saving</th>
                <th className="pb-2">Status</th>
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
                      <span className="ml-2 text-xs text-primary">Recommended</span>
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
