import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { GlossaryTerm } from "@/types/database";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; term: string }>;
}): Promise<Metadata> {
  const { locale, term: termSlug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("glossary_terms")
    .select("*")
    .eq("slug", termSlug)
    .single();

  if (!data) return { title: "Not Found" };

  const displayTerm = locale === "th" ? data.term_th : data.term_en;
  const definition = locale === "th" ? data.definition_th : data.definition_en;
  const description = definition?.slice(0, 160) || displayTerm;

  return {
    title: `${displayTerm} - ${locale === "th" ? "คำศัพท์การเงิน" : "Financial Glossary"} | Nub`,
    description,
    openGraph: {
      title: displayTerm,
      description,
    },
  };
}

export default async function GlossaryTermPage({ params }: { params: Promise<{ locale: string; term: string }> }) {
  const { locale, term: termSlug } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const { data } = await supabase
    .from("glossary_terms")
    .select("*")
    .eq("slug", termSlug)
    .single();

  const term = data as GlossaryTerm | null;

  if (!term) {
    notFound();
  }

  const displayTerm = locale === "th" ? term.term_th : term.term_en;
  const definition = locale === "th" ? term.definition_th : term.definition_en;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href={`/${locale}/glossary`} className="text-sm text-primary hover:underline mb-4 inline-block">
        &larr; {locale === "th" ? "กลับไปคำศัพท์ทั้งหมด" : "Back to Glossary"}
      </Link>
      <Card>
        <CardContent className="p-6">
          <Badge variant="primary" className="mb-3">{term.category}</Badge>
          <h1 className="text-2xl font-bold text-text font-heading">{displayTerm}</h1>
          <p className="mt-4 text-text-secondary leading-relaxed whitespace-pre-wrap">
            {definition}
          </p>
          {term.related_terms && term.related_terms.length > 0 && (
            <div className="mt-6 border-t border-border pt-4">
              <p className="text-sm font-medium text-text-muted mb-2">
                {locale === "th" ? "คำศัพท์ที่เกี่ยวข้อง" : "Related Terms"}
              </p>
              <div className="flex flex-wrap gap-2">
                {term.related_terms.map((related) => (
                  <Link
                    key={related}
                    href={`/${locale}/glossary/${related}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {related}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
