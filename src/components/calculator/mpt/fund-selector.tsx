"use client";

import { cn } from "@/lib/utils";

interface FundItem {
  id: string;
  ticker: string;
  name: string;
  expectedReturn: number;
  standardDeviation: number;
}

interface FundSelectorProps {
  funds: FundItem[];
  selected: string[];
  onSelect: (ids: string[]) => void;
}

export function FundSelector({ funds, selected, onSelect }: FundSelectorProps) {
  function toggleFund(id: string) {
    if (selected.includes(id)) {
      onSelect(selected.filter((s) => s !== id));
    } else {
      onSelect([...selected, id]);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-text-muted">Select 2-10 funds to optimize</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {funds.map((fund) => (
          <button
            key={fund.id}
            type="button"
            onClick={() => toggleFund(fund.id)}
            className={cn(
              "flex items-center justify-between rounded-xl border-2 p-3 text-left transition-all",
              selected.includes(fund.id)
                ? "border-primary bg-primary/5"
                : "border-border hover:border-border-hover"
            )}
          >
            <div>
              <p className="font-medium text-sm text-text">{fund.ticker}</p>
              <p className="text-xs text-text-muted">{fund.name}</p>
            </div>
            <div className="text-right text-xs text-text-muted">
              <p>E(R): {(fund.expectedReturn * 100).toFixed(1)}%</p>
              <p>SD: {(fund.standardDeviation * 100).toFixed(1)}%</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
