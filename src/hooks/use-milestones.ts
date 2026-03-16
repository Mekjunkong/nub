"use client";

import { useMemo } from "react";

interface MilestoneCheck {
  id: string;
  title: string;
  description: string;
  condition: boolean;
}

interface UseMilestonesParams {
  healthScore?: number | null;
  savedPlansCount?: number;
  totalSavings?: number;
  fundedRatio?: number;
}

export function useMilestones(params: UseMilestonesParams) {
  const milestones = useMemo(() => {
    const checks: MilestoneCheck[] = [
      {
        id: "first-plan",
        title: "Great Start!",
        description: "You saved your first financial plan. Keep going!",
        condition: (params.savedPlansCount ?? 0) >= 1,
      },
      {
        id: "score-50",
        title: "You're On Track!",
        description: "Your Financial Health Score has reached 50. Well done!",
        condition: (params.healthScore ?? 0) >= 50,
      },
      {
        id: "score-80",
        title: "Excellent Progress!",
        description: "Your Financial Health Score is above 80. Outstanding!",
        condition: (params.healthScore ?? 0) >= 80,
      },
      {
        id: "millionaire",
        title: "Millionaire Milestone!",
        description: "Your projected savings have reached 1,000,000 THB!",
        condition: (params.totalSavings ?? 0) >= 1000000,
      },
      {
        id: "halfway",
        title: "Halfway There!",
        description: "You've reached 50% of your retirement goal!",
        condition: (params.fundedRatio ?? 0) >= 0.5,
      },
    ];

    // Return first uncelebrated milestone
    return checks.filter((m) => {
      if (!m.condition) return false;
      if (typeof window === "undefined") return false;
      return !localStorage.getItem(`nub-milestone-${m.id}`);
    });
  }, [params]);

  return { pendingMilestones: milestones, nextMilestone: milestones[0] || null };
}
