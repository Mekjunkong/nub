"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { CashflowTemplateForm } from "@/components/calculator/cashflow/cashflow-template-form";
import { CashflowMonthView } from "@/components/calculator/cashflow/cashflow-month-view";
import { CashflowResultsView } from "@/components/calculator/cashflow/cashflow-results";
import { calculateCashflowResults } from "@/lib/cashflow-math";
import { createClient } from "@/lib/supabase/client";
import { ExportPdfButton } from "@/components/shared/export-pdf-button";
import { track, Events } from "@/lib/analytics";
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
  const t = useTranslations("calculator");
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [templates, setTemplates] = useState<Template[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user session and initial data
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || cancelled) {
          if (!cancelled) setLoading(false);
          return;
        }

        setUserId(user.id);

        // Fetch templates and transactions in parallel
        const [templatesRes, transactionsRes] = await Promise.all([
          supabase
            .from("cashflow_templates")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at"),
          supabase
            .from("cashflow_transactions")
            .select("*")
            .eq("user_id", user.id)
            .eq("month", now.getMonth() + 1)
            .eq("year", now.getFullYear()),
        ]);

        if (cancelled) return;

        const dbTemplates = (templatesRes.data ?? []).map((t) => ({
          id: t.id,
          name: t.name,
          direction: t.direction as CashflowDirection,
          category: t.category as CashflowCategory,
          amount: t.amount,
          isActive: t.is_active,
        }));

        const dbTransactions = (transactionsRes.data ?? []).map((t) => ({
          id: t.id,
          templateId: t.template_id,
          direction: t.direction as CashflowDirection,
          category: t.category as CashflowCategory,
          name: t.name,
          amount: t.amount,
          month: t.month,
          year: t.year,
        }));

        setTemplates(dbTemplates);
        setTransactions(dbTransactions);
      } catch (err) {
        console.error("Failed to load cashflow data:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch transactions when month/year changes
  const fetchTransactionsForMonth = useCallback(
    async (m: number, y: number) => {
      if (!userId) return [];

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("cashflow_transactions")
          .select("*")
          .eq("user_id", userId)
          .eq("month", m)
          .eq("year", y);

        if (error) {
          console.error("Failed to fetch transactions:", error);
          return [];
        }

        return (data ?? []).map((t) => ({
          id: t.id,
          templateId: t.template_id,
          direction: t.direction as CashflowDirection,
          category: t.category as CashflowCategory,
          name: t.name,
          amount: t.amount,
          month: t.month,
          year: t.year,
        }));
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
        return [];
      }
    },
    [userId]
  );

  // Auto-fill from templates when navigating to a month with no transactions
  const autoFillMonth = useCallback(
    async (m: number, y: number, existingTransactions: Transaction[]) => {
      if (!userId || templates.length === 0) return;

      const monthTransactions = existingTransactions.filter(
        (t) => t.month === m && t.year === y
      );
      if (monthTransactions.length > 0) return;

      const activeTemplates = templates.filter((t) => t.isActive);
      if (activeTemplates.length === 0) return;

      try {
        const supabase = createClient();
        const rows = activeTemplates.map((t) => ({
          user_id: userId,
          template_id: t.id,
          direction: t.direction,
          category: t.category,
          name: t.name,
          amount: t.amount,
          month: m,
          year: y,
        }));

        const { data, error } = await supabase
          .from("cashflow_transactions")
          .insert(rows)
          .select();

        if (error) {
          console.error("Failed to auto-fill transactions:", error);
          return;
        }

        const newTransactions = (data ?? []).map((t) => ({
          id: t.id,
          templateId: t.template_id,
          direction: t.direction as CashflowDirection,
          category: t.category as CashflowCategory,
          name: t.name,
          amount: t.amount,
          month: t.month,
          year: t.year,
        }));

        setTransactions((prev) => [...prev, ...newTransactions]);
      } catch (err) {
        console.error("Failed to auto-fill transactions:", err);
      }
    },
    [userId, templates]
  );

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

  async function handleMonthChange(newMonth: number) {
    setMonth(newMonth);
    const fetched = await fetchTransactionsForMonth(newMonth, year);
    setTransactions((prev) => {
      // Remove old data for this month/year and replace with fresh data
      const other = prev.filter(
        (t) => !(t.month === newMonth && t.year === year)
      );
      return [...other, ...fetched];
    });
    // Auto-fill if the fetched month has no transactions
    if (fetched.length === 0) {
      await autoFillMonth(newMonth, year, fetched);
    }
  }

  async function handleYearChange(newYear: number) {
    setYear(newYear);
    const fetched = await fetchTransactionsForMonth(month, newYear);
    setTransactions((prev) => {
      const other = prev.filter(
        (t) => !(t.month === month && t.year === newYear)
      );
      return [...other, ...fetched];
    });
    if (fetched.length === 0) {
      await autoFillMonth(month, newYear, fetched);
    }
  }

  async function handleAddTemplate(t: Omit<Template, "id" | "isActive">) {
    if (!userId) return;

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("cashflow_templates")
        .insert({
          user_id: userId,
          name: t.name,
          direction: t.direction,
          category: t.category,
          amount: t.amount,
          is_active: true,
        })
        .select()
        .single();

      if (error || !data) {
        console.error("Failed to add template:", error);
        return;
      }

      setTemplates((prev) => [
        ...prev,
        {
          id: data.id,
          name: data.name,
          direction: data.direction as CashflowDirection,
          category: data.category as CashflowCategory,
          amount: data.amount,
          isActive: data.is_active,
        },
      ]);
    } catch (err) {
      console.error("Failed to add template:", err);
    }
  }

  async function handleUpdateTemplate(id: string, updates: Partial<Template>) {
    // Optimistic update
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );

    try {
      const supabase = createClient();
      // Map camelCase to snake_case for DB
      const dbUpdates: Record<string, unknown> = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.direction !== undefined) dbUpdates.direction = updates.direction;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
      if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

      const { error } = await supabase
        .from("cashflow_templates")
        .update(dbUpdates)
        .eq("id", id);

      if (error) {
        console.error("Failed to update template:", error);
      }
    } catch (err) {
      console.error("Failed to update template:", err);
    }
  }

  async function handleDeleteTemplate(id: string) {
    // Optimistic update
    setTemplates((prev) => prev.filter((t) => t.id !== id));

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("cashflow_templates")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Failed to delete template:", error);
      }
    } catch (err) {
      console.error("Failed to delete template:", err);
    }
  }

  async function handleAddTransaction(
    t: Omit<Transaction, "id" | "templateId" | "month" | "year">
  ) {
    if (!userId) return;

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("cashflow_transactions")
        .insert({
          user_id: userId,
          template_id: null,
          direction: t.direction,
          category: t.category,
          name: t.name,
          amount: t.amount,
          month,
          year,
        })
        .select()
        .single();

      if (error || !data) {
        console.error("Failed to add transaction:", error);
        return;
      }

      setTransactions((prev) => [
        ...prev,
        {
          id: data.id,
          templateId: data.template_id,
          direction: data.direction as CashflowDirection,
          category: data.category as CashflowCategory,
          name: data.name,
          amount: data.amount,
          month: data.month,
          year: data.year,
        },
      ]);
      track(Events.CALCULATOR_COMPLETED, { type: "cashflow" });
    } catch (err) {
      console.error("Failed to add transaction:", err);
    }
  }

  async function handleDeleteTransaction(id: string) {
    // Optimistic update
    setTransactions((prev) => prev.filter((t) => t.id !== id));

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("cashflow_transactions")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Failed to delete transaction:", error);
      }
    } catch (err) {
      console.error("Failed to delete transaction:", err);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-fade-in">
        <div className="page-header-gradient">
          <h1 className="text-2xl font-bold font-heading">
            {t("cashflow.title")}
          </h1>
          <p className="text-sm mt-1 text-white/80">{t("cashflow.subtitle")}</p>
        </div>

        {/* Skeleton: Templates card */}
        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="h-5 w-40 animate-pulse rounded bg-surface-hover mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-10 flex-1 animate-pulse rounded-lg bg-surface-hover" />
                <div className="h-10 w-24 animate-pulse rounded-lg bg-surface-hover" />
                <div className="h-10 w-20 animate-pulse rounded-lg bg-surface-hover" />
              </div>
            ))}
          </div>
        </div>

        {/* Skeleton: Month view card */}
        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-5 w-32 animate-pulse rounded bg-surface-hover" />
            <div className="flex gap-2">
              <div className="h-8 w-8 animate-pulse rounded-lg bg-surface-hover" />
              <div className="h-8 w-24 animate-pulse rounded-lg bg-surface-hover" />
              <div className="h-8 w-8 animate-pulse rounded-lg bg-surface-hover" />
            </div>
          </div>
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 w-full animate-pulse rounded-lg bg-surface-hover" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="page-header-gradient">
        <h1 className="text-2xl font-bold font-heading">
          {t("cashflow.title")}
        </h1>
        <p className="text-sm mt-1 text-white/80">
          {t("cashflow.subtitle")}
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
        <div className="stagger-children flex flex-col gap-6">
          <div className="flex justify-end">
            <ExportPdfButton
              planType="cashflow"
              planName="Cashflow Analysis"
              inputs={{}}
              results={results as unknown as Record<string, unknown>}
            />
          </div>
          <CashflowResultsView results={results} />
        </div>
      )}
    </div>
  );
}
