"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GpfOptimizerResults } from "@/types/calculator";

interface GpfWealthProjectionProps {
  projections: GpfOptimizerResults["wealthProjections"];
  years: number;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(value);

export function GpfWealthProjection({ projections, years }: GpfWealthProjectionProps) {
  // Build chart data: interpolate bands across years
  // The projections contain final values; we linearly interpolate for visualization
  const data = Array.from({ length: years + 1 }, (_, i) => {
    const t = i / years;
    return {
      year: i,
      conservative: Math.round(projections.conservative * t),
      median: Math.round(projections.median * t),
      bull: Math.round(projections.bull * t),
    };
  });

  const successRate = projections.successRate;
  const successColor =
    successRate > 0.7
      ? "text-success"
      : successRate > 0.5
        ? "text-warning"
        : "text-danger";

  return (
    <div className="flex flex-col gap-6">
      {/* Success Rate */}
      <Card>
        <CardContent className="py-6 text-center">
          <p className="text-sm text-text-muted">Success Rate</p>
          <p className={`text-4xl font-bold font-heading ${successColor}`}>
            {(successRate * 100).toFixed(1)}%
          </p>
          <p className="mt-1 text-xs text-text-muted">
            Probability of meeting your investment goal
          </p>
        </CardContent>
      </Card>

      {/* Wealth Projection Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monte Carlo Wealth Projection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  opacity={0.5}
                />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 12, fill: "var(--color-text-muted)" }}
                  label={{ value: "Year", position: "insideBottom", offset: -5 }}
                />
                <YAxis
                  tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                  tick={{ fontSize: 12, fill: "var(--color-text-muted)" }}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    color: "var(--color-text)",
                  }}
                  labelStyle={{ color: "var(--color-text)" }}
                  itemStyle={{ color: "var(--color-text-secondary)" }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="bull"
                  name="Bull (P90)"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.1}
                  strokeWidth={1.5}
                />
                <Area
                  type="monotone"
                  dataKey="median"
                  name="Median (P50)"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="conservative"
                  name="Conservative (P20)"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  fillOpacity={0.1}
                  strokeWidth={1.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
