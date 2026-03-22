"use client";

import { useLocale, useTranslations } from "next-intl";
import { Calculator, TrendingUp, PieChart, Receipt, MessageCircle, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const actions = [
  { href: "calculator/retirement", icon: Calculator, label: "Retirement Planner", color: "text-primary", bg: "bg-primary-light" },
  { href: "calculator/withdrawal", icon: TrendingUp, label: "Withdrawal Sim", color: "text-success", bg: "bg-success-light" },
  { href: "calculator/mpt", icon: PieChart, label: "Portfolio Optimizer", color: "text-secondary", bg: "bg-secondary-light" },
  { href: "calculator/tax", icon: Receipt, label: "Tax Optimizer", color: "text-warning", bg: "bg-warning-light" },
  { href: "chat", icon: MessageCircle, label: "AI Chat", color: "text-accent", bg: "bg-accent-light" },
  { href: "funds", icon: BarChart3, label: "Fund Screener", color: "text-success", bg: "bg-success-light" },
];

export function QuickActions() {
  const locale = useLocale();
  const t = useTranslations("dashboard");

  return (
    <Card variant="elevated">
      <CardHeader><CardTitle className="text-sm">{t("quickActions")}</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {actions.map((a) => {
            const Icon = a.icon;
            return (
              <a
                key={a.href}
                href={`/${locale}/${a.href}`}
                className="group flex items-center gap-2.5 rounded-xl border border-transparent px-3 py-2.5 transition-all duration-200 hover:border-border hover:bg-surface-hover hover:shadow-sm"
              >
                <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl ${a.bg} ${a.color} transition-transform duration-200 group-hover:scale-110`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="truncate text-xs font-medium text-text-secondary group-hover:text-text">{a.label}</span>
              </a>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
