"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { GovernmentInputs } from "@/types/calculator";

interface GovernmentFormProps {
  values: Partial<GovernmentInputs>;
  onChange: (field: string, value: number | string | boolean) => void;
}

export function GovernmentForm({ values, onChange }: GovernmentFormProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Current Age"
          type="number"
          value={values.currentAge ?? ""}
          onChange={(e) => onChange("currentAge", Number(e.target.value))}
        />
        <Input
          label="Monthly Salary (THB)"
          type="number"
          value={values.monthlySalary ?? ""}
          onChange={(e) => onChange("monthlySalary", Number(e.target.value))}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Current Savings (THB)"
          type="number"
          value={values.currentSavings ?? ""}
          onChange={(e) => onChange("currentSavings", Number(e.target.value))}
        />
        <Input
          label="Monthly Contribution (THB)"
          type="number"
          value={values.monthlyContribution ?? ""}
          onChange={(e) => onChange("monthlyContribution", Number(e.target.value))}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Current GPF Value (THB)"
          type="number"
          value={values.currentGpfValue ?? ""}
          onChange={(e) => onChange("currentGpfValue", Number(e.target.value))}
        />
        <Input
          label="GPF Contribution Rate (%)"
          type="number"
          value={(values.gpfContributionRate ?? 0.03) * 100}
          onChange={(e) => onChange("gpfContributionRate", Number(e.target.value) / 100)}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Retirement Age"
          type="number"
          value={values.retirementAge ?? 60}
          onChange={(e) => onChange("retirementAge", Number(e.target.value))}
        />
        <Input
          label="Life Expectancy"
          type="number"
          value={values.lifeExpectancy ?? 85}
          onChange={(e) => onChange("lifeExpectancy", Number(e.target.value))}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Monthly Expenses (THB)"
          type="number"
          value={values.monthlyExpenses ?? ""}
          onChange={(e) => onChange("monthlyExpenses", Number(e.target.value))}
        />
        <Input
          label="Expected Return (%)"
          type="number"
          value={(values.expectedReturn ?? 0.06) * 100}
          onChange={(e) => onChange("expectedReturn", Number(e.target.value) / 100)}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Inflation Rate (%)"
          type="number"
          value={(values.inflationRate ?? 0.03) * 100}
          onChange={(e) => onChange("inflationRate", Number(e.target.value) / 100)}
        />
        <Input
          label="Salary Growth Rate (%)"
          type="number"
          value={(values.salaryGrowthRate ?? 0.03) * 100}
          onChange={(e) => onChange("salaryGrowthRate", Number(e.target.value) / 100)}
        />
      </div>
    </div>
  );
}
