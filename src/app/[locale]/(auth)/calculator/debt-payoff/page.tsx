"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X, CreditCard } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { ExportPdfButton } from "@/components/shared/export-pdf-button";
import { SavePlanButton } from "@/components/calculator/shared/save-plan-button";
import { calculateDebtPayoff } from "@/workers/debt-payoff.worker";
import { formatThaiCurrency } from "@/lib/utils";
import { track, Events } from "@/lib/analytics";
import type { DebtItem, DebtPayoffResults } from "@/types/calculator";

const COLORS = ["#4F7CF7", "#7C5CFC", "#F59E0B", "#EF4444", "#22C55E", "#EC4899"];

const emptyDebt = (): DebtItem => ({
  name: "",
  balance: 0,
  interestRate: 0,
  minPayment: 0,
});

export default function DebtPayoffPage() {
  const [debts, setDebts] = useState<DebtItem[]>([emptyDebt()]);
  const [extraPayment, setExtraPayment] = useState(0);
  const [results, setResults] = useState<DebtPayoffResults | null>(null);
  const [calculating, setCalculating] = useState(false);

  function updateDebt(index: number, field: keyof DebtItem, value: string | number) {
    setDebts((prev) =>
      prev.map((d, i) => (i === index ? { ...d, [field]: value } : d))
    );
  }

  function addDebt() {
    setDebts((prev) => [...prev, emptyDebt()]);
  }

  function removeDebt(index: number) {
    setDebts((prev) => prev.filter((_, i) => i !== index));
  }

  const hasValidDebts = debts.some((d) => d.balance > 0 && d.minPayment > 0);

  const handleCalculate = useCallback(() => {
    const validDebts = debts.filter((d) => d.balance > 0 && d.minPayment > 0);
    if (validDebts.length === 0) return;

    setCalculating(true);
    requestAnimationFrame(() => {
      const result = calculateDebtPayoff({
        debts: validDebts,
        extraMonthlyPayment: extraPayment,
      });
      setResults(result);
      track(Events.CALCULATOR_COMPLETED, { type: "debt_payoff" });
      setCalculating(false);
    });
  }, [debts, extraPayment]);

  // Build chart data from the recommended strategy schedule
  const chartData =
    results != null
      ? results[results.recommendedStrategy].schedule.map((entry) => {
          const point: Record<string, number> = { month: entry.month };
          for (const d of entry.debts) {
            point[d.name || "Debt"] = Math.round(d.balance);
          }
          return point;
        })
      : [];

  const debtNames =
    results != null
      ? results[results.recommendedStrategy].schedule[0]?.debts.map((d) => d.name || "Debt") ?? []
      : [];

  const savingsAmount = Math.abs(results?.interestSaved ?? 0);
  const winner = results?.recommendedStrategy ?? "avalanche";

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="page-header-gradient">
        <div className="flex items-center gap-3">
          <CreditCard className="h-7 w-7 text-white" />
          <div>
            <h1 className="text-2xl font-bold font-heading">Debt Payoff Planner</h1>
            <p className="text-sm mt-1 text-white/80">
              Compare snowball vs avalanche strategies to eliminate debt faster
            </p>
          </div>
        </div>
      </div>

      {/* Debt List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Debts</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {debts.map((debt, index) => (
            <div
              key={index}
              className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-3 items-end"
            >
              <Input
                label={index === 0 ? "Name" : undefined}
                placeholder="e.g., Credit Card"
                value={debt.name}
                onChange={(e) => updateDebt(index, "name", e.target.value)}
              />
              <Input
                label={index === 0 ? "Balance (THB)" : undefined}
                type="number"
                min={0}
                placeholder="100,000"
                value={debt.balance || ""}
                onChange={(e) => updateDebt(index, "balance", Number(e.target.value))}
              />
              <Input
                label={index === 0 ? "Rate (%)" : undefined}
                type="number"
                min={0}
                step={0.1}
                placeholder="18"
                value={debt.interestRate || ""}
                onChange={(e) => updateDebt(index, "interestRate", Number(e.target.value))}
              />
              <Input
                label={index === 0 ? "Min Payment" : undefined}
                type="number"
                min={0}
                placeholder="3,000"
                value={debt.minPayment || ""}
                onChange={(e) => updateDebt(index, "minPayment", Number(e.target.value))}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeDebt(index)}
                disabled={debts.length === 1}
                className="h-10 w-10 text-text-muted hover:text-danger"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button variant="secondary" size="sm" onClick={addDebt} className="w-fit">
            <Plus className="mr-2 h-4 w-4" />
            Add Debt
          </Button>

          <div className="max-w-xs pt-2">
            <Input
              label="Extra Monthly Payment (THB)"
              type="number"
              min={0}
              placeholder="2,000"
              value={extraPayment || ""}
              onChange={(e) => setExtraPayment(Number(e.target.value))}
            />
          </div>

          <div className="mt-4 flex justify-end">
            <Button onClick={handleCalculate} loading={calculating} disabled={!hasValidDebts}>
              Calculate
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <div className="stagger-children flex flex-col gap-6">
          {/* Export + Save */}
          <div className="flex justify-end gap-2">
            <SavePlanButton
              planType="debt_payoff"
              inputs={{ debts, extraMonthlyPayment: extraPayment } as unknown as Record<string, unknown>}
              results={results as unknown as Record<string, unknown>}
            />
            <ExportPdfButton
              planType="debt_payoff"
              planName="Debt Payoff Plan"
              inputs={{ debts, extraMonthlyPayment: extraPayment } as unknown as Record<string, unknown>}
              results={results as unknown as Record<string, unknown>}
            />
          </div>

          {/* Strategy Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card variant={winner === "snowball" ? "elevated" : "default"}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Snowball</CardTitle>
                  {winner === "snowball" && <Badge variant="success">Recommended</Badge>}
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Total Interest</span>
                  <span className="font-semibold">
                    {formatThaiCurrency(results.snowball.totalInterest)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Payoff Time</span>
                  <span className="font-semibold">
                    {results.snowball.payoffMonths} months
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card variant={winner === "avalanche" ? "elevated" : "default"}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Avalanche</CardTitle>
                  {winner === "avalanche" && <Badge variant="success">Recommended</Badge>}
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Total Interest</span>
                  <span className="font-semibold">
                    {formatThaiCurrency(results.avalanche.totalInterest)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Payoff Time</span>
                  <span className="font-semibold">
                    {results.avalanche.payoffMonths} months
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Savings Callout */}
          {savingsAmount > 0 && (
            <Card variant="gradient">
              <CardContent className="py-4 text-center">
                <p className="text-lg font-bold">
                  {winner === "avalanche" ? "Avalanche" : "Snowball"} saves you{" "}
                  {formatThaiCurrency(savingsAmount)}
                </p>
                <p className="text-sm text-text-muted mt-1">
                  in total interest compared to the other strategy
                </p>
              </CardContent>
            </Card>
          )}

          {/* Stacked Area Chart */}
          {chartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Debt Balances Over Time ({winner === "avalanche" ? "Avalanche" : "Snowball"})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 12 }}
                        label={{ value: "Month", position: "insideBottom", offset: -5 }}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
                      />
                      <Tooltip
                        formatter={(value: unknown) => formatThaiCurrency(Number(value))}
                        labelFormatter={(label: unknown) => `Month ${label}`}
                      />
                      {debtNames.map((name, i) => (
                        <Area
                          key={name}
                          type="monotone"
                          dataKey={name}
                          stackId="1"
                          fill={COLORS[i % COLORS.length]}
                          stroke={COLORS[i % COLORS.length]}
                          fillOpacity={0.6}
                        />
                      ))}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
