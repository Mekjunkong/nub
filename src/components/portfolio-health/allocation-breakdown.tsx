"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AllocationBreakdownProps {
  holdings: { asset: string; weight: number }[];
}

const COLORS = [
  "var(--color-primary)",
  "var(--color-secondary)",
  "#F59E0B",
  "#10B981",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
];

export function AllocationBreakdown({ holdings }: AllocationBreakdownProps) {
  const data = holdings.map((h) => ({
    name: h.asset,
    value: Number((h.weight * 100).toFixed(2)),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Asset Allocation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          {/* Pie Chart */}
          <div className="h-52 w-52 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  paddingAngle={2}
                  label={({ name, value }) => `${name} ${value}%`}
                >
                  {data.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => `${v}%`}
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

          {/* Legend */}
          <div className="flex flex-col gap-2">
            {data.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-2 text-sm">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <span className="text-text">{item.name}</span>
                <span className="text-text-muted">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Accessible table */}
        <table className="sr-only" role="table">
          <caption>Asset allocation breakdown</caption>
          <thead>
            <tr><th>Asset</th><th>Weight</th></tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.name}><td>{item.name}</td><td>{item.value}%</td></tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
