"use client";

import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { FreelanceInputs } from "@/types/calculator";

interface FreelanceFormProps {
  values: Partial<FreelanceInputs>;
  onChange: (field: string, value: number | string | boolean) => void;
}

export function FreelanceForm({ values, onChange }: FreelanceFormProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Current Age" type="number" value={values.currentAge ?? ""} onChange={(e) => onChange("currentAge", Number(e.target.value))} />
        <Input label="Monthly Income (THB)" type="number" value={values.monthlySalary ?? ""} onChange={(e) => onChange("monthlySalary", Number(e.target.value))} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Current Savings (THB)" type="number" value={values.currentSavings ?? ""} onChange={(e) => onChange("currentSavings", Number(e.target.value))} />
        <Input label="Monthly Savings (THB)" type="number" value={values.monthlyContribution ?? ""} onChange={(e) => onChange("monthlyContribution", Number(e.target.value))} />
      </div>
      <div className="flex items-center gap-3">
        <Switch checked={values.section40SocialSecurity ?? false} onCheckedChange={(v) => onChange("section40SocialSecurity", v)} />
        <label className="text-sm text-text">Section 40 Social Security</label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Retirement Age" type="number" value={values.retirementAge ?? 60} onChange={(e) => onChange("retirementAge", Number(e.target.value))} />
        <Input label="Life Expectancy" type="number" value={values.lifeExpectancy ?? 85} onChange={(e) => onChange("lifeExpectancy", Number(e.target.value))} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Monthly Expenses (THB)" type="number" value={values.monthlyExpenses ?? ""} onChange={(e) => onChange("monthlyExpenses", Number(e.target.value))} />
        <Input label="Expected Return (%)" type="number" value={(values.expectedReturn ?? 0.06) * 100} onChange={(e) => onChange("expectedReturn", Number(e.target.value) / 100)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Inflation Rate (%)" type="number" value={(values.inflationRate ?? 0.03) * 100} onChange={(e) => onChange("inflationRate", Number(e.target.value) / 100)} />
        <Input label="Income Growth Rate (%)" type="number" value={(values.salaryGrowthRate ?? 0.02) * 100} onChange={(e) => onChange("salaryGrowthRate", Number(e.target.value) / 100)} />
      </div>
    </div>
  );
}
