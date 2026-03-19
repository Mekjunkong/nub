"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Save, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";

interface ActivityItem {
  id: string;
  type: "calculation" | "save" | "chat";
  description: string;
  timestamp: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

const icons = {
  calculation: <Calculator className="h-4 w-4 text-primary" />,
  save: <Save className="h-4 w-4 text-success" />,
  chat: <MessageCircle className="h-4 w-4 text-secondary" />,
};

const planTypeLabels: Record<string, string> = {
  retirement: "Retirement Plan",
  withdrawal: "Withdrawal Plan",
  stress_test: "Stress Test",
  mpt: "MPT Optimization",
  dca: "DCA Plan",
  tax: "Tax Plan",
  cashflow: "Cashflow Plan",
  roic: "ROIC Analysis",
  gpf_optimizer: "GPF Optimizer",
  tipp: "TIPP/VPPI Plan",
  portfolio_health: "Portfolio Health",
  bumnan95: "Bumnan95 Plan",
};

export function formatPlanTypeLabel(planType: string): string {
  return planTypeLabels[planType] ?? planType;
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const t = useTranslations("dashboard");

  return (
    <Card variant="elevated">
      <CardHeader><CardTitle className="text-sm">{t("recentActivity")}</CardTitle></CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-xs text-text-muted">{t("noActivity")}</p>
        ) : (
          <div className="flex flex-col gap-3">
            {activities.slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-start gap-3">
                <div className="mt-0.5">{icons[a.type]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text truncate">{a.description}</p>
                  <p className="text-xs text-text-muted">{new Date(a.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
