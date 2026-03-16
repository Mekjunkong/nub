"use client";

import { Landmark, Briefcase, Laptop } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EmploymentType } from "@/types/database";

interface EmploymentSelectorProps {
  onSelect: (type: EmploymentType) => void;
  selected: EmploymentType | null;
}

const options: {
  value: EmploymentType;
  label: string;
  labelTh: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "government",
    label: "Government Officer",
    labelTh: "ข้าราชการ",
    description: "GPF, pension, government benefits",
    icon: <Landmark className="h-6 w-6" />,
  },
  {
    value: "private",
    label: "Private Sector",
    labelTh: "พนักงานเอกชน",
    description: "PVD, employer match, social security",
    icon: <Briefcase className="h-6 w-6" />,
  },
  {
    value: "freelance",
    label: "Freelance / Self-employed",
    labelTh: "ฟรีแลนซ์ / อาชีพอิสระ",
    description: "Section 40, personal savings",
    icon: <Laptop className="h-6 w-6" />,
  },
];

export function EmploymentSelector({
  onSelect,
  selected,
}: EmploymentSelectorProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          data-testid={`employment-${opt.value}`}
          onClick={() => onSelect(opt.value)}
          className={cn(
            "flex flex-col items-center gap-3 rounded-2xl border-2 p-6 text-center transition-all",
            selected === opt.value
              ? "border-primary bg-primary/5"
              : "border-border hover:border-border-hover hover:bg-surface-hover"
          )}
        >
          <div
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-xl",
              selected === opt.value ? "bg-primary/10 text-primary" : "bg-surface-hover text-text-muted"
            )}
          >
            {opt.icon}
          </div>
          <div>
            <p className="font-semibold text-text">{opt.label}</p>
            <p className="text-sm text-text-muted">{opt.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
