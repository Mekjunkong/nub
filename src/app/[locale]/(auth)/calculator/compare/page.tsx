import { createClient } from "@/lib/supabase/server";
import { setRequestLocale } from "next-intl/server";
import { ComparePageClient } from "./compare-page-client";

export default async function ComparePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let plans: Array<{
    id: string;
    name: string;
    plan_type: string;
    updated_at: string;
    results: Record<string, unknown>;
  }> = [];

  if (user) {
    const { data } = await supabase
      .from("saved_plans")
      .select("id, name, plan_type, updated_at, results")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    plans = (data ?? []) as typeof plans;
  }

  return <ComparePageClient plans={plans} />;
}
