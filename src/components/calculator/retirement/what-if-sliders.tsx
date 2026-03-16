"use client";

import { Slider } from "@/components/ui/slider";

interface WhatIfSlidersProps {
  retirementAge: number;
  monthlyContribution: number;
  expectedReturn: number;
  onChange: (field: string, value: number) => void;
}

export function WhatIfSliders({
  retirementAge,
  monthlyContribution,
  expectedReturn,
  onChange,
}: WhatIfSlidersProps) {
  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-border bg-surface p-6">
      <h3 className="text-lg font-semibold text-text font-heading">
        What If...
      </h3>
      <Slider
        label="Retirement Age"
        value={retirementAge}
        min={50}
        max={70}
        step={1}
        onChange={(e) =>
          onChange("retirementAge", Number(e.target.value))
        }
        formatValue={(v) => `${v} years`}
      />
      <Slider
        label="Monthly Savings"
        value={monthlyContribution}
        min={0}
        max={100000}
        step={1000}
        onChange={(e) =>
          onChange("monthlyContribution", Number(e.target.value))
        }
        formatValue={(v) =>
          new Intl.NumberFormat("th-TH").format(v) + " THB"
        }
      />
      <Slider
        label="Expected Return"
        value={expectedReturn * 100}
        min={1}
        max={15}
        step={0.5}
        onChange={(e) =>
          onChange("expectedReturn", Number(e.target.value) / 100)
        }
        formatValue={(v) => `${v.toFixed(1)}%`}
      />
    </div>
  );
}
