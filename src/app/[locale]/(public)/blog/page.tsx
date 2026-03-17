import { createClient } from "@/lib/supabase/server";
import { setRequestLocale } from "next-intl/server";
import { BlogPageClient } from "./blog-page-client";
import type { BlogPost } from "@/types/database";

type BlogListItem = Pick<BlogPost, "slug" | "title_th" | "title_en" | "category" | "cover_image_url" | "published_at" | "seo_description_th" | "seo_description_en">;

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("slug, title_th, title_en, category, cover_image_url, published_at, seo_description_th, seo_description_en")
    .eq("published", true)
    .order("published_at", { ascending: false });

  const posts = (data ?? []) as BlogListItem[];

  return <BlogPageClient posts={posts} locale={locale} />;
}
