"use client";

import { useState } from "react";
import { FundTable } from "@/components/funds/fund-table";
import { FundFilters } from "@/components/funds/fund-filters";
import { FundComparison } from "@/components/funds/fund-comparison";

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

interface FundsPageClientProps {
  funds: FundRow[];
  locale: string;
}

export function FundsPageClient({ funds, locale }: FundsPageClientProps) {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id].slice(0, 3)
    );
  }

  const filtered = funds.filter((f) => {
    if (category !== "all" && f.category !== category) return false;
    if (search && !f.ticker.toLowerCase().includes(search.toLowerCase()) && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const comparisonFunds = funds.filter((f) => selectedIds.includes(f.id));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-text font-heading">
        {locale === "th" ? "กองทุน" : "Fund Screener"}
      </h1>
      <FundFilters selectedCategory={category} searchQuery={search} onCategoryChange={setCategory} onSearchChange={setSearch} />
      {filtered.length > 0 ? (
        <FundTable funds={filtered} selectedIds={selectedIds} onToggleSelect={toggleSelect} />
      ) : (
        <div className="py-12 text-center rounded-xl border border-border">
          <p className="text-text-muted text-sm">
            {locale === "th" ? "ไม่พบกองทุน" : "No funds found"}
          </p>
        </div>
      )}
      {comparisonFunds.length >= 2 && <FundComparison funds={comparisonFunds} />}
    </div>
  );
}
