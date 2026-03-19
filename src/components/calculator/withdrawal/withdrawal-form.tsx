"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { MonteCarloInputs } from "@/types/calculator";

interface WithdrawalFormProps {
  onCalculate: (inputs: MonteCarloInputs) => void;
}

export function WithdrawalForm({ onCalculate }: WithdrawalFormProps) {
  const t = useTranslations("withdrawal");
  const [values, setValues] = useState({
    currentMonthlyExpenses: 30000,
    yearsToRetirement: 0,
    inflationRate: 0.03,
    retirementAge: 60,
    lifeExpectancy: 85,
    lumpSum: 5000000,
    governmentPension: 0,
    annuity: 0,
    portfolioExpectedReturn: 0.005,
    portfolioSD: 0.04,
    inflationExpectedReturn: 0.0025,
    inflationSD: 0.001,
  });

  function handleChange(field: string, value: number) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit() {
    onCalculate(values);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label={t("monthlyExpenses")} type="number" value={values.currentMonthlyExpenses} onChange={(e) => handleChange("currentMonthlyExpenses", Number(e.target.value))} />
        <Input label={t("lumpSum")} type="number" value={values.lumpSum} onChange={(e) => handleChange("lumpSum", Number(e.target.value))} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label={t("retirementAge")} type="number" value={values.retirementAge} onChange={(e) => handleChange("retirementAge", Number(e.target.value))} />
        <Input label={t("lifeExpectancy")} type="number" value={values.lifeExpectancy} onChange={(e) => handleChange("lifeExpectancy", Number(e.target.value))} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label={t("governmentPension")} type="number" value={values.governmentPension} onChange={(e) => handleChange("governmentPension", Number(e.target.value))} />
        <Input label={t("annuity")} type="number" value={values.annuity} onChange={(e) => handleChange("annuity", Number(e.target.value))} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label={t("portfolioReturn")} type="number" value={values.portfolioExpectedReturn * 100} onChange={(e) => handleChange("portfolioExpectedReturn", Number(e.target.value) / 100)} />
        <Input label={t("portfolioSD")} type="number" value={values.portfolioSD * 100} onChange={(e) => handleChange("portfolioSD", Number(e.target.value) / 100)} />
      </div>
      <div className="flex justify-end">
        <Button onClick={handleSubmit}>{t("simulate")}</Button>
      </div>
    </div>
  );
}
