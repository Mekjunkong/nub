"use client";

import { HealthScoreCard } from "@/components/dashboard/health-score-card";
import { SavedPlansList } from "@/components/dashboard/saved-plans-list";
import { ProgressTracker } from "@/components/dashboard/progress-tracker";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { QuickActions } from "@/components/dashboard/quick-actions";

// Placeholder data - will be fetched from Supabase
const mockPlans: any[] = [];
const mockHistory = [
  { date: "2026-01", score: 45 },
  { date: "2026-02", score: 52 },
  { date: "2026-03", score: 62 },
];
const mockActivities: any[] = [];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-text font-heading">Dashboard</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <HealthScoreCard score={62} previousScore={52} />
            <QuickActions />
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold text-text">Saved Plans</h2>
            <SavedPlansList
              plans={mockPlans}
              onToggleFavorite={(id) => console.log("toggle", id)}
              onOpen={(id) => console.log("open", id)}
            />
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          <ProgressTracker history={mockHistory} />
          <RecentActivity activities={mockActivities} />
        </div>
      </div>
    </div>
  );
}
