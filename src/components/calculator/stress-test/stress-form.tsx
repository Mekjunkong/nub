"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { StressTestInputs } from "@/types/calculator";

interface StressFormProps {
  onCalculate: (inputs: StressTestInputs) => void;
}

export function StressForm({ onCalculate }: StressFormProps) {
  const t = useTranslations("stress_test");
  const [values, setValues] = useState<StressTestInputs>({
    expectedReturn: 0.005,
    sd: 0.04,
    periods: 60,
    dcaAmount: 10000,
    bonusAmount: 0,
    bonusFrequency: 0,
    targetReturn: 1.0,
    varStartPeriod: 5,
    blackSwanStartPeriod: 10,
    blackSwanConsecutivePeriods: 3,
    simulations: 1000,
  });

  function handleChange(field: string, value: number) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label={t("expectedReturn")} type="number" min={0} max={50} step={0.1} value={values.expectedReturn * 100} onChange={(e) => handleChange("expectedReturn", Number(e.target.value) / 100)} />
        <Input label={t("standardDeviation")} type="number" min={0} max={100} step={0.1} value={values.sd * 100} onChange={(e) => handleChange("sd", Number(e.target.value) / 100)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label={t("periods")} type="number" min={1} max={600} value={values.periods} onChange={(e) => handleChange("periods", Number(e.target.value))} />
        <Input label={t("dcaAmount")} type="number" min={0} value={values.dcaAmount} onChange={(e) => handleChange("dcaAmount", Number(e.target.value))} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label={t("varStartPeriod")} type="number" min={0} value={values.varStartPeriod} onChange={(e) => handleChange("varStartPeriod", Number(e.target.value))} />
        <Input label={t("blackSwanStart")} type="number" min={0} value={values.blackSwanStartPeriod} onChange={(e) => handleChange("blackSwanStartPeriod", Number(e.target.value))} />
      </div>
      <Input label={t("blackSwanDuration")} type="number" min={0} value={values.blackSwanConsecutivePeriods} onChange={(e) => handleChange("blackSwanConsecutivePeriods", Number(e.target.value))} />
      <div className="flex justify-end">
        <Button onClick={() => onCalculate(values)}>{t("runStressTest")}</Button>
      </div>
    </div>
  );
}
