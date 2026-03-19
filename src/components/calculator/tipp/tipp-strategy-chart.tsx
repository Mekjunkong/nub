"use client";

import { useTranslations } from "next-intl";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { TippWealthPoint } from "@/types/calculator";

interface TippStrategyChartProps {
  wealthPath: TippWealthPoint[];
}

function formatBaht(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return v.toFixed(0);
}

export function TippStrategyChart({ wealthPath }: TippStrategyChartProps) {
  const t = useTranslations("calculator");
  return (
    <div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={wealthPath}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border)"
              opacity={0.5}
            />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
              label={{
                value: t("tipp.month"),
                position: "insideBottom",
                offset: -4,
                fontSize: 12,
                fill: "var(--color-text-muted)",
              }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "var(--color-text-muted)" }}
              tickFormatter={formatBaht}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                color: "var(--color-text)",
              }}
              labelStyle={{ color: "var(--color-text)" }}
              itemStyle={{ color: "var(--color-text-secondary)" }}
              formatter={(value) => `${formatBaht(Number(value))}`}
              labelFormatter={(label) => `${t("tipp.month")} ${label}`}
            />
            <Line
              type="monotone"
              dataKey="wealth"
              name={t("tipp.wealth")}
              stroke="var(--color-primary)"
              strokeWidth={2.5}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="floor"
              name={t("tipp.floorLabel")}
              stroke="var(--color-danger)"
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Accessible table for screen readers */}
      <table className="sr-only" role="table">
        <caption>TIPP wealth path and floor</caption>
        <thead>
          <tr>
            <th>{t("tipp.month")}</th>
            <th>{t("tipp.wealth")}</th>
            <th>{t("tipp.floorLabel")}</th>
            <th>{t("tipp.multiplier")}</th>
            <th>{t("tipp.action")}</th>
          </tr>
        </thead>
        <tbody>
          {wealthPath.map((p) => (
            <tr key={p.month}>
              <td>{p.month}</td>
              <td>{p.wealth.toFixed(2)}</td>
              <td>{p.floor.toFixed(2)}</td>
              <td>{p.multiplier.toFixed(2)}</td>
              <td>{p.action}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
