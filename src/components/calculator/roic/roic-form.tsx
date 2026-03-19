"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { RoicInputs } from "@/lib/roic-math";

interface RoicFormProps {
  onCalculate: (inputs: RoicInputs) => void;
}

export function RoicForm({ onCalculate }: RoicFormProps) {
  const t = useTranslations("calculator");
  const [ticker, setTicker] = useState("");
  const [ebit, setEbit] = useState("");
  const [taxRate, setTaxRate] = useState("20");
  const [totalAssets, setTotalAssets] = useState("");
  const [currentLiabilities, setCurrentLiabilities] = useState("");
  const [cashAndEquivalents, setCashAndEquivalents] = useState("");
  const [netIncome, setNetIncome] = useState("");
  const [operatingCashFlow, setOperatingCashFlow] = useState("");
  const [wacc, setWacc] = useState("8");
  const [growthRate, setGrowthRate] = useState("2");

  const growthError =
    Number(growthRate) >= Number(wacc)
      ? t("roic.growthRateError")
      : undefined;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (growthError) return;

    onCalculate({
      ticker,
      ebit: Number(ebit),
      taxRate: Number(taxRate) / 100,
      totalAssets: Number(totalAssets),
      currentLiabilities: Number(currentLiabilities),
      cashAndEquivalents: Number(cashAndEquivalents),
      netIncome: Number(netIncome),
      operatingCashFlow: Number(operatingCashFlow),
      wacc: Number(wacc) / 100,
      growthRate: Number(growthRate) / 100,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("roic.inputSection")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label={t("roic.ticker")}
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            placeholder="e.g. MEGA"
          />
          <Input
            label={t("roic.ebit")}
            type="number"
            value={ebit}
            onChange={(e) => setEbit(e.target.value)}
          />
          <Input
            label={`${t("roic.taxRate")} (%)`}
            type="number"
            value={taxRate}
            onChange={(e) => setTaxRate(e.target.value)}
          />
          <Input
            label={t("roic.totalAssets")}
            type="number"
            value={totalAssets}
            onChange={(e) => setTotalAssets(e.target.value)}
          />
          <Input
            label={t("roic.currentLiabilities")}
            type="number"
            value={currentLiabilities}
            onChange={(e) => setCurrentLiabilities(e.target.value)}
          />
          <Input
            label={t("roic.cash")}
            type="number"
            value={cashAndEquivalents}
            onChange={(e) => setCashAndEquivalents(e.target.value)}
          />
          <Input
            label={t("roic.netIncome")}
            type="number"
            value={netIncome}
            onChange={(e) => setNetIncome(e.target.value)}
          />
          <Input
            label={t("roic.operatingCashFlow")}
            type="number"
            value={operatingCashFlow}
            onChange={(e) => setOperatingCashFlow(e.target.value)}
          />
          <Input
            label={`${t("roic.wacc")} (%)`}
            type="number"
            value={wacc}
            onChange={(e) => setWacc(e.target.value)}
          />
          <Input
            label={`${t("roic.growthRate")} (%)`}
            type="number"
            value={growthRate}
            onChange={(e) => setGrowthRate(e.target.value)}
            error={growthError}
          />
          <div className="sm:col-span-2 flex justify-end">
            <Button type="submit" disabled={!!growthError}>
              {t("roic.analyze")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
