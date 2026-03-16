"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const categories = ["all", "retirement", "investing", "tax", "insurance", "general"];

interface GlossarySearchProps {
  selectedCategory: string;
  searchQuery: string;
  onCategoryChange: (cat: string) => void;
  onSearchChange: (q: string) => void;
}

export function GlossarySearch({ selectedCategory, searchQuery, onCategoryChange, onSearchChange }: GlossarySearchProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onCategoryChange(cat)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              selectedCategory === cat ? "bg-primary text-white" : "bg-surface-hover text-text-muted hover:text-text"
            )}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>
      <div className="w-full sm:w-64">
        <Input placeholder="Search terms..." value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} />
      </div>
    </div>
  );
}
