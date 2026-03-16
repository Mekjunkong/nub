import { setRequestLocale } from "next-intl/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function GlossaryTermPage({ params }: { params: Promise<{ locale: string; term: string }> }) {
  const { locale, term } = await params;
  setRequestLocale(locale);

  const displayTerm = term.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <a href={`/${locale}/glossary`} className="text-sm text-primary hover:underline mb-4 inline-block">
        &larr; {locale === "th" ? "กลับไปคำศัพท์ทั้งหมด" : "Back to Glossary"}
      </a>
      <Card>
        <CardContent className="p-6">
          <Badge variant="primary" className="mb-3">Financial Term</Badge>
          <h1 className="text-2xl font-bold text-text font-heading">{displayTerm}</h1>
          <p className="mt-4 text-text-secondary leading-relaxed">
            {locale === "th"
              ? "คำจำกัดความจะถูกดึงจากฐานข้อมูล Supabase"
              : "Term definition will be fetched from Supabase database."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
