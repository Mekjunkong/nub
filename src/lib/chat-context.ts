import { createClient } from "@/lib/supabase/server";

export async function buildUserContext(userId: string): Promise<string> {
  const supabase = await createClient();

  const { data: plans } = await supabase
    .from("saved_plans")
    .select("plan_type, results, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (!plans || plans.length === 0) return "";

  // Keep only most recent per type
  const latestByType: Record<string, Record<string, unknown>> = {};
  for (const plan of plans as Array<{ plan_type: string; results: Record<string, unknown> }>) {
    if (!latestByType[plan.plan_type]) {
      latestByType[plan.plan_type] = plan.results;
    }
  }

  const lines: string[] = ["Here is the user's current financial snapshot (from their saved calculator results):"];

  const r = latestByType.retirement;
  if (r) {
    lines.push(`- Retirement: gap ฿${Number(r.gap ?? 0).toLocaleString()}, health score ${r.healthScore ?? "unknown"}, funded ratio ${r.fundedRatio ? (Number(r.fundedRatio) * 100).toFixed(0) + "%" : "unknown"}`);
  }

  const w = latestByType.withdrawal;
  if (w) {
    lines.push(`- Withdrawal: survival rate ${w.survivalRate ? (Number(w.survivalRate) * 100).toFixed(0) + "%" : "unknown"}, median final wealth ฿${Number(w.medianFinalWealth ?? 0).toLocaleString()}`);
  }

  const s = latestByType.stress_test;
  if (s) {
    lines.push(`- Stress Test: worst drawdown ${s.worstDrawdown ? (Number(s.worstDrawdown) * 100).toFixed(0) + "%" : "unknown"}`);
  }

  const t = latestByType.tax;
  if (t) {
    const opt = t.optimized as Record<string, unknown> | undefined;
    if (opt) {
      lines.push(`- Tax: optimized tax ฿${Number(opt.totalTax ?? 0).toLocaleString()}, effective rate ${opt.effectiveRate ? (Number(opt.effectiveRate) * 100).toFixed(1) + "%" : "unknown"}`);
    }
  }

  const p = latestByType.portfolio_health;
  if (p) {
    lines.push(`- Portfolio Health: overall score ${p.overallScore ?? "unknown"}`);
  }

  if (lines.length === 1) return "";
  lines.push("\nUse this data to give personalized, specific advice. Reference actual numbers when relevant.");
  return lines.join("\n");
}
