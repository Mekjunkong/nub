"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface DcaComparisonChartProps {
  data: {
    static: number[];
    glidepath: number[];
    daa: number[];
  };
}

export function DcaComparisonChart({ data }: DcaComparisonChartProps) {
  const chartData = data.static.map((_, i) => ({
    month: i + 1,
    Static: data.static[i] ?? 0,
    Glidepath: data.glidepath[i] ?? 0,
    DAA: data.daa[i] ?? 0,
  }));

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("th-TH", {
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div>
      <div className="mb-3 flex items-center gap-4 text-sm">
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-full bg-primary" />
          Static
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-full bg-secondary" />
          Glidepath
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-full bg-success" />
          DAA
        </span>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => formatCurrency(Number(v))} />
            <Legend />
            <Line type="monotone" dataKey="Static" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Glidepath" stroke="var(--color-secondary)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="DAA" stroke="var(--color-success)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <table className="sr-only" role="table">
        <caption>DCA strategy comparison</caption>
        <thead>
          <tr><th>Month</th><th>Static</th><th>Glidepath</th><th>DAA</th></tr>
        </thead>
        <tbody>
          {chartData.slice(0, 5).map((d) => (
            <tr key={d.month}>
              <td>{d.month}</td><td>{d.Static}</td><td>{d.Glidepath}</td><td>{d.DAA}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
