import { createClient } from "@/lib/supabase/server";
import { setRequestLocale } from "next-intl/server";
import { GlossaryPageClient } from "./glossary-page-client";
import type { GlossaryTerm } from "@/types/database";

type GlossaryListItem = Pick<GlossaryTerm, "slug" | "term_th" | "term_en" | "definition_th" | "definition_en" | "category">;

export default async function GlossaryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const { data } = await supabase
    .from("glossary_terms")
    .select("slug, term_th, term_en, definition_th, definition_en, category")
    .order("term_en", { ascending: true });

  const terms = (data ?? []) as GlossaryListItem[];

  return <GlossaryPageClient terms={terms} locale={locale} />;
}
