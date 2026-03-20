import { createClient } from "@/lib/supabase/server";
import { setRequestLocale } from "next-intl/server";
import { BlogAdminClient } from "./blog-admin-client";
import type { BlogPost } from "@/types/database";

type BlogItem = Pick<
  BlogPost,
  "id" | "slug" | "title_th" | "title_en" | "category" | "published" | "published_at" | "updated_at"
>;

export default async function BlogAdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("id, slug, title_th, title_en, category, published, published_at, updated_at")
    .order("updated_at", { ascending: false });

  return <BlogAdminClient posts={(data ?? []) as BlogItem[]} locale={locale} />;
}
