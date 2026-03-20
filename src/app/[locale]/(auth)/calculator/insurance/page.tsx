"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ExportPdfButton } from "@/components/shared/export-pdf-button";
import { SavePlanButton } from "@/components/calculator/shared/save-plan-button";
import { calculateInsuranceNeeds } from "@/workers/insurance-needs.worker";
import { formatThaiCurrency } from "@/lib/utils";
import { track, Events } from "@/lib/analytics";
import { Plus, X, HeartPulse } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import type { InsuranceNeedsResults, Dependent } from "@/types/calculator";

const PIE_COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

export default function InsuranceNeedsPage() {
  const [annualIncome, setAnnualIncome] = useState(600000);
  const [yearsOfIncomeReplacement, setYearsOfIncomeReplacement] = useState(10);
  const [totalDebts, setTotalDebts] = useState(0);
  const [existingCoverage, setExistingCoverage] = useState(0);
  const [finalExpenses, setFinalExpenses] = useState(300000);
  const [educationFundNeeded, setEducationFundNeeded] = useState(0);
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [results, setResults] = useState<InsuranceNeedsResults | null>(null);
  const [calculating, setCalculating] = useState(false);

  function addDependent() {
    setDependents((prev) => [
      ...prev,
      { name: "", age: 0, relationship: "", annualCost: 0 },
    ]);
  }

  function removeDependent(index: number) {
    setDependents((prev) => prev.filter((_, i) => i !== index));
  }

  function updateDependent(
    index: number,
    field: keyof Dependent,
    value: string | number
  ) {
    setDependents((prev) =>
      prev.map((d, i) => (i === index ? { ...d, [field]: value } : d))
    );
  }

  function handleCalculate() {
    setCalculating(true);
    requestAnimationFrame(() => {
      const result = calculateInsuranceNeeds({
        annualIncome,
        yearsOfIncomeReplacement,
        totalDebts,
        existingCoverage,
        finalExpenses,
        dependents,
        educationFundNeeded,
      });
      setResults(result);
      setCalculating(false);
      track(Events.CALCULATOR_COMPLETED, { type: "insurance" });
    });
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="page-header-gradient">
        <h1 className="text-2xl font-bold font-heading flex items-center gap-2">
          <HeartPulse className="h-6 w-6" />
          Insurance Needs Calculator
        </h1>
        <p className="text-sm mt-1 text-white/80">
          Calculate your life insurance coverage gap and protect your family
        </p>
      </div>

      {/* --- Form --- */}
      <Card>
        <CardHeader>
          <CardTitle>Your Financial Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="space-y-1">
              <span className="text-sm font-medium">Annual Income (THB)</span>
              <Input
                type="number"
                value={annualIncome}
                onChange={(e) => setAnnualIncome(Number(e.target.value))}
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium">
                Years of Income Replacement
              </span>
              <Input
                type="number"
                value={yearsOfIncomeReplacement}
                onChange={(e) =>
                  setYearsOfIncomeReplacement(Number(e.target.value))
                }
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium">Total Debts (THB)</span>
              <Input
                type="number"
                value={totalDebts}
                onChange={(e) => setTotalDebts(Number(e.target.value))}
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium">
                Existing Coverage (THB)
              </span>
              <Input
                type="number"
                value={existingCoverage}
                onChange={(e) => setExistingCoverage(Number(e.target.value))}
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium">
                Final Expenses (THB)
              </span>
              <Input
                type="number"
                value={finalExpenses}
                onChange={(e) => setFinalExpenses(Number(e.target.value))}
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium">
                Education Fund Needed (THB)
              </span>
              <Input
                type="number"
                value={educationFundNeeded}
                onChange={(e) =>
                  setEducationFundNeeded(Number(e.target.value))
                }
              />
            </label>
          </div>

          {/* --- Dependents --- */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Dependents</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addDependent}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Dependent
              </Button>
            </div>

            {dependents.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No dependents added. Click &quot;Add Dependent&quot; to include
                family members.
              </p>
            )}

            {dependents.map((dep, idx) => (
              <div
                key={idx}
                className="grid grid-cols-[1fr_80px_1fr_120px_32px] gap-2 items-end rounded-lg border border-border p-3"
              >
                <label className="space-y-1">
                  <span className="text-xs text-muted-foreground">Name</span>
                  <Input
                    value={dep.name}
                    onChange={(e) =>
                      updateDependent(idx, "name", e.target.value)
                    }
                    placeholder="e.g. Sarah"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs text-muted-foreground">Age</span>
                  <Input
                    type="number"
                    value={dep.age}
                    onChange={(e) =>
                      updateDependent(idx, "age", Number(e.target.value))
                    }
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs text-muted-foreground">
                    Relationship
                  </span>
                  <Input
                    value={dep.relationship}
                    onChange={(e) =>
                      updateDependent(idx, "relationship", e.target.value)
                    }
                    placeholder="e.g. Child"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs text-muted-foreground">
                    Annual Cost
                  </span>
                  <Input
                    type="number"
                    value={dep.annualCost}
                    onChange={(e) =>
                      updateDependent(
                        idx,
                        "annualCost",
                        Number(e.target.value)
                      )
                    }
                  />
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 text-destructive"
                  onClick={() => removeDependent(idx)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button
            className="w-full"
            onClick={handleCalculate}
            disabled={calculating}
          >
            {calculating ? "Calculating..." : "Calculate Insurance Needs"}
          </Button>
        </CardContent>
      </Card>

      {/* --- Results --- */}
      {results && (
        <div className="stagger-children flex flex-col gap-6">
          <div className="flex justify-end gap-2">
            <SavePlanButton
              planType="insurance"
              inputs={{
                annualIncome,
                yearsOfIncomeReplacement,
                totalDebts,
                existingCoverage,
                finalExpenses,
                educationFundNeeded,
                dependents,
              }}
              results={results as unknown as Record<string, unknown>}
            />
            <ExportPdfButton
              planType="insurance"
              planName="Insurance Needs Analysis"
              inputs={{
                annualIncome,
                yearsOfIncomeReplacement,
                totalDebts,
                existingCoverage,
                finalExpenses,
                educationFundNeeded,
                dependents,
              }}
              results={results as unknown as Record<string, unknown>}
            />
          </div>

          {/* Gap summary */}
          <Card
            variant="elevated"
            className={
              results.gap > 0
                ? "border-destructive/40 bg-destructive/5"
                : "border-emerald-500/40 bg-emerald-500/5"
            }
          >
            <CardContent className="flex flex-col items-center py-8 gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                Coverage Gap
              </span>
              <span
                className={`text-4xl font-bold ${
                  results.gap > 0 ? "text-destructive" : "text-emerald-600"
                }`}
              >
                {formatThaiCurrency(results.gap)}
              </span>
              <span className="text-sm text-muted-foreground">
                Total Needs: {formatThaiCurrency(results.totalNeeds)} |
                Existing: {formatThaiCurrency(results.existingCoverage)}
              </span>
            </CardContent>
          </Card>

          {/* Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Needs Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={results.breakdown.filter((b) => b.amount > 0)}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }: { name?: string; percent?: number }) =>
                        `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`
                      }
                    >
                      {results.breakdown
                        .filter((b) => b.amount > 0)
                        .map((_, i) => (
                          <Cell
                            key={i}
                            fill={PIE_COLORS[i % PIE_COLORS.length]}
                          />
                        ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatThaiCurrency(Number(value))}
                      contentStyle={{
                        backgroundColor: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 8,
                        color: "var(--color-text)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 font-medium">Category</th>
                      <th className="text-right py-2 font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.breakdown.map((row) => (
                      <tr
                        key={row.category}
                        className="border-b border-border/50"
                      >
                        <td className="py-2">{row.category}</td>
                        <td className="py-2 text-right font-mono">
                          {formatThaiCurrency(row.amount)}
                        </td>
                      </tr>
                    ))}
                    <tr className="font-semibold">
                      <td className="py-2">Total Needs</td>
                      <td className="py-2 text-right font-mono">
                        {formatThaiCurrency(results.totalNeeds)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2">Existing Coverage</td>
                      <td className="py-2 text-right font-mono text-emerald-600">
                        - {formatThaiCurrency(results.existingCoverage)}
                      </td>
                    </tr>
                    <tr className="font-bold text-lg">
                      <td className="py-2">Gap</td>
                      <td
                        className={`py-2 text-right font-mono ${
                          results.gap > 0
                            ? "text-destructive"
                            : "text-emerald-600"
                        }`}
                      >
                        {formatThaiCurrency(results.gap)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Recommendation */}
          <Card>
            <CardHeader>
              <CardTitle>Recommendation</CardTitle>
            </CardHeader>
            <CardContent>
              {results.gap > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    You are under-insured by{" "}
                    <strong className="text-destructive">
                      {formatThaiCurrency(results.gap)}
                    </strong>
                    . Consider purchasing additional life insurance coverage to
                    protect your dependents.
                  </p>
                  {results.gap > 5_000_000 && (
                    <p className="text-sm text-muted-foreground">
                      With a gap above 5 million THB, consider a mix of term
                      life insurance for cost-effective coverage and whole life
                      for long-term protection.
                    </p>
                  )}
                  {results.gap <= 5_000_000 && results.gap > 1_000_000 && (
                    <p className="text-sm text-muted-foreground">
                      A term life insurance policy could be an affordable way to
                      close this coverage gap.
                    </p>
                  )}
                  {results.gap <= 1_000_000 && (
                    <p className="text-sm text-muted-foreground">
                      Your gap is relatively modest. Increasing your existing
                      policy or adding a small supplemental plan may suffice.
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-emerald-600">
                  Your existing coverage meets or exceeds your estimated needs.
                  Review annually as your circumstances change.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
