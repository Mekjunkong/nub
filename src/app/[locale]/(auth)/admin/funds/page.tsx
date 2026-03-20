import { createClient } from "@/lib/supabase/server";
import { setRequestLocale } from "next-intl/server";
import { FundImportClient } from "./fund-import-client";
import type { Fund } from "@/types/database";

type FundItem = Pick<
  Fund,
  "id" | "ticker" | "name_th" | "name_en" | "category" | "expected_return" | "standard_deviation" | "updated_at"
>;

export default async function FundAdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const { data } = await supabase
    .from("funds")
    .select("id, ticker, name_th, name_en, category, expected_return, standard_deviation, updated_at")
    .order("ticker", { ascending: true });

  return <FundImportClient funds={(data ?? []) as FundItem[]} locale={locale} />;
}
