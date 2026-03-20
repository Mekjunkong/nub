"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExportPdfButton } from "@/components/shared/export-pdf-button";
import { SavePlanButton } from "@/components/calculator/shared/save-plan-button";
import { calculateInflation } from "@/workers/inflation.worker";
import { formatThaiCurrency } from "@/lib/utils";
import { track, Events } from "@/lib/analytics";
import type { InflationResults } from "@/types/calculator";

export default function InflationPage() {
  const [monthlyExpenses, setMonthlyExpenses] = useState(30000);
  const [inflationRate, setInflationRate] = useState(3);
  const [yearsToProject, setYearsToProject] = useState(30);
  const [results, setResults] = useState<InflationResults | null>(null);
  const [calculating, setCalculating] = useState(false);

  function handleCalculate() {
    setCalculating(true);
    requestAnimationFrame(() => {
      const result = calculateInflation({
        currentMonthlyExpenses: monthlyExpenses,
        inflationRate: inflationRate / 100,
        yearsToProject,
        oneTimeExpenses: [],
      });
      setResults(result);
      track(Events.CALCULATOR_COMPLETED, { type: "inflation" });
      setCalculating(false);
    });
  }

  const lastYear = results?.yearlyProjections[results.yearlyProjections.length - 1];
  const futureMonthly = lastYear ? lastYear.nominalExpenses / 12 : 0;

  const inputsRecord: Record<string, unknown> = {
    currentMonthlyExpenses: monthlyExpenses,
    inflationRate: inflationRate / 100,
    yearsToProject,
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="page-header-gradient">
        <h1 className="text-2xl font-bold font-heading">
          Inflation Impact Calculator
        </h1>
        <p className="text-sm mt-1 text-white/80">
          See how inflation erodes your purchasing power over time
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Current Monthly Expenses (THB)"
              type="number"
              min={0}
              value={monthlyExpenses}
              onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
            />
            <Input
              label="Inflation Rate (%)"
              type="number"
              min={0}
              max={20}
              step={0.1}
              value={inflationRate}
              onChange={(e) => setInflationRate(Number(e.target.value))}
            />
            <Input
              label="Years to Project"
              type="number"
              min={5}
              max={50}
              value={yearsToProject}
              onChange={(e) => setYearsToProject(Number(e.target.value))}
            />
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={handleCalculate} loading={calculating}>
              Calculate
            </Button>
          </div>
        </CardContent>
      </Card>

      {results && (
        <div className="stagger-children flex flex-col gap-6">
          <div className="flex justify-end gap-2">
            <ExportPdfButton
              planType="inflation"
              planName="Inflation Impact"
              inputs={inputsRecord}
              results={results as unknown as Record<string, unknown>}
            />
            <SavePlanButton
              planType="inflation"
              inputs={inputsRecord}
              results={results as unknown as Record<string, unknown>}
            />
          </div>

          {/* Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card variant="elevated">
              <CardContent className="pt-6">
                <p className="text-sm text-text-muted">
                  Today&apos;s {formatThaiCurrency(monthlyExpenses)}/mo in {yearsToProject} years
                </p>
                <p className="text-2xl font-bold font-heading mt-1">
                  {formatThaiCurrency(futureMonthly)}/mo
                </p>
              </CardContent>
            </Card>
            <Card variant="elevated">
              <CardContent className="pt-6">
                <p className="text-sm text-text-muted">Total Lifetime Cost</p>
                <p className="text-2xl font-bold font-heading mt-1">
                  {formatThaiCurrency(results.totalLifetimeCost)}
                </p>
              </CardContent>
            </Card>
            <Card variant="elevated">
              <CardContent className="pt-6">
                <p className="text-sm text-text-muted">Purchasing Power Loss</p>
                <p className="text-2xl font-bold font-heading mt-1">
                  {(results.purchasingPowerLoss * 100).toFixed(1)}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Area Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Nominal vs Real Expenses Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={results.yearlyProjections}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis
                      dataKey="year"
                      label={{ value: "Year", position: "insideBottom", offset: -5 }}
                    />
                    <YAxis
                      tickFormatter={(v: number) => `${(v / 1_000_000).toFixed(1)}M`}
                    />
                    <Tooltip
                      formatter={(value) => formatThaiCurrency(Number(value))}
                    />
                    <Area
                      type="monotone"
                      dataKey="nominalExpenses"
                      name="Nominal Expenses"
                      stroke="#ef4444"
                      fill="#ef4444"
                      fillOpacity={0.15}
                    />
                    <Area
                      type="monotone"
                      dataKey="realPurchasingPower"
                      name="Real Purchasing Power"
                      stroke="#22c55e"
                      fill="#22c55e"
                      fillOpacity={0.15}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
