"use client";

import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceDot,
} from "recharts";
import type { PortfolioPoint } from "@/types/calculator";

interface EfficientFrontierChartProps {
  frontier: PortfolioPoint[];
  maxSharpe: PortfolioPoint;
  minVol: PortfolioPoint;
  assetNames: string[];
}

export function EfficientFrontierChart({
  frontier,
  maxSharpe,
  minVol,
  assetNames,
}: EfficientFrontierChartProps) {
  const data = frontier.map((p) => ({
    risk: +(p.risk * 100).toFixed(2),
    return: +(p.expectedReturn * 100).toFixed(2),
    weights: p.weights,
  }));

  return (
    <div aria-label="Efficient frontier chart">
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
            <XAxis dataKey="risk" name="Risk (%)" unit="%" tick={{ fontSize: 12, fill: "var(--color-text-muted)" }} />
            <YAxis dataKey="return" name="Return (%)" unit="%" tick={{ fontSize: 12, fill: "var(--color-text-muted)" }} />
            <Tooltip
              content={({ payload }) => {
                if (!payload || payload.length === 0) return null;
                const d = payload[0]?.payload;
                if (!d) return null;
                return (
                  <div className="rounded-lg border border-border bg-surface p-3 shadow-md">
                    <p className="text-sm font-medium">Return: {d.return}%</p>
                    <p className="text-sm">Risk: {d.risk}%</p>
                    {d.weights && (
                      <div className="mt-1 text-xs text-text-muted">
                        {d.weights.map((w: number, i: number) => (
                          <p key={i}>{assetNames[i] || `Asset ${i + 1}`}: {(w * 100).toFixed(1)}%</p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }}
            />
            <Scatter data={data} fill="var(--color-primary)" fillOpacity={0.6} />
            <ReferenceDot
              x={+(maxSharpe.risk * 100).toFixed(2)}
              y={+(maxSharpe.expectedReturn * 100).toFixed(2)}
              r={8}
              fill="#FBBF24"
              stroke="#FBBF24"
            />
            <ReferenceDot
              x={+(minVol.risk * 100).toFixed(2)}
              y={+(minVol.expectedReturn * 100).toFixed(2)}
              r={8}
              fill="var(--color-primary)"
              stroke="var(--color-primary)"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <table className="sr-only" role="table">
        <caption>Efficient frontier data</caption>
        <thead>
          <tr><th>Risk (%)</th><th>Return (%)</th><th>Sharpe</th></tr>
        </thead>
        <tbody>
          {frontier.slice(0, 10).map((p, i) => (
            <tr key={i}>
              <td>{(p.risk * 100).toFixed(2)}</td>
              <td>{(p.expectedReturn * 100).toFixed(2)}</td>
              <td>{p.sharpeRatio.toFixed(3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
