"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";

interface TimelineDataPoint {
  year: number;
  age: number;
  savings: number;
  milestone: string | null;
}

interface TimelineChartProps {
  data: TimelineDataPoint[];
}

export function TimelineChart({ data }: TimelineChartProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("th-TH", {
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div aria-label="Timeline chart">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
            <XAxis dataKey="age" tick={{ fontSize: 12, fill: "var(--color-text-muted)" }} label={{ value: "Age", position: "insideBottom", offset: -5, fill: "var(--color-text-muted)" }} />
            <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value))}
              labelFormatter={(label) => `Age ${label}`}
              contentStyle={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 8, color: "var(--color-text)" }}
              labelStyle={{ color: "var(--color-text)" }}
              itemStyle={{ color: "var(--color-text-secondary)" }}
            />
            <Area
              type="monotone"
              dataKey="savings"
              stroke="var(--color-primary)"
              fill="var(--color-primary)"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            {data
              .filter((d) => d.milestone)
              .map((d) => (
                <ReferenceLine
                  key={d.age}
                  x={d.age}
                  stroke="var(--color-secondary)"
                  strokeDasharray="4 4"
                  label={{ value: d.milestone!, position: "top", fontSize: 10 }}
                />
              ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <table className="sr-only" role="table">
        <caption>Financial timeline</caption>
        <thead>
          <tr><th>Year</th><th>Age</th><th>Savings</th><th>Milestone</th></tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.year}>
              <td>{d.year}</td><td>{d.age}</td><td>{d.savings}</td><td>{d.milestone || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
