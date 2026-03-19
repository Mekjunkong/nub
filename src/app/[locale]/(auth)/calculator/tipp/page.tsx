"use client";

import { TippForm } from "@/components/calculator/tipp/tipp-form";
import { TippStrategyChart } from "@/components/calculator/tipp/tipp-strategy-chart";
import { TippRiskDashboard } from "@/components/calculator/tipp/tipp-risk-dashboard";
import { TippAllocationView } from "@/components/calculator/tipp/tipp-allocation-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTippWorker } from "@/hooks/use-tipp-worker";
import type { TippInputs } from "@/types/calculator";

export default function TippPage() {
  const { results, isCalculating, calculate } = useTippWorker();

  function handleSimulate(inputs: TippInputs) {
    calculate(inputs);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text font-heading">
          TIPP/VPPI Portfolio Protection
        </h1>
        <p className="text-sm text-text-muted">
          Simulate time-invariant portfolio protection with a ratcheting floor
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Simulation Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <TippForm onSimulate={handleSimulate} computing={isCalculating} />
        </CardContent>
      </Card>

      {results && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Wealth Path vs Floor</CardTitle>
            </CardHeader>
            <CardContent>
              <TippStrategyChart wealthPath={results.wealthPath} />
            </CardContent>
          </Card>

          <TippRiskDashboard results={results} />

          <TippAllocationView
            riskyWeight={results.riskyWeight}
            safeWeight={results.safeWeight}
            currentMultiplier={results.currentMultiplier}
            finalWealth={results.finalWealth}
            initialCapital={results.wealthPath[0]?.wealth ?? 0}
          />
        </>
      )}
    </div>
  );
}
