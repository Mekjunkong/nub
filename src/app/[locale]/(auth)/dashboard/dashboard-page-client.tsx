"use client";

import { HealthScoreCard } from "@/components/dashboard/health-score-card";
import { SavedPlansList } from "@/components/dashboard/saved-plans-list";
import { ProgressTracker } from "@/components/dashboard/progress-tracker";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { QuickActions } from "@/components/dashboard/quick-actions";
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

export function DashboardPageClient({ healthScore, previousScore, plans, scoreHistory }: DashboardPageClientProps) {
  const typedPlans = plans.map((p) => ({
    ...p,
    plan_type: p.plan_type as PlanType,
  }));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-text font-heading">Dashboard</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <HealthScoreCard score={healthScore} previousScore={previousScore} />
            <QuickActions />
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold text-text">Saved Plans</h2>
            <SavedPlansList
              plans={typedPlans}
              onToggleFavorite={(id) => console.log("toggle", id)}
              onOpen={(id) => console.log("open", id)}
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
