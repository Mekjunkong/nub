"use client";

import { useState, useMemo } from "react";
import { CashflowTemplateForm } from "@/components/calculator/cashflow/cashflow-template-form";
import { CashflowMonthView } from "@/components/calculator/cashflow/cashflow-month-view";
import { CashflowResultsView } from "@/components/calculator/cashflow/cashflow-results";
import { calculateCashflowResults } from "@/lib/cashflow-math";
import type { CashflowDirection, CashflowCategory } from "@/types/database";

interface Template {
  id: string;
  name: string;
  direction: CashflowDirection;
  category: CashflowCategory;
  amount: number;
  isActive: boolean;
}

interface Transaction {
  id: string;
  templateId: string | null;
  direction: CashflowDirection;
  category: CashflowCategory;
  name: string;
  amount: number;
  month: number;
  year: number;
}

export default function CashflowPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [templates, setTemplates] = useState<Template[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Memoize filtered transactions and results together to avoid stale refs
  const { currentTransactions, results } = useMemo(() => {
    const current = transactions.filter(
      (t) => t.month === month && t.year === year
    );
    return {
      currentTransactions: current,
      results: calculateCashflowResults(current),
    };
  }, [transactions, month, year]);

  // Auto-fill from templates when navigating to a new month with no transactions
  function autoFillMonth(m: number, y: number) {
    const existing = transactions.filter((t) => t.month === m && t.year === y);
    if (existing.length === 0 && templates.length > 0) {
      const autoFilled = templates
        .filter((t) => t.isActive)
        .map((t) => ({
          id: crypto.randomUUID(),
          templateId: t.id,
          direction: t.direction,
          category: t.category,
          name: t.name,
          amount: t.amount,
          month: m,
          year: y,
        }));
      setTransactions((prev) => [...prev, ...autoFilled]);
    }
  }

  function handleMonthChange(newMonth: number) {
    setMonth(newMonth);
    autoFillMonth(newMonth, year);
  }

  function handleYearChange(newYear: number) {
    setYear(newYear);
    autoFillMonth(month, newYear);
  }

  function handleAddTemplate(t: Omit<Template, "id" | "isActive">) {
    setTemplates((prev) => [
      ...prev,
      { ...t, id: crypto.randomUUID(), isActive: true },
    ]);
  }

  function handleUpdateTemplate(id: string, updates: Partial<Template>) {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  }

  function handleDeleteTemplate(id: string) {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  }

  function handleAddTransaction(
    t: Omit<Transaction, "id" | "templateId" | "month" | "year">
  ) {
    setTransactions((prev) => [
      ...prev,
      { ...t, id: crypto.randomUUID(), templateId: null, month, year },
    ]);
  }

  function handleDeleteTransaction(id: string) {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text font-heading">
          Cashflow Tracker
        </h1>
        <p className="text-sm text-text-muted">
          Track your income, expenses, and financial health ratios
        </p>
      </div>

      <CashflowTemplateForm
        templates={templates}
        onAdd={handleAddTemplate}
        onUpdate={handleUpdateTemplate}
        onDelete={handleDeleteTemplate}
      />

      <CashflowMonthView
        transactions={currentTransactions}
        month={month}
        year={year}
        onMonthChange={handleMonthChange}
        onYearChange={handleYearChange}
        onAdd={handleAddTransaction}
        onDelete={handleDeleteTransaction}
      />

      {currentTransactions.length > 0 && (
        <CashflowResultsView results={results} />
      )}
    </div>
  );
}
