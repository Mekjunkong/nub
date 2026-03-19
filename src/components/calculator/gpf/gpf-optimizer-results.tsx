"use client";

import { useTranslations } from "next-intl";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { GpfOptimizerResults } from "@/types/calculator";

interface GpfOptimizerResultsViewProps {
  results: GpfOptimizerResults;
}

const PIE_COLORS = ["#6366f1", "#f59e0b", "#10b981"];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(value);

export function GpfOptimizerResultsView({ results }: GpfOptimizerResultsViewProps) {
  const t = useTranslations("calculator");
  const ASSET_NAMES = [t("gpfOptimizer.bondPlan"), t("gpfOptimizer.equityPlan"), t("gpfOptimizer.goldPlan")];
  const pieData = results.maxSharpe.weights.map((w, i) => ({
    name: ASSET_NAMES[i],
    value: Math.round(w * 1000) / 10,
  }));

  return (
    <div className="flex flex-col gap-6">
      {/* Optimal Allocation */}
      <Card>
        <CardHeader>
          <CardTitle>{t("gpfOptimizer.optimalAllocation")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, value }) => `${name} ${value}%`}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${value}%`}
                  contentStyle={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    color: "var(--color-text)",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Risk Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: t("gpfOptimizer.var95"), value: results.var95 },
          { label: t("gpfOptimizer.var99"), value: results.var99 },
          { label: t("gpfOptimizer.cvar95"), value: results.cvar95 },
          { label: t("gpfOptimizer.cvar99"), value: results.cvar99 },
        ].map((metric) => (
          <Card key={metric.label}>
            <CardContent className="py-4 text-center">
              <p className="text-xs text-text-muted">{metric.label}</p>
              <p className="text-xl font-bold text-danger font-heading">
                {formatCurrency(metric.value)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Rebalancing Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t("gpfOptimizer.rebalance")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-2 text-left font-medium text-text-muted">{t("gpfOptimizer.asset")}</th>
                  <th className="pb-2 text-left font-medium text-text-muted">{t("gpfOptimizer.action")}</th>
                  <th className="pb-2 text-right font-medium text-text-muted">{t("gpfOptimizer.amount")}</th>
                </tr>
              </thead>
              <tbody>
                {results.rebalanceActions.map((action) => (
                  <tr key={action.asset} className="border-b border-border/50">
                    <td className="py-3 text-text">{action.asset}</td>
                    <td className="py-3">
                      <Badge
                        variant={
                          action.action === "BUY"
                            ? "success"
                            : action.action === "SELL"
                              ? "danger"
                              : "default"
                        }
                      >
                        {action.action}
                      </Badge>
                    </td>
                    <td className="py-3 text-right font-medium text-text">
                      {formatCurrency(action.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-xs text-text-muted">{t("gpfOptimizer.expectedReturn")}</p>
            <p className="text-2xl font-bold text-success font-heading">
              {(results.maxSharpe.expectedReturn * 100).toFixed(2)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-xs text-text-muted">{t("gpfOptimizer.risk")}</p>
            <p className="text-2xl font-bold text-warning font-heading">
              {(results.maxSharpe.risk * 100).toFixed(2)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-xs text-text-muted">{t("gpfOptimizer.sharpeRatio")}</p>
            <p className="text-2xl font-bold text-primary font-heading">
              {results.maxSharpe.sharpeRatio.toFixed(3)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
