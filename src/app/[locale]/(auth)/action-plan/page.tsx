import { createClient } from "@/lib/supabase/server";
import { setRequestLocale } from "next-intl/server";
import { ActionPlanClient } from "./action-plan-client";

export default async function ActionPlanPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const plans: Record<string, Record<string, unknown>> = {};

  if (user) {
    // Fetch the most recent plan of each type
    const { data } = await supabase
      .from("saved_plans")
      .select("plan_type, results")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (data) {
      for (const row of data as Array<{ plan_type: string; results: Record<string, unknown> }>) {
        if (!plans[row.plan_type]) {
          plans[row.plan_type] = row.results;
        }
      }
    }
  }

  return <ActionPlanClient plans={plans} />;
}
