"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ComparisonFund {
  ticker: string;
  name: string;
  expectedReturn: number;
  standardDeviation: number;
  category: string;
}

interface FundComparisonProps {
  funds: ComparisonFund[];
  correlations?: Record<string, number>;
}

export function FundComparison({ funds, correlations }: FundComparisonProps) {
  if (funds.length < 2) return null;

  return (
    <Card>
      <CardHeader><CardTitle>Comparison</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-3 py-2 text-left text-xs text-text-muted">Metric</th>
                {funds.map((f) => (
                  <th key={f.ticker} className="px-3 py-2 text-right text-xs font-medium text-text">{f.ticker}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="px-3 py-2 text-text-muted">Category</td>
                {funds.map((f) => <td key={f.ticker} className="px-3 py-2 text-right">{f.category}</td>)}
              </tr>
              <tr className="border-b border-border">
                <td className="px-3 py-2 text-text-muted">Expected Return</td>
                {funds.map((f) => <td key={f.ticker} className="px-3 py-2 text-right font-mono">{(f.expectedReturn * 100).toFixed(1)}%</td>)}
              </tr>
              <tr className="border-b border-border">
                <td className="px-3 py-2 text-text-muted">Standard Deviation</td>
                {funds.map((f) => <td key={f.ticker} className="px-3 py-2 text-right font-mono">{(f.standardDeviation * 100).toFixed(1)}%</td>)}
              </tr>
              <tr>
                <td className="px-3 py-2 text-text-muted">Sharpe Ratio</td>
                {funds.map((f) => (
                  <td key={f.ticker} className="px-3 py-2 text-right font-mono">
                    {((f.expectedReturn - 0.02) / f.standardDeviation).toFixed(3)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
