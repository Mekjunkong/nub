"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { FundTable } from "@/components/funds/fund-table";
import { FundFilters } from "@/components/funds/fund-filters";
import { FundComparison } from "@/components/funds/fund-comparison";

const mockFunds = [
  { id: "1", ticker: "SCBRMS&P500", name: "SCB US Equity S&P 500", category: "equity", expectedReturn: 0.08, standardDeviation: 0.1858, roicCurrent: 0.12, affiliateUrl: "https://www.scbam.com" },
  { id: "2", ticker: "SCBRM2", name: "SCB Short-term Fixed Income", category: "bond", expectedReturn: 0.025, standardDeviation: 0.0191, roicCurrent: 0.03, affiliateUrl: "https://www.scbam.com" },
  { id: "3", ticker: "SCBRMGOLDH", name: "SCB Gold THB Hedged", category: "gold", expectedReturn: 0.05, standardDeviation: 0.1511, roicCurrent: 0.08, affiliateUrl: "https://www.scbam.com" },
];

export default function FundsPage() {
  const locale = useLocale();
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id].slice(0, 3)
    );
  }

  const filtered = mockFunds.filter((f) => {
    if (category !== "all" && f.category !== category) return false;
    if (search && !f.ticker.toLowerCase().includes(search.toLowerCase()) && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const comparisonFunds = mockFunds.filter((f) => selectedIds.includes(f.id));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-text font-heading">
        {locale === "th" ? "กองทุน" : "Fund Screener"}
      </h1>
      <FundFilters selectedCategory={category} searchQuery={search} onCategoryChange={setCategory} onSearchChange={setSearch} />
      <FundTable funds={filtered} selectedIds={selectedIds} onToggleSelect={toggleSelect} />
      {comparisonFunds.length >= 2 && <FundComparison funds={comparisonFunds} />}
    </div>
  );
}
