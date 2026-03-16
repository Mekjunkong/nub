"use client";

import { useLocale } from "next-intl";
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

  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">Quick Actions</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          {actions.map((a) => {
            const Icon = a.icon;
            return (
              <a
                key={a.href}
                href={`/${locale}/${a.href}`}
                className="flex flex-col items-center gap-1.5 rounded-xl p-3 transition-colors hover:bg-surface-hover"
              >
                <Icon className={`h-5 w-5 ${a.color}`} />
                <span className="text-[10px] text-text-muted text-center leading-tight">{a.label}</span>
              </a>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
