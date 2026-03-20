"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Check } from "lucide-react";
import {
  planResultFields,
  getNestedValue,
  formatResultValue,
} from "@/lib/plan-result-fields";
import type { PlanType } from "@/types/database";
import { cn } from "@/lib/utils";

interface Plan {
  id: string;
  name: string;
  plan_type: string;
  updated_at: string;
  results: Record<string, unknown>;
}

interface ComparePageClientProps {
  plans: Plan[];
}

export function ComparePageClient({ plans }: ComparePageClientProps) {
  const t = useTranslations("common");
  const [selectedType, setSelectedType] = useState<PlanType | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Group plans by type, only show types that have comparison fields defined
  const plansByType = useMemo(() => {
    const grouped: Partial<Record<PlanType, Plan[]>> = {};
    for (const plan of plans) {
      const pt = plan.plan_type as PlanType;
      if (!planResultFields[pt]) continue;
      if (!grouped[pt]) grouped[pt] = [];
      grouped[pt]!.push(plan);
    }
    // Only keep types with 2+ plans
    return Object.fromEntries(
      Object.entries(grouped).filter(([, v]) => v && v.length >= 2)
    ) as Partial<Record<PlanType, Plan[]>>;
  }, [plans]);

  const availableTypes = Object.keys(plansByType) as PlanType[];
  const plansForType = selectedType ? (plansByType[selectedType] ?? []) : [];
  const selectedPlans = plansForType.filter((p) => selectedIds.includes(p.id));
  const fields = selectedType ? (planResultFields[selectedType] ?? []) : [];

  function togglePlan(id: string) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev; // max 3
      return [...prev, id];
    });
  }

  function handleTypeSelect(type: PlanType) {
    setSelectedType(type);
    setSelectedIds([]);
  }

  if (plans.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center animate-fade-in">
        <BarChart3 className="h-12 w-12 text-text-muted" />
        <h2 className="text-xl font-bold text-text">No Plans to Compare</h2>
        <p className="text-sm text-text-muted max-w-md">
          Run some calculators and save your results first. You need at least 2
          saved plans of the same type to compare.
        </p>
      </div>
    );
  }

  if (availableTypes.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center animate-fade-in">
        <BarChart3 className="h-12 w-12 text-text-muted" />
        <h2 className="text-xl font-bold text-text">Need More Plans</h2>
        <p className="text-sm text-text-muted max-w-md">
          You need at least 2 saved plans of the same type to compare. Try
          running a calculator with different assumptions.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="page-header-gradient">
        <h1 className="text-2xl font-bold text-text font-heading">
          Compare Plans
        </h1>
        <p className="text-sm text-text-muted">
          Select a plan type, then pick 2-3 plans to compare side by side.
        </p>
      </div>

      {/* Step 1: Select plan type */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Plan Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {availableTypes.map((type) => (
              <Button
                key={type}
                variant={selectedType === type ? "primary" : "outline"}
                size="sm"
                onClick={() => handleTypeSelect(type)}
              >
                {t(`planTypes.${type}`)}
                <span className="ml-1 text-xs opacity-60">
                  ({plansByType[type]?.length})
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Select plans */}
      {selectedType && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Select Plans (max 3)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {plansForType.map((plan) => {
                const isSelected = selectedIds.includes(plan.id);
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => togglePlan(plan.id)}
                    className={cn(
                      "flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors",
                      isSelected
                        ? "border-primary bg-primary/5 text-text"
                        : "border-border hover:bg-surface-hover text-text-secondary"
                    )}
                  >
                    <div>
                      <p className="text-sm font-medium">{plan.name}</p>
                      <p className="text-xs text-text-muted">
                        {new Date(plan.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-primary" />}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Comparison table */}
      {selectedPlans.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-2 pr-4 text-left text-text-muted font-medium">
                      Metric
                    </th>
                    {selectedPlans.map((p) => (
                      <th
                        key={p.id}
                        className="py-2 px-4 text-right text-text font-medium"
                      >
                        {p.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field) => {
                    const values = selectedPlans.map((p) =>
                      getNestedValue(p.results, field.key)
                    );
                    // Highlight best value (highest for most, lowest for drawdown)
                    const isLowerBetter =
                      field.key.includes("Drawdown") ||
                      field.key.includes("gap") ||
                      field.key.includes("Tax") ||
                      field.key.includes("risk");
                    const numericValues = values.map((v) =>
                      v != null ? Number(v) : null
                    );
                    const validNums = numericValues.filter(
                      (n): n is number => n != null && !isNaN(n)
                    );
                    const bestValue =
                      validNums.length > 0
                        ? isLowerBetter
                          ? Math.min(...validNums)
                          : Math.max(...validNums)
                        : null;

                    return (
                      <tr key={field.key} className="border-b border-border/50">
                        <td className="py-2.5 pr-4 text-text-muted">
                          {field.label}
                        </td>
                        {values.map((val, i) => {
                          const num = val != null ? Number(val) : null;
                          const isBest =
                            num != null &&
                            bestValue != null &&
                            num === bestValue &&
                            validNums.length > 1;
                          return (
                            <td
                              key={selectedPlans[i].id}
                              className={cn(
                                "py-2.5 px-4 text-right font-mono",
                                isBest && "text-success font-semibold"
                              )}
                            >
                              {formatResultValue(val, field.format)}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
