import { createClient } from "@/lib/supabase/server";
import { setRequestLocale } from "next-intl/server";
import { DashboardPageClient } from "./dashboard-page-client";
import type { Profile, SavedPlan } from "@/types/database";

type ProfileScore = Pick<Profile, "financial_health_score">;
type SavedPlanItem = Pick<SavedPlan, "id" | "name" | "plan_type" | "is_favorite" | "updated_at" | "results" | "scenario_label">;

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let healthScore: number | null = null;
  let previousScore: number | null = null;
  let plans: SavedPlanItem[] = [];

  if (user) {
    // Fetch profile for health score
    const { data: profileData } = await supabase
      .from("profiles")
      .select("financial_health_score")
      .eq("id", user.id)
      .single();

    const profile = profileData as ProfileScore | null;
    healthScore = profile?.financial_health_score ?? null;

    // Fetch previous score from the most recent saved portfolio_health plan
    const { data: prevPlan } = await supabase
      .from("saved_plans")
      .select("results")
      .eq("user_id", user.id)
      .eq("plan_type", "portfolio_health")
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();

    if (prevPlan?.results && typeof prevPlan.results === "object") {
      const results = prevPlan.results as Record<string, unknown>;
      if (typeof results.overallScore === "number") {
        previousScore = results.overallScore;
      }
    }

    // Fetch saved plans
    const { data: plansData } = await supabase
      .from("saved_plans")
      .select("id, name, plan_type, is_favorite, updated_at, results, scenario_label")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    plans = (plansData ?? []) as SavedPlanItem[];
  }

  // Build score history from saved portfolio_health plans
  const scoreHistory: { date: string; score: number }[] = [];
  if (user) {
    const { data: historyPlans } = await supabase
      .from("saved_plans")
      .select("updated_at, results")
      .eq("user_id", user.id)
      .eq("plan_type", "portfolio_health")
      .order("updated_at", { ascending: true })
      .limit(12);

    if (historyPlans) {
      for (const plan of historyPlans) {
        const results = plan.results as Record<string, unknown> | null;
        if (results && typeof results.overallScore === "number") {
          scoreHistory.push({
            date: new Date(plan.updated_at).toISOString().slice(0, 7),
            score: results.overallScore,
          });
        }
      }
    }
  }

  return (
    <DashboardPageClient
      healthScore={healthScore}
      previousScore={previousScore}
      plans={plans}
      scoreHistory={scoreHistory}
    />
  );
}
