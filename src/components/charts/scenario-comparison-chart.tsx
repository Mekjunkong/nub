"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { ScenarioResult } from "@/types/calculator";

interface ScenarioComparisonChartProps {
  scenarios: ScenarioResult[];
}

const COLORS = ["var(--color-success)", "var(--color-warning)", "var(--color-danger)", "#7C5CFC"];

export function ScenarioComparisonChart({
  scenarios,
}: ScenarioComparisonChartProps) {
  const data = scenarios.map((s) => ({
    name: s.name,
    drawdown: +(s.maxDrawdown * 100).toFixed(2),
    finalWealth: s.finalWealth,
    recoveryTime: s.recoveryTime,
  }));

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {scenarios.map((s, i) => (
          <div key={s.name} className="rounded-xl border border-border bg-surface p-3 text-center">
            <p className="text-xs text-text-muted">{s.name}</p>
            <p className="text-lg font-bold text-text" style={{ color: COLORS[i] }}>
              {(s.maxDrawdown * 100).toFixed(1)}%
            </p>
            <p className="text-xs text-text-muted">Max Drawdown</p>
          </div>
        ))}
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} />
            <YAxis tick={{ fontSize: 12, fill: "var(--color-text-muted)" }} tickFormatter={(v) => `${v}%`} />
            <Tooltip
              formatter={(v) => `${Number(v).toFixed(2)}%`}
              contentStyle={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 8, color: "var(--color-text)" }}
              labelStyle={{ color: "var(--color-text)" }}
              itemStyle={{ color: "var(--color-text-secondary)" }}
            />
            <Bar dataKey="drawdown" name="Max Drawdown %" fill="var(--color-danger)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <table className="sr-only" role="table">
        <caption>Scenario comparison</caption>
        <thead>
          <tr><th>Scenario</th><th>Max Drawdown</th><th>Final Wealth</th><th>Recovery (months)</th></tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.name}>
              <td>{d.name}</td><td>{d.drawdown}%</td><td>{d.finalWealth}</td><td>{d.recoveryTime}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
