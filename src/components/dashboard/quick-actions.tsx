"use client";

import { useLocale, useTranslations } from "next-intl";
import { Calculator, TrendingUp, PieChart, Receipt, MessageCircle, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const actions = [
  { href: "calculator/retirement", icon: Calculator, label: "Retirement Planner", color: "text-primary" },
  { href: "calculator/withdrawal", icon: TrendingUp, label: "Withdrawal Sim", color: "text-success" },
  { href: "calculator/mpt", icon: PieChart, label: "Portfolio Optimizer", color: "text-secondary" },
  { href: "calculator/tax", icon: Receipt, label: "Tax Optimizer", color: "text-warning" },
  { href: "chat", icon: MessageCircle, label: "AI Chat", color: "text-primary" },
  { href: "funds", icon: BarChart3, label: "Fund Screener", color: "text-success" },
];

export function QuickActions() {
  const locale = useLocale();
  const t = useTranslations("dashboard");

  return (
    <Card variant="elevated">
      <CardHeader><CardTitle className="text-sm">{t("quickActions")}</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {actions.map((a) => {
            const Icon = a.icon;
            return (
              <a
                key={a.href}
                href={`/${locale}/${a.href}`}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition-all hover:bg-surface-hover hover:shadow-sm group"
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 ${a.color} transition-transform group-hover:scale-110`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-text-secondary group-hover:text-text">{a.label}</span>
              </a>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
