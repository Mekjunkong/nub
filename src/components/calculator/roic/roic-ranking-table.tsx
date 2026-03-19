"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RoicRankingEntry {
  ticker: string;
  name: string;
  roicCurrent: number;
  roicHistory: Record<string, number>;
  sloanRatio: number;
  fairValue: number;
  rating: string;
}

interface RoicRankingTableProps {
  entries: RoicRankingEntry[];
}

type SortKey = "ticker" | "name" | "roicCurrent" | "sloanRatio" | "fairValue" | "rating";

const ratingVariant: Record<string, "success" | "primary" | "warning" | "danger"> = {
  Excellent: "success",
  Good: "primary",
  Moderate: "warning",
  Poor: "danger",
};

const ratingOrder: Record<string, number> = {
  Excellent: 4,
  Good: 3,
  Moderate: 2,
  Poor: 1,
};

export function RoicRankingTable({ entries }: RoicRankingTableProps) {
  const t = useTranslations("calculator");
  const [sortKey, setSortKey] = useState<SortKey>("roicCurrent");
  const [sortAsc, setSortAsc] = useState(false);

  // Collect all history year keys
  const historyKeys = Array.from(
    new Set(entries.flatMap((e) => Object.keys(e.roicHistory)))
  ).sort();

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  }

  const sorted = [...entries].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "rating") {
      cmp = (ratingOrder[a.rating] ?? 0) - (ratingOrder[b.rating] ?? 0);
    } else if (sortKey === "ticker" || sortKey === "name") {
      cmp = a[sortKey].localeCompare(b[sortKey]);
    } else {
      cmp = a[sortKey] - b[sortKey];
    }
    return sortAsc ? cmp : -cmp;
  });

  const sortIndicator = (key: SortKey) =>
    sortKey === key ? (sortAsc ? " \u25B2" : " \u25BC") : "";

  const thClass =
    "px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider cursor-pointer hover:text-text select-none";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("roic.ranking")}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className={thClass} onClick={() => handleSort("ticker")}>
                {t("roic.ticker")}{sortIndicator("ticker")}
              </th>
              <th className={thClass} onClick={() => handleSort("name")}>
                {t("roic.name")}{sortIndicator("name")}
              </th>
              <th className={thClass} onClick={() => handleSort("roicCurrent")}>
                {t("roic.roicCurrent")}{sortIndicator("roicCurrent")}
              </th>
              {historyKeys.map((year) => (
                <th key={year} className={`${thClass} cursor-default`}>
                  ROIC {year}
                </th>
              ))}
              <th className={thClass} onClick={() => handleSort("sloanRatio")}>
                {t("roic.sloan")}{sortIndicator("sloanRatio")}
              </th>
              <th className={thClass} onClick={() => handleSort("fairValue")}>
                {t("roic.fairValue")}{sortIndicator("fairValue")}
              </th>
              <th className={thClass} onClick={() => handleSort("rating")}>
                {t("roic.quality")}{sortIndicator("rating")}
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((entry) => (
              <tr key={entry.ticker} className="border-b border-border last:border-0 hover:bg-surface-hover">
                <td className="px-4 py-3 font-medium text-text">{entry.ticker}</td>
                <td className="px-4 py-3 text-text-muted">{entry.name}</td>
                <td className="px-4 py-3 font-medium text-text">
                  {(entry.roicCurrent * 100).toFixed(2)}%
                </td>
                {historyKeys.map((year) => (
                  <td key={year} className="px-4 py-3 text-text-muted">
                    {entry.roicHistory[year] != null
                      ? `${(entry.roicHistory[year] * 100).toFixed(2)}%`
                      : "-"}
                  </td>
                ))}
                <td className="px-4 py-3 text-text-muted">{entry.sloanRatio.toFixed(4)}</td>
                <td className="px-4 py-3 text-text">
                  ฿{entry.fairValue.toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={ratingVariant[entry.rating] ?? "default"}>
                    {entry.rating}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
