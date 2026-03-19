"use client";

import { useTranslations } from "next-intl";
import { TippForm } from "@/components/calculator/tipp/tipp-form";
import { TippStrategyChart } from "@/components/calculator/tipp/tipp-strategy-chart";
import { TippRiskDashboard } from "@/components/calculator/tipp/tipp-risk-dashboard";
import { TippAllocationView } from "@/components/calculator/tipp/tipp-allocation-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTippWorker } from "@/hooks/use-tipp-worker";
import { track, Events } from "@/lib/analytics";
import type { TippInputs } from "@/types/calculator";

export default function TippPage() {
  const t = useTranslations("calculator");
  const { results, isCalculating, calculate } = useTippWorker();

  function handleSimulate(inputs: TippInputs) {
    calculate(inputs);
    track(Events.CALCULATOR_COMPLETED, { type: "tipp" });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text font-heading">
          {t("tipp.title")}
        </h1>
        <p className="text-sm text-text-muted">
          {t("tipp.subtitle")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("tipp.simulationParameters")}</CardTitle>
        </CardHeader>
        <CardContent>
          <TippForm onSimulate={handleSimulate} computing={isCalculating} />
        </CardContent>
      </Card>

      {results && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{t("tipp.wealthPathVsFloor")}</CardTitle>
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
