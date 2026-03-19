"use client";

import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { PrivateInputs } from "@/types/calculator";

interface PrivateFormProps {
  values: Partial<PrivateInputs>;
  onChange: (field: string, value: number | string | boolean) => void;
}

export function PrivateForm({ values, onChange }: PrivateFormProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Current Age" type="number" min={18} max={100} value={values.currentAge ?? ""} onChange={(e) => onChange("currentAge", Number(e.target.value))} />
        <Input label="Monthly Salary (THB)" type="number" min={0} value={values.monthlySalary ?? ""} onChange={(e) => onChange("monthlySalary", Number(e.target.value))} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Current Savings (THB)" type="number" min={0} value={values.currentSavings ?? ""} onChange={(e) => onChange("currentSavings", Number(e.target.value))} />
        <Input label="Monthly Contribution (THB)" type="number" min={0} value={values.monthlyContribution ?? ""} onChange={(e) => onChange("monthlyContribution", Number(e.target.value))} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="PVD Rate (%)" type="number" min={0} max={100} step={0.1} value={(values.pvdContributionRate ?? 0.05) * 100} onChange={(e) => onChange("pvdContributionRate", Number(e.target.value) / 100)} />
        <Input label="Employer Match (%)" type="number" min={0} max={100} step={0.1} value={(values.employerMatchRate ?? 0.05) * 100} onChange={(e) => onChange("employerMatchRate", Number(e.target.value) / 100)} />
      </div>
      <div className="flex items-center gap-3">
        <Switch checked={values.hasSocialSecurity ?? true} onCheckedChange={(v) => onChange("hasSocialSecurity", v)} />
        <label className="text-sm text-text">Social Security Active</label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Retirement Age" type="number" min={40} max={100} value={values.retirementAge ?? 60} onChange={(e) => onChange("retirementAge", Number(e.target.value))} />
        <Input label="Life Expectancy" type="number" min={40} max={120} value={values.lifeExpectancy ?? 85} onChange={(e) => onChange("lifeExpectancy", Number(e.target.value))} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Monthly Expenses (THB)" type="number" min={0} value={values.monthlyExpenses ?? ""} onChange={(e) => onChange("monthlyExpenses", Number(e.target.value))} />
        <Input label="Expected Return (%)" type="number" min={0} max={50} step={0.1} value={(values.expectedReturn ?? 0.07) * 100} onChange={(e) => onChange("expectedReturn", Number(e.target.value) / 100)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Inflation Rate (%)" type="number" min={0} max={30} step={0.1} value={(values.inflationRate ?? 0.03) * 100} onChange={(e) => onChange("inflationRate", Number(e.target.value) / 100)} />
        <Input label="Salary Growth Rate (%)" type="number" min={0} max={30} step={0.1} value={(values.salaryGrowthRate ?? 0.04) * 100} onChange={(e) => onChange("salaryGrowthRate", Number(e.target.value) / 100)} />
      </div>
    </div>
  );
}
