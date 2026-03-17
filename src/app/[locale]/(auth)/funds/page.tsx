import { createClient } from "@/lib/supabase/server";
import { setRequestLocale } from "next-intl/server";
import { FundsPageClient } from "./funds-page-client";
import type { Fund } from "@/types/database";

type FundListItem = Pick<Fund, "id" | "ticker" | "name_th" | "name_en" | "category" | "expected_return" | "standard_deviation" | "roic_current" | "affiliate_url">;

export default async function FundsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const { data } = await supabase
    .from("funds")
    .select("id, ticker, name_th, name_en, category, expected_return, standard_deviation, roic_current, affiliate_url")
    .order("ticker", { ascending: true });

  const rawFunds = (data ?? []) as FundListItem[];

  const funds = rawFunds.map((f) => ({
    id: f.id,
    ticker: f.ticker,
    name: locale === "th" ? f.name_th : f.name_en,
    category: f.category,
    expectedReturn: f.expected_return,
    standardDeviation: f.standard_deviation,
    roicCurrent: f.roic_current,
    affiliateUrl: f.affiliate_url,
  }));

  return <FundsPageClient funds={funds} locale={locale} />;
}
