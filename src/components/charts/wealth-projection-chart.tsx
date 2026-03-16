"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface WealthProjectionChartProps {
  percentiles: {
    p10: number[];
    p25: number[];
    p50: number[];
    p75: number[];
    p90: number[];
  };
}

export function WealthProjectionChart({
  percentiles,
}: WealthProjectionChartProps) {
  const data = percentiles.p50.map((_, i) => ({
    month: i,
    p10: percentiles.p10[i] ?? 0,
    p25: percentiles.p25[i] ?? 0,
    p50: percentiles.p50[i] ?? 0,
    p75: percentiles.p75[i] ?? 0,
    p90: percentiles.p90[i] ?? 0,
  }));

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div aria-label="Wealth projection chart">
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Area type="monotone" dataKey="p90" stackId="band" stroke="none" fill="var(--color-primary)" fillOpacity={0.1} />
            <Area type="monotone" dataKey="p75" stackId="band2" stroke="none" fill="var(--color-primary)" fillOpacity={0.15} />
            <Area type="monotone" dataKey="p50" stroke="var(--color-primary)" strokeWidth={2} fill="var(--color-primary)" fillOpacity={0.2} />
            <Area type="monotone" dataKey="p25" stackId="band3" stroke="none" fill="var(--color-primary)" fillOpacity={0.15} />
            <Area type="monotone" dataKey="p10" stackId="band4" stroke="none" fill="var(--color-primary)" fillOpacity={0.1} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {/* Accessible table fallback */}
      <table className="sr-only" role="table">
        <caption>Wealth projection percentiles</caption>
        <thead>
          <tr>
            <th>Month</th><th>P10</th><th>P25</th><th>P50</th><th>P75</th><th>P90</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.month}>
              <td>{row.month}</td>
              <td>{row.p10}</td><td>{row.p25}</td><td>{row.p50}</td>
              <td>{row.p75}</td><td>{row.p90}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
