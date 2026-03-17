"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowUpDown, ExternalLink } from "lucide-react";

interface FundRow {
  id: string;
  ticker: string;
  name: string;
  category: string;
  expectedReturn: number;
  standardDeviation: number;
  roicCurrent: number | null;
  affiliateUrl: string | null;
}

interface FundTableProps {
  funds: FundRow[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
}

type SortKey = "ticker" | "expectedReturn" | "standardDeviation" | "roicCurrent";

const categoryColors: Record<string, "primary" | "success" | "warning" | "secondary" | "default"> = {
  equity: "primary", bond: "success", gold: "warning", mixed: "secondary", money_market: "default",
};

function SortHeader({ label, field, onSort }: { label: string; field: SortKey; onSort: (key: SortKey) => void }) {
  return (
    <th className="cursor-pointer px-3 py-2 text-left text-xs font-medium text-text-muted" onClick={() => onSort(field)}>
      <span className="flex items-center gap-1">{label} <ArrowUpDown className="h-3 w-3" /></span>
    </th>
  );
}

export function FundTable({ funds, selectedIds, onToggleSelect }: FundTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("ticker");
  const [sortAsc, setSortAsc] = useState(true);

  function handleSort(key: SortKey) {
    if (sortKey === key) { setSortAsc(!sortAsc); }
    else { setSortKey(key); setSortAsc(true); }
  }

  const sorted = [...funds].sort((a, b) => {
    const aVal = a[sortKey] ?? 0;
    const bVal = b[sortKey] ?? 0;
    return sortAsc ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
  });

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-surface-hover">
          <tr>
            <th className="px-3 py-2 w-10"></th>
            <SortHeader label="Ticker" field="ticker" onSort={handleSort} />
            <th className="px-3 py-2 text-left text-xs font-medium text-text-muted">Name</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-text-muted">Category</th>
            <SortHeader label="E(R)" field="expectedReturn" onSort={handleSort} />
            <SortHeader label="SD" field="standardDeviation" onSort={handleSort} />
            <SortHeader label="ROIC" field="roicCurrent" onSort={handleSort} />
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((fund) => (
            <tr key={fund.id} className={cn("border-t border-border transition-colors hover:bg-surface-hover", selectedIds.includes(fund.id) && "bg-primary/5")}>
              <td className="px-3 py-2">
                <input type="checkbox" checked={selectedIds.includes(fund.id)} onChange={() => onToggleSelect(fund.id)} className="rounded border-border" />
              </td>
              <td className="px-3 py-2 font-medium text-text font-mono text-xs">{fund.ticker}</td>
              <td className="px-3 py-2 text-text-secondary max-w-[200px] truncate">{fund.name}</td>
              <td className="px-3 py-2"><Badge variant={categoryColors[fund.category] || "default"}>{fund.category}</Badge></td>
              <td className="px-3 py-2 text-right font-mono">{(fund.expectedReturn * 100).toFixed(1)}%</td>
              <td className="px-3 py-2 text-right font-mono">{(fund.standardDeviation * 100).toFixed(1)}%</td>
              <td className="px-3 py-2 text-right font-mono">{fund.roicCurrent != null ? `${(fund.roicCurrent * 100).toFixed(1)}%` : "-"}</td>
              <td className="px-3 py-2">
                {fund.affiliateUrl && (
                  <a href={fund.affiliateUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-hover">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
