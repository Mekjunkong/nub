import { createClient } from "@/lib/supabase/server";
import { setRequestLocale } from "next-intl/server";
import { DashboardPageClient } from "./dashboard-page-client";
import type { Profile, SavedPlan } from "@/types/database";

type ProfileScore = Pick<Profile, "financial_health_score">;
type SavedPlanItem = Pick<SavedPlan, "id" | "name" | "plan_type" | "is_favorite" | "updated_at" | "results">;

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

    // Fetch saved plans
    const { data: plansData } = await supabase
      .from("saved_plans")
      .select("id, name, plan_type, is_favorite, updated_at, results")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    plans = (plansData ?? []) as SavedPlanItem[];
  }

  // Build score history from current score
  const scoreHistory = healthScore != null
    ? [{ date: new Date().toISOString().slice(0, 7), score: healthScore }]
    : [];

  return (
    <DashboardPageClient
      healthScore={healthScore}
      previousScore={previousScore}
      plans={plans}
      scoreHistory={scoreHistory}
      locale={locale}
    />
  );
}
