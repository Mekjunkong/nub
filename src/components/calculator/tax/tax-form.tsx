"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { TaxInputs } from "@/types/calculator";

interface TaxFormProps {
  onCalculate: (inputs: TaxInputs) => void;
}

export function TaxForm({ onCalculate }: TaxFormProps) {
  const [values, setValues] = useState<TaxInputs>({
    annualIncome: 1000000,
    ssfAmount: 0,
    rmfAmount: 0,
    lifeInsurance: 0,
    healthInsurance: 0,
    pensionInsurance: 0,
    pvdContribution: 0,
    socialSecurityContribution: 9000,
  });

  function handleChange(field: string, value: number) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="flex flex-col gap-4">
      <Input label="Annual Income (THB)" type="number" value={values.annualIncome} onChange={(e) => handleChange("annualIncome", Number(e.target.value))} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="SSF Amount (THB)" type="number" value={values.ssfAmount} onChange={(e) => handleChange("ssfAmount", Number(e.target.value))} />
        <Input label="RMF Amount (THB)" type="number" value={values.rmfAmount} onChange={(e) => handleChange("rmfAmount", Number(e.target.value))} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Life Insurance (THB)" type="number" value={values.lifeInsurance} onChange={(e) => handleChange("lifeInsurance", Number(e.target.value))} />
        <Input label="Health Insurance (THB)" type="number" value={values.healthInsurance} onChange={(e) => handleChange("healthInsurance", Number(e.target.value))} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Provident Fund (THB)" type="number" value={values.pvdContribution} onChange={(e) => handleChange("pvdContribution", Number(e.target.value))} />
        <Input label="Social Security (THB)" type="number" value={values.socialSecurityContribution} onChange={(e) => handleChange("socialSecurityContribution", Number(e.target.value))} />
      </div>
      <div className="flex justify-end">
        <Button onClick={() => onCalculate(values)}>Optimize Tax</Button>
      </div>
    </div>
  );
}
