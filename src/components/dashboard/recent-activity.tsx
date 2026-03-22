"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Save, MessageCircle, Clock } from "lucide-react";
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

const iconConfig = {
  calculation: { icon: Calculator, bg: "bg-primary-light", color: "text-primary" },
  save: { icon: Save, bg: "bg-success-light", color: "text-success" },
  chat: { icon: MessageCircle, bg: "bg-secondary-light", color: "text-secondary" },
};

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

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
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <Clock className="h-8 w-8 text-text-muted/40" />
            <p className="text-xs text-text-muted">{t("noActivity")}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {activities.slice(0, 5).map((a) => {
              const cfg = iconConfig[a.type];
              const Icon = cfg.icon;
              return (
                <div
                  key={a.id}
                  className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-surface-hover"
                >
                  <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl ${cfg.bg} ${cfg.color}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-xs font-medium text-text">{a.description}</p>
                    <p className="text-[10px] text-text-muted">{timeAgo(a.timestamp)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
