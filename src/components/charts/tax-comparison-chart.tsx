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

interface TaxComparisonChartProps {
  currentTax: number;
  optimizedTax: number;
  taxSaved: number;
}

export function TaxComparisonChart({
  currentTax,
  optimizedTax,
  taxSaved,
}: TaxComparisonChartProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("th-TH", {
      maximumFractionDigits: 0,
    }).format(value);

  const data = [
    { label: "Before", tax: currentTax },
    { label: "After", tax: optimizedTax },
  ];

  return (
    <div>
      <div className="mb-4 text-center">
        <p className="text-sm text-text-muted">Tax Saved</p>
        <p className="text-3xl font-bold text-success font-heading">
          {formatCurrency(taxSaved)}
        </p>
      </div>
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-surface p-4 text-center">
          <p className="text-xs text-text-muted">Before Optimization</p>
          <p className="text-xl font-bold text-danger">
            {formatCurrency(currentTax)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4 text-center">
          <p className="text-xs text-text-muted">After Optimization</p>
          <p className="text-xl font-bold text-success">
            {formatCurrency(optimizedTax)}
          </p>
        </div>
      </div>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => formatCurrency(Number(v))} />
            <Bar dataKey="tax" radius={[8, 8, 0, 0]}>
              {/* Colors handled via CSS */}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <table className="sr-only" role="table">
        <caption>Tax comparison</caption>
        <thead>
          <tr><th>Status</th><th>Tax Amount</th></tr>
        </thead>
        <tbody>
          <tr><td>Before</td><td>{formatCurrency(currentTax)}</td></tr>
          <tr><td>After</td><td>{formatCurrency(optimizedTax)}</td></tr>
          <tr><td>Saved</td><td>{formatCurrency(taxSaved)}</td></tr>
        </tbody>
      </table>
    </div>
  );
}
