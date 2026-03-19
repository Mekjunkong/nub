"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { HealthScoreCard } from "@/components/dashboard/health-score-card";
import { SavedPlansList } from "@/components/dashboard/saved-plans-list";
import { ProgressTracker } from "@/components/dashboard/progress-tracker";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { createClient } from "@/lib/supabase/client";
import type { PlanType } from "@/types/database";

interface SavedPlanRow {
  id: string;
  name: string;
  plan_type: string;
  is_favorite: boolean;
  updated_at: string;
  results: Record<string, unknown>;
}

interface DashboardPageClientProps {
  healthScore: number | null;
  previousScore: number | null;
  plans: SavedPlanRow[];
  scoreHistory: Array<{ date: string; score: number }>;
  locale: string;
}

const routeMap: Record<string, string> = {
  retirement: "retirement",
  withdrawal: "withdrawal",
  stress_test: "stress-test",
  mpt: "mpt",
  dca: "dca",
  tax: "tax",
  cashflow: "cashflow",
  roic: "roic",
  gpf_optimizer: "gpf-optimizer",
  tipp: "tipp",
  portfolio_health: "portfolio-health",
  bumnan95: "bumnan95",
};

export function DashboardPageClient({ healthScore, previousScore, plans: initialPlans, scoreHistory, locale }: DashboardPageClientProps) {
  const router = useRouter();
  const intlLocale = useLocale();
  const [plans, setPlans] = useState(initialPlans);

  const typedPlans = plans.map((p) => ({
    ...p,
    plan_type: p.plan_type as PlanType,
  }));

  async function handleToggleFavorite(id: string) {
    const plan = plans.find((p) => p.id === id);
    if (!plan) return;
    // Optimistic update
    setPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_favorite: !p.is_favorite } : p))
    );
    try {
      const supabase = createClient();
      await supabase
        .from("saved_plans")
        .update({ is_favorite: !plan.is_favorite })
        .eq("id", id);
    } catch (e) {
      // Revert on failure
      setPlans((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_favorite: plan.is_favorite } : p))
      );
      console.error("Failed to toggle favorite:", e);
    }
  }

  function handleOpenPlan(id: string) {
    const plan = plans.find((p) => p.id === id);
    if (!plan) return;
    const route = routeMap[plan.plan_type];
    if (route) router.push(`/${intlLocale}/calculator/${route}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-text font-heading">{locale === "th" ? "\u0E41\u0E14\u0E0A\u0E1A\u0E2D\u0E23\u0E4C\u0E14" : "Dashboard"}</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <HealthScoreCard score={healthScore} previousScore={previousScore} />
            <QuickActions />
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold text-text">{locale === "th" ? "\u0E41\u0E1C\u0E19\u0E17\u0E35\u0E48\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E44\u0E27\u0E49" : "Saved Plans"}</h2>
            <SavedPlansList
              plans={typedPlans}
              onToggleFavorite={handleToggleFavorite}
              onOpen={handleOpenPlan}
            />
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          <ProgressTracker history={scoreHistory} />
          <RecentActivity activities={[]} />
        </div>
      </div>
    </div>
  );
}
