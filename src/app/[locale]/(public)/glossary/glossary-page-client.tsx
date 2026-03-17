"use client";

import { useState } from "react";
import { GlossaryCard } from "@/components/glossary/glossary-card";
import { GlossarySearch } from "@/components/glossary/glossary-search";

interface GlossaryTermRow {
  slug: string;
  term_th: string;
  term_en: string;
  definition_th: string;
  definition_en: string;
  category: string;
}

interface GlossaryPageClientProps {
  terms: GlossaryTermRow[];
  locale: string;
}

export function GlossaryPageClient({ terms, locale }: GlossaryPageClientProps) {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = terms.filter((t) => {
    if (category !== "all" && t.category !== category) return false;
    const term = locale === "th" ? t.term_th : t.term_en;
    if (search && !term.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-text font-heading">
        {locale === "th" ? "คำศัพท์ทางการเงิน" : "Financial Glossary"}
      </h1>
      <GlossarySearch selectedCategory={category} searchQuery={search} onCategoryChange={setCategory} onSearchChange={setSearch} />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length > 0 ? (
          filtered.map((term) => (
            <GlossaryCard key={term.slug} slug={term.slug} termTh={term.term_th} termEn={term.term_en} definitionTh={term.definition_th} definitionEn={term.definition_en} category={term.category} locale={locale} />
          ))
        ) : (
          <div className="col-span-full py-12 text-center">
            <p className="text-text-muted text-sm">
              {locale === "th" ? "ไม่พบคำศัพท์" : "No terms found"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
