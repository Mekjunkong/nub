import { setRequestLocale } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { BlogPost } from "@/types/database";

export default async function BlogPostPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  const post = data as BlogPost | null;

  if (!post) {
    notFound();
  }

  const title = locale === "th" ? post.title_th : post.title_en;
  const content = locale === "th" ? post.content_th : post.content_en;
  const publishedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString(locale === "th" ? "th-TH" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      <a href={`/${locale}/blog`} className="text-sm text-primary hover:underline mb-4 inline-block">
        &larr; {locale === "th" ? "กลับไปบทความทั้งหมด" : "Back to Blog"}
      </a>
      <div className="mb-6">
        <Badge variant="primary">{post.category}</Badge>
        <h1 className="mt-3 text-3xl font-bold text-text font-heading">
          {title}
        </h1>
        {publishedDate && (
          <p className="mt-2 text-sm text-text-muted">{publishedDate}</p>
        )}
      </div>
      {post.cover_image_url && (
        <img
          src={post.cover_image_url}
          alt={title}
          className="mb-6 w-full rounded-xl object-cover"
        />
      )}
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <div className="text-text-secondary whitespace-pre-wrap leading-relaxed">
          {content}
        </div>
      </div>
    </article>
  );
}
