import { setRequestLocale } from "next-intl/server";
import { Badge } from "@/components/ui/badge";

// Placeholder - will fetch from Supabase by slug
export default async function BlogPostPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <Badge variant="primary">Article</Badge>
        <h1 className="mt-3 text-3xl font-bold text-text font-heading">
          {slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
        </h1>
        <p className="mt-2 text-sm text-text-muted">Published on March 2026</p>
      </div>
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <p className="text-text-secondary">
          {locale === "th"
            ? "เนื้อหาบทความจะถูกดึงจากฐานข้อมูล Supabase"
            : "Blog post content will be fetched from Supabase database."}
        </p>
      </div>
    </article>
  );
}
