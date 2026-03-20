"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { HealthScoreCard } from "@/components/dashboard/health-score-card";
import { SavedPlansList } from "@/components/dashboard/saved-plans-list";
import { ProgressTracker } from "@/components/dashboard/progress-tracker";
import { RecentActivity, formatPlanTypeLabel } from "@/components/dashboard/recent-activity";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { ShareScoreButton } from "@/components/shared/share-score-button";
import { createClient } from "@/lib/supabase/client";
import type { PlanType } from "@/types/database";

const PREV_SCORE_KEY = "nub_previous_health_score";

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

export function DashboardPageClient({ healthScore, previousScore: serverPreviousScore, plans: initialPlans, scoreHistory }: DashboardPageClientProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("dashboard");
  const [plans, setPlans] = useState(initialPlans);
  const [localPreviousScore] = useState<number | null>(() => {
    if (serverPreviousScore != null) return serverPreviousScore;
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem(PREV_SCORE_KEY);
      if (stored !== null) {
        const parsed = parseFloat(stored);
        if (!isNaN(parsed)) return parsed;
      }
    } catch {
      // localStorage may be unavailable
    }
    return null;
  });

  useEffect(() => {
    if (healthScore == null) return;
    try {
      // Save current score so it becomes "previous" on next visit
      localStorage.setItem(PREV_SCORE_KEY, String(healthScore));
    } catch {
      // localStorage may be unavailable
    }
  }, [healthScore]);

  const typedPlans = plans.map((p) => ({
    ...p,
    plan_type: p.plan_type as PlanType,
  }));

  // Derive recent activity from saved plans
  const recentActivities = plans.slice(0, 5).map((plan) => ({
    id: plan.id,
    type: "save" as const,
    description: `${plan.name} (${formatPlanTypeLabel(plan.plan_type)})`,
    timestamp: plan.updated_at,
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
    if (route) router.push(`/${locale}/calculator/${route}`);
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t("goodMorning") : hour < 18 ? t("goodAfternoon") : t("goodEvening");

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Greeting */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text font-heading">{greeting}</h1>
          <p className="text-sm text-text-muted">{t("subtitle")}</p>
        </div>
        <ShareScoreButton score={healthScore} title="Nub - My Financial Health" />
      </div>

      {/* Bento Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
        {/* Health Score - spans 2 cols on large */}
        <div className="sm:col-span-2">
          <HealthScoreCard score={healthScore} previousScore={localPreviousScore} />
        </div>

        {/* Quick Actions */}
        <div className="sm:col-span-2 lg:col-span-2">
          <QuickActions />
        </div>

        {/* Progress */}
        <div className="sm:col-span-1 lg:col-span-2">
          <ProgressTracker history={scoreHistory} />
        </div>

        {/* Recent Activity */}
        <div className="sm:col-span-1 lg:col-span-2">
          <RecentActivity activities={recentActivities} />
        </div>
      </div>

      {/* Saved Plans - full width below */}
      <div className="animate-slide-up" style={{ animationDelay: "200ms" }}>
        <h2 className="mb-3 text-sm font-semibold text-text">{t("savedPlans")}</h2>
        <SavedPlansList
          plans={typedPlans}
          onToggleFavorite={handleToggleFavorite}
          onOpen={handleOpenPlan}
        />
      </div>
    </div>
  );
}
