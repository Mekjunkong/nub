"use client";

import { Star, Calculator, TrendingUp, Shield, PieChart, DollarSign, Receipt } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PlanType } from "@/types/database";

interface SavedPlanItem {
  id: string;
  name: string;
  plan_type: PlanType;
  is_favorite: boolean;
  updated_at: string;
  results: Record<string, unknown>;
}

interface SavedPlansListProps {
  plans: SavedPlanItem[];
  onToggleFavorite: (id: string) => void;
  onOpen: (id: string) => void;
}

const planIcons: Record<PlanType, React.ReactNode> = {
  retirement: <Calculator className="h-4 w-4" />,
  withdrawal: <TrendingUp className="h-4 w-4" />,
  stress_test: <Shield className="h-4 w-4" />,
  mpt: <PieChart className="h-4 w-4" />,
  dca: <DollarSign className="h-4 w-4" />,
  tax: <Receipt className="h-4 w-4" />,
  cashflow: <Receipt className="h-4 w-4" />,
  roic: <TrendingUp className="h-4 w-4" />,
  gpf_optimizer: <PieChart className="h-4 w-4" />,
  tipp: <Shield className="h-4 w-4" />,
  portfolio_health: <TrendingUp className="h-4 w-4" />,
  bumnan95: <Calculator className="h-4 w-4" />,
};

export function SavedPlansList({ plans, onToggleFavorite, onOpen }: SavedPlansListProps) {
  const t = useTranslations("common");
  if (plans.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-text-muted text-sm">No saved plans yet</p>
          <p className="text-text-muted text-xs mt-1">Run a calculator and save your first plan</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {plans.map((plan) => (
        <Card key={plan.id} className="cursor-pointer transition-all hover:shadow-md" onClick={() => onOpen(plan.id)}>
          <CardContent className="flex items-center gap-3 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {planIcons[plan.plan_type]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-text truncate">{plan.name}</p>
              <div className="flex items-center gap-2">
                <Badge variant="primary">{t(`planTypes.${plan.plan_type}`)}</Badge>
                <span className="text-xs text-text-muted">
                  {new Date(plan.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(plan.id); }}
              className="p-1"
            >
              <Star className={cn("h-4 w-4", plan.is_favorite ? "fill-warning text-warning" : "text-text-muted")} />
            </button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
