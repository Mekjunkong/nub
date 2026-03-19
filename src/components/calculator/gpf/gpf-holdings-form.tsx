"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GpfOptimizerInputs } from "@/types/calculator";

interface GpfHoldingsFormProps {
  onOptimize: (inputs: GpfOptimizerInputs) => void;
  computing: boolean;
}

const ASSET_ASSUMPTIONS = [
  { name: "Bond Plan (แผนตราสารหนี้)", expectedReturn: "2.5%", sd: "1.26%" },
  { name: "Foreign Equity Plan (แผนหุ้นต่างประเทศ)", expectedReturn: "8.0%", sd: "12.04%" },
  { name: "Gold Plan (แผนทองคำ)", expectedReturn: "5.0%", sd: "15.17%" },
];

export function GpfHoldingsForm({ onOptimize, computing }: GpfHoldingsFormProps) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>GPF Holdings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Bond Plan (THB)"
              type="number"
              min={0}
              value={bondPlan || ""}
              onChange={(e) => setBondPlan(Number(e.target.value))}
            />
            <Input
              label="Foreign Equity Plan (THB)"
              type="number"
              min={0}
              value={equityPlan || ""}
              onChange={(e) => setEquityPlan(Number(e.target.value))}
            />
            <Input
              label="Gold Plan (THB)"
              type="number"
              min={0}
              value={goldPlan || ""}
              onChange={(e) => setGoldPlan(Number(e.target.value))}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Monthly Contribution (THB)"
              type="number"
              min={0}
              value={monthlyContribution || ""}
              onChange={(e) => setMonthlyContribution(Number(e.target.value))}
            />
            <Input
              label="Investment Horizon (Years)"
              type="number"
              min={1}
              max={40}
              value={investmentYears || ""}
              onChange={(e) => setInvestmentYears(Number(e.target.value))}
            />
          </div>

          {/* Read-only asset assumptions */}
          <div className="rounded-lg border border-border bg-surface-hover/50 p-4">
            <p className="mb-2 text-sm font-medium text-text">Asset Assumptions</p>
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
              Optimize Portfolio
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
