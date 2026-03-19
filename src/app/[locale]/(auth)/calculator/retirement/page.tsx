"use client";

import { useState, useCallback, useRef } from "react";
import { EmploymentSelector } from "@/components/calculator/retirement/employment-selector";
import { GovernmentForm } from "@/components/calculator/retirement/government-form";
import { PrivateForm } from "@/components/calculator/retirement/private-form";
import { FreelanceForm } from "@/components/calculator/retirement/freelance-form";
import { RetirementResults } from "@/components/calculator/retirement/retirement-results";
import { WhatIfSliders } from "@/components/calculator/retirement/what-if-sliders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateRetirement } from "@/workers/retirement-planner.worker";
import { track, Events } from "@/lib/analytics";
import type { RetirementInputs, RetirementResults as Results } from "@/types/calculator";
import type { EmploymentType } from "@/types/database";

interface RetirementFormValues {
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  monthlySalary: number;
  monthlyExpenses: number;
  currentSavings: number;
  monthlyContribution: number;
  expectedReturn: number;
  inflationRate: number;
  salaryGrowthRate: number;
  legacyAmount: number;
  hasInsurance: boolean;
  hasDiversifiedPortfolio: boolean;
  // Government
  gpfContributionRate?: number;
  currentGpfValue?: number;
  serviceStartYear?: number;
  positionLevel?: number;
  // Private
  pvdContributionRate?: number;
  employerMatchRate?: number;
  hasSocialSecurity?: boolean;
  // Freelance
  section40SocialSecurity?: boolean;
}

const defaults: RetirementFormValues = {
  currentAge: 30,
  retirementAge: 60,
  lifeExpectancy: 85,
  monthlySalary: 40000,
  monthlyExpenses: 25000,
  currentSavings: 200000,
  monthlyContribution: 5000,
  expectedReturn: 0.06,
  inflationRate: 0.03,
  salaryGrowthRate: 0.03,
  legacyAmount: 0,
  hasInsurance: false,
  hasDiversifiedPortfolio: false,
};

export default function RetirementPlannerPage() {
  const [employmentType, setEmploymentType] = useState<EmploymentType | null>(null);
  const [formValues, setFormValues] = useState<RetirementFormValues>(defaults);
  const [results, setResults] = useState<Results | null>(null);
  const [calculating, setCalculating] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  function handleFieldChange(field: string, value: number | string | boolean) {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  }

  const handleCalculate = useCallback(() => {
    if (!employmentType) return;
    setCalculating(true);

    const inputs = buildInputs(employmentType, formValues);
    const result = calculateRetirement(inputs);
    setResults(result);
    track(Events.CALCULATOR_COMPLETED, { type: "retirement" });
    setCalculating(false);
  }, [employmentType, formValues]);

  function handleWhatIf(field: string, value: number) {
    const updated = { ...formValues, [field]: value };
    setFormValues(updated);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (employmentType) {
        const inputs = buildInputs(employmentType, updated);
        setResults(calculateRetirement(inputs));
      }
    }, 150);
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="page-header-gradient">
        <h1 className="text-2xl font-bold font-heading">
          Retirement Planner
        </h1>
        <p className="text-sm mt-1 text-white/80">
          Analyze your retirement gap and plan for a secure future
        </p>
      </div>

      {/* Step 1: Employment type */}
      <Card>
        <CardHeader>
          <CardTitle>Select Your Employment Type</CardTitle>
        </CardHeader>
        <CardContent>
          <EmploymentSelector onSelect={setEmploymentType} selected={employmentType} />
        </CardContent>
      </Card>

      {/* Step 2: Form */}
      {employmentType && (
        <Card>
          <CardHeader>
            <CardTitle>Your Details</CardTitle>
          </CardHeader>
          <CardContent>
            {employmentType === "government" && (
              <GovernmentForm values={formValues} onChange={handleFieldChange} />
            )}
            {employmentType === "private" && (
              <PrivateForm values={formValues} onChange={handleFieldChange} />
            )}
            {employmentType === "freelance" && (
              <FreelanceForm values={formValues} onChange={handleFieldChange} />
            )}
            <div className="mt-6 flex justify-end">
              <Button onClick={handleCalculate} loading={calculating}>
                Calculate
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Results */}
      {results && (
        <div className="stagger-children flex flex-col gap-6">
          <RetirementResults results={results} />
          <WhatIfSliders
            retirementAge={formValues.retirementAge}
            monthlyContribution={formValues.monthlyContribution}
            expectedReturn={formValues.expectedReturn}
            onChange={handleWhatIf}
          />
        </div>
      )}
    </div>
  );
}

function buildInputs(
  type: EmploymentType,
  values: RetirementFormValues
): RetirementInputs {
  const base = {
    currentAge: values.currentAge ?? 30,
    retirementAge: values.retirementAge ?? 60,
    lifeExpectancy: values.lifeExpectancy ?? 85,
    monthlySalary: values.monthlySalary ?? 40000,
    monthlyExpenses: values.monthlyExpenses ?? 25000,
    currentSavings: values.currentSavings ?? 200000,
    monthlyContribution: values.monthlyContribution ?? 5000,
    expectedReturn: values.expectedReturn ?? 0.06,
    inflationRate: values.inflationRate ?? 0.03,
    salaryGrowthRate: values.salaryGrowthRate ?? 0.03,
    legacyAmount: values.legacyAmount ?? 0,
    hasInsurance: values.hasInsurance ?? false,
    hasDiversifiedPortfolio: values.hasDiversifiedPortfolio ?? false,
  };

  if (type === "government") {
    return {
      ...base,
      employmentType: "government",
      gpfContributionRate: values.gpfContributionRate ?? 0.03,
      currentGpfValue: values.currentGpfValue ?? 0,
      serviceStartYear: values.serviceStartYear ?? 2020,
      positionLevel: values.positionLevel ?? 5,
    };
  }
  if (type === "private") {
    return {
      ...base,
      employmentType: "private",
      pvdContributionRate: values.pvdContributionRate ?? 0.05,
      employerMatchRate: values.employerMatchRate ?? 0.05,
      hasSocialSecurity: values.hasSocialSecurity ?? true,
    };
  }
  return {
    ...base,
    employmentType: "freelance",
    section40SocialSecurity: values.section40SocialSecurity ?? false,
  };
}
