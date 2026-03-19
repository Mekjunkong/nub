"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { CashflowDirection, CashflowCategory } from "@/types/database";

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

interface CashflowMonthViewProps {
  transactions: Transaction[];
  month: number;
  year: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  onAdd: (t: Omit<Transaction, "id" | "templateId" | "month" | "year">) => void;
  onDelete: (id: string) => void;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const CATEGORY_KEYS: Record<CashflowCategory, string> = {
  salary: "salary",
  overtime: "overtime",
  bonus: "bonus",
  allowance: "allowance",
  personal: "personal",
  family: "family",
  transport: "transport",
  education: "education",
  travel: "travel",
  housing: "housing",
  debt: "debt",
  donation: "donation",
  other: "other",
  insurance_life: "insuranceLife",
  insurance_health: "insuranceHealth",
  insurance_pension: "insurancePension",
  rmf: "rmf",
  ssf: "ssf",
  pvd: "pvd",
  gpf: "gpf",
  tesg: "tesg",
};

const SECTION_CONFIG: {
  key: string;
  titleKey: string;
  directions: CashflowDirection[];
  defaultDirection: CashflowDirection;
  defaultCategory: CashflowCategory;
}[] = [
  {
    key: "income",
    titleKey: "income",
    directions: ["income"],
    defaultDirection: "income",
    defaultCategory: "salary",
  },
  {
    key: "expenses",
    titleKey: "expenses",
    directions: ["expense"],
    defaultDirection: "expense",
    defaultCategory: "personal",
  },
  {
    key: "savings",
    titleKey: "savingsAndInvestments",
    directions: ["saving", "investment"],
    defaultDirection: "saving",
    defaultCategory: "rmf",
  },
];

function navigateMonth(month: number, year: number, delta: number) {
  let newMonth = month + delta;
  let newYear = year;
  if (newMonth < 1) {
    newMonth = 12;
    newYear -= 1;
  } else if (newMonth > 12) {
    newMonth = 1;
    newYear += 1;
  }
  return { month: newMonth, year: newYear };
}

export function CashflowMonthView({
  transactions,
  month,
  year,
  onMonthChange,
  onYearChange,
  onAdd,
  onDelete,
}: CashflowMonthViewProps) {
  const t = useTranslations("calculator");
  function handlePrev() {
    const nav = navigateMonth(month, year, -1);
    if (nav.year !== year) onYearChange(nav.year);
    else onMonthChange(nav.month);
  }

  function handleNext() {
    const nav = navigateMonth(month, year, 1);
    if (nav.year !== year) onYearChange(nav.year);
    else onMonthChange(nav.month);
  }

  function handleQuickAdd(direction: CashflowDirection, category: CashflowCategory) {
    const name = prompt("Transaction name:");
    if (!name?.trim()) return;
    const amountStr = prompt("Amount (THB):");
    const amount = parseFloat(amountStr ?? "");
    if (isNaN(amount) || amount <= 0) return;
    onAdd({ direction, category, name: name.trim(), amount });
  }

  return (
    <div data-testid="cashflow-month-view">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t("cashflow.monthlyTransactions")}</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handlePrev}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
              <span className="min-w-[140px] text-center text-sm font-medium text-text">
                {MONTH_NAMES[month - 1]} {year}
              </span>
              <Button variant="ghost" size="sm" onClick={handleNext}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="py-8 text-center text-sm text-text-muted">
              {t("cashflow.noTransactions")}
            </p>
          ) : (
            <div className="flex flex-col gap-6">
              {SECTION_CONFIG.map((section) => {
                const sectionTxs = transactions.filter((t) =>
                  section.directions.includes(t.direction)
                );
                if (sectionTxs.length === 0) return null;

                const subtotal = sectionTxs.reduce((sum, t) => sum + t.amount, 0);

                return (
                  <div key={section.key}>
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-text">
                        {t(`cashflow.${section.titleKey}`)}
                      </h4>
                      <span className="text-sm font-medium text-text-muted">
                        {"\u0E3F"}{subtotal.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      {sectionTxs.map((tx) => (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-surface-hover"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-text">{tx.name}</span>
                            <Badge variant="default">
                              {t(`cashflow.${CATEGORY_KEYS[tx.category]}`)}
                            </Badge>
                            {tx.templateId != null && (
                              <Badge variant="secondary">Auto</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-text">
                              {"\u0E3F"}{tx.amount.toLocaleString()}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDelete(tx.id)}
                            >
                              <svg className="h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleQuickAdd(section.defaultDirection, section.defaultCategory)
                        }
                      >
                        + {t("cashflow.addTransaction")}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
