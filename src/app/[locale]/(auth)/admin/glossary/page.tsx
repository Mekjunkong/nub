import { createClient } from "@/lib/supabase/server";
import { setRequestLocale } from "next-intl/server";
import { GlossaryAdminClient } from "./glossary-admin-client";
import type { GlossaryTerm } from "@/types/database";

type GlossaryItem = Pick<
  GlossaryTerm,
  "id" | "slug" | "term_th" | "term_en" | "category" | "updated_at"
>;

export default async function GlossaryAdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const { data } = await supabase
    .from("glossary_terms")
    .select("id, slug, term_th, term_en, category, updated_at")
    .order("term_en", { ascending: true });

  return <GlossaryAdminClient terms={(data ?? []) as GlossaryItem[]} locale={locale} />;
}
