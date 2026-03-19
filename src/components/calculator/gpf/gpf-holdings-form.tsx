"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GpfOptimizerInputs } from "@/types/calculator";

interface GpfHoldingsFormProps {
  onOptimize: (inputs: GpfOptimizerInputs) => void;
  computing: boolean;
}

export function GpfHoldingsForm({ onOptimize, computing }: GpfHoldingsFormProps) {
  const t = useTranslations("calculator");
  const [bondPlan, setBondPlan] = useState(0);
  const [equityPlan, setEquityPlan] = useState(0);
  const [goldPlan, setGoldPlan] = useState(0);
  const [monthlyContribution, setMonthlyContribution] = useState(5000);
  const [investmentYears, setInvestmentYears] = useState(20);

  function handleSubmit() {
    onOptimize({
      currentHoldings: { bondPlan, equityPlan, goldPlan },
      monthlyContribution,
      investmentYears,
      riskFreeRate: 0.025,
      assetReturns: [0.025, 0.08, 0.05],
      assetSDs: [0.0126, 0.1204, 0.1517],
      correlationMatrix: [
        [1.0, 0.15, 0.14],
        [0.15, 1.0, 0.10],
        [0.14, 0.10, 1.0],
      ],
      rebalanceFrequency: 12,
      simulations: 1000,
    });
  }

  const ASSET_ASSUMPTIONS = [
    { name: t("gpfOptimizer.bondPlan"), expectedReturn: "2.5%", sd: "1.26%" },
    { name: t("gpfOptimizer.equityPlan"), expectedReturn: "8.0%", sd: "12.04%" },
    { name: t("gpfOptimizer.goldPlan"), expectedReturn: "5.0%", sd: "15.17%" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("gpfOptimizer.currentHoldings")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label={`${t("gpfOptimizer.bondPlan")} (THB)`}
              type="number"
              min={0}
              value={bondPlan || ""}
              onChange={(e) => setBondPlan(Number(e.target.value))}
            />
            <Input
              label={`${t("gpfOptimizer.equityPlan")} (THB)`}
              type="number"
              min={0}
              value={equityPlan || ""}
              onChange={(e) => setEquityPlan(Number(e.target.value))}
            />
            <Input
              label={`${t("gpfOptimizer.goldPlan")} (THB)`}
              type="number"
              min={0}
              value={goldPlan || ""}
              onChange={(e) => setGoldPlan(Number(e.target.value))}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={`${t("gpfOptimizer.contribution")} (THB)`}
              type="number"
              min={0}
              value={monthlyContribution || ""}
              onChange={(e) => setMonthlyContribution(Number(e.target.value))}
            />
            <Input
              label={t("gpfOptimizer.horizon")}
              type="number"
              min={1}
              max={40}
              value={investmentYears || ""}
              onChange={(e) => setInvestmentYears(Number(e.target.value))}
            />
          </div>

          {/* Read-only asset assumptions */}
          <div className="rounded-lg border border-border bg-surface-hover/50 p-4">
            <p className="mb-2 text-sm font-medium text-text">{t("gpfOptimizer.assetAssumptions")}</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {ASSET_ASSUMPTIONS.map((asset) => (
                <div key={asset.name} className="text-xs text-text-muted">
                  <p className="font-medium text-text-secondary">{asset.name}</p>
                  <p>E(R): {asset.expectedReturn} | SD: {asset.sd}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSubmit} loading={computing}>
              {t("gpfOptimizer.optimize")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
