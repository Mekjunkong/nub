import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { BlogPost } from "@/types/database";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!post) return { title: "Not Found" };

  const title = locale === "th" ? post.title_th : post.title_en;
  const description =
    locale === "th"
      ? (post.seo_description_th || post.title_th)
      : (post.seo_description_en || post.title_en);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      ...(post.cover_image_url ? { images: [post.cover_image_url] } : {}),
    },
  };
}

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
      <Link href={`/${locale}/blog`} className="text-sm text-primary hover:underline mb-4 inline-block">
        &larr; {locale === "th" ? "กลับไปบทความทั้งหมด" : "Back to Blog"}
      </Link>
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
        <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-xl">
          <Image
            src={post.cover_image_url}
            alt={title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <div className="text-text-secondary whitespace-pre-wrap leading-relaxed">
          {content}
        </div>
      </div>
    </article>
  );
}
