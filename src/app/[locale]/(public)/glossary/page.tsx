"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { GlossaryCard } from "@/components/glossary/glossary-card";
import { GlossarySearch } from "@/components/glossary/glossary-search";

const mockTerms = [
  { slug: "monte-carlo", term_th: "มอนติคาร์โล", term_en: "Monte Carlo Simulation", definition_th: "วิธีการจำลองทางสถิติ", definition_en: "Statistical simulation method", category: "investing" },
  { slug: "roic", term_th: "อัตราผลตอบแทนจากเงินลงทุน", term_en: "ROIC", definition_th: "อัตราส่วนทางการเงิน", definition_en: "Financial ratio measuring returns", category: "investing" },
  { slug: "sharpe-ratio", term_th: "อัตราส่วนชาร์ป", term_en: "Sharpe Ratio", definition_th: "อัตราส่วนวัดผลตอบแทน", definition_en: "Risk-adjusted return measure", category: "investing" },
  { slug: "gpf", term_th: "กบข.", term_en: "Government Pension Fund", definition_th: "กองทุนบำเหน็จบำนาญข้าราชการ", definition_en: "GPF for Thai civil servants", category: "retirement" },
  { slug: "pvd", term_th: "กองทุนสำรองเลี้ยงชีพ", term_en: "Provident Fund", definition_th: "กองทุนออมเพื่อการเกษียณ", definition_en: "Retirement savings fund for private sector", category: "retirement" },
];

export default function GlossaryPage() {
  const locale = useLocale();
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = mockTerms.filter((t) => {
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
        {filtered.map((term) => (
          <GlossaryCard key={term.slug} slug={term.slug} termTh={term.term_th} termEn={term.term_en} definitionTh={term.definition_th} definitionEn={term.definition_en} category={term.category} locale={locale} />
        ))}
      </div>
    </div>
  );
}
