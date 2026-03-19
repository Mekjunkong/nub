"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Bumnan95Inputs } from "@/types/calculator";

interface Bumnan95FormProps {
  onCalculate: (inputs: Bumnan95Inputs) => void;
  computing: boolean;
}

export function Bumnan95Form({ onCalculate, computing }: Bumnan95FormProps) {
  const [values, setValues] = useState({
    currentAge: 33,
    retirementAge: 60,
    lifeExpectancy: 95,
    monthlyExpenses: 61392,
    inflationRate: 2.5,
    portfolioReturn: 6,
    portfolioSD: 12,
    currentSavings: 500000,
    governmentPension: 30520,
    gender: "male" as "male" | "female",
    annuityStartAge: 60,
    annuityPaymentYears: 26,
    annuityRate: 0.82,
    simulations: 1000,
  });

  function handleChange(field: string, value: number | string) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit() {
    onCalculate({
      ...values,
      inflationRate: values.inflationRate / 100,
      portfolioReturn: values.portfolioReturn / 100,
      portfolioSD: values.portfolioSD / 100,
      annuityRate: values.annuityRate / 100,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Planning Parameters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Current Age" type="number" value={values.currentAge} onChange={(e) => handleChange("currentAge", Number(e.target.value))} />
            <Input label="Retirement Age" type="number" value={values.retirementAge} onChange={(e) => handleChange("retirementAge", Number(e.target.value))} />
            <Input label="Life Expectancy" type="number" value={values.lifeExpectancy} onChange={(e) => handleChange("lifeExpectancy", Number(e.target.value))} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Monthly Expenses (฿)" type="number" value={values.monthlyExpenses} onChange={(e) => handleChange("monthlyExpenses", Number(e.target.value))} />
            <Input label="Current Savings (฿)" type="number" value={values.currentSavings} onChange={(e) => handleChange("currentSavings", Number(e.target.value))} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Inflation Rate (%)" type="number" value={values.inflationRate} onChange={(e) => handleChange("inflationRate", Number(e.target.value))} />
            <Input label="Portfolio Return (%)" type="number" value={values.portfolioReturn} onChange={(e) => handleChange("portfolioReturn", Number(e.target.value))} />
            <Input label="Portfolio SD (%)" type="number" value={values.portfolioSD} onChange={(e) => handleChange("portfolioSD", Number(e.target.value))} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Government Pension (฿/month)" type="number" value={values.governmentPension} onChange={(e) => handleChange("governmentPension", Number(e.target.value))} />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text">Gender</label>
              <select className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text" value={values.gender} onChange={(e) => handleChange("gender", e.target.value)}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Annuity Start Age" type="number" value={values.annuityStartAge} onChange={(e) => handleChange("annuityStartAge", Number(e.target.value))} />
            <Input label="Payment Years" type="number" value={values.annuityPaymentYears} onChange={(e) => handleChange("annuityPaymentYears", Number(e.target.value))} />
            <Input label="Annuity Rate (%)" type="number" value={values.annuityRate} onChange={(e) => handleChange("annuityRate", Number(e.target.value))} />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSubmit} loading={computing}>Calculate</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
