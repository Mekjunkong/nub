"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CashflowResults } from "@/lib/cashflow-math";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface CashflowResultsViewProps {
  results: CashflowResults;
}

const formatCurrency = (value: number) =>
  `\u0E3F${value.toLocaleString()}`;

const formatPercent = (value: number) =>
  `${(value * 100).toFixed(1)}%`;

function ProgressBar({
  value,
  target,
  warning,
}: {
  value: number;
  target?: number;
  warning?: boolean;
}) {
  const pct = Math.min(value * 100, 100);
  const barColor = warning && value > 0.4 ? "bg-danger" : "bg-primary";

  return (
    <div className="relative h-3 w-full rounded-full bg-surface-hover">
      <div
        className={`h-3 rounded-full transition-all ${barColor}`}
        style={{ width: `${pct}%` }}
      />
      {target !== undefined && (
        <div
          className="absolute top-0 h-3 w-0.5 bg-text"
          style={{ left: `${Math.min(target * 100, 100)}%` }}
          title={`Target: ${(target * 100).toFixed(0)}%`}
        />
      )}
    </div>
  );
}

const LIFESTYLE_COLORS: Record<string, string> = {
  personal: "#6366f1",
  family: "#f59e0b",
  transport: "#10b981",
  education: "#3b82f6",
  travel: "#ec4899",
  housing: "#8b5cf6",
  other: "#94a3b8",
};

export function CashflowResultsView({ results }: CashflowResultsViewProps) {
  const t = useTranslations("calculator");
  const lifestyleData = Object.entries(results.lifestyleBreakdown)
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      key,
      value,
    }));

  // Build chart data as a single stacked bar
  const chartData = [
    lifestyleData.reduce(
      (acc, item) => {
        acc[item.key] = item.value;
        return acc;
      },
      { name: "Expenses" } as Record<string, string | number>
    ),
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Summary metrics */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-xs text-text-muted">{t("cashflow.totalIncome")}</p>
            <p className="text-2xl font-bold text-success font-heading">
              {formatCurrency(results.totalIncome)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-xs text-text-muted">{t("cashflow.totalExpenses")}</p>
            <p className="text-2xl font-bold text-danger font-heading">
              {formatCurrency(results.totalExpenses)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-xs text-text-muted">{t("cashflow.netCashflow")}</p>
            <p
              className={`text-2xl font-bold font-heading ${
                results.netCashflow >= 0 ? "text-success" : "text-danger"
              }`}
            >
              {formatCurrency(results.netCashflow)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ratio cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex flex-col gap-2 py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-text">{t("cashflow.savingsRatio")}</p>
              <p className="text-sm font-bold text-text">
                {formatPercent(results.savingsInvestmentRatio)}
              </p>
            </div>
            <ProgressBar value={results.savingsInvestmentRatio} target={0.2} />
            <p className="text-xs text-text-muted">{t("cashflow.savingsTarget")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-2 py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-text">{t("cashflow.debtRatio")}</p>
              <p className="text-sm font-bold text-text">
                {formatPercent(results.debtServiceRatio)}
              </p>
            </div>
            <ProgressBar value={results.debtServiceRatio} warning />
            <p className="text-xs text-text-muted">{t("cashflow.debtWarning")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-2 py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-text">{t("cashflow.insuranceRatio")}</p>
              <p className="text-sm font-bold text-text">
                {formatPercent(results.insuranceRiskRatio)}
              </p>
            </div>
            <ProgressBar value={results.insuranceRiskRatio} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-2 py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-text">{t("cashflow.taxDeductible")}</p>
              <p className="text-sm font-bold text-text">
                {formatCurrency(results.taxDeductibleTotal)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lifestyle breakdown chart */}
      {lifestyleData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("cashflow.lifestyle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[80px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" hide />
                  <Tooltip
                    formatter={(value, name) => [
                      formatCurrency(Number(value)),
                      String(name).charAt(0).toUpperCase() + String(name).slice(1),
                    ]}
                  />
                  {lifestyleData.map((item) => (
                    <Bar
                      key={item.key}
                      dataKey={item.key}
                      stackId="lifestyle"
                      fill={LIFESTYLE_COLORS[item.key] ?? "#94a3b8"}
                      name={item.name}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="mt-3 flex flex-wrap gap-3">
              {lifestyleData.map((item) => (
                <div key={item.key} className="flex items-center gap-1.5">
                  <div
                    className="h-3 w-3 rounded-sm"
                    style={{ backgroundColor: LIFESTYLE_COLORS[item.key] ?? "#94a3b8" }}
                  />
                  <span className="text-xs text-text-muted">
                    {item.name} ({formatCurrency(item.value)})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
