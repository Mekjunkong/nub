"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import type { Fund, FundCategory } from "@/types/database";

const CATEGORIES: { value: FundCategory; label: string }[] = [
  { value: "equity", label: "Equity" },
  { value: "bond", label: "Bond" },
  { value: "gold", label: "Gold" },
  { value: "mixed", label: "Mixed" },
  { value: "money_market", label: "Money Market" },
];

interface FundSelectorProps {
  funds: Fund[];
  selected: string[];
  onSelect: (ids: string[]) => void;
  maxSelection?: number;
  locale?: string;
}

export function FundSelector({
  funds,
  selected,
  onSelect,
  maxSelection = 10,
  locale = "th",
}: FundSelectorProps) {
  const [search, setSearch] = useState("");
  const [activeCategories, setActiveCategories] = useState<Set<FundCategory>>(
    new Set()
  );

  const atMax = selected.length >= maxSelection;

  function toggleCategory(cat: FundCategory) {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  }

  function toggleFund(id: string) {
    if (selected.includes(id)) {
      onSelect(selected.filter((s) => s !== id));
    } else if (!atMax) {
      onSelect([...selected, id]);
    }
  }

  function removeFund(id: string) {
    onSelect(selected.filter((s) => s !== id));
  }

  const filteredFunds = useMemo(() => {
    const q = search.toLowerCase().trim();
    return funds.filter((fund) => {
      // Category filter
      if (activeCategories.size > 0 && !activeCategories.has(fund.category)) {
        return false;
      }
      // Search filter
      if (q) {
        const name = locale === "th" ? fund.name_th : fund.name_en;
        return (
          fund.ticker.toLowerCase().includes(q) ||
          name.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [funds, search, activeCategories, locale]);

  const selectedFunds = useMemo(
    () => funds.filter((f) => selected.includes(f.id)),
    [funds, selected]
  );

  function getFundName(fund: Fund): string {
    return locale === "th" ? fund.name_th : fund.name_en;
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Selected count */}
      <p className="text-sm text-text-muted">
        {selected.length} of {maxSelection} selected
        {selected.length < 2 && " (min 2)"}
      </p>

      {/* Selected chips */}
      {selectedFunds.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedFunds.map((fund) => (
            <span
              key={fund.id}
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
            >
              {fund.ticker}
              <button
                type="button"
                onClick={() => removeFund(fund.id)}
                className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-primary/20 transition-colors"
                aria-label={`Remove ${fund.ticker}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-3 w-3"
                >
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search */}
      <Input
        placeholder="Search by ticker or name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Category badges */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            type="button"
            onClick={() => toggleCategory(cat.value)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              activeCategories.has(cat.value)
                ? "bg-primary text-white"
                : "bg-surface-hover text-text-muted hover:text-text"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Fund list */}
      <div className="max-h-80 overflow-y-auto rounded-xl border border-border">
        {filteredFunds.length === 0 ? (
          <p className="p-4 text-center text-sm text-text-muted">
            No funds found
          </p>
        ) : (
          <div className="divide-y divide-border">
            {filteredFunds.map((fund) => {
              const isSelected = selected.includes(fund.id);
              const isDisabled = atMax && !isSelected;
              return (
                <button
                  key={fund.id}
                  type="button"
                  onClick={() => toggleFund(fund.id)}
                  disabled={isDisabled}
                  className={cn(
                    "flex w-full items-center gap-3 p-3 text-left transition-colors",
                    isSelected
                      ? "bg-primary/5"
                      : "hover:bg-surface-hover",
                    isDisabled && "cursor-not-allowed opacity-50"
                  )}
                >
                  {/* Checkbox */}
                  <div
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
                      isSelected
                        ? "border-primary bg-primary text-white"
                        : "border-border"
                    )}
                  >
                    {isSelected && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-3.5 w-3.5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>

                  {/* Fund info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-text truncate">
                        {fund.ticker}
                      </p>
                      <span className="shrink-0 rounded-full bg-surface-hover px-2 py-0.5 text-[10px] font-medium text-text-muted">
                        {fund.category}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted truncate">
                      {getFundName(fund)}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="shrink-0 text-right text-xs text-text-muted">
                    <p>E(R): {(fund.expected_return * 100).toFixed(1)}%</p>
                    <p>SD: {(fund.standard_deviation * 100).toFixed(1)}%</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
