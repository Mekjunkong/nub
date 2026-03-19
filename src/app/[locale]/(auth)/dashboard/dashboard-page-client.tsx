"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { HealthScoreCard } from "@/components/dashboard/health-score-card";
import { SavedPlansList } from "@/components/dashboard/saved-plans-list";
import { ProgressTracker } from "@/components/dashboard/progress-tracker";
import { RecentActivity, formatPlanTypeLabel } from "@/components/dashboard/recent-activity";
import { QuickActions } from "@/components/dashboard/quick-actions";
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
  const [localPreviousScore, setLocalPreviousScore] = useState<number | null>(serverPreviousScore);

  // On mount: read previous score from localStorage
  // When healthScore changes: save old score to localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PREV_SCORE_KEY);
      if (stored !== null) {
        const parsed = parseFloat(stored);
        if (!isNaN(parsed)) {
          setLocalPreviousScore(parsed);
        }
      }
    } catch {
      // localStorage may be unavailable
    }
  }, []);

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

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-text font-heading">{t("title")}</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <HealthScoreCard score={healthScore} previousScore={localPreviousScore} />
            <QuickActions />
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold text-text">{t("savedPlans")}</h2>
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
          <RecentActivity activities={recentActivities} />
        </div>
      </div>
    </div>
  );
}
